import { Routes, Route, Navigate } from 'react-router-dom';
import IddingsPlanner from './components/IddingsPlanner';

export default function App() {
  return (
    <Routes>
      <Route path="/:tab" element={<IddingsPlanner />} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
