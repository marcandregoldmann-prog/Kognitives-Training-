import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import ErrorBoundary from './ErrorBoundary';

// Indicate that the script has loaded successfully
(window as any).appLoaded = true;
const loadingText = document.getElementById('loading-text');
if (loadingText) loadingText.textContent = 'Initialisiere...';

try {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    throw new Error("Root element not found");
  }

  createRoot(rootElement).render(
    <StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </StrictMode>,
  );
} catch (e) {
  console.error("Failed to render app:", e);
  if (loadingText) loadingText.textContent = 'Fehler beim Starten der App';
  const loadingSub = document.getElementById('loading-subtext');
  if (loadingSub) loadingSub.textContent = String(e);
}
