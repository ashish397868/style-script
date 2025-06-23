// components/ui/CartButton.js
import { AiOutlineShoppingCart } from "react-icons/ai";

const CartButton = ({ count = 0, onClick, iconClass = "", badgeClass = "" }) => {
  return (
    <button onClick={onClick} className={`relative w-10 h-10 flex items-center justify-center rounded-full ${iconClass}`}>
      <AiOutlineShoppingCart className="w-7 h-7 text-inherit " />
      {count > 0 && <span className={`absolute -top-1 -right-1 bg-pink-700 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center ${badgeClass}`}>{count}</span>}
    </button>
  );
};

export default CartButton;
