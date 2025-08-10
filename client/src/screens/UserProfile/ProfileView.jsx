// ProfileView.jsx
import { FiUser, FiMail, FiPhone, FiEdit2, FiLock } from "react-icons/fi";

const ProfileView = ({ user, onEdit, onChangePassword, error, userError }) => {
  return (
    <div className="space-y-6">
      {(error || userError) && (
        <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error || userError}
        </div>
      )}

      <div className="flex items-start">
        <div className="bg-pink-100 p-3 rounded-full mr-4">
          <FiUser className="h-6 w-6 text-pink-600" />
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500">Full Name</h3>
          <p className="text-lg font-medium text-gray-900">{user.name}</p>
        </div>
      </div>

      <div className="flex items-start">
        <div className="bg-pink-100 p-3 rounded-full mr-4">
          <FiMail className="h-6 w-6 text-pink-600" />
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500">Email Address</h3>
          <p className="text-lg font-medium text-gray-900">{user.email}</p>
        </div>
      </div>

      <div className="flex items-start">
        <div className="bg-pink-100 p-3 rounded-full mr-4">
          <FiPhone className="h-6 w-6 text-pink-600" />
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500">Phone Number</h3>
          <p className="text-lg font-medium text-gray-900">{user.phone || "Not provided"}</p>
        </div>
      </div>

      <div className="pt-6 border-t border-gray-100 flex space-x-3">
        <button onClick={onEdit} className="cursor-pointer flex-1 flex items-center justify-center px-5 py-2.5 bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded-lg hover:from-pink-600 hover:to-pink-700 transition-all duration-300">
          <FiEdit2 className="mr-2" />
          Edit Profile
        </button>

        <button onClick={onChangePassword} className="cursor-pointer flex-1 flex items-center justify-center px-5 py-2.5 bg-white border border-pink-500 text-pink-600 rounded-lg hover:bg-pink-50 transition-colors duration-300">
          <FiLock className="mr-2" />
          Change Password
        </button>
      </div>
    </div>
  );
};

export default ProfileView;
