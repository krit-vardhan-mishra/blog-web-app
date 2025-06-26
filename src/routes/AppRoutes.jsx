import React from 'react';
import { Routes, Route } from 'react-router-dom';
import SignupPage from '../pages/SignupPage';
import LoginPage from '../pages/LoginPage';
import LandingPage from '../pages/LandingPage';
import { HomePage } from '../pages/HomePage';
import MyPosts from '../pages/MyPosts';
import DeletedBlogs from '../pages/DeletedBlogs';
import AccountSetting from '../pages/AccountSetting';
import NotFound from '../pages/NotFound';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/home" element={<HomePage />} />
      <Route path="/your-posts" element={<MyPosts />} />
      <Route path="/deleted" element={<DeletedBlogs />} />
      <Route path="/account-setting" element={<AccountSetting />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
