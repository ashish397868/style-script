// components/ui/CartSidebar.js
import { AiFillDelete, AiFillMinusCircle, AiFillPlusCircle } from "react-icons/ai";
import { Link } from "react-router-dom";
import { BsFillBagCheckFill } from "react-icons/bs";
import { RxCrossCircled } from "react-icons/rx";

const CartSidebar = ({ isOpen, onClose, cart, addToCart, removeFromCart, clearCart, subTotal }) => {
  if (!isOpen) return null;

  const cartCount = Object.keys(cart).reduce((total, key) => total + cart[key].qty, 0);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />
        <div className="fixed inset-y-0 right-0 max-w-full flex">
          <div className="w-screen max-w-md">
            <div className="h-full flex flex-col bg-white shadow-xl">
              <div className="flex-1 py-6 overflow-y-auto px-4 sm:px-6">
                {/* Header with Cart Button (used as close) */}
                <div className="flex items-start justify-between">
                  <h2 className="text-lg font-medium text-gray-900">Shopping Cart</h2>
                  <RxCrossCircled onClick={onClose} className="text-gray-500 hover:text-gray-700 w-8 h-8"/>
                </div>

                <div className="mt-8">
                  {Object.keys(cart).length === 0 ? (
                    <p className="text-center text-gray-500">Your cart is empty</p>
                  ) : (
                    <ul className="-my-6 divide-y divide-gray-200">
                      {Object.keys(cart).map((key) => (
                        <li key={key} className="py-6 flex">
                          <div className="ml-4 flex-1 flex flex-col">
                            <div className="flex justify-between text-base font-medium text-gray-900">
                              <h3>
                                {cart[key].name} ({cart[key].size}/{cart[key].color})
                              </h3>
                              <p>₹{cart[key].price * cart[key].qty}</p>
                            </div>
                            <div className="flex-1 flex items-end justify-between text-sm">
                              <div className="flex items-center">
                                <button onClick={() => removeFromCart(key, 1)} className="text-gray-500 hover:text-gray-700">
                                  <AiFillMinusCircle className="h-5 w-5" />
                                </button>
                                <span className="mx-2 text-gray-500">{cart[key].qty}</span>
                                <button onClick={() => addToCart(key, 1)} className="text-gray-500 hover:text-gray-700">
                                  <AiFillPlusCircle className="h-5 w-5" />
                                </button>
                              </div>
                              <button onClick={() => removeFromCart(key, cart[key].qty)} className="text-red-600 hover:text-red-500">
                                <AiFillDelete className="h-5 w-5" />
                              </button>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-gray-200 py-6 px-4 sm:px-6">
                <div className="flex justify-between text-base font-medium text-gray-900">
                  <p>Subtotal</p>
                  <p>₹{subTotal.toFixed(2)}</p>
                </div>
                <p className="mt-0.5 text-sm text-gray-500">Shipping and taxes calculated at checkout.</p>
                <div className="mt-6">
                  <Link
                    to="/checkout"
                    onClick={onClose}
                    className={`w-full flex justify-center items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white ${
                      Object.keys(cart).length === 0 ? "bg-gray-300 cursor-not-allowed" : "bg-pink-600 hover:bg-pink-700"
                    }`}
                  >
                    <BsFillBagCheckFill className="mr-2" />
                    Checkout
                  </Link>
                </div>
                <div className="mt-4 flex justify-center">
                  <button
                    disabled={Object.keys(cart).length === 0}
                    onClick={clearCart}
                    className={`w-full flex justify-center items-center px-6 py-3 rounded-md shadow-sm text-base font-medium text-white ${
                      Object.keys(cart).length === 0 ? "bg-gray-300 cursor-not-allowed" : "bg-pink-600 hover:bg-pink-700"
                    }`}
                  >
                    <AiFillDelete className="mr-2" />
                    Clear Cart
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartSidebar;
