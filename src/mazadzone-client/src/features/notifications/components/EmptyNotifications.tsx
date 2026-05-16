import { Bell } from "lucide-react";

export const EmptyNotifications = () => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mb-4">
        <Bell className="w-8 h-8 text-gray-300" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900">No notifications yet</h3>
      <p className="text-sm text-gray-500 mt-1">You&apos;ll see updates here</p>
    </div>
  );
};
