import { useEffect, useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import useUserProfile from "../../redux/features/user/userProfileHook";
import { FiUser, FiMail, FiPhone, FiEdit2, FiSave, FiX, FiLock, FiEye, FiEyeOff } from "react-icons/fi";
import Loader from "../../components/Loader";

// Validation schemas
const ProfileSchema = Yup.object().shape({
  name: Yup.string().required("Full name is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  phone: Yup.string()
    .matches(/^[0-9]*$/, "Phone number must contain digits only")
    .min(10, "Phone number must be at least 10 digits")
    .nullable(),
});

const PasswordSchema = Yup.object().shape({
  currentPassword: Yup.string().required("Current password is required"),
  newPassword: Yup.string().min(8, "Password must be at least 8 characters").required("New password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("newPassword"), null], "Passwords must match")
    .required("Please confirm new password"),
});

const UserProfile = () => {
  const { user, isLoading: userLoading, error: userError, fetchProfile, updateProfile, changePassword } = useUserProfile();

  const [editMode, setEditMode] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true); // Renamed for clarity
  const [updateLoading, setUpdateLoading] = useState(false); // Separate loading for updates
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [error, setError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [success, setSuccess] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  const [passwordVisibility, setPasswordVisibility] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });

  useEffect(() => {
    if (user && user.name) {
      setInitialLoading(false);
    } else {
      setInitialLoading(true);
      fetchProfile()
        .then(() => setError(""))
        .catch(() => setError("Failed to load profile. Please try again later."))
        .finally(() => setInitialLoading(false));
    }
  }, [user, fetchProfile]);

  const togglePasswordVisibility = (field) => {
    setPasswordVisibility((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleEdit = () => {
    setEditMode(true);
    setSuccess("");
    setError("");
  };

  const handleCancel = () => {
    setEditMode(false);
    setSuccess("");
    setError("");
  };

  const handlePasswordCancel = () => {
    setShowPasswordForm(false);
    setPasswordError("");
    setPasswordSuccess("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-pink-50 py-12 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-pink-500 to-pink-600 rounded-full mb-6">
            <div className="bg-white w-20 h-20 rounded-full flex items-center justify-center">
              <FiUser className="h-12 w-12 text-pink-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">User Profile</h1>
          <p className="text-gray-600 max-w-md mx-auto">Manage your personal information and account details</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {(initialLoading || userLoading) ? (
            <Loader />
          ) : (
            <div className="p-6 sm:p-8">
              {(error || userError) && (
                <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {error || userError}
                </div>
              )}

              {success && (
                <div className="bg-green-50 text-green-700 px-4 py-3 rounded-lg mb-6 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  {success}
                </div>
              )}

              {!editMode ? (
                <>
                  <div className="space-y-6">
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

                    <div className="pt-6 border-t border-gray-100 flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3">
                      <button onClick={handleEdit} className="cursor-pointer flex items-center justify-center px-5 py-2.5 bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded-lg hover:from-pink-600 hover:to-pink-700 transition-all duration-300">
                        <FiEdit2 className="mr-2" />
                        Edit Profile
                      </button>
                      <button onClick={() => setShowPasswordForm(!showPasswordForm)} className="cursor-pointer flex items-center justify-center px-5 py-2.5 bg-white border border-pink-500 text-pink-600 rounded-lg hover:bg-pink-50 transition-colors duration-300">
                        <FiLock className="mr-2" />
                        Change Password
                      </button>
                    </div>
                  </div>

                  {showPasswordForm && (
                    <div className="mt-6 p-4 border rounded-lg bg-gray-50">
                      {passwordError && (
                        <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg mb-4 flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          {passwordError}
                        </div>
                      )}

                      {passwordSuccess && (
                        <div className="bg-green-50 text-green-700 px-4 py-3 rounded-lg mb-4 flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          {passwordSuccess}
                        </div>
                      )}

                      <Formik
                        initialValues={{ currentPassword: "", newPassword: "", confirmPassword: "" }}
                        validationSchema={PasswordSchema}
                        onSubmit={async (values, { resetForm }) => {
                          setPasswordLoading(true);
                          setPasswordError("");
                          setPasswordSuccess("");
                          try {
                            await changePassword({
                              currentPassword: values.currentPassword,
                              newPassword: values.newPassword,
                            });
                            setPasswordSuccess("Password changed successfully!");
                            resetForm();
                            setShowPasswordForm(false);
                          } catch (err) {
                            setPasswordError(err || "Failed to change password");
                          } finally {
                            setPasswordLoading(false);
                          }
                        }}
                      >
                        {({ handleChange, values }) => (
                          <Form className="space-y-4">
                            {["currentPassword", "newPassword", "confirmPassword"].map((field) => (
                              <div key={field}>
                                <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">{field.replace(/([A-Z])/g, " $1")}</label>
                                <div className="relative">
                                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FiLock className="h-5 w-5 text-gray-400" />
                                  </div>
                                  <Field
                                    type={passwordVisibility[field] ? "text" : "password"}
                                    name={field}
                                    value={values[field]}
                                    onChange={handleChange}
                                    className="pl-10 pr-10 block w-full rounded-lg border border-gray-300 shadow-sm py-2 px-4 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                                    placeholder={`Enter ${field}`}
                                  />
                                  <button type="button" onClick={() => togglePasswordVisibility(field)} className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                    {passwordVisibility[field] ? <FiEyeOff className="h-5 w-5 text-gray-400" /> : <FiEye className="h-5 w-5 text-gray-400" />}
                                  </button>
                                </div>
                                <ErrorMessage name={field} component="div" className="text-red-500 text-sm mt-1" />
                              </div>
                            ))}

                            <div className="flex space-x-3">
                              <button
                                type="submit"
                                className="flex-1 flex items-center justify-center px-5 py-2 bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded-lg hover:from-pink-600 hover:to-pink-700 transition-all duration-300"
                                disabled={passwordLoading}
                              >
                                <FiSave className="mr-2" />
                                {passwordLoading ? "Updating Password..." : "Update Password"}
                              </button>

                              <button type="button" onClick={handlePasswordCancel} className="flex-1 flex items-center justify-center px-5 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-300">
                                <FiX className="mr-2" />
                                Cancel
                              </button>
                            </div>
                          </Form>
                        )}
                      </Formik>
                    </div>
                  )}
                </>
              ) : (
                <Formik
                  initialValues={{
                    name: user.name || "",
                    email: user.email || "",
                    phone: user.phone || "",
                  }}
                  validationSchema={ProfileSchema}
                  onSubmit={async (values) => {
                    setUpdateLoading(true); // Use separate loading state
                    setError("");
                    setSuccess("");
                    try {
                      await updateProfile(values);
                      setEditMode(false);
                      setSuccess("Profile updated successfully!");
                    } catch (err) {
                      setError(err || "Failed to update profile. Please try again.");
                    } finally {
                      setUpdateLoading(false);
                    }
                  }}
                >
                  {({ handleChange, values }) => (
                    <Form className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FiUser className="h-5 w-5 text-gray-400" />
                          </div>
                          <Field
                            type="text"
                            name="name"
                            value={values.name}
                            onChange={handleChange}
                            className="pl-10 block w-full rounded-lg border border-gray-300 shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                            placeholder="Enter your full name"
                          />
                          <ErrorMessage name="name" component="div" className="text-red-500 text-sm mt-1" />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FiMail className="h-5 w-5 text-gray-400" />
                          </div>
                          <Field
                            type="email"
                            name="email"
                            value={values.email}
                            onChange={handleChange}
                            className="pl-10 block w-full rounded-lg border border-gray-300 shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                            placeholder="Enter your email"
                          />
                          <ErrorMessage name="email" component="div" className="text-red-500 text-sm mt-1" />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FiPhone className="h-5 w-5 text-gray-400" />
                          </div>
                          <Field
                            type="tel"
                            name="phone"
                            value={values.phone}
                            onChange={handleChange}
                            className="pl-10 block w-full rounded-lg border border-gray-300 shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                            placeholder="Enter your phone number"
                          />
                          <ErrorMessage name="phone" component="div" className="text-red-500 text-sm mt-1" />
                        </div>
                      </div>

                      <div className="pt-6 border-t border-gray-100 flex space-x-3">
                        <button
                          type="submit"
                          className="flex-1 flex items-center justify-center px-5 py-2.5 bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded-lg hover:from-pink-600 hover:to-pink-700 transition-all duration-300"
                          disabled={updateLoading}
                        >
                          <FiSave className="mr-2" />
                          {updateLoading ? "Saving..." : "Save Changes"}
                        </button>

                        <button type="button" onClick={handleCancel} className="flex-1 flex items-center justify-center px-5 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-300">
                          <FiX className="mr-2" />
                          Cancel
                        </button>
                      </div>
                    </Form>
                  )}
                </Formik>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;