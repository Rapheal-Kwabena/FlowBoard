import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { pb } from '../../lib/pocketbase';
import toast from 'react-hot-toast';
import { RecordModel } from 'pocketbase';
import { User } from '../../types';

const mapRecordToUser = (record: RecordModel): User => {
  return {
    id: record.id,
    email: record.email,
    name: record.name,
    avatar: record.avatar ? pb.getFileUrl(record, record.avatar) : undefined,
    phone: record.phone,
  };
};

const ProfileSettings: React.FC = () => {
  const { user, setUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [avatar, setAvatar] = useState<File | null>(null);
  const [phone, setPhone] = useState(user?.phone || '');

  const handleUpdateProfile = async () => {
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('phone', phone);
      if (avatar) {
        formData.append('avatar', avatar);
      }
      const updatedUser = await pb.collection('users').update(user!.id, formData);
      setUser(mapRecordToUser(updatedUser));
      toast.success('Profile updated successfully');
    } catch (err) {
      toast.error('Failed to update profile');
    }
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-xl">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Profile Settings</h3>
      <div className="flex items-center space-x-4 mb-6">
        <img
          src={user?.avatarUrl || `https://avatars.dicebear.com/api/initials/${user?.name}.svg`}
          alt={user?.name}
          className="w-16 h-16 rounded-full"
        />
        <input type="file" onChange={(e) => setAvatar(e.target.files?.[0] || null)} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Phone
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
          />
        </div>
      </div>
      <div className="flex justify-end mt-6">
        <button onClick={handleUpdateProfile} className="px-6 py-3 bg-blue-600 text-white rounded-lg">
          Save Changes
        </button>
      </div>
    </div>
  );
};

export default ProfileSettings;