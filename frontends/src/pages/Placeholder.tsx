import React from 'react';

const Placeholder: React.FC = () => {
  return (
    <div className="page-not-found">
      <h1>404 - Page Not Found</h1>
      <p>The page you are looking for does not exist.</p>
      <a href="/" className="btn btn-primary">
        Return Home
      </a>
    </div>
  );
};

export default Placeholder;
