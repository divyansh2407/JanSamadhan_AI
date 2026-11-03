import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';

/**
 * App – Root application component.
 * All page-level routing is defined here.
 * Additional routes will be added in later stages.
 */
function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      {/* Stage 2+: auth, dashboard, reports, admin routes */}
    </Routes>
  );
}

export default App;
