import React, { useState, useEffect } from "react";
import { useUserStore } from "../../store/userStore";
import { useCheckoutStore } from "../../store/checkoutStore";
import api from "../../services/api";
import { FiEdit2, FiPlus, FiCheck, FiX, FiMapPin, FiUser, FiPhone, FiHome } from "react-icons/fi";
import Modal from "react-modal";
import { useNavigate } from "react-router-dom";
Modal.setAppElement("#root");

const AddressSelection = ({ onAddressSelect }) => {
  const navigate = useNavigate();
  const user = useUserStore((state) => state.user);
  const setUser = useUserStore((state) => state.setUser);
  const initAuth = useUserStore((state) => state.initAuth);
  const setSelectedAddress = useCheckoutStore((state) => state.setSelectedAddress);

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

  // Ensure user is loaded from global state or fetch if token exists
  useEffect(() => {
    if (!user && localStorage.getItem('token')) {
      initAuth();
    }
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (user && Array.isArray(user.addresses)) {
      setAddress(user.addresses);
      setSelectedAddressState(user.addresses.length > 0 ? user.addresses[0] : null);
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
      let updatedAddress;
      if (isEditing) {
        updatedAddress = address.map((addr) =>
          addr._id === currentAddress._id
            ? {
                ...currentAddress,
                name: currentAddress.name,
                phone: currentAddress.phone,
                _id: currentAddress._id || null
              }
            : {
                ...addr,
                _id: addr._id || null
              }
        );
      } else {
        updatedAddress = [
          ...address.map(addr => ({ ...addr, _id: addr._id || null })),
          {
            ...currentAddress,
            name: currentAddress.name,
            phone: currentAddress.phone,
            _id: currentAddress._id || null
          }
        ];
      }

      const payload = { addresses: updatedAddress };
      const response = await api.patch("/users/profile", payload);
      
      if (response.data && response.data.user) {
        setUser(response.data.user);
        
        if (response.data.user.address) {
          if (Array.isArray(response.data.user.address)) {
            setAddress(response.data.user.address);
            setSelectedAddressState(
              response.data.user.address.length > 0 
                ? response.data.user.address[response.data.user.address.length - 1]._id 
                : null
            );
          } else {
            const addressWithId = { 
              ...response.data.user.address, 
              _id: response.data.user.address._id || 'temp-id-1',
              name: response.data.user.address.name || user?.name || "",
              phone: response.data.user.address.phone || user?.phone || ""
            };
            setAddress([addressWithId]);
            setSelectedAddressState(addressWithId._id);
          }
        }
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
    setCurrentAddress({
      ...addressToEdit,
      name: addressToEdit.name || user?.name || "",
      phone: addressToEdit.phone || user?.phone || "",
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

  const handleSelectAddress = (addrObj) => {
    setSelectedAddressState(addrObj);
    if (onAddressSelect) {
      onAddressSelect(addrObj);
    }
  };

  const handleDeliverToAddress = () => {
    if (selectedAddress) {
      setSelectedAddress(selectedAddress);
      onAddressSelect?.(selectedAddress);
      navigate('/review-order');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6">
          <h1 className="text-2xl font-bold text-white">Select a delivery address</h1>
          <p className="text-blue-100 mt-2">
            {address.length > 0 
              ? `You have ${address.length} saved address${address.length > 1 ? 'es' : ''}`
              : "You don't have any saved address yet"}
          </p>
        </div>
        
        <div className="p-6">
          {address.length > 0 ? (
            <div className="space-y-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                <FiMapPin className="mr-2 text-blue-600" />
                Delivery Addresses
              </h2>
              {/* {console.log("User : - -", user)} */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {address.map((addr, idx) => (
                  <div 
                    key={addr._id || idx} 
                    className={`border rounded-xl p-5 transition-all duration-300 cursor-pointer ${
                      selectedAddress === addr 
                        ? "border-blue-500 bg-blue-50 shadow-md transform -translate-y-1" 
                        : "border-gray-200 hover:border-blue-300 hover:bg-blue-50"
                    }`}
                    onClick={() => handleSelectAddress(addr)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center mb-2">
                          <div className="bg-blue-100 p-2 rounded-full mr-3">
                            <FiUser className="h-5 w-5 text-blue-600" />
                          </div>
                          <h3 className="font-bold text-gray-900 text-lg capitalize">{user.name}</h3>
                        </div>
                        
                        <div className="flex items-start mt-3">
                          <div className="bg-blue-100 p-2 rounded-full mr-3">
                            <FiHome className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-gray-700">
                              {addr.addressLine1}, {addr.addressLine2 && `${addr.addressLine2}, `}
                              {addr.city}, {addr.state}, {addr.pincode}
                            </p>
                            <p className="text-gray-500 text-sm mt-1">{addr.country}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center mt-3">
                          <div className="bg-blue-100 p-2 rounded-full mr-3">
                            <FiPhone className="h-5 w-5 text-blue-600" />
                          </div>
                          <p className="text-gray-700">{user.phone}</p>
                        </div>
                      </div>
                      
                      {selectedAddress === addr && (
                        <div className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                          Selected
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditAddress(addr);
                        }} 
                        className="text-blue-600 hover:text-blue-800 flex items-center text-sm"
                      >
                        <FiEdit2 className="mr-1" /> Edit address
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 mb-6">
              <div className="bg-blue-100 p-5 rounded-full inline-block mb-4">
                <FiMapPin className="h-12 w-12 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">No Addresses Found</h3>
              <p className="text-gray-600 max-w-md mx-auto">
                You haven't saved any addresses yet. Add an address to continue with your order.
              </p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-4 border-t border-gray-200">
            <button 
              onClick={handleAddNewAddress} 
              className="flex items-center px-5 py-3 bg-white border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium"
            >
              <FiPlus className="mr-2" /> Add a new delivery address
            </button>

            {address.length > 0 && selectedAddress && (
              <button 
                onClick={handleDeliverToAddress}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-lg hover:from-blue-700 hover:to-indigo-800 transition-all shadow-lg font-medium"
              >
                Deliver to this address
              </button>
            )}
          </div>
        </div>
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
        shouldCloseOnOverlayClick={true}
        style={{
          content: {
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: 0,
            border: 'none',
            borderRadius: '0.5rem',
            inset: '50% auto auto 50%',
            transform: 'translate(-50%, -50%)',
            width: '100%',
            maxWidth: '32rem',
          },
          overlay: {
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          },
        }}
      >
        <div className="bg-white rounded-2xl overflow-visible shadow-xl max-w-md w-full">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-5 sticky top-0 z-10">
            <h2 className="text-xl font-bold text-white flex items-center">
              <FiMapPin className="mr-2" />
              {isEditing ? "Edit Address" : "Add New Address"}
            </h2>
          </div>
          <div className="p-6">
            <div className="space-y-5">
              {/* ...existing form fields... */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <FiUser className="mr-2 text-gray-500" /> Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={currentAddress.name}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    errors.name 
                      ? "border-red-300 focus:ring-red-500 focus:border-red-500" 
                      : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                  } focus:outline-none`}
                  placeholder="John Doe"
                />
                {errors.name && <p className="mt-2 text-sm text-red-600">{errors.name}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <FiPhone className="mr-2 text-gray-500" /> Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={currentAddress.phone}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    errors.phone 
                      ? "border-red-300 focus:ring-red-500 focus:border-red-500" 
                      : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                  } focus:outline-none`}
                  placeholder="+91 9876543210"
                />
                {errors.phone && <p className="mt-2 text-sm text-red-600">{errors.phone}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <FiHome className="mr-2 text-gray-500" /> Address Line 1
                </label>
                <input
                  type="text"
                  name="addressLine1"
                  value={currentAddress.addressLine1}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    errors.addressLine1 
                      ? "border-red-300 focus:ring-red-500 focus:border-red-500" 
                      : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                  } focus:outline-none`}
                  placeholder="Street address, P.O. box"
                />
                {errors.addressLine1 && <p className="mt-2 text-sm text-red-600">{errors.addressLine1}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Address Line 2 (Optional)</label>
                <input 
                  type="text" 
                  name="addressLine2" 
                  value={currentAddress.addressLine2} 
                  onChange={handleInputChange} 
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 focus:outline-none" 
                  placeholder="Apartment, suite, unit, building, floor, etc."
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                  <input
                    type="text"
                    name="city"
                    value={currentAddress.city}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      errors.city 
                        ? "border-red-300 focus:ring-red-500 focus:border-red-500" 
                        : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                    } focus:outline-none`}
                    placeholder="City"
                  />
                  {errors.city && <p className="mt-2 text-sm text-red-600">{errors.city}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                  <input
                    type="text"
                    name="state"
                    value={currentAddress.state}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      errors.state 
                        ? "border-red-300 focus:ring-red-500 focus:border-red-500" 
                        : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                    } focus:outline-none`}
                    placeholder="State"
                  />
                  {errors.state && <p className="mt-2 text-sm text-red-600">{errors.state}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Pincode</label>
                  <input
                    type="text"
                    name="pincode"
                    value={currentAddress.pincode}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      errors.pincode 
                        ? "border-red-300 focus:ring-red-500 focus:border-red-500" 
                        : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                    } focus:outline-none`}
                    placeholder="Postal code"
                  />
                  {errors.pincode && <p className="mt-2 text-sm text-red-600">{errors.pincode}</p>}
                </div>
              </div>
              <div className="flex flex-col sm:flex-row justify-between gap-3 pt-4">
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    setIsEditing(false);
                  }}
                  className="px-5 py-3 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 font-medium flex items-center justify-center"
                >
                  <FiX className="mr-2" /> Cancel
                </button>
                <button 
                  onClick={handleSubmitAddress} 
                  className="px-5 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-lg hover:from-blue-700 hover:to-indigo-800 font-medium flex items-center justify-center"
                >
                  <FiCheck className="mr-2" /> {isEditing ? "Update Address" : "Save Address"}
                </button>
              </div>
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
          border-radius: 0.5rem;
          overflow: hidden;
        }
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
        }
      `}</style>
    </div>
  );
};

export default AddressSelection;