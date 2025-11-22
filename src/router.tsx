import { createHashRouter } from 'react-router-dom';
import MainView from './pages/MainView';
import Settings from './pages/Settings';

export const router = createHashRouter([
  {
    path: '/',
    element: <MainView />,
  },
  {
    path: '/settings',
    element: <Settings />,
  },
]);
