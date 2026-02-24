import { lazy, Suspense } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { TokenProvider } from './context/TokenContext';
import CursorEffect from './components/layout/CursorEffect';
import AppShell from './components/shell/AppShell';

const TokenWallet = lazy(() => import('./components/tokens/TokenWallet'));

function App() {
  return (
    <ThemeProvider>
      <TokenProvider>
        <CursorEffect />
        <Suspense fallback={null}>
          <TokenWallet />
        </Suspense>
        <AppShell />
      </TokenProvider>
    </ThemeProvider>
  );
}

export default App;
