import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FiMapPin } from "react-icons/fi";
import { Formik, Form, Field, ErrorMessage } from "formik";
import useUserProfile from "../../redux/features/user/userProfileHook";
import { addressAPI } from "../../services/api";
import { addressInitialValues, addressValidationSchema } from "../../utils/formConfig/addressFormConfig";

const EditAddressPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, fetchProfile, updateProfile } = useUserProfile();

  const [initialValues, setInitialValues] = useState(addressInitialValues);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState("");

  // ✅ Load address data
  useEffect(() => {
    const loadAddress = async () => {
      setLoading(true);
      try {
        let found;
        if (user?.addresses?.length) {
          found = user.addresses.find((a) => String(a._id) === String(id));
        }
        if (!found) {
          const profileData = await fetchProfile();
          found = profileData.addresses?.find((a) => String(a._id) === String(id));
        }
        if (found) {
          // overwrite initial values with found address data
          setInitialValues({
            ...addressInitialValues,
            ...found,
          });
        } else {
          setError("Address not found");
        }
      } catch (err) {
        console.error("Error loading address", err);
        setError("Failed to load address");
      } finally {
        setLoading(false);
      }
    };

    loadAddress();
  }, [id, user, fetchProfile]);

  // ✅ Submit handler
  const handleSubmit = async (values) => {
    setSubmitLoading(true);
    setError("");
    try {
      await addressAPI.updateAddress(id, values);

      // Optimistic update Redux store
      await updateProfile({
        addresses: user.addresses.map((a) => (String(a._id) === String(id) ? { ...a, ...values } : a)),
      });

      navigate("/addresses");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to update address");
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-6">Loading address...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md mt-8">
      <div className="flex items-center mb-6">
        <FiMapPin className="text-pink-500 mr-2 text-xl" />
        <h1 className="text-2xl font-bold text-gray-800">Edit Address</h1>
      </div>

      {error && <div className="text-red-600 mb-2">{error}</div>}

      <Formik enableReinitialize initialValues={initialValues} validationSchema={addressValidationSchema} onSubmit={handleSubmit}>
        {() => (
          <Form className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <Field type="text" name="name" className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500" />
                <ErrorMessage name="name" component="div" className="text-red-500 text-sm mt-1" />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <Field type="text" name="phone" className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500" />
                <ErrorMessage name="phone" component="div" className="text-red-500 text-sm mt-1" />
              </div>

              {/* Address Line 1 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 1</label>
                <Field type="text" name="addressLine1" className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500" />
                <ErrorMessage name="addressLine1" component="div" className="text-red-500 text-sm mt-1" />
              </div>

              {/* Address Line 2 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 2</label>
                <Field type="text" name="addressLine2" className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500" />
                <ErrorMessage name="addressLine2" component="div" className="text-red-500 text-sm mt-1" />
              </div>

              {/* City */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <Field type="text" name="city" className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500" />
                <ErrorMessage name="city" component="div" className="text-red-500 text-sm mt-1" />
              </div>

              {/* State */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                <Field type="text" name="state" className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500" />
                <ErrorMessage name="state" component="div" className="text-red-500 text-sm mt-1" />
              </div>

              {/* Pincode */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
                <Field type="text" name="pincode" className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500" />
                <ErrorMessage name="pincode" component="div" className="text-red-500 text-sm mt-1" />
              </div>

              {/* Country */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                <Field type="text" name="country" className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500" />
                <ErrorMessage name="country" component="div" className="text-red-500 text-sm mt-1" />
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 mt-8">
              <button type="button" onClick={() => navigate("/addresses")} className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50">
                Cancel
              </button>
              <button type="submit" className="px-4 py-2 bg-pink-500 text-white rounded-md hover:bg-pink-600" disabled={submitLoading}>
                {submitLoading ? "Saving..." : "Save Address"}
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default EditAddressPage;
