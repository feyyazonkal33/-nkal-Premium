import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import IscilikList from './pages/IscilikList';
import IscilikDetail from './pages/IscilikDetail';
import HesapList from './pages/HesapList';
import HesapDetail from './pages/HesapDetail';

function App() {
  return (
    <BrowserRouter>
      <div className="max-w-md mx-auto min-h-screen relative shadow-2xl bg-dark text-gray-200">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/iscilik" element={<IscilikList />} />
          <Route path="/iscilik/:id" element={<IscilikDetail />} />
          <Route path="/hesap" element={<HesapList />} />
          <Route path="/hesap/:id" element={<HesapDetail />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
