import { createBrowserRouter } from 'react-router-dom';
import MainView from './pages/MainView';
import Settings from './pages/Settings';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainView />,
  },
  {
    path: '/settings',
    element: <Settings />,
  },
]);
