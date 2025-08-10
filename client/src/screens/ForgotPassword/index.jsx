import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useUserHook from "../../redux/features/user/useUserHook";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { Formik, Form, ErrorMessage } from "formik";
import * as Yup from "yup";
import Button from "../../components/Button";

const emailValidationSchema = Yup.object({
  email: Yup.string().email("Invalid email format").required("Email is required"),
});

const resetValidationSchema = Yup.object({
  otp: Yup.string()
    .matches(/^\d{6}$/, "OTP must be a 6-digit number")
    .required("OTP is required"),
  newPassword: Yup.string().min(8, "Password must be at least 8 characters").required("New password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("newPassword")], "Passwords do not match")
    .required("Confirm password is required"),
});

const ForgotPassword = () => {
  const navigate = useNavigate();

  const { sendForgotPasswordEmail, resetUserPassword, error ,passwordLoading } = useUserHook();

  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [emailFromStep1, setEmailFromStep1] = useState("");

  const togglePasswordVisibility = () => setShowPassword((prev) => !prev);

  const handleRequestReset = async (values) => {
    setMessage("");
    try {
      const resultAction = await sendForgotPasswordEmail(values.email);
      if (resultAction.payload?.success) {
        setEmailFromStep1(values.email); // save email for step 2
        setMessage(resultAction.payload?.message || "A password reset link has been sent to your email.");
        setStep(2);
      } else {
        setMessage(resultAction.payload?.message || "Failed to send reset email.");
      }
    } catch {
      setMessage("Failed to send reset email. Please try again.");
    }
  };

  const handleResetPassword = async (values) => {
    setMessage("");
    try {
      const resultAction = await resetUserPassword({
        email: values.email,
        otp: values.otp,
        newPassword: values.newPassword,
      });
      if (resultAction.payload?.success) {
        setMessage(resultAction.payload.message || "Password reset successful!");
        setTimeout(() => {
          navigate("/login", { replace: true });
        }, 500); 
      } else {
        setMessage(resultAction.payload?.message || "Failed to reset password.");
      }
    } catch {
      setMessage("Failed to reset password. Please try again.");
    }
  };

  const renderError = (name) => <ErrorMessage name={name} component="p" className="mt-1 text-sm text-red-600" />;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4 sm:px-6">
      <div className="w-full max-w-md bg-white shadow-lg rounded-xl p-6 md:p-8 space-y-6">
        <h2 className="text-center text-2xl sm:text-3xl font-extrabold text-gray-900">{step === 1 ? "Reset your password" : "Enter OTP"}</h2>

        {(error || message) && <div className={`p-3 rounded-md ${message.includes("success") || message.includes("sent") ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>{error || message}</div>}

        {step === 1 ? (
          <Formik initialValues={{ email: "" }} validationSchema={emailValidationSchema} onSubmit={handleRequestReset}>
            {({ getFieldProps , isValid}) => (
              <Form className="space-y-4 md:space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email address
                  </label>
                  <input
                    id="email"
                    type="email"
                    {...getFieldProps("email")}
                    placeholder="Enter your email"
                    className="appearance-none relative block w-full px-3 py-2.5 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 sm:text-sm"
                  />
                  {renderError("email")}
                </div>

                <Button disabled={!isValid || passwordLoading} type="submit" loading={passwordLoading}>
                  {passwordLoading ? "Sending OTP..." : "Send OTP"}
                </Button>
              </Form>
            )}
          </Formik>
        ) : (
          <Formik
            initialValues={{
              email: emailFromStep1 || "",
              otp: "",
              newPassword: "",
              confirmPassword: "",
            }}
            validationSchema={resetValidationSchema}
            onSubmit={handleResetPassword}
          >
            {({ getFieldProps , isValid}) => (
              <Form className="space-y-4 md:space-y-6">
                <input type="hidden" {...getFieldProps("email")} />

                <div>
                  <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-1">
                    OTP Code
                  </label>
                  <input
                    id="otp"
                    type="text"
                    maxLength={6}
                    {...getFieldProps("otp")}
                    placeholder="Enter 6-digit OTP"
                    className="appearance-none relative block w-full px-3 py-2.5 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 sm:text-sm"
                  />
                  {renderError("otp")}
                </div>

                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      id="newPassword"
                      type={showPassword ? "text" : "password"}
                      {...getFieldProps("newPassword")}
                      placeholder="Create new password"
                      className="appearance-none relative block w-full px-3 py-2.5 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 sm:text-sm pr-10"
                    />
                    <button type="button" onClick={togglePasswordVisibility} className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      {showPassword ? <AiOutlineEyeInvisible className="cursor-pointer h-5 w-5 text-gray-400 hover:text-gray-500" /> : <AiOutlineEye className="cursor-pointer h-5 w-5 text-gray-400 hover:text-gray-500" />}
                    </button>
                  </div>
                  {renderError("newPassword")} 
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm Password
                  </label>
                  <input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    {...getFieldProps("confirmPassword")}
                    placeholder="Confirm your new password"
                    className="appearance-none relative block w-full px-3 py-2.5 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 sm:text-sm"
                  />
                  {renderError("confirmPassword")}
                </div>

                <Button type="submit" loading={passwordLoading} disabled={!isValid}>
                  {passwordLoading ? "Resetting password..." : "Reset Password"}
                </Button>
              </Form>
            )}
          </Formik>
        )}

        <div className="text-sm text-center pt-2">
          <Link to="/login" className="font-medium text-pink-600 hover:text-pink-500">
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
