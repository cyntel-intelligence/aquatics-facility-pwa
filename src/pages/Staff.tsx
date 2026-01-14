import { Users } from 'lucide-react';

export const Staff = () => {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Users className="h-8 w-8 text-primary-600" />
        <h1 className="text-3xl font-bold text-gray-900">Staff Management</h1>
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600">Staff management for admins - coming soon...</p>
      </div>
    </div>
  );
};
