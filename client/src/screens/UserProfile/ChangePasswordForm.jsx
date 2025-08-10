// ChangePasswordForm.jsx
import { useState } from "react";
import { Formik, Form, ErrorMessage } from "formik";
import * as Yup from "yup";
import { FiLock, FiSave, FiX, FiEye, FiEyeOff } from "react-icons/fi";

const PasswordSchema = Yup.object().shape({
  currentPassword: Yup.string().required("Current password is required"),
  newPassword: Yup.string().min(8, "Password must be at least 8 characters").required("New password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("newPassword"), null], "Passwords must match")
    .required("Please confirm new password"),
});

const ChangePasswordForm = ({ onCancel, onSubmit, loading, error, success }) => {
  const [passwordVisibility, setPasswordVisibility] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });

  const togglePasswordVisibility = (field) => {
    setPasswordVisibility((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  return (
    <Formik initialValues={{ currentPassword: "", newPassword: "", confirmPassword: "" }} validationSchema={PasswordSchema} onSubmit={onSubmit}>
      {({ getFieldProps, isValid }) => (
        <Form className="space-y-4">
          {error && <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg mb-4 flex items-center">{error}</div>}
          {success && <div className="bg-green-50 text-green-700 px-4 py-3 rounded-lg mb-4 flex items-center">{success}</div>}

          {["currentPassword", "newPassword", "confirmPassword"].map((field) => (
            <div key={field}>
              <label htmlFor={field} className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                {field.replace(/([A-Z])/g, " $1")}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id={field}
                  type={passwordVisibility[field] ? "text" : "password"}
                  placeholder={`Enter ${field}`}
                  {...getFieldProps(field)}
                  className="pl-10 pr-10 block w-full rounded-lg border border-gray-300 shadow-sm py-2 px-4 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                />
                <button type="button" onClick={() => togglePasswordVisibility(field)} className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  {passwordVisibility[field] ? <FiEyeOff className="cursor-pointer h-5 w-5 text-gray-400" /> : <FiEye className="cursor-pointer h-5 w-5 text-gray-400" />}
                </button>
              </div>
              <ErrorMessage name={field} component="div" className="text-red-500 text-sm mt-1" />
            </div>
          ))}

          <div className="flex space-x-3">
            <button
              type="submit"
              disabled={loading || !isValid}
              className="cursor-pointer flex-1 flex items-center justify-center px-5 py-2 bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded-lg hover:from-pink-600 hover:to-pink-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiSave className="mr-2" />
              {loading ? "Updating Password..." : "Update Password"}
            </button>

            <button type="button" onClick={onCancel} className="cursor-pointer flex-1 flex items-center justify-center px-5 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-300 ">
              <FiX className="mr-2" />
              Cancel
            </button>
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default ChangePasswordForm;
