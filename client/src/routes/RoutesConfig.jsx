import React, { lazy, Suspense } from 'react';
import {
  Route,
  createRoutesFromElements,
} from 'react-router-dom';

import PublicRoute from './PublicRoute';
import PrivateRoute from './PrivateRoute';
import PageLayout from '../components/PageLayout';
import RootLayout from '../components/RootLayout';
import RouterErrorBoundary from '@/components/RouterErrorBoundary';
import GoogleAuthHandler from '../context/GoogleAuthHandler';

import {
  exploreLoader,
  blogDetailLoader,
  userDetailLoader,
  createCachedLoader
} from './loaders';

import {
  homePageLoader,
  myPostsLoader,
} from './protectedLoaders';
import DeletedBlogs from '@/pages/DeletedBlogs';

const PageLoadingSpinner = () => (
  <div className="min-h-screen bg-[#1A1C20] flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
      <p className="text-gray-400 text-lg">Loading...</p>
    </div>
  </div>
);

const LandingPage = lazy(() => import('../pages/LandingPage'));
const ExplorePage = lazy(() => import('../pages/ExplorePage'));
const UserDetail = lazy(() => import('../pages/UserDetail'));
const BlogDetail = lazy(() => import('../pages/BlogDetail'));
const AuthPage = lazy(() => import('../pages/AuthPage'));
const VerifySignupPage = lazy(() => import('../pages/VerifySignupPage'));
const ForgotPasswordPage = lazy(() => import('../pages/ForgotPasswordPage'));
const VerifyOTPPage = lazy(() => import('../pages/VerifyOTPPage'));
const ResetPasswordPage = lazy(() => import('../pages/ResetPasswordPage'));
const SetPasswordPage = lazy(() => import('../pages/SetPasswordPage'));
const HomePage = lazy(() => import('../pages/HomePage'));
const MyPosts = lazy(() => import('../pages/MyPosts'));
const AccountSetting = lazy(() => import('../pages/AccountSetting'));
const NotFound = lazy(() => import('../pages/NotFound'));

const cachedExploreLoader = createCachedLoader(exploreLoader);
const cachedBlogDetailLoader = createCachedLoader(blogDetailLoader);
const cachedUserDetailLoader = createCachedLoader(userDetailLoader);

const SuspenseWrapper = ({ children }) => (
  <Suspense fallback={<PageLoadingSpinner />}>
    {children}
  </Suspense>
);

const routes = createRoutesFromElements(
  <Route
    path="/"
    element={<RootLayout />}
    errorElement={<RouterErrorBoundary />}
  >
    {/* Public Routes */}
    <Route element={<PublicRoute />}>
      <Route
        index
        element={
          <SuspenseWrapper>
            <LandingPage />
          </SuspenseWrapper>
        }
      />
      <Route
        path="login"
        element={
          <SuspenseWrapper>
            <AuthPage />
          </SuspenseWrapper>
        }
      />
      <Route
        path="signup"
        element={
          <SuspenseWrapper>
            <AuthPage />
          </SuspenseWrapper>
        }
      />
      <Route path="google-auth" element={<GoogleAuthHandler />} />
      <Route
        path="forgot-password"
        element={
          <SuspenseWrapper>
            <ForgotPasswordPage />
          </SuspenseWrapper>
        }
      />
      <Route
        path="verify-otp"
        element={
          <SuspenseWrapper>
            <VerifyOTPPage />
          </SuspenseWrapper>
        }
      />
      <Route
        path="verify-signup"
        element={
          <SuspenseWrapper>
            <VerifySignupPage />
          </SuspenseWrapper>
        }
      />
      <Route
        path="reset-password"
        element={
          <SuspenseWrapper>
            <ResetPasswordPage />
          </SuspenseWrapper>
        }
      />
      <Route
        path="set-password"
        element={
          <SuspenseWrapper>
            <SetPasswordPage />
          </SuspenseWrapper>
        }
      />
    </Route>

    {/* Routes with Header */}
    <Route element={<PageLayout />}>
      {/* Public Loadable Routes */}
      <Route
        path="explore"
        element={
          <SuspenseWrapper>
            <ExplorePage />
          </SuspenseWrapper>
        }
        loader={cachedExploreLoader}
        errorElement={<RouterErrorBoundary />}
      />
      <Route
        path="user/:userId"
        element={
          <SuspenseWrapper>
            <UserDetail />
          </SuspenseWrapper>
        }
        loader={cachedUserDetailLoader}
        errorElement={<RouterErrorBoundary />}
      />
      <Route
        path="blog/:blogId"
        element={
          <SuspenseWrapper>
            <BlogDetail />
          </SuspenseWrapper>
        }
        loader={cachedBlogDetailLoader}
        errorElement={<RouterErrorBoundary />}
      />

      {/* Private Routes */}
      <Route element={<PrivateRoute />}>
        <Route
          path="home"
          element={
            <SuspenseWrapper>
              <HomePage />
            </SuspenseWrapper>
          }
          loader={homePageLoader}
          errorElement={<RouterErrorBoundary />}
        />
        <Route
          path="your-posts"
          element={
            <SuspenseWrapper>
              <MyPosts />
            </SuspenseWrapper>
          }
          loader={myPostsLoader}
          errorElement={<RouterErrorBoundary />}
        />
        <Route
          path="deleted"
          element={
            <SuspenseWrapper>
              <DeletedBlogs />
            </SuspenseWrapper>
          }
          errorElement={<RouterErrorBoundary />}
        />
        <Route
          path="account-setting"
          element={
            <SuspenseWrapper>
              <AccountSetting />
            </SuspenseWrapper>
          }
          errorElement={<RouterErrorBoundary />}
        />
      </Route>
    </Route>

    {/* Fallback */}
    <Route
      path="*"
      element={
        <SuspenseWrapper>
          <NotFound />
        </SuspenseWrapper>
      }
    />
  </Route>
);

export default routes;