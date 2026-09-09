import { createRoot } from 'react-dom/client'
import App from './app/App'
import AppErrorBoundary from '@/components/AppErrorBoundary'
import './index.css'
import './styles/workbook.css'
import { initMonitoring } from '@/lib/monitoring'
import { initTransientSessionIsolation } from '@/lib/transientSessionIsolation'
import { authCallbackLocation } from '@/lib/authReturn.mjs'

// Providers can return to Site URL instead of redirectTo. Use the same error,
// recovery and invitation handling there, before mounting the router/analytics.
const authReturn = authCallbackLocation(window.location);
if (authReturn) window.history.replaceState(window.history.state, '', authReturn);

initMonitoring();
initTransientSessionIsolation();

createRoot(document.getElementById("root")!).render(
  <AppErrorBoundary>
    <App />
  </AppErrorBoundary>,
);
