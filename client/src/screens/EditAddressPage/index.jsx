import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useUserProfile from "../../redux/features/user/userProfileHook";
import { FiMapPin } from "react-icons/fi";
import Loader from "../../components/Loader";
import { addressAPI } from "../../services/api";

const EditAddressPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, fetchProfile } = useUserProfile();
  const [address, setAddress] = useState({
    name: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    pincode: "",
    country: "",
    phone: "",
    isDefault: false,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Populate form from Redux user or fetch from API
  useEffect(() => {
    const loadAddress = async () => {
      setLoading(true);
      try {
        // First try to get address from the Redux store
        if (user?.addresses) {
          const found = user.addresses.find((a) => String(a._id) === id);
          if (found) {
            setAddress({ ...found });
            setLoading(false);
            return;
          }
        }
        
        // If not found in Redux store, fetch the latest profile data
        const profileData = await fetchProfile();
        const foundInFresh = profileData.addresses?.find((a) => String(a._id) === id);
        
        if (foundInFresh) {
          setAddress({ ...foundInFresh });
        } else {
          setError("Address not found");
        }
      } catch (err) {
        console.error("Failed to load address:", err);
        setError("Failed to load address details");
      } finally {
        setLoading(false);
      }
    };

    loadAddress();
  }, [user, id, fetchProfile]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAddress((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await addressAPI.updateAddress(id, {
        name: address.name,
        addressLine1: address.addressLine1,
        addressLine2: address.addressLine2,
        city: address.city,
        state: address.state,
        pincode: address.pincode,
        country: address.country,
        phone: address.phone,
        isDefault: address.isDefault,
      });

      navigate("/addresses");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to update address");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md mt-8">
      <div className="flex items-center mb-6">
        <FiMapPin className="text-pink-500 mr-2 text-xl" />
        <h1 className="text-2xl font-bold text-gray-800">Edit Address</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div className="text-red-600 mb-2">{error}</div>}

        {/* Name & Phone */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input type="text" name="name" value={address.name} onChange={handleChange} className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <input type="text" name="phone" value={address.phone} onChange={handleChange} className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 " required />
          </div>

          {/* Address Lines */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 1</label>
            <input type="text" name="addressLine1" value={address.addressLine1} onChange={handleChange} className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 2</label>
            <input type="text" name="addressLine2" value={address.addressLine2} onChange={handleChange} className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500" />
          </div>

          {/* City / State */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
            <input type="text" name="city" value={address.city} onChange={handleChange} className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
            <input type="text" name="state" value={address.state} onChange={handleChange} className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500" required />
          </div>

          {/* Pincode / Country */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
            <input type="text" name="pincode" value={address.pincode} onChange={handleChange} className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
            <input type="text" name="country" value={address.country} onChange={handleChange} className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500" required />
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 mt-8">
          <button type="button" onClick={() => navigate("/addresses")} className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50">
            Cancel
          </button>
          <button type="submit" className="px-4 py-2 bg-pink-500 text-white rounded-md hover:bg-pink-600" disabled={loading}>
            Save Address
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditAddressPage;