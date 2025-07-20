import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import Button from "../../components/Button";
import useUserHook from "../../redux/features/user/useUserHook";

const loginValidationSchema = Yup.object({
  email: Yup.string().email("Invalid email format").required("Email is required"),
  password: Yup.string().required("Password is required"),
});

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading, error, clearUserError } = useUserHook();

  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");

  const from = location.state?.from || "/";

  const togglePasswordVisibility = () => setShowPassword((prev) => !prev);

  const handleSubmit = async (values, { setSubmitting }) => {
    setMessage("");
    try {
      const resultAction = await login(values);
      if (resultAction.payload?.success) {
        setMessage(resultAction.payload?.message || "Login successful! Redirecting...");
        navigate(from);
      } else {
        setMessage(resultAction.payload?.message || "Login failed. Please try again.");
      }
    } catch (err) {
      setMessage("Login failed. Please try again.", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4 sm:px-6">
      <div className="w-full max-w-md bg-white shadow-lg rounded-xl p-6 md:p-8 space-y-6">
        <h2 className="text-center text-2xl sm:text-3xl font-extrabold text-gray-900">Sign in to your account</h2>

        {(error || message) && <div className={`p-3 rounded-md ${message.includes("success") ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>{error || message}</div>}

        <Formik initialValues={{ email: "", password: "" }} validationSchema={loginValidationSchema} onSubmit={handleSubmit}>
          {({ handleChange, values }) => (
            <Form className="space-y-4 md:space-y-6">
              <div className="space-y-4">
                {/* Email */}
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

                {/* Password */}
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

              {/* Forgot Password Link */}
              <div className="flex justify-end">
                <Link to="/forgot-password" className="text-sm font-medium text-pink-600 hover:text-pink-500">
                  Forgot your password?
                </Link>
              </div>

              {/* Submit Button */}
              <div>
                <Button type="submit" loading={isLoading} className="w-full justify-center py-2.5">
                  {isLoading ? "Signing in..." : "Sign in"}
                </Button>
              </div>

              {/* Signup Link */}
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Don't have an account?{" "}
                  <Link to="/signup" className="font-medium text-pink-600 hover:text-pink-500">
                    Sign up
                  </Link>
                </p>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default Login;