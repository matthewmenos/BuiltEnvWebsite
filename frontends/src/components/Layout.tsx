import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import PageTitle from './PageTitle';

const Layout: React.FC = () => {
  return (
    <div className="app">
      {/* Rewrites <title>/canonical/OG tags per public route (SPA SEO). */}
      <PageTitle />
      <Navbar />
      <main className="page-main">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
