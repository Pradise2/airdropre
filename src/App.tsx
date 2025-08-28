// src/App.tsx

import { Routes, Route } from 'react-router-dom';
import { Header } from './components/Header';
import { HomePage } from './pages/HomePage';
import { CreatePage } from './pages/CreatePage';
import { DetailsPage } from './pages/DetailsPage';
import './App.css'; // For main layout styling

function App() {
  return (
    <div className="appContainer">
      <Header />
      <main className="mainContent">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/create" element={<CreatePage />} />
          {/* The :id is a URL parameter for fetching a specific raindrop */}
          <Route path="/raindrop/:id" element={<DetailsPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;