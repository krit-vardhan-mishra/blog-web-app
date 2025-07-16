import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '../components/ui/Button';
import { passwordResetService } from '../api/authService';

export const SetPasswordPage = () => {
  const { search } = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(search);
  const token = params.get('token');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    document.title = 'Set Your Password';
    if (!token) {
      navigate('/login');
    } else {
      // stash token in local storage (or context) so our API calls pick it up:
      localStorage.setItem('authToken', token);
    }
  }, [token, navigate]);

  const validate = () => {
    const errs = {};
    if (password.length < 8) errs.password = 'At least 8 characters';
    if (password !== confirm) errs.confirm = 'Passwords do not match';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    try {
      await passwordResetService.setPassword(password);  // new API call
      navigate('/dashboard');  // or wherever
    } catch (err) {
      setErrors({ form: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1C222A] px-4">
      <div className="bg-[#2A2E36] p-8 rounded-lg shadow-xl w-full max-w-sm">
        <h1 className="text-white text-2xl font-bold mb-6 text-center">Choose a Password</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-white font-semibold block mb-1">Password</label>
            <motion.input
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full p-3 bg-[#1C222A] text-white rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
            />
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
          </div>
          <div>
            <label className="text-white font-semibold block mb-1">Confirm Password</label>
            <motion.input
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              className="w-full p-3 bg-[#1C222A] text-white rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
            />
            {errors.confirm && <p className="text-red-500 text-sm mt-1">{errors.confirm}</p>}
          </div>
          {errors.form && <p className="text-red-500 text-center">{errors.form}</p>}
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg"
            >
              {isLoading ? 'Setting…' : 'Set Password'}
            </Button>
          </motion.div>
        </form>
      </div>
    </div>
  );
};

export default SetPasswordPage;