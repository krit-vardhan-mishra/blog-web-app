import HeaderSkeleton from '../component/HeaderSkeleton';
import FooterSkeleton from '../component/FooterSkeleton';

const AccountSettingSkeleton = () => {
  return (
    <div className="bg-[#1C222A] min-h-screen">
      {/* Header Skeleton */}
      <HeaderSkeleton />

      <div className="flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md space-y-6 animate-pulse">
          {/* First Name */}
          <div className="space-y-2">
            <div className="h-4 bg-gray-700 rounded w-1/3" />
            <div className="h-10 bg-gray-700 rounded w-full" />
          </div>

          {/* Last Name */}
          <div className="space-y-2">
            <div className="h-4 bg-gray-700 rounded w-1/3" />
            <div className="h-10 bg-gray-700 rounded w-full" />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <div className="h-4 bg-gray-700 rounded w-1/3" />
            <div className="h-10 bg-gray-700 rounded w-full" />
          </div>

          {/* About Yourself */}
          <div className="space-y-2">
            <div className="h-4 bg-gray-700 rounded w-1/2" />
            <div className="h-24 bg-gray-700 rounded w-full" />
          </div>

          {/* Button */}
          <div className="flex justify-center">
            <div className="h-10 w-32 bg-gray-700 rounded-lg" />
          </div>
        </div>
      </div>

      {/* Footer Skeleton */}
      <FooterSkeleton />
    </div>
  );
};

export default AccountSettingSkeleton;
