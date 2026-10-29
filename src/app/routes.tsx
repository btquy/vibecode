import type { RouteObject } from 'react-router-dom';
import { EntryPage } from '../features/entry/EntryPage';
import { HomePlaceholder } from './HomePlaceholder';

/** PRD §8 – Định tuyến: `/`, `/new`, `/edit/:id`. */
export const routes: RouteObject[] = [
  { path: '/', element: <HomePlaceholder /> },
  { path: '/new', element: <EntryPage /> },
  { path: '/edit/:id', element: <EntryPage /> },
  { path: '*', element: <HomePlaceholder /> },
];

export const routerFuture = {
  v7_relativeSplatPath: true,
  v7_fetcherPersist: true,
  v7_normalizeFormMethod: true,
  v7_partialHydration: true,
  v7_skipActionErrorRevalidation: true,
} as const;
