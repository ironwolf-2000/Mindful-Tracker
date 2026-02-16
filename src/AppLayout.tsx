import type { FC } from 'react';
import { Outlet } from 'react-router-dom';
import { AppShell } from '@mantine/core';
// import { Header } from './components';

export const AppLayout: FC = () => (
  <AppShell padding='xl' header={{ height: 60 }}>
    {/* <Header /> */}
    <Outlet />
  </AppShell>
);
