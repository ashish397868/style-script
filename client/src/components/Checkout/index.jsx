import React, { useState, useEffect } from "react";
import { useUserStore } from "../../store/userStore";
import { useCheckoutStore } from "../../store/checkoutStore";
import api from "../../services/api";
import { FiEdit2, FiPlus, FiCheck, FiX } from "react-icons/fi";
import Modal from "react-modal";
import { useNavigate } from "react-router-dom";
Modal.setAppElement("#root");

const AddressSelection = ({ onAddressSelect }) => {
  const navigate = useNavigate();
  const user = useUserStore((state) => state.user);
  const setUser = useUserStore((state) => state.setUser);
  const setSelectedAddress = useCheckoutStore((state) => state.setSelectedAddress);
  
  // Add debugging for initial user data
  useEffect(() => {
    console.log("=== Initial User Data ===");
    console.log("Current user state:", user);
    console.log("Is user loaded:", !!user);
    console.log("User properties:", user ? Object.keys(user) : 'No user');
  }, [user]);

  const [address, setAddress] = useState([]);
  const [selectedAddress, setSelectedAddressState] = useState(null);
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

  useEffect(() => {
    console.log("useEffect triggered, user:", user);
    
    if (user && user.address) {
      // Check if user.address is an array or single object
      if (Array.isArray(user.address)) {
        // If it's already an array
        setAddress(user.address);
        setSelectedAddressState(user.address.length > 0 ? user.address[0]._id : null);
      } else {
        // If it's a single address object, convert to array
        const addressWithId = { ...user.address, _id: user.address._id || 'temp-id-1' };
        const addressArray = [addressWithId];
        setAddress(addressArray);
        setSelectedAddressState(addressWithId._id);
      }
    } else {
      setAddress([]);
      setSelectedAddressState(null);
    }
  }, [user]);

  const validateAddress = () => {
    const newErrors = {};

    if (!currentAddress.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!currentAddress.phone || !/^\+?[\d\s-]{10,}$/.test(currentAddress.phone)) {
      newErrors.phone = "Valid phone number is required";
    }

    if (!currentAddress.addressLine1.trim()) {
      newErrors.addressLine1 = "Address line is required";
    }

    if (!currentAddress.city.trim()) {
      newErrors.city = "City is required";
    }

    if (!currentAddress.state.trim()) {
      newErrors.state = "State is required";
    }

    if (!currentAddress.pincode || !/^\d{6}$/.test(currentAddress.pincode)) {
      newErrors.pincode = "Valid 6-digit pincode is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentAddress((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmitAddress = async () => {
    if (!validateAddress()) return;

    try {
      console.log("=== Submitting Address ===");
      console.log("1. Current address state:", address);
      
      let updatedAddress;
      if (isEditing) {
        // Edit existing address
        updatedAddress = address.map((addr) => 
          addr._id === currentAddress._id ? {
            ...currentAddress,
            // Ensure name and phone are saved with the address
            name: currentAddress.name,
            phone: currentAddress.phone
          } : addr
        );
      } else {
        // Add new address
        updatedAddress = [
          ...address,
          {
            ...currentAddress,
            // Ensure name and phone are saved with the address
            name: currentAddress.name,
            phone: currentAddress.phone,
            _id: Date.now().toString() // temp _id for frontend
          }
        ];
      }

      console.log("2. Updated address to be sent:", updatedAddress);

      // Send PATCH to /users/profile with updated address array
      const payload = { address: updatedAddress };
      console.log("3. Sending payload:", payload);
      
      const response = await api.patch("/users/profile", payload);
      console.log("4. Server response:", response.data);
      
      if (response.data && response.data.user) {
        console.log("5. Setting new user data:", response.data.user);
        setUser(response.data.user);
        
        // Handle the response address data
        if (response.data.user.address) {
          if (Array.isArray(response.data.user.address)) {
            setAddress(response.data.user.address);
            setSelectedAddressState(
              response.data.user.address.length > 0 
                ? response.data.user.address[response.data.user.address.length - 1]._id 
                : null
            );
          } else {
            // Single address object
            const addressWithId = { 
              ...response.data.user.address, 
              _id: response.data.user.address._id || 'temp-id-1',
              // Ensure name and phone are included
              name: response.data.user.address.name || user?.name || "",
              phone: response.data.user.address.phone || user?.phone || ""
            };
            setAddress([addressWithId]);
            setSelectedAddressState(addressWithId._id);
          }
        }
      } else {
        console.warn("6. No valid address data in response");
      }
      
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
    } catch (error) {
      console.error("Error saving address:", error);
    }
  };

  const handleEditAddress = (addressToEdit) => {
    console.log("Editing address:", addressToEdit);
    // When editing, use the name and phone from the address object itself
    setCurrentAddress({
      ...addressToEdit,
      // If we're editing, use the address's name and phone, otherwise fallback to user's data
      name: addressToEdit.name || user?.name || "",
      phone: addressToEdit.phone || user?.phone || "",
    });
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleAddNewAddress = () => {
    // Add detailed debugging
    console.log("=== Debug Address Modal ===");
    console.log("1. Full user object:", user);
    console.log("2. User name:", user?.name);
    console.log("3. User phone:", user?.phone);
    console.log("4. User address:", user?.address);
    
    if (!user) {
      console.warn("User object is not loaded yet");
      return;
    }

    // Log the address being set
    const newAddress = {
      name: user.name || "",
      phone: user.phone || "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      pincode: "",
      country: "India",
    };
    
    console.log("5. Setting new address:", newAddress);
    
    setCurrentAddress(newAddress);
    setIsEditing(false);
    setIsModalOpen(true);
  };

  const handleSelectAddress = (addressId) => {
    setSelectedAddressState(addressId);
    if (onAddressSelect) {
      const selectedAddr = address.find((a) => a._id === addressId);
      onAddressSelect(selectedAddr);
    }
  };

  const handleDeliverToAddress = () => {
    const selectedAddr = address.find((a) => a._id === selectedAddress);
    if (selectedAddr) {
      // Save the selected address to the store
      setSelectedAddress(selectedAddr);
      // Call the callback if provided
      onAddressSelect?.(selectedAddr);
      // Navigate to review order page
      navigate('/review-order');
    } else {
      console.error('No address selected');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h1 className="text-2xl font-bold mb-6">Select a delivery address</h1>
      {console.log("address state:", address)}

      {address.length > 0 ? (
        <>
          <h2 className="text-lg font-semibold mb-4">Delivery address ({address.length})</h2>

          <div className="space-y-4 mb-6">
            {address.map((addr) => (
              <div 
                key={addr._id} 
                className={`border rounded-lg p-4 ${
                  selectedAddress === addr._id 
                    ? "border-blue-500 bg-blue-50" 
                    : "border-gray-200"
                }`}
              >
                <div className="cursor-pointer" onClick={() => handleSelectAddress(addr._id)}>
                  <p className="font-semibold">{addr.name}</p>
                  <p className="text-gray-600 mt-1">
                    <span className="mr-2">📌</span>
                    {addr.addressLine1}, {addr.addressLine2 && `${addr.addressLine2}, `}
                    {addr.city}, {addr.state}, {addr.pincode}, {addr.country}
                  </p>
                  <p className="text-gray-600 mt-1">
                    <span className="mr-2">📞</span>
                    {addr.phone}
                  </p>
                </div>

                <div className="mt-3 flex space-x-4">
                  <button 
                    onClick={() => handleEditAddress(addr)} 
                    className="text-blue-600 hover:text-blue-800 flex items-center"
                  >
                    <FiEdit2 className="mr-1" /> Edit address
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="mb-6">
          <p className="text-gray-600">You don't have any saved address yet.</p>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <button 
          onClick={handleAddNewAddress} 
          className="text-blue-600 hover:text-blue-800 flex items-center"
        >
          <FiPlus className="mr-1" /> Add a new delivery address
        </button>

        {address.length > 0 && selectedAddress && (
          <button 
            onClick={handleDeliverToAddress}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Deliver to this address
          </button>
        )}
      </div>

      {/* Address Modal */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => {
          setIsModalOpen(false);
          setIsEditing(false);
        }}
        className="modal"
        overlayClassName="modal-overlay"
        contentLabel={isEditing ? "Edit Address" : "Add New Address"}
      >
        <div className="bg-white p-6 rounded-lg max-w-md mx-auto">
          <h2 className="text-xl font-bold mb-4">
            {isEditing ? "Edit Address" : "Add New Address"}
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Full Name</label>
              <input
                type="text"
                name="name"
                value={currentAddress.name}
                onChange={handleInputChange}
                className={`mt-1 block w-full rounded-md shadow-sm ${
                  errors.name 
                    ? "border-red-300 focus:ring-red-500 focus:border-red-500" 
                    : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                } sm:text-sm`}
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Phone Number</label>
              <input
                type="tel"
                name="phone"
                value={currentAddress.phone}
                onChange={handleInputChange}
                className={`mt-1 block w-full rounded-md shadow-sm ${
                  errors.phone 
                    ? "border-red-300 focus:ring-red-500 focus:border-red-500" 
                    : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                } sm:text-sm`}
              />
              {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Address Line 1</label>
              <input
                type="text"
                name="addressLine1"
                value={currentAddress.addressLine1}
                onChange={handleInputChange}
                className={`mt-1 block w-full rounded-md shadow-sm ${
                  errors.addressLine1 
                    ? "border-red-300 focus:ring-red-500 focus:border-red-500" 
                    : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                } sm:text-sm`}
              />
              {errors.addressLine1 && <p className="mt-1 text-sm text-red-600">{errors.addressLine1}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Address Line 2 (Optional)</label>
              <input 
                type="text" 
                name="addressLine2" 
                value={currentAddress.addressLine2} 
                onChange={handleInputChange} 
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" 
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">City</label>
                <input
                  type="text"
                  name="city"
                  value={currentAddress.city}
                  onChange={handleInputChange}
                  className={`mt-1 block w-full rounded-md shadow-sm ${
                    errors.city 
                      ? "border-red-300 focus:ring-red-500 focus:border-red-500" 
                      : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                  } sm:text-sm`}
                />
                {errors.city && <p className="mt-1 text-sm text-red-600">{errors.city}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">State</label>
                <input
                  type="text"
                  name="state"
                  value={currentAddress.state}
                  onChange={handleInputChange}
                  className={`mt-1 block w-full rounded-md shadow-sm ${
                    errors.state 
                      ? "border-red-300 focus:ring-red-500 focus:border-red-500" 
                      : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                  } sm:text-sm`}
                />
                {errors.state && <p className="mt-1 text-sm text-red-600">{errors.state}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Pincode</label>
                <input
                  type="text"
                  name="pincode"
                  value={currentAddress.pincode}
                  onChange={handleInputChange}
                  className={`mt-1 block w-full rounded-md shadow-sm ${
                    errors.pincode 
                      ? "border-red-300 focus:ring-red-500 focus:border-red-500" 
                      : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                  } sm:text-sm`}
                />
                {errors.pincode && <p className="mt-1 text-sm text-red-600">{errors.pincode}</p>}
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setIsEditing(false);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <FiX className="inline mr-1" /> Cancel
              </button>
              <button 
                onClick={handleSubmitAddress} 
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <FiCheck className="inline mr-1" /> {isEditing ? "Update" : "Save"}
              </button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Modal styles */}
      <style>{`
        .modal {
          position: absolute;
          top: 50%;
          left: 50%;
          right: auto;
          bottom: auto;
          margin-right: -50%;
          transform: translate(-50%, -50%);
          width: 100%;
          max-width: 32rem;
          padding: 0;
          border: none;
          outline: none;
        }
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          z-index: 1000;
        }
      `}</style>
    </div>
  );
};

export default AddressSelection;