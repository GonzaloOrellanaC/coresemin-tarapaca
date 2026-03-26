import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import About from './pages/About';
import NewsList from './pages/NewsList';
import NewsDetail from './pages/NewsDetail';
import Events from './pages/Events';
import PresenciaRegional from './pages/PresenciaRegional';
import Admin from './pages/Admin';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';
import Blogs from './pages/Blogs';
import Contact from './pages/Contact';

const ScrollToTop = () => {
  const { pathname } = useLocation();

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

const App: React.FC = () => {
  return (
    <Router>
      <ScrollToTop />
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/nosotros" element={<About />} />
            <Route path="/noticias" element={<NewsList />} />
            <Route path="/noticia/:slug" element={<NewsDetail />} />
            <Route path="/eventos" element={<Events />} />
            <Route path="/presencia-regional" element={<PresenciaRegional />} />
            <Route path="/blogs" element={<Blogs />} />
            <Route path="/contacto" element={<Contact />} />
            <Route path="/admin" element={
              <ProtectedRoute>
                <Admin />
              </ProtectedRoute>
            } />
            <Route path="/login" element={<Login />} />
          </Routes>
        </main>
        <Footer />
      </div> 
    </Router>
  );
};

export default App;