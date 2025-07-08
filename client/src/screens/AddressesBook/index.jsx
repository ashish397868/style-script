import { useEffect, useState } from "react";
import { FiEdit, FiTrash2, FiMapPin, FiPlus } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import Loader from "../../components/Loader";
import useUserProfile from "../../redux/features/user/userProfileHook";
import { addressAPI } from "../../services/api";

const AddressBook = () => {
  const { user, fetchProfile } = useUserProfile();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    fetchProfile()
      .then((res) => {
        setAddresses(res.addresses || []);
        setError("");
      })
      .catch(() => {
        setAddresses([]);
        setError("Failed to load addresses");
      })
      .finally(() => setLoading(false));
  }, [fetchProfile]);

  const handleAddressClick = (address) => {
    navigate(`/addresses/edit/${address._id}`);
  };

  const handleAddAddress = () => {
    navigate("/addresses/new");
  };

  const handleEditClick = (e, address) => {
    e.stopPropagation();
    navigate(`/addresses/edit/${address._id}`);
  };

  const removeAddress = async (e, id) => {
    e.stopPropagation();
    setLoading(true);
    setError("");
    try {
      const updated = addresses.filter((addr) => addr._id !== id);
      await addressAPI.deleteAddress(id);
      setAddresses(updated);
    } catch {
      setError("Failed to remove address");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Your Addresses</h1>
        <button onClick={handleAddAddress} className="flex items-center px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-md transition-colors">
          <FiPlus className="mr-2" /> Add address
        </button>
      </div>

      {error && <div className="text-red-600 mb-4">{error}</div>}
      {loading && <Loader />}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {addresses.map((address) => (
          <div key={address._id} className="border rounded-lg p-5 cursor-pointer transition-all hover:shadow-md border-gray-200 hover:border-pink-500" onClick={() => handleAddressClick(address)}>
            <div className="flex items-start mb-4">
              <FiMapPin className="text-gray-500 mt-1 mr-2" />
              <div>
                <h3 className="font-bold text-lg text-gray-800">{address.name}</h3>
                <p className="text-gray-600">{address.addressLine1}</p>
                {address.addressLine2 && <p className="text-gray-600">{address.addressLine2}</p>}
                <p className="text-gray-600">
                  {address.city}, {address.state} {address.pincode}
                </p>
                <p className="text-gray-600">{address.country}</p>
                <p className="mt-2 text-gray-600">Phone: {address.phone || user?.phone}</p>
              </div>
            </div>

            {/* <div className="mt-4 pt-4 border-t border-gray-100">
              <button className="text-pink-600 hover:text-pink-800 text-sm font-medium" onClick={(e) => e.stopPropagation()}>
                Add delivery instructions
              </button>
            </div> */}

            <div className="flex space-x-3 mt-4">
              <button className="flex items-center text-gray-700 hover:text-gray-900 cursor-pointer" onClick={(e) => handleEditClick(e, address)}>
                <FiEdit className="mr-1" /> Edit
              </button>
              <button className="flex items-center text-gray-700 hover:text-red-600 cursor-pointer" onClick={(e) => removeAddress(e, address._id)} disabled={loading}>
                <FiTrash2 className="mr-1" /> Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AddressBook;
