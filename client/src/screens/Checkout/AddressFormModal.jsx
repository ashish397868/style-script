// src/pages/AddressFormModal.jsx
import React from 'react';
import Modal from 'react-modal';
import { FiUser, FiPhone, FiHome, FiMapPin, FiX, FiCheck } from 'react-icons/fi';

// Make sure this matches the app’s root element
if (typeof window !== 'undefined') {
  Modal.setAppElement('#root');
}

export default function AddressFormModal({
  isOpen,
  onClose,
  onSubmit,
  currentAddress,
  handleInputChange,
  errors,
  isEditing,
}) {
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      style={{
        overlay: {
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 1000,
        },
        content: {
          position: 'absolute',
          top: '50%',
          left: '50%',
          right: 'auto',
          bottom: 'auto',
          transform: 'translate(-50%, -50%)',
          padding: '0',
          maxWidth: '600px',
          width: '90%',
          borderRadius: '0.5rem',
          border: 'none',
          background: 'transparent',
          overflow: 'visible',
          maxHeight: '90vh',       // ← ensure content never exceeds 90% of viewport height
          overflowY: 'auto',
        },
      }}
      contentLabel="Address Form"
    >
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-visible">
        {/* Header */}
        <div className="bg-gradient-to-r from-pink-600 to-pink-700 p-5 sticky top-0 z-10 rounded-t-2xl">
          <h2 className="text-xl font-bold text-white flex items-center">
            <FiMapPin className="mr-2" />
            {isEditing ? 'Edit Address' : 'Add New Address'}
          </h2>
        </div>

        {/* Body */}
        <div className="p-6">
          <div className="space-y-5">
            {/* Full Name */}
            <div>
              <label className="flex items-center mb-2 text-sm font-medium text-gray-700">
                <FiUser className="mr-2 text-gray-500" />
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={currentAddress.name}
                onChange={handleInputChange}
                placeholder="John Doe"
                className={`w-full px-4 py-3 rounded-lg border focus:outline-none ${
                  errors.name
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                    : 'border-gray-300 focus:ring-pink-500 focus:border-pink-500'
                }`}
              />
              {errors.name && (
                <p className="mt-2 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="flex items-center mb-2 text-sm font-medium text-gray-700">
                <FiPhone className="mr-2 text-gray-500" />
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={currentAddress.phone}
                onChange={handleInputChange}
                placeholder="+91 9876543210"
                className={`w-full px-4 py-3 rounded-lg border focus:outline-none ${
                  errors.phone
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                    : 'border-gray-300 focus:ring-pink-500 focus:border-pink-500'
                }`}
              />
              {errors.phone && (
                <p className="mt-2 text-sm text-red-600">{errors.phone}</p>
              )}
            </div>

            {/* Address Line 1 */}
            <div>
              <label className="flex items-center mb-2 text-sm font-medium text-gray-700">
                <FiHome className="mr-2 text-gray-500" />
                Address Line 1
              </label>
              <input
                type="text"
                name="addressLine1"
                value={currentAddress.addressLine1}
                onChange={handleInputChange}
                placeholder="Street address, P.O. box"
                className={`w-full px-4 py-3 rounded-lg border focus:outline-none ${
                  errors.addressLine1
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                    : 'border-gray-300 focus:ring-pink-500 focus:border-pink-500'
                }`}
              />
              {errors.addressLine1 && (
                <p className="mt-2 text-sm text-red-600">
                  {errors.addressLine1}
                </p>
              )}
            </div>

            {/* Address Line 2 */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Address Line 2 (Optional)
              </label>
              <input
                type="text"
                name="addressLine2"
                value={currentAddress.addressLine2}
                onChange={handleInputChange}
                placeholder="Apartment, suite, unit, building, floor, etc."
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-pink-500 focus:border-pink-500 focus:outline-none"
              />
            </div>

            {/* City / State / Pincode */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* City */}
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  City
                </label>
                <input
                  type="text"
                  name="city"
                  value={currentAddress.city}
                  onChange={handleInputChange}
                  placeholder="City"
                  className={`w-full px-4 py-3 rounded-lg border focus:outline-none ${
                    errors.city
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                      : 'border-gray-300 focus:ring-pink-500 focus:border-pink-500'
                  }`}
                />
                {errors.city && (
                  <p className="mt-2 text-sm text-red-600">{errors.city}</p>
                )}
              </div>

              {/* State */}
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  State
                </label>
                <input
                  type="text"
                  name="state"
                  value={currentAddress.state}
                  onChange={handleInputChange}
                  placeholder="State"
                  className={`w-full px-4 py-3 rounded-lg border focus:outline-none ${
                    errors.state
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                      : 'border-gray-300 focus:ring-pink-500 focus:border-pink-500'
                  }`}
                />
                {errors.state && (
                  <p className="mt-2 text-sm text-red-600">{errors.state}</p>
                )}
              </div>

              {/* Pincode */}
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Pincode
                </label>
                <input
                  type="text"
                  name="pincode"
                  value={currentAddress.pincode}
                  onChange={handleInputChange}
                  placeholder="Postal code"
                  className={`w-full px-4 py-3 rounded-lg border focus:outline-none ${
                    errors.pincode
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                      : 'border-gray-300 focus:ring-pink-500 focus:border-pink-500'
                  }`}
                />
                {errors.pincode && (
                  <p className="mt-2 text-sm text-red-600">
                    {errors.pincode}
                  </p>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row justify-between gap-3 pt-4">
              <button
                onClick={onClose}
                className="flex items-center justify-center px-5 py-3 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
              >
                <FiX className="mr-2" />
                Cancel
              </button>
              <button
                onClick={onSubmit}
                className="flex items-center justify-center px-5 py-3 bg-gradient-to-r from-pink-600 to-pink-700 text-white rounded-lg hover:from-pink-700 hover:to-pink-800 font-medium"
              >
                <FiCheck className="mr-2" />
                {isEditing ? 'Update Address' : 'Save Address'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
