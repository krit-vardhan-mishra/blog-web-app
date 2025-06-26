export const HeaderSkeleton = () => {
  return (
    <div className="w-full h-[70px] bg-gray-800/80 backdrop-blur-md shadow-md flex items-center justify-between px-4 border-b border-gray-700">
      <div className="h-8 bg-gray-700 rounded-lg w-1/4"></div>
      <div className="flex items-center space-x-2 mr-[5px]">
        {[...Array(3)].map((_, index) => (
          <div key={index} className="w-10 h-10 bg-gray-700 rounded-full"></div>
        ))}
      </div>
    </div>
  );
};

export default HeaderSkeleton;