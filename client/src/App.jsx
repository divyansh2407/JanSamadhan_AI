/**
 * JanSamadhan – Root Application Component
 * Provides global authentication context and top-level routing.
 */

import { AuthProvider } from './context/AuthContext';
import AppRoutes from './routes/AppRoutes';

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;
