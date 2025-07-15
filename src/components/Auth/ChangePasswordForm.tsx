import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { pb } from '../../lib/pocketbase';
import toast from 'react-hot-toast';

interface ChangePasswordFormProps {
  onClose: () => void;
}

const ChangePasswordForm: React.FC<ChangePasswordFormProps> = ({ onClose }) => {
  const { user } = useAuth();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('');

  const handleChangePassword = async () => {
    if (newPassword !== newPasswordConfirm) {
      toast.error('New passwords do not match');
      return;
    }

    try {
      await pb.collection('users').update(user!.id, {
        oldPassword,
        password: newPassword,
        passwordConfirm: newPasswordConfirm,
      });
      toast.success('Password updated successfully');
      onClose();
    } catch (err) {
      toast.error('Failed to update password');
    }
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-xl">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Change Password</h3>
      <div className="space-y-4">
        <input
          type="password"
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
          placeholder="Old Password"
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
        />
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="New Password"
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
        />
        <input
          type="password"
          value={newPasswordConfirm}
          onChange={(e) => setNewPasswordConfirm(e.target.value)}
          placeholder="Confirm New Password"
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
        />
      </div>
      <div className="flex justify-end mt-6">
        <button onClick={onClose} className="px-6 py-3 text-gray-700 dark:text-gray-300">
          Cancel
        </button>
        <button onClick={handleChangePassword} className="px-6 py-3 bg-blue-600 text-white rounded-lg">
          Save Changes
        </button>
      </div>
    </div>
  );
};

export default ChangePasswordForm;