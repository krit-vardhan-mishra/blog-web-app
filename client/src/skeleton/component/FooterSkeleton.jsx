export const FooterSkeleton = () => {
  return (
    <footer className="bg-[#1e1e2f] text-white py-8 px-4 mt-10">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Branding Skeleton */}
        <div>
          <div className="h-6 bg-gray-700 rounded-lg mb-2 w-1/2"></div>
          <div className="h-4 bg-gray-700 rounded-lg w-full"></div>
          <div className="h-4 bg-gray-700 rounded-lg w-3/4 mt-2"></div>
        </div>

        {/* Quick Links Skeleton */}
        <div>
          <div className="h-6 bg-gray-700 rounded-lg mb-3 w-1/3"></div>
          <div className="space-y-2">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="h-4 bg-gray-700 rounded-lg w-2/3"></div>
            ))}
          </div>
        </div>

        {/* Social Media Skeleton */}
        <div>
          <div className="h-6 bg-gray-700 rounded-lg mb-3 w-1/3"></div>
          <div className="flex space-x-4">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="w-5 h-5 bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Text Skeleton */}
      <div className="text-center mt-6 border-t border-gray-700 pt-4">
        <div className="h-4 bg-gray-700 rounded-lg w-1/3 mx-auto"></div>
      </div>
    </footer>
  );
};

export default FooterSkeleton;