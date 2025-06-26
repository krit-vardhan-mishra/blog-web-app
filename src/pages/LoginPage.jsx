import { useEffect, useState } from "react";
import FeaturesSidebar from "../components/FeaturesSidebar";
import { Button } from "../components/ui/button";
import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import { LoginPageSkeleton } from "../skeleton/pages/LoginPageSkelton";

export const LoginPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    document.title = "Login - Blog App";
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const validate = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex = /^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,}$/;

    if (!formData.email) newErrors.email = "Email is required";
    else if (!emailRegex.test(formData.email)) newErrors.email = "Invalid email format";

    if (!formData.password) newErrors.password = "Password is required";
    else if (!passwordRegex.test(formData.password))
      newErrors.password = "Password must be 8+ chars, include 1 capital letter & 1 symbol";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      window.location.href = "/home";
    }
  };

  if (isLoading) {
    return <LoginPageSkeleton />;
  }

  return (
    <div className="flex h-screen bg-[#1C222A]">
      <FeaturesSidebar />

      <div className="flex flex-col items-center justify-center w-1/2 bg-[#2A2E36]">
        <p className="text-white text-3xl font-bold mb-8">
          Welcome to Your Blog Space
        </p>
        <h1 className="text-white text-4xl font-bold mb-10">Login Here</h1>

        <form className="w-3/4 space-y-6" onSubmit={handleSubmit}>
          {/* Email Input */}
          <div className="grid grid-cols-4 gap-4 items-center">
            <label
              className="col-span-1 text-white transform transition-transform duration-200 hover:scale-110"
              htmlFor="email"
            >
              <b>Email:</b>
            </label>
            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="col-span-3 w-full"
            >
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full p-3 bg-[#1C222A] text-white border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 hover:border-white hover:border-2 transition duration-200"
                placeholder="Enter your email"
                required
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </motion.div>
          </div>

          {/* Password Input */}
          <div className="grid grid-cols-4 gap-4 items-start">
            <label
              className="col-span-1 text-white transform transition-transform duration-200 hover:scale-110 pt-3"
              htmlFor="password"
            >
              <b>Password:</b>
            </label>
            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="col-span-3 w-full"
            >
              <div className="relative w-full">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full p-3 pr-10 bg-[#1C222A] text-white border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 hover:border-white hover:border-2 transition duration-200"
                  placeholder="Enter your password"
                  required
                />
                <div
                  className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-white" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-white" />
                  )}
                </div>
              </div>
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password}</p>
              )}
            </motion.div>
          </div>

          {/* Remember Me Checkbox */}
          <div className="flex justify-center space-x-3">
            <input
              type="checkbox"
              id="remember"
              className="h-5 w-5 bg-[#1C222A] border border-gray-600 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-white hover:border-2 transition duration-200"
            />
            <label htmlFor="remember" className="text-white">
              <b>Remember Me</b>
            </label>
          </div>

          {/* Login Button */}
          <div className="flex justify-center mt-6">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white" type="submit">
                Log in
              </Button>
            </motion.div>
          </div>
        </form>

        <p className="text-white mt-6">
          Don't have an account?{" "}
          <a href="/signup" className="text-blue-400 hover:underline">
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
