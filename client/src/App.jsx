import { Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import PlaceholderAuth from './pages/PlaceholderAuth';

/**
 * App – Root application component.
 * Configures top-level routing for JanSamadhan.
 */
function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<PlaceholderAuth mode="Login" />} />
      <Route path="/register" element={<PlaceholderAuth mode="Register" />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
