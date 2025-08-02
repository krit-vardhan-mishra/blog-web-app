import React from 'react';
import { useRouteError, useNavigate } from 'react-router-dom';
import { ArrowLeft, Home, RefreshCw, AlertTriangle } from 'lucide-react';

const RouterErrorBoundary = () => {
  const error = useRouteError();
  const navigate = useNavigate();
  const NODE_ENV = "DEVELOPMENT";

  const getErrorDetails = () => {
    if (error?.status) {
      switch (error.status) {
        case 404:
          return {
            title: "Page Not Found",
            message: "The page you're looking for doesn't exist or has been moved.",
            statusCode: "404"
          };
        case 403:
          return {
            title: "Access Forbidden",
            message: "You don't have permission to access this resource.",
            statusCode: "403"
          };
        case 401:
          return {
            title: "Unauthorized",
            message: "Please log in to access this page.",
            statusCode: "401"
          };
        case 500:
          return {
            title: "Server Error",
            message: "Something went wrong on our end. Please try again later.",
            statusCode: "500"
          };
        default:
          return {
            title: "Something Went Wrong",
            message: error.statusText || "An unexpected error occurred.",
            statusCode: error.status?.toString()
          };
      }
    }

    if (error instanceof Error) {
      return {
        title: "Application Error",
        message: error.message || "An unexpected error occurred in the application.",
        statusCode: null,
        stack: error.stack
      };
    }

    return {
      title: "Unknown Error",
      message: "An unexpected error occurred.",
      statusCode: null
    };
  };

  const { title, message, statusCode, stack } = getErrorDetails();

  const handleGoBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  const handleGoHome = () => {
    navigate('/');
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1A1C20] to-[#2A2D35] flex flex-col items-center justify-center text-white px-4">
      <div className="max-w-2xl w-full text-center">
        {/* Error Icon */}
        <div className="mb-8">
          <div className="w-20 h-20 mx-auto bg-red-500/20 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-10 h-10 text-red-400" />
          </div>
        </div>

        {/* Status Code */}
        {statusCode && (
          <div className="text-6xl font-bold text-red-400 mb-4">
            {statusCode}
          </div>
        )}

        {/* Error Title */}
        <h1 className="text-3xl md:text-4xl font-bold mb-4 text-gray-100">
          {title}
        </h1>

        {/* Error Message */}
        <p className="text-lg text-gray-300 mb-8 leading-relaxed">
          {message}
        </p>

        {/* Error Details (Development Only) */}
        {NODE_ENV === 'DEVELOPMENT' && error && (
          <details className="mb-8 text-left">
            <summary className="cursor-pointer text-gray-400 hover:text-gray-200 mb-2">
              Show Error Details
            </summary>
            <div className="bg-gray-800/50 p-4 rounded-lg text-sm">
              <div className="mb-2">
                <strong className="text-red-400">Error:</strong>
                <div className="text-gray-300 mt-1">{error.toString()}</div>
              </div>
              {stack && (
                <div>
                  <strong className="text-red-400">Stack Trace:</strong>
                  <pre className="text-xs text-gray-400 mt-1 overflow-x-auto whitespace-pre-wrap">
                    {stack}
                  </pre>
                </div>
              )}
            </div>
          </details>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button
            onClick={handleGoBack}
            className="group flex items-center gap-2 px-6 py-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-all duration-200 transform hover:scale-105"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-200" />
            <span className="font-medium">Go Back</span>
          </button>

          <button
            onClick={handleGoHome}
            className="group flex items-center gap-2 px-6 py-3 bg-blue-600 rounded-lg hover:bg-blue-700 transition-all duration-200 transform hover:scale-105"
          >
            <Home className="w-5 h-5" />
            <span className="font-medium">Go Home</span>
          </button>

          <button
            onClick={handleRefresh}
            className="group flex items-center gap-2 px-6 py-3 bg-green-600 rounded-lg hover:bg-green-700 transition-all duration-200 transform hover:scale-105"
          >
            <RefreshCw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-300" />
            <span className="font-medium">Refresh</span>
          </button>
        </div>

        {/* Additional Help */}
        <div className="mt-8 text-sm text-gray-400">
          <p>If this problem persists, please contact support or try again later.</p>
        </div>
      </div>
    </div>
  );
};

export default RouterErrorBoundary;