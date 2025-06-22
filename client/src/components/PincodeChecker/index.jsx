// src/components/PincodeChecker.jsx
import { useState } from "react";
import { toast } from "react-toastify";

export default function PincodeChecker({ onCheck }) {
  const [pin, setPin] = useState("");
  const [service, setService] = useState(null);

  const checkServicability = async () => {
    try {
      // replace with your pincode API call
      const response = await fetch("/api/get-pincode");
      const pinJson = await response.json();
      const available = Object.keys(pinJson).includes(pin);
      setService(available);
      toast[available ? "success" : "error"](
        available ? "We deliver to this pincode." : "We do not deliver here yet."
      );
      onCheck?.(available);
    } catch (err) {
      toast.error("Failed to check pincode.");
      setService(null);
      onCheck?.(null);
    }
  };

  return (
    <div className="mt-5">
      <div className="flex space-x-2">
        <input
          type="text"
          value={pin}
          onChange={e => setPin(e.target.value)}
          className="px-2 border border-gray-300 rounded"
          placeholder="Enter your Pincode"
        />
        <button
          onClick={checkServicability}
          className="bg-indigo-500 text-white py-2 px-6 rounded hover:bg-indigo-600"
        >
          Check
        </button>
      </div>
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
