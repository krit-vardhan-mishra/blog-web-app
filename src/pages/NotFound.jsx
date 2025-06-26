import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#1C222A] flex flex-col items-center justify-center text-white px-4">
      <h1 className="text-5xl font-bold mb-4">404</h1>
      <p className="text-xl sm:text-2xl text-gray-300 mb-8 text-center">
        Oops! The page you're looking for doesn't exist.
      </p>

      <button
        onClick={() => navigate(-1)}
        className="group flex items-center gap-2 px-6 py-2 bg-gray-700 rounded-full hover:bg-gray-600 transition duration-200"
      >
        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-200" />
        <span className="text-white font-medium">Go Back</span>
      </button>
    </div>
  );
};

export default NotFound;