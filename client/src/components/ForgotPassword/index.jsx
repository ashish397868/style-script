import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { forgotPassword, resetPassword, clearError } from '../../redux/features/userSlice';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
import Button from '../Button';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isLoading = useSelector((state) => state.user.isLoading);
  const error = useSelector((state) => state.user.error);

  const [step, setStep] = useState(1); // 1: email input, 2: reset code, 3: new password
  const [formData, setFormData] = useState({
    email: '',
    resetCode: '',
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

    if (!formData.resetCode.trim()) errors.resetCode = 'Reset code is required';
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
      const resultAction = await dispatch(forgotPassword(formData.email));
      if (forgotPassword.fulfilled.match(resultAction)) {
        setMessage('A password reset link has been sent to your email. Please check your inbox.');
        setStep(2);
      } else {
        setMessage(resultAction.payload || 'Failed to send reset email. Please try again.');
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
      const resultAction = await dispatch(resetPassword({
        email: formData.email,
        resetCode: formData.resetCode,
        newPassword: formData.newPassword
      }));
      if (resetPassword.fulfilled.match(resultAction)) {
        setMessage('Password reset successful!');
        setTimeout(() => {
          navigate('/login', { 
            state: { message: 'Password has been reset successfully. Please login with your new password.' },
            replace: true 
          });
        }, 2000);
      } else {
        setMessage(resultAction.payload || 'Failed to reset password. Please try again.');
      }
    } catch (err) {
      setMessage('Failed to reset password. Please try again.');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) clearError();
    if (formErrors[name]) setFormErrors(prev => ({ ...prev, [name]: '' }));
  };

  const togglePasswordVisibility = () => setShowPassword(prev => !prev);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white shadow-lg rounded-xl p-8 space-y-6">
        <h2 className="text-center text-3xl font-extrabold text-gray-900">
          {step === 1 ? "Reset your password" : "Enter reset code"}
        </h2>

        {message && (
          <div className={`p-3 rounded-md ${message.includes('success') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {message}
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleRequestReset} className="space-y-6">
            <div>
              <label htmlFor="email" className="sr-only">Email address</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className={`appearance-none rounded relative block w-full px-3 py-2 border ${
                  formErrors.email ? 'border-red-300' : 'border-gray-300'
                } placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm`}
                placeholder="Email address"
              />
              {formErrors.email && (
                <p className="mt-2 text-sm text-red-600">{formErrors.email}</p>
              )}
            </div>

            <div>
              <Button
                type="submit"
                isLoading={isLoading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
              >
                Send Reset Instructions
              </Button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-6">
            <div>
              <label htmlFor="resetCode" className="sr-only">Reset Code</label>
              <input
                id="resetCode"
                name="resetCode"
                type="text"
                required
                value={formData.resetCode}
                onChange={handleChange}
                className={`appearance-none rounded-t relative block w-full px-3 py-2 border ${
                  formErrors.resetCode ? 'border-red-300' : 'border-gray-300'
                } placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm`}
                placeholder="Reset Code"
              />
              {formErrors.resetCode && (
                <p className="mt-2 text-sm text-red-600">{formErrors.resetCode}</p>
              )}
            </div>

            <div className="relative">
              <label htmlFor="newPassword" className="sr-only">New Password</label>
              <input
                id="newPassword"
                name="newPassword"
                type={showPassword ? "text" : "password"}
                required
                value={formData.newPassword}
                onChange={handleChange}
                className={`appearance-none rounded relative block w-full px-3 py-2 border ${
                  formErrors.newPassword ? 'border-red-300' : 'border-gray-300'
                } placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm`}
                placeholder="New Password"
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showPassword ? (
                  <AiOutlineEyeInvisible className="h-5 w-5 text-gray-400" />
                ) : (
                  <AiOutlineEye className="h-5 w-5 text-gray-400" />
                )}
              </button>
              {formErrors.newPassword && (
                <p className="mt-2 text-sm text-red-600">{formErrors.newPassword}</p>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="sr-only">Confirm Password</label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showPassword ? "text" : "password"}
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`appearance-none rounded relative block w-full px-3 py-2 border ${
                  formErrors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                } placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm`}
                placeholder="Confirm Password"
              />
              {formErrors.confirmPassword && (
                <p className="mt-2 text-sm text-red-600">{formErrors.confirmPassword}</p>
              )}
            </div>

            <div>
              <Button
                type="submit"
                isLoading={isLoading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
              >
                Reset Password
              </Button>
            </div>
          </form>
        )}

        <div className="text-sm text-center">
          <Link to="/login" className="font-medium text-pink-600 hover:text-pink-500">
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;