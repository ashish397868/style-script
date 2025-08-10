import { useNavigate } from "react-router-dom";
import { FiPlus } from "react-icons/fi";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { addressAPI } from "../../services/api";
import useUserHook from "../../redux/features/user/useUserHook";
import { addressInitialValues, addressValidationSchema } from "../../utils/formConfig/addressFormConfig";

const NewAddressPage = () => {
  const navigate = useNavigate();
  const { user, updateUserProfile } = useUserHook();

  const handleSubmit = async (values, { setSubmitting, setFieldError }) => {
    try {
      const res = await addressAPI.addAddress(values);
      const newAddress = res?.data || values;

      // update redux user profile with new address
      await updateUserProfile({
        addresses: [...(user?.addresses || []), newAddress],
      });

      navigate("/addresses");
    } catch (err) {
      console.error(err);
      setFieldError("name", err.response?.data?.message || "Failed to add address");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md mt-8">
      <div className="flex items-center mb-6">
        <FiPlus className="text-pink-500 mr-2 text-xl" />
        <h1 className="text-2xl font-bold text-gray-800">Add New Address</h1>
      </div>

      <Formik initialValues={addressInitialValues} validationSchema={addressValidationSchema} onSubmit={handleSubmit}>
        {({ isSubmitting }) => (
          <Form className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Name */}
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

            {/* Buttons */}
            <div className="flex justify-end gap-3 mt-8">
              <button type="button" onClick={() => navigate("/addresses")} className="cursor-pointer px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
                Cancel
              </button>
              <button type="submit" className="cursor-pointer px-4 py-2 bg-pink-500 text-white rounded-md hover:bg-pink-600 flex items-center justify-center" disabled={isSubmitting}>
                {isSubmitting ? "Adding..." : "Add Address"}
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default NewAddressPage;

{/* 
----------------------------------------------
📌 Formik `<Field>` Component Kaise Kaam Karta Hai:
----------------------------------------------
1. Jab hum `<Formik>` component use karte hain, wo apne children 
   (Form, Field, ErrorMessage, etc.) ko ek "context" deta hai.
   Is context me `values`, `errors`, `touched` aur form handlers 
   (`handleChange`, `handleBlur`, `setFieldValue`, etc.) hote hain.

2. `<Field name="phone" />` likhne ka matlab hai:
   - Formik ke `values.phone` se value bind karo.
   - `onChange` ko Formik ke `handleChange` se bind karo.
   - `onBlur` ko Formik ke `handleBlur` se bind karo.
   - Ye sab kaam internally `getFieldProps(name)` call karke hota hai.

3. Is wajah se hume manually `onChange`, `onBlur` ya `value` 
   pass karne ki zarurat nahi padti.

4. Agar hum `<input>` direct use karein bina `<Field>` ke,
   to hume ye sab props manually dene padte:
5. `<ErrorMessage name="phone" />` sirf Formik ke `errors.phone` 
se error text nikalta hai aur display karta hai agar wo exist kare.

⚡ Summary: `<Field>` = `getFieldProps(name)` + automatic binding
----------------------------------------------
*/}