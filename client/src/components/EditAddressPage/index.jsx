import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUserStore } from '../../store/userStore';
import { userAPI } from '../../services/api';
import { FiSave, FiX, FiMapPin } from 'react-icons/fi';
import { ClipLoader } from 'react-spinners';

const EditAddressPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useUserStore((s) => s.user);
  const setUser = useUserStore((s) => s.setUser);
  const [address, setAddress] = useState({
    name: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
    country: '',
    phone: '',
    isDefault: false
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user && Array.isArray(user.addresses)) {
      const found = user.addresses.find((a) => String(a._id) === String(id));
      if (found) {
        setAddress({
          name: found.name || '',
          addressLine1: found.addressLine1 || '',
          addressLine2: found.addressLine2 || '',
          city: found.city || '',
          state: found.state || '',
          pincode: found.pincode || '',
          country: found.country || '',
          phone: found.phone || '',
          isDefault: !!found.isDefault
        });
      }
    }
    setLoading(false);
  }, [user, id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAddress(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      // Update the address in the array
      const updatedAddresses = (user.addresses || []).map((a) =>
        String(a._id) === String(id) ? { ...a, ...address } : a
      );
      // If isDefault is set, ensure only one default
      if (address.isDefault) {
        updatedAddresses.forEach((a) => {
          if (String(a._id) !== String(id)) a.isDefault = false;
        });
      }
      const res = await userAPI.setDefaultAddress(updatedAddresses);
      setUser(res.data);
      navigate('/addresses');
    } catch (err) {
      setError('Failed to update address');
    } finally {
      setLoading(false);
    }
  };


  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <ClipLoader color="#f59e42" size={40} speedMultiplier={0.8} />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md mt-8">
      <div className="flex items-center mb-6">
        <FiMapPin className="text-amber-500 mr-2 text-xl" />
        <h1 className="text-2xl font-bold text-gray-800">Edit Address</h1>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div className="text-red-600 mb-2">{error}</div>}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              value={address.name}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <input
              type="text"
              name="phone"
              value={address.phone}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address Line 1
            </label>
            <input
              type="text"
              name="addressLine1"
              value={address.addressLine1}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address Line 2
            </label>
            <input
              type="text"
              name="addressLine2"
              value={address.addressLine2}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              City
            </label>
            <input
              type="text"
              name="city"
              value={address.city}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              State
            </label>
            <input
              type="text"
              name="state"
              value={address.state}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Pincode
            </label>
            <input
              type="text"
              name="pincode"
              value={address.pincode}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Country
            </label>
            <input
              type="text"
              name="country"
              value={address.country}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              required
            />
          </div>
        </div>
        <div className="flex items-center mt-4">
          <input
            type="checkbox"
            name="isDefault"
            checked={address.isDefault}
            onChange={handleChange}
            className="h-4 w-4 text-amber-500 rounded focus:ring-amber-500"
          />
          <label className="ml-2 text-sm text-gray-700">
            Set as default address
          </label>
        </div>
        <div className="flex justify-end gap-3 mt-8">
          <button 
            type="button"
            onClick={() => navigate('/addresses')}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button 
            type="submit"
            className="px-4 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600"
            disabled={loading}
          >
            Save Address
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditAddressPage;