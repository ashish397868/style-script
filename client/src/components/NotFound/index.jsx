import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <h1 className="text-4xl font-bold text-red-600 mb-4">404 - Page Not Found</h1>
      <p className="text-lg mb-6">Sorry, the page you are looking for does not exist.</p>
      <Link to="/" className="px-6 py-2 bg-blue-700 text-white rounded font-medium transition-colors hover:bg-blue-800">Go to Home</Link>
    </div>
  );
};

export default NotFound;
