import { HashRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import IscilikDetail from './pages/IscilikDetail';
import HesapDetail from './pages/HesapDetail';
import TopBar from './components/TopBar';
import BottomNav from './components/BottomNav';

function App() {
  return (
    <HashRouter>
      <div className="max-w-md mx-auto min-h-screen flex flex-col relative shadow-2xl bg-dark text-gray-200">
        <TopBar />
        <div className="flex-1 overflow-y-auto pb-24">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/iscilik/:id" element={<IscilikDetail />} />
            <Route path="/hesap/:id" element={<HesapDetail />} />
          </Routes>
        </div>
        <BottomNav />
      </div>
    </HashRouter>
  );
}

export default App;
