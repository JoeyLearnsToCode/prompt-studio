import { createBrowserRouter } from 'react-router-dom';
import MainView from './pages/MainView';
import Settings from './pages/Settings';
import SnippetLibrary from './pages/SnippetLibrary';
import DiffView from './pages/DiffView';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainView />,
  },
  {
    path: '/settings',
    element: <Settings />,
  },
  {
    path: '/snippets',
    element: <SnippetLibrary />,
  },
  {
    path: '/diff',
    element: <DiffView />,
  },
]);
