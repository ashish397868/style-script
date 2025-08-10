import { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { pincodeAPI } from "../../services/api";
import { toast } from "react-toastify";

export default function PincodeChecker({ onCheck }) {
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(false);

  const formik = useFormik({
    initialValues: { pin: "" },
    validationSchema: Yup.object({
      pin: Yup.string()
        .required("Pincode is required")
        .matches(/^\d{6}$/, "Pincode must be exactly 6 digits"),
    }),
    validateOnBlur: true,
    validateOnChange: true, // Validate on change
    onSubmit: async ({ pin }) => {
      try {
        setLoading(true);
        const { data: pinJson } = await pincodeAPI.getPincodes();
        const available = Object.keys(pinJson).includes(pin);

        setService(available);
        toast[available ? "success" : "error"](available ? "We deliver to this pincode." : "We do not deliver here yet.");

        onCheck?.(available);
      } catch (err) {
        toast.error(err?.message || "Failed to check pincode.");
        setService(null);
        onCheck?.(null);
      } finally {
        setLoading(false);
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
          className={`px-2 border rounded focus:outline-none focus:ring-2 focus:ring-pink-500 ${formik.touched.pin && formik.errors.pin ? "border-red-500" : "border-gray-300"}`}
          placeholder="Enter your Pincode"
        />
        
        <button type="submit" disabled={loading || !formik.isValid} className="flex items-center justify-center cursor-pointer bg-pink-600 hover:bg-pink-700 text-white py-2 px-6 rounded disabled:opacity-50 disabled:cursor-not-allowed">
          {loading && (
            <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 
           5.291A7.962 7.962 0 014 12H0c0 3.042 
           1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          )}
          {loading ? "Checking..." : "Check"}
        </button>
      </form>

      {formik.touched.pin && formik.errors.pin && <p className="text-red-600 text-sm mt-2">{formik.errors.pin}</p>}

      {service !== null && !formik.errors.pin && <p className={`text-sm mt-3 ${service ? "text-green-700" : "text-red-700"}`}>{service ? "Yay! We deliver to this pincode." : "Sorry! We do not deliver to this pincode yet."}</p>}
    </div>
  );
}
