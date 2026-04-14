import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { TokenProvider } from './context/TokenContext';
import CursorEffect from './components/layout/CursorEffect';
import AppShell from './components/shell/AppShell';

const TokenWallet = lazy(() => import('./components/tokens/TokenWallet'));
const BrandSection = lazy(() => import('./components/personas/BrandSection'));
const StatsSection = lazy(() => import('./components/personas/StatsSection'));
const LiveSection = lazy(() => import('./components/personas/LiveSection'));

// Route-to-persona mapping
const PERSONA_ROUTES = [
  { path: '/work', persona: 'developer' },
  { path: '/architect', persona: 'developer' }, // legacy — already shared with people
  { path: '/runner', persona: 'runner' },
  { path: '/ventures', persona: 'blockchain' },
  { path: '/connect', persona: 'social' },
  { path: '/thoughts', persona: 'thinker' },
  { path: '/about', persona: 'dating' },
];

function App() {
  return (
    <ThemeProvider>
      <TokenProvider>
        <CursorEffect />
        <Suspense fallback={null}>
          <TokenWallet />
        </Suspense>
        <Routes>
          {PERSONA_ROUTES.map(({ path, persona }) => (
            <Route key={path} path={path} element={<AppShell directPersona={persona} />} />
          ))}
          <Route path="/brand" element={<Suspense fallback={null}><BrandSection /></Suspense>} />
          <Route path="/stats" element={<Suspense fallback={null}><StatsSection /></Suspense>} />
          <Route path="/live" element={<Suspense fallback={null}><LiveSection /></Suspense>} />
          <Route path="/*" element={<AppShell />} />
        </Routes>
      </TokenProvider>
    </ThemeProvider>
  );
}

export default App;
