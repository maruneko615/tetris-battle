import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Menu from './pages/Menu';
import SinglePlayer from './components/SinglePlayer';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Menu />} />
        <Route path="/single" element={<SinglePlayer />} />
        <Route path="/multi" element={<div style={{ padding: 24, color: '#8888bb' }}>Multiplayer — coming soon</div>} />
      </Routes>
    </BrowserRouter>
  );
}
