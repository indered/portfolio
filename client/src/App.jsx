import { lazy, Suspense, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { TokenProvider } from './context/TokenContext';
import InboxButton from './components/layout/InboxButton';
import AppShell from './components/shell/AppShell';

const TokenWallet = lazy(() => import('./components/tokens/TokenWallet'));
const BrandingSection = lazy(() => import('./components/personas/BrandingSection'));
const StatsSection = lazy(() => import('./components/personas/StatsSection'));
const LiveSection = lazy(() => import('./components/personas/LiveSection'));
const CursorShowcase = lazy(() => import('./components/layout/CursorShowcase'));
const AskSection = lazy(() => import('./components/personas/AskSection'));
const MessagesSection = lazy(() => import('./components/personas/MessagesSection'));
const AssistantSection = lazy(() => import('./components/personas/AssistantSection'));
const WaterlilyVideoPage = lazy(() => import('./components/video/WaterlilyVideoPage'));
const VideoStatsPage = lazy(() => import('./components/video/VideoStatsPage'));

// Case study pages (crawl-friendly, standalone routes)
const TokopediaDiscovery = lazy(() => import('./components/case-studies/TokopediaDiscovery'));
const EmiratesNbdPaymentTracker = lazy(() => import('./components/case-studies/EmiratesNbdPaymentTracker'));
const WithloveAiAgent = lazy(() => import('./components/case-studies/WithloveAiAgent'));
const Kokaihop3 = lazy(() => import('./components/case-studies/Kokaihop3'));

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

function ResumeViewRedirect() {
  return (
    <iframe
      src="/mahesh-inder-resume.pdf"
      title="Mahesh Inder resume"
      style={{ width: '100vw', height: '100vh', border: 0, display: 'block', background: '#0b1020' }}
    />
  );
}

function ResumeDownloadRedirect() {
  useEffect(() => {
    const link = document.createElement('a');
    link.href = '/mahesh-inder-resume.pdf';
    link.download = 'Mahesh_Inder_Full_Stack_AI.pdf';
    link.click();
  }, []);

  return null;
}

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
          <Route path="/branding" element={<Suspense fallback={null}><BrandingSection /></Suspense>} />
          <Route path="/brand" element={<Suspense fallback={null}><BrandingSection /></Suspense>} />
          <Route path="/stats" element={<Suspense fallback={null}><StatsSection /></Suspense>} />
          <Route path="/live" element={<Suspense fallback={null}><LiveSection /></Suspense>} />
          <Route path="/cursors/:id?" element={<Suspense fallback={null}><CursorShowcase /></Suspense>} />
          <Route path="/resume" element={<ResumeViewRedirect />} />
          <Route path="/resume/download" element={<ResumeDownloadRedirect />} />
          <Route path="/ask" element={<Suspense fallback={null}><AskSection /></Suspense>} />
          <Route path="/inbox" element={<Suspense fallback={null}><MessagesSection /></Suspense>} />
          <Route path="/me" element={<Suspense fallback={null}><AssistantSection /></Suspense>} />
          <Route path="/waterlily-video" element={<Suspense fallback={null}><WaterlilyVideoPage /></Suspense>} />
          <Route path="/video-stats" element={<Suspense fallback={null}><VideoStatsPage /></Suspense>} />
          <Route path="/work/tokopedia-discovery" element={<Suspense fallback={null}><TokopediaDiscovery /></Suspense>} />
          <Route path="/work/emirates-nbd-payment-tracker" element={<Suspense fallback={null}><EmiratesNbdPaymentTracker /></Suspense>} />
          <Route path="/work/withlove-ai-agent" element={<Suspense fallback={null}><WithloveAiAgent /></Suspense>} />
          <Route path="/work/kokaihop-3" element={<Suspense fallback={null}><Kokaihop3 /></Suspense>} />
          <Route path="/*" element={<AppShell />} />
        </Routes>
      </TokenProvider>
    </ThemeProvider>
  );
}

export default App;
