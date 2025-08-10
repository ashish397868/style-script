import { useState, useEffect } from "react";
import { FiUser } from "react-icons/fi";
import Loader from "../../components/Loader";
import useUserHook from "../../redux/features/user/useUserHook";
import ProfileView from "./ProfileView";
import ProfileEditForm from "./ProfileEditForm";
import ChangePasswordForm from "./ChangePasswordForm";

const UserProfile = () => {
  const { user, authLoading, error: userError, fetchUserProfile, updateUserProfile, changeUserPassword } = useUserHook();

  const [editMode, setEditMode] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [error, setError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [success, setSuccess] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  useEffect(() => {
    if (user && user.name) {
      setInitialLoading(false);
    } else {
      setInitialLoading(true);
      fetchUserProfile()
        .then(() => setError(""))
        .catch(() => setError("Failed to load profile. Please try again later."))
        .finally(() => setInitialLoading(false));
    }
  }, [user, fetchUserProfile]);

  const handleProfileUpdate = async (values, { setSubmitting }) => {
    setUpdateLoading(true);
    setError("");
    setSuccess("");
    try {
      await updateUserProfile(values);
      setEditMode(false);
      setSuccess("Profile updated successfully!");
    } catch (err) {
      setError(err.message || "Failed to update profile. Please try again.");
    } finally {
      setUpdateLoading(false);
      setSubmitting(false);
    }
  };

  const handlePasswordChange = async (values, { setSubmitting, resetForm }) => {
    setPasswordLoading(true);
    setPasswordError("");
    setPasswordSuccess("");
    try {
      await changeUserPassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      setPasswordSuccess("Password changed successfully!");
      resetForm();
      setShowPasswordForm(false);
    } catch (err) {
      setPasswordError(err.message || "Failed to change password");
    } finally {
      setPasswordLoading(false);
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-pink-50 py-12 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        {/* Yeh white bg container jisme heading + icon + description + baaki sab ek saath */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden p-6 sm:p-8">
          {/* Heading + Icon + Description */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-pink-500 to-pink-600 rounded-full mb-6 mx-auto">
              <div className="bg-white w-20 h-20 rounded-full flex items-center justify-center">
                <FiUser className="h-12 w-12 text-pink-600" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">User Profile</h1>
            <p className="text-gray-600 max-w-md mx-auto">Manage your personal information and account details</p>
          </div>

          {/* Loader or Profile Content */}
          {initialLoading || authLoading ? (
            <Loader />
          ) : (
            <>
              {!editMode && !showPasswordForm && (
                <ProfileView
                  user={user}
                  onEdit={() => {
                    setEditMode(true);
                    setSuccess("");
                    setError("");
                  }}
                  onChangePassword={() => {
                    setShowPasswordForm(true);
                    setPasswordError("");
                    setPasswordSuccess("");
                  }}
                  error={error}
                  userError={userError}
                />
              )}

              {editMode && <ProfileEditForm user={user} onCancel={() => setEditMode(false)} onSubmit={handleProfileUpdate} loading={updateLoading} error={error} success={success} />}

              {showPasswordForm && <ChangePasswordForm onCancel={() => setShowPasswordForm(false)} onSubmit={handlePasswordChange} loading={passwordLoading} error={passwordError} success={passwordSuccess} />}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
