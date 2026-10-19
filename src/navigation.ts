import React from 'react';
import { SECTION_ROUTES, routeForPath } from './routes';

// While a link or back/forward is scrolling us to a section, scroll tracking must not rewrite the URL.
let pendingPath: string | null = null;
let pendingTimer: number | undefined;

export function getPendingPath(): string | null {
  return pendingPath;
}

function clearPending() {
  pendingPath = null;
  window.clearTimeout(pendingTimer);
}

if (typeof window !== 'undefined') {
  window.addEventListener('scrollend', clearPending);
}

export function scrollToPath(pathname: string, behavior: ScrollBehavior = 'smooth'): void {
  const route = routeForPath(pathname);
  if (!route) return;

  pendingPath = route.path;
  window.clearTimeout(pendingTimer);
  pendingTimer = window.setTimeout(clearPending, behavior === 'smooth' ? 3000 : 100);

  if (route.id === 'home') {
    window.scrollTo({ top: 0, behavior });
  } else {
    document.getElementById(route.id)?.scrollIntoView({ behavior });
  }
}

export function navigateToSection(path: string): void {
  if (window.location.pathname !== path) {
    window.history.pushState(null, '', path);
  }
  scrollToPath(path);
}

// The section being read: the last one whose top has passed 35% of the viewport.
export function currentSectionPath(): string {
  const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
  if (atBottom) return SECTION_ROUTES[SECTION_ROUTES.length - 1].path;

  const line = window.innerHeight * 0.35;
  for (let i = SECTION_ROUTES.length - 1; i >= 0; i--) {
    const el = document.getElementById(SECTION_ROUTES[i].id);
    if (el && el.getBoundingClientRect().top <= line) return SECTION_ROUTES[i].path;
  }
  return '/';
}

// For <a href="/about"> links: keep the real href for crawlers and new tabs, scroll in place otherwise.
export function handleSectionLinkClick(event: React.MouseEvent<HTMLAnchorElement>, path: string): void {
  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  event.preventDefault();
  navigateToSection(path);
}
