// ProfileEditForm.jsx
import { Formik, Form, ErrorMessage } from "formik";
import * as Yup from "yup";
import { FiSave, FiX } from "react-icons/fi";

const ProfileSchema = Yup.object().shape({
  name: Yup.string().required("Full name is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  phone: Yup.string()
    .matches(/^[0-9]*$/, "Phone number must contain digits only")
    .min(10, "Phone number must be at least 10 digits")
    .nullable(),
});

const ProfileEditForm = ({ user, onCancel, onSubmit, loading, error, success }) => {
  return (
    <Formik
      initialValues={{
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
      }}
      validationSchema={ProfileSchema}
      onSubmit={onSubmit}
    >
      {({ getFieldProps, isValid }) => (
        <Form className="space-y-6">
          {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
          {success && <div className="text-green-600 text-sm mb-2">{success}</div>}

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>
            <input
              id="name"
              type="text"
              placeholder="Enter your full name"
              {...getFieldProps("name")}
              className="appearance-none relative block w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 sm:text-sm pl-10"
            />
            <ErrorMessage name="name" component="div" className="text-red-500 text-sm mt-1" />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              {...getFieldProps("email")}
              className="appearance-none relative block w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 sm:text-sm pl-10"
            />
            <ErrorMessage name="email" component="div" className="text-red-500 text-sm mt-1" />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            <input
              id="phone"
              type="tel"
              placeholder="Enter your phone number"
              {...getFieldProps("phone")}
              className="appearance-none relative block w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 sm:text-sm pl-10"
            />
            <ErrorMessage name="phone" component="div" className="text-red-500 text-sm mt-1" />
          </div>

          <div className="pt-6 border-t border-gray-100 flex space-x-3">
            <button
              type="submit"
              disabled={!isValid || loading}
              className="flex-1 flex items-center justify-center px-5 py-2.5 bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded-lg hover:from-pink-600 hover:to-pink-700 transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiSave className="mr-2" />
              {loading ? "Saving..." : "Save Changes"}
            </button>

            <button type="button" onClick={onCancel} className="cursor-pointer flex-1 flex items-center justify-center px-5 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-300">
              <FiX className="mr-2" />
              Cancel
            </button>
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default ProfileEditForm;
