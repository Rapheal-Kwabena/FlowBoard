import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { pb } from '../../lib/pocketbase';
import toast from 'react-hot-toast';

const TwoFactorAuthSetup: React.FC = () => {
  const { user } = useAuth();
  const [showQr, setShowQr] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [otp, setOtp] = useState('');

  const handleEnable2FA = async () => {
    if (!user) return;
    try {
      // Replace with the correct API call to initiate 2FA setup
      const result = await pb.send(`/users/${user.id}/2fa/setup`, { method: 'POST' });
      setQrCode(result.secret);
      setShowQr(true);
      toast.success('Scan the QR code with your authenticator app');
    } catch (err) {
      toast.error('Failed to enable 2FA');
    }
  };

  const handleConfirm2FA = async () => {
    if (!user) return;
    try {
      // Replace with the correct API call to confirm 2FA
      await pb.send(`/users/${user.id}/2fa/confirm`, {
        method: 'POST',
        body: { otp }
      });
      toast.success('2FA enabled successfully');
      setShowQr(false);
    } catch (err) {
      toast.error('Failed to confirm 2FA');
    }
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-xl">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Two-Factor Authentication</h3>
      {!user?.twoFactor && !showQr && (
        <button onClick={handleEnable2FA} className="px-4 py-2 bg-blue-600 text-white rounded-lg">
          Enable 2FA
        </button>
      )}
      {user?.twoFactor && (
        <p>Two-Factor Authentication is already enabled.</p>
      )}
      {showQr && (
        <div>
          <p className="mb-4">Scan this QR code with your authenticator app:</p>
          <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=otpauth://totp/FlowBoard:${user?.email}?secret=${qrCode}&issuer=FlowBoard`} alt="QR Code" />
          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="Enter OTP"
            className="w-full mt-4 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
          />
          <button onClick={handleConfirm2FA} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg">
            Confirm
          </button>
        </div>
      )}
    </div>
  );
};

export default TwoFactorAuthSetup;