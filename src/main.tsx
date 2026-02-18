import { createRoot } from 'react-dom/client';
import { MantineProvider } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';
import { createGlobalStyle } from 'styled-components';
import { Analytics } from '@vercel/analytics/react';
import { App } from './App';
import '@mantine/core/styles.css';

const GlobalStyle = createGlobalStyle`
  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  * {
    margin: 0;
    padding: 0;
  }

  html, body, #root {
    height: 100%;
  }

  body {
    font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI',
      sans-serif;
    line-height: 1.4;
    background: #f5f2ec;
    color: #3a3530;
  }

  button {
    font: inherit;
    background: none;
  }
`;

createRoot(document.getElementById('root')!).render(
  <MantineProvider>
    <ModalsProvider>
      <App />
      <GlobalStyle />
      <Analytics />
    </ModalsProvider>
  </MantineProvider>,
);
