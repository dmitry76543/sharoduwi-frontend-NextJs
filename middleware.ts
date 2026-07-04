import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import {
  CITY_COOKIE,
  cityPath,
  detectGeoCitySlug,
  DEFAULT_CITY_SLUG,
  getCityBySlug,
  isCitySlug,
  LEGACY_CITY_SLUGS,
} from "@/lib/cities";
import {
  CITY_COOKIE_MAX_AGE,
  getLegacyPathRedirect,
  getRegionalRootConsolidationRedirect,
  isAppRootSegment,
} from "@/lib/cities/routing";

const STATIC_FILE = /\.[a-z0-9]+$/i;

function redirectTo(request: NextRequest, pathname: string, status: 301 | 307 | 308) {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  return NextResponse.redirect(url, status);
}

function setCityCookie(response: NextResponse, slug: string) {
  response.cookies.set(CITY_COOKIE, slug, {
    path: "/",
    maxAge: CITY_COOKIE_MAX_AGE,
    sameSite: "lax",
  });
  response.headers.set("x-city-slug", slug);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    STATIC_FILE.test(pathname)
  ) {
    return NextResponse.next();
  }

  const legacyTarget = getLegacyPathRedirect(pathname);
  if (legacyTarget) {
    return redirectTo(request, legacyTarget, 301);
  }

  const segments = pathname.split("/").filter(Boolean);
  const firstSegment = segments[0];

  if (firstSegment && LEGACY_CITY_SLUGS[firstSegment]) {
    const canonical = LEGACY_CITY_SLUGS[firstSegment];
    const rest = segments.slice(1);
    const newPath = cityPath(canonical, rest.length ? `/${rest.join("/")}` : "/");
    return redirectTo(request, newPath, 301);
  }

  if (
    segments.length === 1 &&
    firstSegment &&
    !isCitySlug(firstSegment) &&
    !isAppRootSegment(firstSegment)
  ) {
    return redirectTo(request, "/", 307);
  }

  const cookieCity = request.cookies.get(CITY_COOKIE)?.value;
  const cookieSlug =
    cookieCity && isCitySlug(cookieCity) ? getCityBySlug(cookieCity)!.slug : null;

  let geoSlug: string | null = null;
  if (!firstSegment || !isCitySlug(firstSegment)) {
    if (!cookieSlug) {
      geoSlug = await detectGeoCitySlug(request);
    }
  }

  const preferredCitySlug = cookieSlug ?? geoSlug;

  const regionalRedirect = getRegionalRootConsolidationRedirect(pathname, preferredCitySlug);
  if (regionalRedirect) {
    const response = redirectTo(request, regionalRedirect, 301);
    const slugToPersist = preferredCitySlug ?? DEFAULT_CITY_SLUG;
    if (!cookieSlug) {
      setCityCookie(response, slugToPersist);
    }
    return response;
  }

  if (firstSegment && isCitySlug(firstSegment)) {
    const response = NextResponse.next();
    setCityCookie(response, getCityBySlug(firstSegment)!.slug);
    return response;
  }

  if (cookieSlug) {
    const response = NextResponse.next();
    response.headers.set("x-city-slug", cookieSlug);
    return response;
  }

  if (geoSlug) {
    const response = NextResponse.next();
    setCityCookie(response, geoSlug);
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon.svg|.*\\..*).*)"],
};
