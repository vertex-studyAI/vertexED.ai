import { createRoot } from 'react-dom/client'
import App from './app/App'
import AppErrorBoundary from '@/components/AppErrorBoundary'
import './index.css'
import { initMonitoring } from '@/lib/monitoring'
import { initTransientSessionIsolation } from '@/lib/transientSessionIsolation'

initMonitoring();
initTransientSessionIsolation();

createRoot(document.getElementById("root")!).render(
  <AppErrorBoundary>
    <App />
  </AppErrorBoundary>,
);