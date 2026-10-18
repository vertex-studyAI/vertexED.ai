import { createContext } from 'react';

// Presentation only. Authorization remains in ProtectedRoute and the API.
export const BetaAccessDisplayContext = createContext<(visible: boolean) => void>(() => {});
