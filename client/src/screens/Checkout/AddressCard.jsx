import { FiEdit2, FiUser, FiPhone, FiHome } from 'react-icons/fi';

const AddressCard = ({ 
  address, 
  user, 
  isSelected, 
  onSelect, 
  onEdit 
}) => {
  return (
    <div 
      className={`border rounded-xl p-5 transition-all duration-300 cursor-pointer ${
        isSelected 
          ? "border-pink-500 bg-pink-50 shadow-md transform -translate-y-1" 
          : "border-gray-200 hover:border-pink-300 hover:bg-pink-50"
      }`}
      onClick={() => onSelect(address)}
    >
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center mb-2">
            <div className="bg-pink-100 p-2 rounded-full mr-3">
              <FiUser className="h-5 w-5 text-pink-600" />
            </div>
            <h3 className="font-bold text-gray-900 text-lg capitalize">
              {address.name || user?.name}
            </h3>
          </div>
          
          <div className="flex items-start mt-3">
            <div className="bg-pink-100 p-2 rounded-full mr-3">
              <FiHome className="h-5 w-5 text-pink-600" />
            </div>
            <div>
              <p className="text-gray-700">
                {address.addressLine1}, {address.addressLine2 && `${address.addressLine2}, `}
                {address.city}, {address.state}, {address.pincode}
              </p>
              <p className="text-gray-500 text-sm mt-1">{address.country}</p>
            </div>
          </div>
          
          <div className="flex items-center mt-3">
            <div className="bg-pink-100 p-2 rounded-full mr-3">
              <FiPhone className="h-5 w-5 text-pink-600" />
            </div>
            <p className="text-gray-700">{address.phone || user?.phone}</p>
          </div>
        </div>
        
        {isSelected && (
          <div className="bg-pink-500 text-white text-xs px-2 py-1 rounded-full">
            Selected
          </div>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100">
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onEdit(address);
          }} 
          className="text-pink-600 hover:text-pink-800 flex items-center text-sm"
        >
          <FiEdit2 className="mr-1" /> Edit address
        </button>
      </div>
    </div>
  );
};

export default AddressCard;