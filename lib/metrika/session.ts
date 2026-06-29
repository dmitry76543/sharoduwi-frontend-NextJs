import { METRIKA_GOALS } from "@/lib/metrika/goals";
import { reachGoal } from "@/lib/metrika/reach-goal";

const STORAGE_KEY = "sharoduwi_metrika_session";
const QUALIFIED_MS = 60_000;

type SessionState = {
  pages: string[];
  startedAt: number;
  productViewed: boolean;
  addToCart: boolean;
  checkoutVisited: boolean;
  orderSent: boolean;
  contactMade: boolean;
  deliveryVisited: boolean;
  fired: Partial<Record<string, true>>;
};

function defaultState(): SessionState {
  return {
    pages: [],
    startedAt: Date.now(),
    productViewed: false,
    addToCart: false,
    checkoutVisited: false,
    orderSent: false,
    contactMade: false,
    deliveryVisited: false,
    fired: {},
  };
}

function readState(): SessionState {
  if (typeof window === "undefined") return defaultState();
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    return { ...defaultState(), ...JSON.parse(raw) };
  } catch {
    return defaultState();
  }
}

function writeState(state: SessionState) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* ignore quota errors */
  }
}

function fireOnce(state: SessionState, key: string, goal: string, params?: Record<string, unknown>) {
  if (state.fired[key]) return state;
  reachGoal(goal, params);
  const next = { ...state, fired: { ...state.fired, [key]: true as const } };
  writeState(next);
  return next;
}

export function trackSessionPage(pathname: string) {
  let state = readState();
  if (!state.pages.includes(pathname)) {
    state = { ...state, pages: [...state.pages, pathname] };
    writeState(state);
  }

  if (state.pages.length >= 2 && Date.now() - state.startedAt >= QUALIFIED_MS) {
    state = fireOnce(state, "qualified_visit", METRIKA_GOALS.QUALIFIED_VISIT, {
      pages: state.pages.length,
      seconds: Math.round((Date.now() - state.startedAt) / 1000),
    });
  }

  return state;
}

export function scheduleQualifiedVisitCheck() {
  if (typeof window === "undefined") return;
  window.setTimeout(() => {
    const state = readState();
    if (state.pages.length >= 2) {
      fireOnce(state, "qualified_visit", METRIKA_GOALS.QUALIFIED_VISIT, {
        pages: state.pages.length,
        seconds: Math.round((Date.now() - state.startedAt) / 1000),
      });
    }
  }, QUALIFIED_MS);
}

export function markProductViewed() {
  const state = { ...readState(), productViewed: true };
  writeState(state);
  tryDeepInterest(state);
}

export function markAddToCartSession() {
  const state = { ...readState(), addToCart: true };
  writeState(state);
  tryDeepInterest(state);
}

export function markCheckoutVisited() {
  const state = { ...readState(), checkoutVisited: true };
  writeState(state);
  return state;
}

export function markOrderSent() {
  const state = { ...readState(), orderSent: true };
  writeState(state);
  return state;
}

export function markContactMade() {
  let state = { ...readState(), contactMade: true };
  writeState(state);
  tryLocalClient(state);
}

export function markDeliveryVisited() {
  let state = { ...readState(), deliveryVisited: true };
  writeState(state);
  tryLocalClient(state);
}

export function trackAlmostOrder(prevPath: string | null, nextPath: string) {
  if (prevPath !== "/checkout" || nextPath === "/checkout") return;
  const state = readState();
  if (state.orderSent) return;
  fireOnce(state, "almost_order", METRIKA_GOALS.ALMOST_ORDER);
}

function tryDeepInterest(state: SessionState) {
  if (!state.productViewed || !state.addToCart) return;
  fireOnce(state, "deep_interest", METRIKA_GOALS.DEEP_INTEREST);
}

function tryLocalClient(state: SessionState) {
  if (!state.contactMade || !state.deliveryVisited) return;
  fireOnce(state, "local_client", METRIKA_GOALS.LOCAL_CLIENT);
}
