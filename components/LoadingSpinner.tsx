import React from 'react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      <p className="mt-3 text-lg text-gray-700">درحال تولید موضوعات پایان‌نامه...</p>
      <p className="text-sm text-gray-500">این فرآیند ممکن است چند لحظه طول بکشد.</p>
    </div>
  );
};

export default LoadingSpinner;