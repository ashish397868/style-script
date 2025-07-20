import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useUserHook from "../../redux/features/user/useUserHook";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { Formik, Form, Field, ErrorMessage } from "formik";
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
  const { sendForgotPasswordEmail, resetUserPassword, isLoading, error, clearUserError } = useUserHook();

  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");

  const togglePasswordVisibility = () => setShowPassword((prev) => !prev);

  const handleRequestReset = async (values) => {
    setMessage("");
    try {
      const resultAction = await sendForgotPasswordEmail(values.email);
      console.log(resultAction);
      if (resultAction.payload?.success) {
        setMessage(resultAction.payload?.message || "A password reset link has been sent to your email. Please check your inbox.");
        setStep(2);
      } else {
        setMessage(resultAction.payload?.message || "Failed to send reset email. Please try again.");
      }
    } catch (err) {
      setMessage("Failed to send reset email. Please try again.", err);
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
          navigate("/login",{ replace: true,});
        }, 2000);
      } else {
        setMessage(resultAction.payload?.message || "Failed to reset password. Please try again.");
      }
    } catch (err) {
      setMessage("Failed to reset password. Please try again.", err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4 sm:px-6">
      <div className="w-full max-w-md bg-white shadow-lg rounded-xl p-6 md:p-8 space-y-6">
        <h2 className="text-center text-2xl sm:text-3xl font-extrabold text-gray-900">{step === 1 ? "Reset your password" : "Enter OTP"}</h2>

        {(error || message) && <div className={`p-3 rounded-md ${message.includes("success") || message.includes("sent") ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>{error || message}</div>}

        {step === 1 ? (
          <Formik initialValues={{ email: "" }} validationSchema={emailValidationSchema} onSubmit={handleRequestReset}>
            {({ handleChange, values }) => (
              <Form className="space-y-4 md:space-y-6">
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
                    placeholder="Enter your email"
                  />
                  <ErrorMessage name="email" component="p" className="mt-1 text-sm text-red-600" />
                </div>

                <div>
                  <Button type="submit" loading={isLoading} className="w-full justify-center py-2.5">
                    {isLoading ? "Sending OTP..." : "Send OTP"}
                  </Button>
                </div>
              </Form>
            )}
          </Formik>
        ) : (
          <Formik
            initialValues={{
              email: "", // we'll pass the same email from step1
              otp: "",
              newPassword: "",
              confirmPassword: "",
            }}
            validationSchema={resetValidationSchema}
            onSubmit={(values) => {
              values.email = values.email || ""; // ensure email is set
              handleResetPassword(values);
            }}
          >
            {({ handleChange, values }) => {
              // When moving from step1 to step2, we need to carry over the email
              if (!values.email) {
                console.log("email not found")
              }
              return (
                <Form className="space-y-4 md:space-y-6">
                  {/* Hidden field to carry email */}
                  <Field type="hidden" name="email" value={values.email} />

                  <div>
                    <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-1">
                      OTP Code
                    </label>
                    <Field
                      id="otp"
                      name="otp"
                      type="text"
                      maxLength={6}
                      onChange={(e) => {
                        handleChange(e);
                        if (error) clearUserError();
                      }}
                      value={values.otp}
                      className="appearance-none relative block w-full px-3 py-2.5 border border-gray-300 focus:ring-pink-500 focus:border-pink-500 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-2 sm:text-sm"
                      placeholder="Enter 6-digit OTP"
                    />
                    <ErrorMessage name="otp" component="p" className="mt-1 text-sm text-red-600" />
                  </div>

                  <div>
                    <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                      New Password
                    </label>
                    <div className="relative">
                      <Field
                        id="newPassword"
                        name="newPassword"
                        type={showPassword ? "text" : "password"}
                        onChange={(e) => {
                          handleChange(e);
                          if (error) clearUserError();
                        }}
                        value={values.newPassword}
                        className="appearance-none relative block w-full px-3 py-2.5 border border-gray-300 focus:ring-pink-500 focus:border-pink-500 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-2 sm:text-sm pr-10"
                        placeholder="Create new password"
                      />
                      <button type="button" onClick={togglePasswordVisibility} className="absolute inset-y-0 right-0 pr-3 flex items-center">
                        {showPassword ? <AiOutlineEyeInvisible className="h-5 w-5 text-gray-400 hover:text-gray-500" /> : <AiOutlineEye className="h-5 w-5 text-gray-400 hover:text-gray-500" />}
                      </button>
                    </div>
                    <ErrorMessage name="newPassword" component="p" className="mt-1 text-sm text-red-600" />
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                      Confirm Password
                    </label>
                    <Field
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      onChange={(e) => {
                        handleChange(e);
                        if (error) clearUserError();
                      }}
                      value={values.confirmPassword}
                      className="appearance-none relative block w-full px-3 py-2.5 border border-gray-300 focus:ring-pink-500 focus:border-pink-500 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-2 sm:text-sm"
                      placeholder="Confirm your new password"
                    />
                    <ErrorMessage name="confirmPassword" component="p" className="mt-1 text-sm text-red-600" />
                  </div>

                  <div>
                    <Button type="submit" loading={isLoading} className="w-full justify-center py-2.5">
                      {isLoading ? "Resetting password..." : "Reset Password"}
                    </Button>
                  </div>
                </Form>
              );
            }}
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