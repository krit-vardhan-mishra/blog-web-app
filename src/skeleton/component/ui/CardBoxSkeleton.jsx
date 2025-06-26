export  const CardBoxSkeleton = () => {
  return (
    <div className="bg-[#2A2E36] text-white rounded-2xl py-4 px-6 shadow-lg p-6 w-full">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-7 h-7 bg-gray-600 rounded"></div>
        <div className="h-6 bg-gray-600 rounded w-3/4"></div>
      </div>
      <div className="space-y-2">
        <div className="h-4 bg-gray-600 rounded w-full"></div>
        <div className="h-4 bg-gray-600 rounded w-2/3"></div>
      </div>
    </div>
  );
};