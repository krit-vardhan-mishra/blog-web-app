import { FeaturesSidebarSkeleton } from "../component/FeaturesSideBarSkeleton";

export const LoginPageSkeleton = () => {
  return (
    <div className="flex h-screen bg-[#1C222A]">
      <FeaturesSidebarSkeleton />

      <div className="flex flex-col items-center justify-center w-1/2 bg-[#2A2E36]">
        <div className="w-3/4 space-y-8">
          {/* Welcome Text Skeleton */}
          <div className="text-center space-y-4">
            <div className="h-8 bg-gray-600 rounded w-3/4 mx-auto"></div>
            <div className="h-10 bg-gray-600 rounded w-1/2 mx-auto"></div>
          </div>

          {/* Form Skeleton */}
          <div className="space-y-6">
            {/* Email Input Skeleton */}
            <div className="grid grid-cols-4 gap-4 items-center">
              <div className="col-span-1">
                <div className="h-6 bg-gray-600 rounded w-16"></div>
              </div>
              <div className="col-span-3">
                <div className="h-12 bg-[#1C222A] border border-gray-600 rounded-lg"></div>
              </div>
            </div>

            {/* Password Input Skeleton */}
            <div className="grid grid-cols-4 gap-4 items-center">
              <div className="col-span-1">
                <div className="h-6 bg-gray-600 rounded w-20"></div>
              </div>
              <div className="col-span-3 relative">
                <div className="h-12 bg-[#1C222A] border border-gray-600 rounded-lg"></div>
                <div className="absolute inset-y-0 right-3 flex items-center">
                  <div className="w-5 h-5 bg-gray-600 rounded"></div>
                </div>
              </div>
            </div>

            {/* Remember Me Checkbox Skeleton */}
            <div className="flex justify-center space-x-3 items-center">
              <div className="h-5 w-5 bg-[#1C222A] border border-gray-600 rounded"></div>
              <div className="h-5 bg-gray-600 rounded w-24"></div>
            </div>

            {/* Login Button Skeleton */}
            <div className="flex justify-center mt-6">
              <div className="h-10 bg-gray-600 rounded w-24"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};