import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
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
        <Routes>
          <Route path="/architect" element={<AppShell directPersona="developer" />} />
          <Route path="/*" element={<AppShell />} />
        </Routes>
      </TokenProvider>
    </ThemeProvider>
  );
}

export default App;
