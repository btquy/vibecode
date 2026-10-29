import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import '@fontsource/be-vietnam-pro/400.css';
import '@fontsource/be-vietnam-pro/500.css';
import '@fontsource/be-vietnam-pro/600.css';
import '@fontsource/be-vietnam-pro/700.css';
import './styles/tokens.css';
import './styles/global.css';
import { ToastProvider } from './components/Toast';
import { routerFuture, routes } from './app/routes';

const router = createBrowserRouter(routes, { future: routerFuture });

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ToastProvider>
      <RouterProvider router={router} future={{ v7_startTransition: true }} />
    </ToastProvider>
  </StrictMode>,
);
