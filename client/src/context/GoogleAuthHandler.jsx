import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const GoogleAuthHandler = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { loginUser } = useAuth();

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const token = query.get('token');
    const user = JSON.parse(decodeURIComponent(query.get('user')));

    if (token && user) {
      loginUser({ token, user }, true);
      navigate('/home');
    } else {
      navigate('/login');
    }
  }, [location.search, loginUser, navigate]);

  return <p className="text-white text-center">Signing you in via Google...</p>;
};

export default GoogleAuthHandler;
