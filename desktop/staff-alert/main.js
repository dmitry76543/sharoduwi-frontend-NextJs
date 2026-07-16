const {
  app,
  BrowserWindow,
  Tray,
  Menu,
  nativeImage,
  Notification,
  shell,
  ipcMain,
  screen,
} = require("electron");
const path = require("path");
const fs = require("fs");

const ALARM_WINDOW_WIDTH = 420;
const ALARM_WINDOW_HEIGHT = 260;

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
      melodyId: 0,
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
  const icoFile = path.join(__dirname, "assets", "icon.ico");
  const pngFile = path.join(__dirname, "assets", "icon.png");
  let image = nativeImage.createFromPath(icoFile);
  if (image.isEmpty()) {
    image = nativeImage.createFromPath(pngFile);
  }
  if (image.isEmpty()) {
    image = nativeImage.createEmpty();
  }
  return image.resize({ width: 16, height: 16 });
}

function appWindowIcon() {
  const icoFile = path.join(__dirname, "assets", "icon.ico");
  const pngFile = path.join(__dirname, "assets", "icon.png");
  let image = nativeImage.createFromPath(icoFile);
  if (image.isEmpty()) image = nativeImage.createFromPath(pngFile);
  return image;
}

function getAlarmWindowBounds() {
  const display = screen.getPrimaryDisplay();
  const area = display.workArea;
  const width = ALARM_WINDOW_WIDTH;
  const height = ALARM_WINDOW_HEIGHT;
  // Выше центра, чтобы окно целиком было над панелью задач без прокрутки.
  const x = Math.round(area.x + (area.width - width) / 2);
  const y = Math.round(area.y + Math.max(48, area.height * 0.12));
  return { x, y, width, height };
}

function ensureAlarmWindow() {
  if (alarmWindow && !alarmWindow.isDestroyed()) return alarmWindow;

  const bounds = getAlarmWindowBounds();
  alarmWindow = new BrowserWindow({
    ...bounds,
    show: false,
    skipTaskbar: true,
    resizable: false,
    alwaysOnTop: true,
    icon: appWindowIcon(),
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

function showAlarmWindow(melodyId) {
  const config = readConfig();
  const id =
    typeof melodyId === "number" ? melodyId : Number(config.melodyId) || 0;
  const win = ensureAlarmWindow();
  win.setBounds(getAlarmWindowBounds());
  win.show();
  win.focus();
  win.webContents.send("alarm-start", id);
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
    height: 640,
    resizable: false,
    icon: appWindowIcon(),
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
  const melodyId = Number(config.melodyId) || 0;
  const melodies = [
    [0, "Сирена скорой"],
    [1, "Пожарная"],
    [2, "Красная тревога"],
    [3, "Скорый заказ"],
    [4, "Шаровой звон"],
    [5, "Фанфар"],
    [6, "Кассовый"],
    [7, "Бас"],
    [8, "Неон"],
    [9, "Сирена доставки"],
  ];

  return Menu.buildFromTemplate([
    {
      label: alarming ? "🛑 Остановить сигнал" : "▶️ Проверить звук",
      click: () => {
        if (alarming) stopAlarm();
        else {
          alarming = true;
          showAlarmWindow(melodyId);
        }
      },
    },
    {
      label: "Мелодия оповещения",
      submenu: melodies.map(([id, name]) => ({
        label: name,
        type: "radio",
        checked: melodyId === id,
        click: () => {
          const next = readConfig();
          next.melodyId = id;
          writeConfig(next);
          tray?.setContextMenu(buildTrayMenu());
          alarming = true;
          showAlarmWindow(id);
        },
      })),
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
    showAlarmWindow(Number(config.melodyId) || 0);

    if (Notification.isSupported()) {
      const note = new Notification({
        title: alert.title || "Новый заказ в ШАРОДУВЫ!",
        body: alert.body || "Откройте Staff Alert",
        icon: path.join(__dirname, "assets", "icon.png"),
        silent: true,
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
    melodyId: Number.isFinite(Number(next.melodyId))
      ? Math.min(9, Math.max(0, Number(next.melodyId)))
      : Number(current.melodyId) || 0,
  };
  writeConfig(merged);
  applyAutoLaunch(merged.autoLaunch);
  tray?.setContextMenu(buildTrayMenu());
  startPolling();
  return merged;
});

ipcMain.handle("preview-melody", () => {
  const config = readConfig();
  alarming = true;
  showAlarmWindow(Number(config.melodyId) || 0);
  return true;
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
