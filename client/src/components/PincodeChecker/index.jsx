// src/components/PincodeChecker.jsx
import { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { pincodeAPI } from "../../services/api";
import { toast } from "react-toastify";

export default function PincodeChecker({ onCheck }) {
  const [service, setService] = useState(null);

  // Formik + Yup setup
  const formik = useFormik({
    initialValues: {
      pin: "",
    },
    validationSchema: Yup.object({
      pin: Yup.string()
        .required("Pincode is required")
        .matches(/^\d{6}$/, "Pincode must be exactly 6 digits"),
    }),
    onSubmit: async ({ pin }) => {
      try {
        const { data: pinJson } = await pincodeAPI.getPincodes();
        const available = Object.keys(pinJson).includes(pin);
        setService(available);
        toast[available ? "success" : "error"](
          available ? "We deliver to this pincode." : "We do not deliver here yet."
        );
        onCheck?.(available);
      } catch (err) {
        toast.error("Failed to check pincode.",err);
        setService(null);
        onCheck?.(null);
      }
    },
  });

  return (
    <div className="mt-5">
      <form onSubmit={formik.handleSubmit} className="flex space-x-2">
        <input
          type="text"
          name="pin"
          value={formik.values.pin}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          className={`px-2 border rounded ${
            formik.touched.pin && formik.errors.pin
              ? "border-red-500"
              : "border-gray-300"
          }`}
          placeholder="Enter your Pincode"
        />
        <button
          type="submit"
          className="bg-pink-600 hover:bg-pink-700 text-white py-2 px-6 rounded"
        >
          Check
        </button>
      </form>

      {/* Validation message */}
      {formik.touched.pin && formik.errors.pin && (
        <p className="text-red-600 text-sm mt-2">{formik.errors.pin}</p>
      )}

      {/* Delivery result messages */}
      {service === false && (
        <p className="text-red-700 text-sm mt-3">
          Sorry! We do not deliver to this pincode yet.
        </p>
      )}
      {service === true && (
        <p className="text-green-700 text-sm mt-3">
          Yay! We deliver to this pincode.
        </p>
      )}
    </div>
  );
}