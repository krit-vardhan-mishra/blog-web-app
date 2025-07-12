import PostDetailsSkeleton from '../component/PostDetailsSkeleton';
import FooterSkeleton from '../component/FooterSkeleton';
import HeaderSkeleton from '../component/HeaderSkeleton';

export const HomePageSkeleton = () => {
  return (
    <div className="bg-[#1C222A] min-h-screen">
      <HeaderSkeleton />

      <div className="max-w-4xl mx-auto p-6">
        {/* Dynamic Greeting Skeleton */}
        <div className="mb-8">
          <div className="h-10 bg-gray-700 rounded-lg mb-2 w-2/3"></div>
          <div className="h-6 bg-gray-700 rounded-lg w-1/3"></div>
          <div className="h-1 w-full bg-gray-700 rounded-full mt-3"></div>
        </div>

        {/* Welcome Message Skeleton */}
        <div className="bg-[#2A2E36] rounded-lg p-6 mb-6">
          <div className="h-7 bg-gray-700 rounded-lg mb-3 w-3/4"></div>
          <div className="h-4 bg-gray-700 rounded-lg w-full"></div>
          <div className="h-4 bg-gray-700 rounded-lg w-2/3 mt-2"></div>
        </div>

        {/* Quick Stats Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="bg-[#2A2E36] rounded-lg p-4 text-center">
              <div className="h-5 bg-gray-700 rounded-lg mb-2 w-2/3 mx-auto"></div>
              <div className="h-8 bg-gray-700 rounded-lg mb-2 w-1/3 mx-auto"></div>
              <div className="h-4 bg-gray-700 rounded-lg w-1/2 mx-auto"></div>
            </div>
          ))}
        </div>

        {/* Post Details Skeletons */}
        <PostDetailsSkeleton />
        <PostDetailsSkeleton />
        <PostDetailsSkeleton />
      </div>

      {/* Floating Action Button Skeleton */}
      <div className="fixed bottom-6 right-6 z-50 bg-gray-700 p-4 rounded-full shadow-lg">
        <div className="w-6 h-6 bg-gray-600 rounded"></div>
      </div>

      <FooterSkeleton />
    </div>
  );
};

export default HomePageSkeleton;