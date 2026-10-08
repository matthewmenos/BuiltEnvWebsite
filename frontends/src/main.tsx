import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './context/ThemeContext';
import './styles/base.css';
import './styles/layout.css';
import './styles/home.css';
import './styles/programmes.css';
import './styles/programme-detail.css';
import './styles/news.css';
import './styles/news-detail.css';
import './styles/events.css';
import './styles/event-detail.css';
import './styles/staff.css';
import './styles/staff-detail.css';
import './styles/gallery.css';
import './styles/gallery-detail.css';
import './styles/contact.css';
import './styles/admin-login.css';
import './styles/admin.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
