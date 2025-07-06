import { useEffect, useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { userAPI } from '../../services/api';
import { FiEdit, FiTrash2, FiMapPin, FiCheck, FiPlus } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import Loader from '../Loader';

const AddressBook = () => {
  const user = useSelector((state) => state.user.user);
  const dispatch = useDispatch();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Always fetch latest user profile from backend on mount and after address changes
  const fetchProfile = useCallback(async () => {
    setLoading(true);
    try {
      const res = await userAPI.getProfile();
      dispatch({ type: 'user/setUser', payload: res.data });
      setAddresses(res.data.addresses || []);
    } catch (err) {
      setAddresses([]);
      setError('Failed to load addresses');
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  useEffect(() => {
    fetchProfile();
    // eslint-disable-next-line
  }, []);

  const handleAddressClick = (address) => {
    // Navigate to edit page with address ID
    navigate(`/addresses/edit/${address._id}`);
  };

  const handleAddAddress = () => {
    navigate('/addresses/new');
  };

  const handleEditClick = (e, address) => {
    e.stopPropagation(); // Prevent triggering the card click
    navigate(`/addresses/edit/${address._id}`);
  };

  const setDefaultAddress = async (e, id) => {
    e.stopPropagation();
    setLoading(true);
    setError('');
    try {
      const updatedAddresses = addresses.map(addr => ({ ...addr, isDefault: addr._id === id }));
      await userAPI.setDefaultAddress(updatedAddresses);
      await fetchProfile();
    } catch (err) {
      setError('Failed to set default address');
    } finally {
      setLoading(false);
    }
  };

  const removeAddress = async (e, id) => {
    e.stopPropagation();
    setLoading(true);
    setError('');
    try {
      const updatedAddresses = addresses.filter(addr => addr._id !== id);
      await userAPI.removeAddress(updatedAddresses);
      await fetchProfile();
    } catch (err) {
      setError('Failed to remove address');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Your Addresses</h1>
        <button
          onClick={handleAddAddress}
          className="flex items-center px-4 py-2  bg-pink-600 hover:bg-pink-700 text-white rounded-md transition-colors"
        >
          <FiPlus className="mr-2" />
          Add address
        </button>
      </div>
      {error && <div className="text-red-600 mb-4">{error}</div>}
      {loading && <Loader />}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {addresses.map((address, idx) => (
          <div 
            key={address._id || idx} 
            className={`border rounded-lg p-5 relative cursor-pointer transition-all hover:shadow-md ${
              address.isDefault 
                ? 'border-2 border-pink-400 bg-pink-50' 
                : 'border-gray-200 hover:border-pink-500'
            }`}
            onClick={() => handleAddressClick(address)}
          >
            {address.isDefault && (
              <div className="absolute top-3 right-3 flex items-center bg-pink-100 text-pink-800 px-2 py-1 rounded text-sm">
                <FiCheck className="mr-1" /> Default
              </div>
            )}
            <div className="flex items-start mb-4">
              <FiMapPin className="text-gray-500 mt-1 mr-2 flex-shrink-0" />
              <div>
                <h3 className="font-bold text-lg text-gray-800">{address.name}</h3>
                <p className="text-gray-600">{address.addressLine1}</p>
                {address.addressLine2 && <p className="text-gray-600">{address.addressLine2}</p>}
                <p className="text-gray-600">{address.city}</p>
                <p className="text-gray-600">{address.state}, {address.pincode}</p>
                <p className="text-gray-600">{address.country}</p>
                <p className="mt-2 text-gray-600">Phone number: {address.phone || user?.phone}</p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <button 
                className="text-pink-600 hover:text-pink-800 text-sm font-medium flex items-center"
                onClick={(e) => e.stopPropagation()}
              >
                Add delivery instructions
              </button>
            </div>
            <div className="flex space-x-3 mt-4">
              <button 
                className="flex items-center text-gray-700 hover:text-gray-900"
                onClick={(e) => handleEditClick(e, address)}
              >
                <FiEdit className="mr-1" /> Edit
              </button>
              <button 
                className="flex items-center text-gray-700 hover:text-red-600"
                onClick={(e) => removeAddress(e, address._id)}
                disabled={loading}
              >
                <FiTrash2 className="mr-1" /> Remove
              </button>
              {!address.isDefault && (
                <button 
                  className="flex items-center text-gray-700 hover:text-pink-600 ml-auto"
                  onClick={(e) => setDefaultAddress(e, address._id)}
                  disabled={loading}
                >
                  Set as Default
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AddressBook;