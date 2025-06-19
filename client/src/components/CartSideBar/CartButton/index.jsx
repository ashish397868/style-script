// components/ui/CartButton.js
import { AiOutlineShoppingCart } from "react-icons/ai";

const CartButton = ({ count = 0, onClick, iconClass = "", badgeClass = "" }) => {
  return (
    <button onClick={onClick} className={`relative p-2 rounded-full ${iconClass}`}>
      <AiOutlineShoppingCart className="text-2xl" />
      {count > 0 && <span className={`absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center ${badgeClass}`}>{count}</span>}
    </button>
  );
};

export default CartButton;
