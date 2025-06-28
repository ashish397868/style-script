// models/Address.js
const { Schema, model } = require("mongoose");

const AddressSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true }, // name of the person at this address
    active: {type: Boolean,default: false},// whether this address is active or not
    label: { type: String, enum: ["Home", "Office"], default: "Home" },
    addressLine1: { type: String, required: true },
    addressLine2: { type: String, default: "" },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    phone: { type: String, required: true }, // per‑address phone
  },
  { timestamps: true }
);

module.exports = model("Address", AddressSchema);
