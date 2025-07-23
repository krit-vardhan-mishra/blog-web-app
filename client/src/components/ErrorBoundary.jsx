import React from 'react';
import { ArrowLeft } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      errorMessage: ''
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, errorMessage: error.message };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  goBack = () => {
    window.history.back();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#1C222A] flex flex-col items-center justify-center text-white px-4">
          <h1 className="text-4xl font-bold mb-4">Something went wrong.</h1>
          <p className="text-md sm:text-lg text-red-400 mb-2 text-center">
            {this.state.errorMessage}
          </p>

          <button
            onClick={this.goBack}
            className="group flex items-center gap-2 px-6 py-2 bg-gray-700 rounded-full hover:bg-gray-600 transition duration-200"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-200" />
            <span className="text-white font-medium">Go Back</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;