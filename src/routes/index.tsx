import { createBrowserRouter } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import Home from '@/pages/Home';

export const router = createBrowserRouter([
  {
    path: ROUTES.HOME,
    element: <Home />,
  },
]);
