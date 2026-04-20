import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { TokenProvider } from './context/TokenContext';
import InboxButton from './components/layout/InboxButton';
import AppShell from './components/shell/AppShell';

const TokenWallet = lazy(() => import('./components/tokens/TokenWallet'));
const BrandSection = lazy(() => import('./components/personas/BrandSection'));
const StatsSection = lazy(() => import('./components/personas/StatsSection'));
const LiveSection = lazy(() => import('./components/personas/LiveSection'));
const CursorShowcase = lazy(() => import('./components/layout/CursorShowcase'));
const AskSection = lazy(() => import('./components/personas/AskSection'));
const MessagesSection = lazy(() => import('./components/personas/MessagesSection'));

// Route-to-persona mapping
const PERSONA_ROUTES = [
  { path: '/about', persona: 'about' },
  { path: '/work', persona: 'work' },
  { path: '/architect', persona: 'work' },
  { path: '/connect', persona: 'connect' },
  { path: '/runner', persona: 'runner' },
  { path: '/ventures', persona: 'ventures' },
  { path: '/thoughts', persona: 'thoughts' },
];

function App() {
  return (
    <ThemeProvider>
      <TokenProvider>
        <InboxButton />
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
          <Route path="/cursors/:id?" element={<Suspense fallback={null}><CursorShowcase /></Suspense>} />
          <Route path="/ask" element={<Suspense fallback={null}><AskSection /></Suspense>} />
          <Route path="/inbox" element={<Suspense fallback={null}><MessagesSection /></Suspense>} />
          <Route path="/*" element={<AppShell />} />
        </Routes>
      </TokenProvider>
    </ThemeProvider>
  );
}

export default App;
