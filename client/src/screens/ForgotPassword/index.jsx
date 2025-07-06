import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useUserHook from '../../redux/features/user/useUserHook';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
import Button from '../../components/Button';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const { sendForgotPasswordEmail, resetUserPassword, isLoading, error, clearUserError } = useUserHook();

  const [step, setStep] = useState(1); // 1: email input, 2: OTP input, 3: new password
  const [formData, setFormData] = useState({
    email: '',
    otp: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [message, setMessage] = useState('');

  const validateEmailForm = () => {
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.email.trim()) errors.email = 'Email is required';
    else if (!emailRegex.test(formData.email)) errors.email = 'Invalid email format';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateResetForm = () => {
    const errors = {};
    const otpRegex = /^\d{6}$/;
    if (!formData.otp.trim()) errors.otp = 'OTP is required';
    else if (!otpRegex.test(formData.otp)) errors.otp = 'OTP must be a 6-digit number';
    if (!formData.newPassword) errors.newPassword = 'New password is required';
    else if (formData.newPassword.length < 8) errors.newPassword = 'Password must be at least 8 characters';
    if (formData.newPassword !== formData.confirmPassword) errors.confirmPassword = 'Passwords do not match';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleRequestReset = async (e) => {
    e.preventDefault();
    setMessage('');
    if (!validateEmailForm()) return;

    try {
      const resultAction = await sendForgotPasswordEmail(formData.email);
      if (resultAction.payload?.success ) {
        setMessage(resultAction.payload?.message || 'A password reset link has been sent to your email. Please check your inbox.');
        setStep(2);
      } else {
        setMessage(resultAction.payload?.message || 'Failed to send reset email. Please try again.');
      }
    } catch (err) {
      setMessage('Failed to send reset email. Please try again.');
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setMessage('');
    if (!validateResetForm()) return;

    try {
      const resultAction = await resetUserPassword({
        email: formData.email,
        otp: formData.otp,
        newPassword: formData.newPassword
      });
      if (resultAction.payload?.success) {
        setMessage(resultAction.payload.message || 'Password reset successful!');
        setTimeout(() => {
          navigate('/login', { 
            state: { message: 'Password has been reset successfully. Please login with your new password.' },
            replace: true 
          });
        }, 2000);
      } else {
        setMessage(resultAction.payload?.message || 'Failed to reset password. Please try again.');
      }
    } catch (err) {
      setMessage('Failed to reset password. Please try again.');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) clearUserError();
    if (formErrors[name]) setFormErrors(prev => ({ ...prev, [name]: '' }));
  };

  const togglePasswordVisibility = () => setShowPassword(prev => !prev);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4 sm:px-6">
      <div className="w-full max-w-md bg-white shadow-lg rounded-xl p-6 md:p-8 space-y-6">
        <h2 className="text-center text-2xl sm:text-3xl font-extrabold text-gray-900">
          {step === 1 ? "Reset your password" : "Enter OTP"}
        </h2>

        {(error || message) && (
          <div className={`p-3 rounded-md ${(message.includes('success') || message.includes('sent')) ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {error || message}
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleRequestReset} className="space-y-4 md:space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className={`appearance-none relative block w-full px-3 py-2.5 border ${
                  formErrors.email 
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                    : 'border-gray-300 focus:ring-pink-500 focus:border-pink-500'
                } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-2 sm:text-sm`}
                placeholder="Enter your email"
              />
              {formErrors.email && (
                <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>
              )}
            </div>

            <div>
              <Button
                type="submit"
                loading={isLoading}
                className="w-full justify-center py-2.5"
              >
                {isLoading ? 'Sending OTP...' : 'Send OTP'}
              </Button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-4 md:space-y-6">
            <div>
              <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-1">
                OTP Code
              </label>
              <input
                id="otp"
                name="otp"
                type="text"
                required
                value={formData.otp}
                onChange={handleChange}
                maxLength={6}
                className={`appearance-none relative block w-full px-3 py-2.5 border ${
                  formErrors.otp 
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                    : 'border-gray-300 focus:ring-pink-500 focus:border-pink-500'
                } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-2 sm:text-sm`}
                placeholder="Enter 6-digit OTP"
              />
              {formErrors.otp && (
                <p className="mt-1 text-sm text-red-600">{formErrors.otp}</p>
              )}
            </div>

            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                New Password
              </label>
              <div className="relative">
                <input
                  autoComplete="new-password"
                  id="newPassword"
                  name="newPassword"
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.newPassword}
                  onChange={handleChange}
                  className={`appearance-none relative block w-full px-3 py-2.5 border ${
                    formErrors.newPassword 
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                      : 'border-gray-300 focus:ring-pink-500 focus:border-pink-500'
                  } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-2 sm:text-sm pr-10`}
                  placeholder="Create new password"
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <AiOutlineEyeInvisible className="h-5 w-5 text-gray-400 hover:text-gray-500" />
                  ) : (
                    <AiOutlineEye className="h-5 w-5 text-gray-400 hover:text-gray-500" />
                  )}
                </button>
              </div>
              {formErrors.newPassword && (
                <p className="mt-1 text-sm text-red-600">{formErrors.newPassword}</p>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <input
                autoComplete="new-password"
                id="confirmPassword"
                name="confirmPassword"
                type={showPassword ? "text" : "password"}
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`appearance-none relative block w-full px-3 py-2.5 border ${
                  formErrors.confirmPassword 
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                    : 'border-gray-300 focus:ring-pink-500 focus:border-pink-500'
                } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-2 sm:text-sm`}
                placeholder="Confirm your new password"
              />
              {formErrors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{formErrors.confirmPassword}</p>
              )}
            </div>

            <div>
              <Button
                type="submit"
                loading={isLoading}
                className="w-full justify-center py-2.5"
              >
                {isLoading ? 'Resetting password...' : 'Reset Password'}
              </Button>
            </div>
          </form>
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