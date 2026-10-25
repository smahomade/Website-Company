import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './styles.css';

const app = (
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
/* Built pages arrive as finished HTML (scripts/prerender.mjs): pick that up rather than redraw it,
   once the browser has shown it (the frame after this one; or in 200 ms for a tab in the
   background, where frames wait). The dev server sends an empty root, so it renders from scratch. */
const root = document.getElementById('root');
if (root.hasChildNodes()) {
  let started = false;
  const hydrate = () => {
    if (started) return;
    started = true;
    ReactDOM.hydrateRoot(root, app);
  };
  requestAnimationFrame(() => setTimeout(hydrate, 0));
  setTimeout(hydrate, 200);
} else ReactDOM.createRoot(root).render(app);
