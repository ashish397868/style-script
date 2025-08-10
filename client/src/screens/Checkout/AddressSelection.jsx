// src/pages/AddressSelection.jsx
import { useState, useEffect, useCallback, useMemo } from "react";
import Modal from "react-modal";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { FiPlus, FiMapPin, FiRefreshCw } from "react-icons/fi";
import { addressAPI, userAPI } from "../../services/api";
import { setSelectedAddress as setSelectedAddressAction } from "../../redux/features/checkout/checkoutSlice";
import { setUser } from "../../redux/features/user/userSlice"; // <-- ADD: Redux action for updating user
import useUser from "../../redux/features/user/useUserHook";
import AddressCard from "./AddressCard";
import AddressFormModal from "./AddressFormModal";
import { addressInitialValues } from "../../utils/formConfig/addressFormConfig";

if (typeof window !== "undefined") {
  Modal.setAppElement("#root");
}

export default function AddressSelection({ onAddressSelect }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useUser();

  const [selectedAddress, setSelectedAddress] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentAddress, setCurrentAddress] = useState(null);

  const addresses = useMemo(() => {
    return Array.isArray(user?.addresses) ? user.addresses : [];
  }, [user?.addresses]);

  // Set default selected address when addresses change
  useEffect(() => {
    if (!selectedAddress || !addresses.some((a) => a._id === selectedAddress._id)) {
      setSelectedAddress(addresses[0] || null);
    }
  }, [addresses, selectedAddress]);

  // Manual refresh
  const fetchUserData = async () => {
    setIsRefreshing(true);
    try {
      const { data } = await userAPI.getProfile();
      dispatch(setUser(data)); // update redux user
    } catch (err) {
      console.error(err);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Add new address
  const handleAddNew = () => {
    if (!user) return;
    const prefilledValues = {
      ...addressInitialValues,
      name: user.name || "",
      phone: user.phone || "",
    };
    setCurrentAddress(prefilledValues);
    setIsEditing(false);
    setIsModalOpen(true);
  };

  // Edit address
  const handleEdit = (address) => {
    setCurrentAddress({ ...address });
    setIsEditing(true);
    setIsModalOpen(true);
  };

  // Add/Edit submit
  const handleSubmitAddress = async (values) => {
    try {
      if (isEditing) {
        await addressAPI.updateAddress(values._id, values);
      } else {
        await addressAPI.addAddress(values);
      }
      // Backend se latest user profile leke redux update
      const { data } = await userAPI.getProfile();
      dispatch(setUser(data));
    } catch (err) {
      console.error(err);
    } finally {
      setIsModalOpen(false);
    }
  };

  // Confirm selection
  const handleDeliver = useCallback(() => {
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
            <h1 className="text-2xl font-bold text-white">Select a delivery address</h1>
            <p className="text-pink-100 mt-2">{addresses.length ? `You have ${addresses.length} saved address${addresses.length > 1 ? "es" : ""}` : "You don't have any saved address yet"}</p>
          </div>
          <button onClick={fetchUserData} disabled={isRefreshing} className="text-white hover:text-pink-200 transition-colors">
            <FiRefreshCw className={`w-5 h-5 ${isRefreshing ? "animate-spin" : ""}`} />
          </button>
        </div>

        <div className="p-6">
          {addresses.length ? (
            <>
              <h2 className="text-xl font-semibold text-gray-800 flex items-center mb-4">
                <FiMapPin className="mr-2 text-pink-600" />
                Delivery Addresses
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {addresses.map((addr) => (
                  <AddressCard key={addr._id} address={addr} isSelected={selectedAddress?._id === addr._id} onSelect={() => setSelectedAddress(addr)} onEdit={handleEdit} />
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-8 mb-6">
              <div className="bg-pink-100 p-5 rounded-full inline-block mb-4">
                <FiMapPin className="h-12 w-12 text-pink-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">No Addresses Found</h3>
              <p className="text-gray-600">You haven't saved any addresses yet. Add one to continue.</p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-4 border-t border-gray-200">
            <button onClick={handleAddNew} className="cursor-pointer flex items-center px-5 py-3 bg-white border border-pink-600 text-pink-600 rounded-lg hover:bg-pink-50 font-medium">
              <FiPlus className="mr-2" /> Add a new delivery address
            </button>
            {addresses.length > 0 && selectedAddress && (
              <button onClick={handleDeliver} className="cursor-pointer px-6 py-3 bg-gradient-to-r from-pink-600 to-pink-700 text-white rounded-lg hover:from-pink-700 hover:to-pink-800 transition-all shadow-lg font-medium">
                Deliver to this address
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Address Form Modal */}
      {isModalOpen && <AddressFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSubmit={handleSubmitAddress} initialValues={currentAddress} isEditing={isEditing} />}
    </div>
  );
}
