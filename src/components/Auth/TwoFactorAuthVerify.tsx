import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

interface TwoFactorAuthVerifyProps {
  onSuccess: () => void;
}

const TwoFactorAuthVerify: React.FC<TwoFactorAuthVerifyProps> = ({ onSuccess }) => {
  const { verify2FA } = useAuth();
  const [otp, setOtp] = useState('');

  const handleVerify = async () => {
    try {
      await verify2FA(otp);
      toast.success('2FA verified successfully');
      onSuccess();
    } catch (err) {
      toast.error('Failed to verify 2FA');
    }
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-xl">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Two-Factor Authentication</h3>
      <p className="mb-4">Enter the code from your authenticator app.</p>
      <input
        type="text"
        value={otp}
        onChange={(e) => setOtp(e.target.value)}
        placeholder="Enter OTP"
        className="w-full mt-4 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
      />
      <button onClick={handleVerify} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg">
        Verify
      </button>
    </div>
  );
};

export default TwoFactorAuthVerify;