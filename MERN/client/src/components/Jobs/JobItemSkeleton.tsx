const JobItemSkeleton = () => {
  return (
    <li className="relative flex flex-col lg:flex-row gap-8 lg:gap-4 bg-white rounded-md shadow-[0_12px_16px_0_#d7e9ec] mb-8 lg:mb-4 p-7 px-6 lg:px-10 animate-pulse">
      <div className="w-16 h-16 lg:w-[88px] lg:h-[88px] bg-gray-200 rounded -mt-14 md:mt-0 mb-[-16px]"></div>
      <div className="flex-1 flex flex-col lg:flex-row lg:items-center">
        <div className="flex-1">
          <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
          <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
          <div className="h-3 bg-gray-200 rounded w-64"></div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <div className="h-8 bg-gray-200 rounded w-20"></div>
          <div className="h-8 bg-gray-200 rounded w-24"></div>
          <div className="h-8 bg-gray-200 rounded w-28"></div>
        </div>
      </div>
    </li>
  );
};

export default JobItemSkeleton;
