// Each section of the single page has its own URL. The element id equals the slug.
export interface SectionRoute {
  path: string;
  id: string;
  label: string;
}

export const SECTION_ROUTES: SectionRoute[] = [
  { path: '/', id: 'home', label: 'Home' },
  { path: '/about', id: 'about', label: 'About' },
  { path: '/conditions', id: 'conditions', label: 'Conditions' },
  { path: '/how-it-works', id: 'how-it-works', label: 'How it works' },
  { path: '/reviews', id: 'reviews', label: 'Reviews' },
  { path: '/faq', id: 'faq', label: 'FAQ' },
  { path: '/contact', id: 'contact', label: 'Contact' },
];

export function routeForPath(pathname: string): SectionRoute | undefined {
  const normalised = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;
  return SECTION_ROUTES.find(route => route.path === normalised);
}

export function routeForId(id: string): SectionRoute | undefined {
  return SECTION_ROUTES.find(route => route.id === id);
}
