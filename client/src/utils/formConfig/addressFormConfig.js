// src/utils/addressFormConfig.js
import * as Yup from "yup";

export const addressInitialValues = {
  name: "",
  phone: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  pincode: "",
  country: "India",
};

export const addressValidationSchema = Yup.object({
  name: Yup.string().required("Full name is required"),
  phone: Yup.string()
    .matches(/^(\+91|0)?[0-9]{10}$/, "Invalid Indian phone number")
    .required("Phone is required"),
  addressLine1: Yup.string().required("Address Line 1 is required"),
  city: Yup.string().required("City is required"),
  state: Yup.string().required("State is required"),
  pincode: Yup.string()
    .matches(/^\d{6}$/, "Pincode must be 6 digits")
    .required("Pincode is required"),
  country: Yup.string().required("Country is required"),
});
