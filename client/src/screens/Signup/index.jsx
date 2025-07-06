import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useUserHook from '../../redux/features/user/useUserHook';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
import Button from '../../components/Button';

const Signup = () => {
  const navigate = useNavigate();
  const { signup, isLoading, error, clearUserError } = useUserHook();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    password: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [message, setMessage] = useState('');

  const validateForm = () => {
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.email.trim()) errors.email = 'Email is required';
    else if (!emailRegex.test(formData.email)) errors.email = 'Invalid email format';
    
    if (!formData.name.trim()) errors.name = 'Name is required';
    else if (formData.name.trim().length < 3) errors.name = 'Name must be at least 3 characters';
    
    if (!formData.password) errors.password = 'Password is required';
    else if (formData.password.length < 8) errors.password = 'Password must be at least 8 characters';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    if (!validateForm()) return;

    try {
      const resultAction = await signup(formData);
      if (resultAction.payload?.success) {
        setMessage(resultAction.payload?.message || 'Signup successful! Redirecting to home...');
        setTimeout(() => navigate('/'), 1500);
      } else {
        setMessage(resultAction.payload?.message || 'Signup failed. Please try again.');
      }
    } catch (err) {
      setMessage('Signup failed. Please try again.');
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
          Create your account
        </h2>

        {(error || message) && (
          <div className={`p-3 rounded-md ${message.includes('successful') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {error || message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
          <div className="space-y-4">
            {/* Name Input */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                value={formData.name}
                onChange={handleChange}
                className={`appearance-none relative block w-full px-3 py-2.5 border ${
                  formErrors.name ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-pink-500 focus:border-pink-500'
                } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-2 sm:text-sm`}
                placeholder="Full Name"
              />
              {formErrors.name && <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>}
            </div>

            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={formData.email}
                onChange={handleChange}
                className={`appearance-none relative block w-full px-3 py-2.5 border ${
                  formErrors.email ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-pink-500 focus:border-pink-500'
                } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-2 sm:text-sm`}
                placeholder="Email address"
              />
              {formErrors.email && <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>}
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`appearance-none relative block w-full px-3 py-2.5 border ${
                    formErrors.password ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-pink-500 focus:border-pink-500'
                  } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-2 sm:text-sm pr-10`}
                  placeholder="Password"
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
              {formErrors.password && <p className="mt-1 text-sm text-red-600">{formErrors.password}</p>}
            </div>
          </div>

          <div>
            <Button
              type="submit"
              loading={isLoading}
              className="w-full justify-center py-2.5"
            >
              {isLoading ? 'Creating account...' : 'Sign up'}
            </Button>
          </div>

          <div className="text-sm text-center pt-2">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-pink-600 hover:text-pink-500">
              Sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Signup;