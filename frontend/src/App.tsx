import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import BooksPage from './pages/BooksPage';
import AddEditBook from './pages/AddEditBook';
import SearchPage from './pages/SearchPage';
import AVLVisualizer from './pages/AVLVisualizer';
import BSTComparison from './pages/BSTComparison';
import './index.css';

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          {/* Landing page — no sidebar */}
          <Route path="/" element={<Landing />} />

          {/* App shell with sidebar */}
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/books" element={<BooksPage />} />
            <Route path="/add" element={<AddEditBook />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/avl" element={<AVLVisualizer />} />
            <Route path="/compare" element={<BSTComparison />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}
