// src/pages/AddressFormModal.jsx
import Modal from "react-modal";
import { FiMapPin, FiX, FiCheck } from "react-icons/fi";
import { Formik, Form, Field, ErrorMessage } from "formik";
import {
  addressInitialValues,
  addressValidationSchema,
} from "../../utils/formConfig/addressFormConfig";

export default function AddressFormModal({
  isOpen,
  onClose,
  onSubmit,       // (values) => Promise
  initialValues,  // object shape matching addressInitialValues
  isEditing,
}) {
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      style={{
        overlay: {
          backgroundColor: "rgba(0,0,0,0.5)",
          zIndex: 1000,
        },
        content: {
          position: "absolute",
          top: "5%",
          left: "50%",
          transform: "translate(-50%)",
          padding: 0,
          maxWidth: "600px",
          width: "90%",
          borderRadius: "0.5rem",
          border: "none",
          background: "transparent",
          maxHeight: "90vh",
          overflowY: "auto",
        },
      }}
      contentLabel="Address Form"
    >
      <div className="bg-white rounded-2xl shadow-xl overflow-visible">
        {/* Header */}
        <div className="bg-gradient-to-r from-pink-600 to-pink-700 p-5 sticky top-0 z-10 rounded-t-2xl">
          <h2 className="text-xl font-bold text-white flex items-center">
            <FiMapPin className="mr-2" />
            {isEditing ? "Edit Address" : "Add New Address"}
          </h2>
        </div>

        {/* Body */}
        <div className="p-6">
          <Formik
            enableReinitialize
            initialValues={initialValues || addressInitialValues}
            validationSchema={addressValidationSchema}
            onSubmit={async (values, { setSubmitting }) => {
              await onSubmit(values);
              setSubmitting(false);
            }}
          >
            {({ isSubmitting }) => (
              <Form className="space-y-5">
                {/* Full Name */}
                <div>
                  <label className="flex items-center mb-2 text-sm font-medium text-gray-700">
                    <FiMapPin className="mr-2 text-gray-500" />
                    Full Name
                  </label>
                  <Field
                    type="text"
                    name="name"
                    placeholder="John Doe"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-pink-500 focus:border-pink-500"
                  />
                  <ErrorMessage
                    name="name"
                    component="p"
                    className="mt-2 text-sm text-red-600"
                  />
                </div>

                {/* Phone Number */}
                <div>
                  <label className="flex items-center mb-2 text-sm font-medium text-gray-700">
                    <FiMapPin className="mr-2 text-gray-500" />
                    Phone Number
                  </label>
                  <Field
                    type="tel"
                    name="phone"
                    placeholder="+91 9876543210"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-pink-500 focus:border-pink-500"
                  />
                  <ErrorMessage
                    name="phone"
                    component="p"
                    className="mt-2 text-sm text-red-600"
                  />
                </div>

                {/* Address Line 1 */}
                <div>
                  <label className="flex items-center mb-2 text-sm font-medium text-gray-700">
                    <FiMapPin className="mr-2 text-gray-500" />
                    Address Line 1
                  </label>
                  <Field
                    type="text"
                    name="addressLine1"
                    placeholder="Street address"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-pink-500 focus:border-pink-500"
                  />
                  <ErrorMessage
                    name="addressLine1"
                    component="p"
                    className="mt-2 text-sm text-red-600"
                  />
                </div>

                {/* Address Line 2 */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Address Line 2 (Optional)
                  </label>
                  <Field
                    type="text"
                    name="addressLine2"
                    placeholder="Apartment, suite, unit, building, floor, etc."
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-pink-500 focus:border-pink-500"
                  />
                </div>

                {/* City / State / Pincode */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {["city", "state", "pincode"].map((field) => (
                    <div key={field}>
                      <label className="block mb-2 text-sm font-medium text-gray-700 capitalize">
                        {field}
                      </label>
                      <Field
                        type="text"
                        name={field}
                        placeholder={
                          field === "pincode" ? "Postal code" : field
                        }
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-pink-500 focus:border-pink-500"
                      />
                      <ErrorMessage
                        name={field}
                        component="p"
                        className="mt-2 text-sm text-red-600"
                      />
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row justify-between gap-3 pt-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex items-center justify-center px-5 py-3 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
                  >
                    <FiX className="mr-2" />
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center justify-center px-5 py-3 bg-gradient-to-r from-pink-600 to-pink-700 text-white rounded-lg hover:from-pink-700 hover:to-pink-800 font-medium"
                  >
                    <FiCheck className="mr-2" />
                    {isEditing ? "Update Address" : "Save Address"}
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </Modal>
  );
}
