export const EditPostSkeleton = () => {
  return (
    <div className="text-white">
      <div className="h-6 bg-gray-700 rounded-lg mb-4 w-1/3"></div>
      <form>
        <div className="mb-4">
          <div className="h-4 bg-gray-700 rounded-lg mb-2 w-1/2"></div>
          <div className="w-full h-10 bg-gray-700 rounded-lg"></div>
        </div>
        <div className="mb-4">
          <div className="h-4 bg-gray-700 rounded-lg mb-2 w-1/2"></div>
          <div className="w-full h-24 bg-gray-700 rounded-lg"></div>
        </div>
        <div className="h-10 bg-gray-700 rounded-lg w-20"></div>
      </form>
    </div>
  );
};

export default EditPostSkeleton;