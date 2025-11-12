// 500 Server Error Page
import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/common/Button';
import { ROUTES } from '../utils/constants';

const Error500 = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-6">
          <h1 className="text-9xl font-bold text-red-600">500</h1>
          <h2 className="text-2xl font-semibold text-gray-900 mt-4">Server Error</h2>
          <p className="text-gray-600 mt-2">
            Something went wrong on our end. Please try again later.
          </p>
        </div>
        <div className="flex gap-4 justify-center">
          <Link to={ROUTES.HOME}>
            <Button variant="primary">Go Home</Button>
          </Link>
          <Button variant="secondary" onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Error500;

