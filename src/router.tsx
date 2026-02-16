import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppLayout } from './AppLayout';
import { IndexPage } from './pages';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <IndexPage /> },
      //   {
      //     path: ''
      //     element: <Element />
      //   },
    ],
  },
  {
    path: '*',
    element: <Navigate to='/' replace />,
  },
]);
