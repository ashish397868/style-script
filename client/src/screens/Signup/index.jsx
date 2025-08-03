import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import useUserHook from "../../redux/features/user/useUserHook";
import Button from "../../components/Button";

// ✅ Validation Schema using Yup
const signupValidationSchema = Yup.object({
  name: Yup.string().required("Name is required").min(3, "Name must be at least 3 characters"),
  email: Yup.string().email("Invalid email format").required("Email is required"),
  password: Yup.string().required("Password is required").min(8, "Password must be at least 8 characters"),
});

const Signup = () => {
  const navigate = useNavigate();
  const { signup, isLoading, error, clearUserError } = useUserHook();

  // 👁️ show/hide password state
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");

  const togglePasswordVisibility = () => setShowPassword((prev) => !prev);

  // 🔥 handle submit from Formik
  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    setMessage("");
    try {
      const resultAction = await signup(values);
      if (resultAction.payload?.success) {
        setMessage(resultAction.payload?.message || "Signup successful! Redirecting...");
        resetForm(); // clear form fields
        setTimeout(() => navigate("/"), 1500);
      } else {
        setMessage(resultAction.payload?.message || "Signup failed. Please try again.");
      }
    } catch (err) {
      setMessage("Signup failed. Please try again.",err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4 sm:px-6">
      <div className="w-full max-w-md bg-white shadow-lg rounded-xl p-6 md:p-8 space-y-6">
        <h2 className="text-center text-2xl sm:text-3xl font-extrabold text-gray-900">Create your account</h2>

        {/* ✅ Error / Success Messages */}
        {(error || message) && <div className={`p-3 rounded-md ${message.includes("successful") ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>{error || message}</div>}

        {/* ✅ Formik Wrapper */}
        <Formik initialValues={{ name: "", email: "", password: "" }} validationSchema={signupValidationSchema} onSubmit={handleSubmit}>
          {({ handleChange, values }) => (
            <Form className="space-y-4 md:space-y-6">
              <div className="space-y-4">
                {/* 🔹 Name Field */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <Field
                    id="name"
                    name="name"
                    type="text"
                    onChange={(e) => {
                      handleChange(e);
                      if (error) clearUserError();
                    }}
                    value={values.name}
                    className="appearance-none relative block w-full px-3 py-2.5 border border-gray-300 focus:ring-pink-500 focus:border-pink-500 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-2 sm:text-sm"
                    placeholder="Full Name"
                  />
                  <ErrorMessage name="name" component="p" className="mt-1 text-sm text-red-600" />
                </div>

                {/* 🔹 Email Field */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email address
                  </label>
                  <Field
                    id="email"
                    name="email"
                    type="email"
                    onChange={(e) => {
                      handleChange(e);
                      if (error) clearUserError();
                    }}
                    value={values.email}
                    className="appearance-none relative block w-full px-3 py-2.5 border border-gray-300 focus:ring-pink-500 focus:border-pink-500 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-2 sm:text-sm"
                    placeholder="Email address"
                  />
                  <ErrorMessage name="email" component="p" className="mt-1 text-sm text-red-600" />
                </div>

                {/* 🔹 Password Field */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <Field
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      onChange={(e) => {
                        handleChange(e);
                        if (error) clearUserError();
                      }}
                      value={values.password}
                      className="appearance-none relative block w-full px-3 py-2.5 border border-gray-300 focus:ring-pink-500 focus:border-pink-500 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-2 sm:text-sm pr-10"
                      placeholder="Password"
                    />
                    <button type="button" onClick={togglePasswordVisibility} className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      {showPassword ? <AiOutlineEyeInvisible className="h-5 w-5 text-gray-400 hover:text-gray-500" /> : <AiOutlineEye className="h-5 w-5 text-gray-400 hover:text-gray-500" />}
                    </button>
                  </div>
                  <ErrorMessage name="password" component="p" className="mt-1 text-sm text-red-600" />
                </div>
              </div>

              {/* 🔹 Submit Button */}
              <div>
                <Button type="submit" loading={isLoading} className="cursor-pointer w-full justify-center py-2.5">
                  {isLoading ? "Creating account..." : "Sign up"}
                </Button>
              </div>

              {/* 🔹 Login Link */}
              <div className="text-sm text-center pt-2">
                Already have an account?{" "}
                <Link to="/login" className="font-medium text-pink-600 hover:text-pink-500">
                  Sign in
                </Link>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default Signup;
