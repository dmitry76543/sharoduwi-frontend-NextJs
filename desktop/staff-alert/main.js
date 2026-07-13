const {
  app,
  BrowserWindow,
  Tray,
  Menu,
  nativeImage,
  Notification,
  shell,
  ipcMain,
} = require("electron");
const path = require("path");
const fs = require("fs");

const POLL_MS = 12_000;
const DEFAULT_SITE = "https://sharoduwi.ru";

/** @type {Electron.Tray | null} */
let tray = null;
/** @type {BrowserWindow | null} */
let setupWindow = null;
/** @type {BrowserWindow | null} */
let alarmWindow = null;
/** @type {ReturnType<typeof setInterval> | null} */
let pollTimer = null;
let lastSeenOrderId = "";
let alarming = false;

function configPath() {
  return path.join(app.getPath("userData"), "config.json");
}

function seenPath() {
  return path.join(app.getPath("userData"), "last-seen.json");
}

function readConfig() {
  try {
    return JSON.parse(fs.readFileSync(configPath(), "utf8"));
  } catch {
    return {
      siteUrl: DEFAULT_SITE,
      password: "",
      autoLaunch: true,
      pollMs: POLL_MS,
    };
  }
}

function writeConfig(config) {
  fs.mkdirSync(app.getPath("userData"), { recursive: true });
  fs.writeFileSync(configPath(), JSON.stringify(config, null, 2), "utf8");
}

function readLastSeen() {
  try {
    return JSON.parse(fs.readFileSync(seenPath(), "utf8")).orderId || "";
  } catch {
    return "";
  }
}

function writeLastSeen(orderId) {
  fs.mkdirSync(app.getPath("userData"), { recursive: true });
  fs.writeFileSync(
    seenPath(),
    JSON.stringify({ orderId, at: new Date().toISOString() }, null, 2),
    "utf8"
  );
}

function applyAutoLaunch(enabled) {
  app.setLoginItemSettings({
    openAtLogin: Boolean(enabled),
    path: process.execPath,
    args: [],
  });
}

function trayIcon() {
  const iconFile = path.join(__dirname, "assets", "icon.png");
  let image = nativeImage.createFromPath(iconFile);
  if (image.isEmpty()) {
    // 16x16 purple fallback
    image = nativeImage.createEmpty();
  }
  return image.resize({ width: 16, height: 16 });
}

function ensureAlarmWindow() {
  if (alarmWindow && !alarmWindow.isDestroyed()) return alarmWindow;

  alarmWindow = new BrowserWindow({
    width: 420,
    height: 280,
    show: false,
    skipTaskbar: true,
    resizable: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  alarmWindow.loadFile(path.join(__dirname, "alarm.html"));
  alarmWindow.on("closed", () => {
    alarmWindow = null;
  });

  return alarmWindow;
}

function showAlarmWindow() {
  const win = ensureAlarmWindow();
  win.show();
  win.focus();
  win.webContents.send("alarm-start");
}

function stopAlarm() {
  alarming = false;
  if (alarmWindow && !alarmWindow.isDestroyed()) {
    alarmWindow.webContents.send("alarm-stop");
    alarmWindow.hide();
  }
}

function openStaffAlert() {
  const config = readConfig();
  const base = (config.siteUrl || DEFAULT_SITE).replace(/\/$/, "");
  shell.openExternal(`${base}/staff-alert`);
}

function openSetup() {
  if (setupWindow && !setupWindow.isDestroyed()) {
    setupWindow.show();
    setupWindow.focus();
    return;
  }

  setupWindow = new BrowserWindow({
    width: 480,
    height: 560,
    resizable: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  setupWindow.loadFile(path.join(__dirname, "setup.html"));
  setupWindow.on("closed", () => {
    setupWindow = null;
  });
}

function buildTrayMenu() {
  const config = readConfig();
  return Menu.buildFromTemplate([
    {
      label: alarming ? "🛑 Остановить сигнал" : "▶️ Проверить звук",
      click: () => {
        if (alarming) stopAlarm();
        else {
          alarming = true;
          showAlarmWindow();
        }
      },
    },
    { type: "separator" },
    {
      label: "Открыть Staff Alert в браузере",
      click: () => openStaffAlert(),
    },
    {
      label: "Настройки…",
      click: () => openSetup(),
    },
    {
      label: config.autoLaunch
        ? "✓ Запуск с Windows"
        : "Запуск с Windows",
      click: () => {
        const next = readConfig();
        next.autoLaunch = !next.autoLaunch;
        writeConfig(next);
        applyAutoLaunch(next.autoLaunch);
        tray?.setContextMenu(buildTrayMenu());
      },
    },
    { type: "separator" },
    {
      label: "Выйти",
      click: () => {
        stopAlarm();
        app.quit();
      },
    },
  ]);
}

function createTray() {
  tray = new Tray(trayIcon());
  tray.setToolTip("ШАРОДУВЫ — сигнал заказов");
  tray.setContextMenu(buildTrayMenu());
  tray.on("double-click", () => openStaffAlert());
}

async function pollOnce() {
  const config = readConfig();
  if (!config.password) return;

  const base = (config.siteUrl || DEFAULT_SITE).replace(/\/$/, "");
  const url = `${base}/api/staff-alert/poll`;

  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${config.password}`,
        "X-Staff-Alert-Password": config.password,
      },
    });

    if (!response.ok) {
      tray?.setToolTip(
        response.status === 401
          ? "ШАРОДУВЫ — неверный пароль"
          : `ШАРОДУВЫ — ошибка опроса (${response.status})`
      );
      return;
    }

    const json = await response.json();
    tray?.setToolTip("ШАРОДУВЫ — сигнал заказов (онлайн)");

    const alert = json.alert;
    if (!alert?.orderId) return;

    if (!lastSeenOrderId) {
      // Первый запуск после установки: запоминаем текущий заказ без сигнала.
      lastSeenOrderId = alert.orderId;
      writeLastSeen(alert.orderId);
      return;
    }

    if (alert.orderId === lastSeenOrderId) return;

    lastSeenOrderId = alert.orderId;
    writeLastSeen(alert.orderId);

    alarming = true;
    showAlarmWindow();

    if (Notification.isSupported()) {
      const note = new Notification({
        title: alert.title || "Новый заказ в ШАРОДУВЫ!",
        body: alert.body || "Откройте Staff Alert",
        silent: false,
      });
      note.on("click", () => openStaffAlert());
      note.show();
    }
  } catch (error) {
    tray?.setToolTip(
      `ШАРОДУВЫ — нет связи: ${error instanceof Error ? error.message : "error"}`
    );
  }
}

function startPolling() {
  if (pollTimer) clearInterval(pollTimer);
  const config = readConfig();
  const ms = Number(config.pollMs) > 3000 ? Number(config.pollMs) : POLL_MS;
  void pollOnce();
  pollTimer = setInterval(() => void pollOnce(), ms);
}

ipcMain.handle("get-config", () => readConfig());

ipcMain.handle("save-config", (_event, next) => {
  const current = readConfig();
  const merged = {
    ...current,
    ...next,
    siteUrl: String(next.siteUrl || current.siteUrl || DEFAULT_SITE).trim(),
    password: String(next.password || "").trim(),
    autoLaunch: Boolean(next.autoLaunch),
  };
  writeConfig(merged);
  applyAutoLaunch(merged.autoLaunch);
  tray?.setContextMenu(buildTrayMenu());
  startPolling();
  return merged;
});

ipcMain.handle("test-connection", async () => {
  const config = readConfig();
  const base = (config.siteUrl || DEFAULT_SITE).replace(/\/$/, "");
  const response = await fetch(`${base}/api/staff-alert/poll`, {
    headers: {
      Authorization: `Bearer ${config.password}`,
      "X-Staff-Alert-Password": config.password,
    },
  });
  if (!response.ok) {
    throw new Error(
      response.status === 401
        ? "Неверный пароль Staff Alert"
        : `Ошибка сервера: ${response.status}`
    );
  }
  return response.json();
});

ipcMain.on("alarm-stopped-by-ui", () => {
  alarming = false;
  if (alarmWindow && !alarmWindow.isDestroyed()) alarmWindow.hide();
});

const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
} else {
  app.on("second-instance", () => {
    openSetup();
  });

  app.whenReady().then(() => {
    lastSeenOrderId = readLastSeen();
    const config = readConfig();
    applyAutoLaunch(config.autoLaunch !== false);
    createTray();
    ensureAlarmWindow();

    if (!config.password) {
      openSetup();
    } else {
      startPolling();
    }

    // Не держим Dock/taskbar как основное окно
    if (process.platform === "win32") {
      app.setAppUserModelId("ru.sharoduwi.staffalert");
    }
  });
}

app.on("window-all-closed", () => {
  // Не выходим — остаёмся в трее.
});

app.on("before-quit", () => {
  if (pollTimer) clearInterval(pollTimer);
  stopAlarm();
});
