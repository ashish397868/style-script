// src/pages/AddressSelection.jsx
import  { useState, useEffect, useCallback } from "react";
import Modal from "react-modal";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import  { addressAPI, userAPI } from "../../services/api";
import { FiPlus, FiMapPin, FiRefreshCw } from "react-icons/fi";
import { setSelectedAddress as setSelectedAddressAction } from "../../redux/features/checkout/checkoutSlice";
import useUser from "../../redux/features/user/useUserHook";  
import AddressCard from "./AddressCard";
import AddressFormModal from "./AddressFormModal";

// Only run this client‑side
if (typeof window !== "undefined") {
  Modal.setAppElement("#root");
}

export default function AddressSelection({ onAddressSelect }) {
  const navigate = useNavigate();
  const dispatch  = useDispatch();
  const { user, initializeAuth, isAuthenticated } = useUser();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentAddress, setCurrentAddress] = useState({
    name: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
  });
  const [errors, setErrors] = useState({});

  // On mount, if we have a token but no user loaded, initialize auth
  useEffect(() => {
    if (!isAuthenticated && localStorage.getItem("token")) {
      initializeAuth();
    }
  }, [isAuthenticated, initializeAuth]);

  // Whenever `user` changes, extract addresses
  useEffect(() => {
    if (!user) return;

    const userAddresses = Array.isArray(user.addresses)
      ? user.addresses
      : Array.isArray(user.address)
      ? user.address
      : user.address && typeof user.address === "object"
      ? [user.address]
      : [];

    setAddresses(userAddresses);
    
    // Only set selected address if none is selected or if the current one is no longer in the list
    const addressStillExists = userAddresses.some(addr => selectedAddress && addr._id === selectedAddress._id);
    if (!selectedAddress || !addressStillExists) {
      setSelectedAddress(userAddresses[0] || null);
    }
  }, [user, selectedAddress]);
  
  // Function to manually fetch user data
  const fetchUserData = async () => {
    setIsRefreshing(true);
    try {
      await initializeAuth();
      const { data } = await userAPI.getProfile();
      if (data?.user) {
        const userAddresses = Array.isArray(data.user.addresses) ? data.user.addresses : [];
        setAddresses(userAddresses);
        if (userAddresses.length > 0 && !selectedAddress) {
          setSelectedAddress(userAddresses[0]);
        }
      }
    } catch (err) {
      console.error("Error fetching user data:", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const validateAddress = () => {
    const newErrors = {};
    if (!currentAddress.name.trim()) newErrors.name = "Name is required";
    if (
      !currentAddress.phone ||
      !/^\+?[\d\s-]{10,}$/.test(currentAddress.phone)
    ) {
      newErrors.phone = "Valid phone number is required";
    }
    if (!currentAddress.addressLine1.trim())
      newErrors.addressLine1 = "Address line is required";
    if (!currentAddress.city.trim()) newErrors.city = "City is required";
    if (!currentAddress.state.trim()) newErrors.state = "State is required";
    if (
      !currentAddress.pincode ||
      !/^\d{6}$/.test(currentAddress.pincode)
    ) {
      newErrors.pincode = "Valid 6-digit pincode is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentAddress((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitAddress = async () => {
    if (!validateAddress()) return;

    try {
      if (isEditing) {
        // Update existing address
        await addressAPI.updateAddress(currentAddress._id, currentAddress);
      } else {
        // Add new address
        await addressAPI.addAddress(currentAddress);
      }
      
      // Reload user data to get updated addresses
      await initializeAuth();
      // Explicitly fetch fresh user data to get the addresses
      await fetchUserData();
      
      // Small delay to ensure data is refreshed
      setTimeout(() => {
        setIsModalOpen(false);
        setIsEditing(false);
        setCurrentAddress({
          name: "",
          phone: "",
          addressLine1: "",
          addressLine2: "",
          city: "",
          state: "",
          pincode: "",
          country: "India",
        });
      }, 500);
    } catch (err) {
      console.error("Error saving address:", err);
    }
  };

  const handleEditAddress = (addr) => {
    setCurrentAddress({
      ...addr,
      name: addr.name || user?.name || "",
      phone: addr.phone || user?.phone || "",
    });
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleAddNewAddress = () => {
    if (!user) return;

    setCurrentAddress({
      name: user.name || "",
      phone: user.phone || "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      pincode: "",
      country: "India",
    });
    setIsEditing(false);
    setIsModalOpen(true);
  };

  const handleDeliverToAddress = useCallback(() => {
    if (!selectedAddress) return;
    dispatch(setSelectedAddressAction(selectedAddress));
    onAddressSelect?.(selectedAddress);
    navigate("/review-order");
  }, [dispatch, navigate, onAddressSelect, selectedAddress]);

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-gradient-to-r from-pink-50 to-pink-50 rounded-2xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-pink-600 to-pink-700 p-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white">
              Select a delivery address
            </h1>
            <p className="text-pink-100 mt-2">
              {addresses.length > 0
                ? `You have ${addresses.length} saved address${
                    addresses.length > 1 ? "es" : ""
                  }`
                : "You don't have any saved address yet"}
            </p>
          </div>
          <button 
            onClick={fetchUserData} 
            className="text-white hover:text-pink-200 transition-colors"
            disabled={isRefreshing}
          >
            <FiRefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="p-6">
          {addresses.length > 0 ? (
            <div className="space-y-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                <FiMapPin className="mr-2 text-pink-600" />
                Delivery Addresses
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {addresses.map((addr) => (
                  <AddressCard
                    key={addr._id || addr.id}
                    address={addr}
                    user={user}
                    isSelected={selectedAddress?._id === addr._id}
                    onSelect={setSelectedAddress}
                    onEdit={handleEditAddress}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 mb-6">
              <div className="bg-pink-100 p-5 rounded-full inline-block mb-4">
                <FiMapPin className="h-12 w-12 text-pink-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                No Addresses Found
              </h3>
              <p className="text-gray-600 max-w-md mx-auto">
                You haven't saved any addresses yet. Add one to continue.
              </p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-4 border-t border-gray-200">
            <button
              onClick={handleAddNewAddress}
              className="flex items-center px-5 py-3 bg-white border border-pink-600 text-pink-600 rounded-lg hover:bg-pink-50 transition-colors font-medium"
            >
              <FiPlus className="mr-2" /> Add a new delivery address
            </button>

            {addresses.length > 0 && selectedAddress && (
              <button
                onClick={handleDeliverToAddress}
                className="px-6 py-3 bg-gradient-to-r from-pink-600 to-pink-700 text-white rounded-lg hover:from-pink-700 hover:to-pink-800 transition-all shadow-lg font-medium"
              >
                Deliver to this address
              </button>
            )}
          </div>
        </div>
      </div>

      {isModalOpen && (
        <AddressFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleSubmitAddress}
          currentAddress={currentAddress}
          handleInputChange={handleInputChange}
          errors={errors}
          isEditing={isEditing}
        />
      )}
    </div>
  );
}
