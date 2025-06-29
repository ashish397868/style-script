import { Link } from 'react-router-dom';


const AccessDenied = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <h1 className="text-red-700 text-4xl mb-4">Access Denied</h1>
      <p className="text-lg mb-6">You do not have permission to view this page.</p>
      <Link to="/" className="px-6 py-2 bg-pink-700 text-white rounded font-medium transition-colors hover:bg-pink-800">Go to Home</Link>
    </div>
  );
};

export default AccessDenied;
