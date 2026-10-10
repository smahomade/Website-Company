import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import Home from './pages/Home.jsx';
import HowItWorks from './pages/HowItWorks.jsx';
import Services from './pages/Services.jsx';
import Portfolio from './pages/Portfolio.jsx';
import Contact from './pages/Contact.jsx';
import Register from './pages/Register.jsx';
import NotFound from './pages/NotFound.jsx';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="how-it-works" element={<HowItWorks />} />
        <Route path="services" element={<Services />} />
        <Route path="portfolio" element={<Portfolio />} />
        <Route path="contact" element={<Contact />} />
        <Route path="register" element={<Register />} />

        {/* Legacy static-site URLs (also redirected at the CDN via public/_redirects) */}
        <Route path="index.html" element={<Navigate to="/" replace />} />
        <Route path="how-it-works.html" element={<Navigate to="/how-it-works" replace />} />
        <Route path="services.html" element={<Navigate to="/services" replace />} />
        <Route path="portfolio.html" element={<Navigate to="/portfolio" replace />} />
        <Route path="contact.html" element={<Navigate to="/contact" replace />} />
        <Route path="register.html" element={<Navigate to="/register" replace />} />

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
