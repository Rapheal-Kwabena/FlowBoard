import React from 'react';
import zxcvbn from 'zxcvbn';

interface PasswordStrengthProps {
  password?: string;
}

const PasswordStrength: React.FC<PasswordStrengthProps> = ({ password }) => {
  const testResult = zxcvbn(password || '');
  const score = testResult.score;

  const strengthLabel = ['Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
  const strengthColor = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500', 'bg-teal-500'];

  return (
    <div className="mt-2">
      <div className="flex justify-between mb-1">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Password Strength</span>
        <span className={`text-sm font-medium ${strengthColor[score]}`}>{strengthLabel[score]}</span>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <div
          className={`h-2 rounded-full ${strengthColor[score]}`}
          style={{ width: `${((score + 1) / 5) * 100}%` }}
        />
      </div>
    </div>
  );
};

export default PasswordStrength;