import { Link } from "react-router-dom";

const Footer = ({ shopLinks = [], customerLinks = [], policyLinks = [], title, logo }) => {
  return (
    <footer className="bg-[#f6f9fc] text-gray-700 text-sm px-4 sm:px-6 py-10">
      <div className="max-w-7xl mx-auto grid grid-cols-2 xs:grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
        {/* Brand Section - Full width on mobile */}
        <div className="xs:col-span-2 sm:col-span-2 md:col-span-1">
          <div className="flex items-center space-x-2 mb-3">
            <img src={logo} alt="Logo" className="w-8 h-8" />
            <h2 className="text-lg font-bold text-pink-600">{title}</h2>
          </div>
          <p className="mb-1">Wear the &lt;code/&gt;</p>
          <p>Premium coding tshirts, hoodies<br />and apparels</p>
        </div>

        {/* Shop Links - 2 columns on mobile */}
        <div>
          <h3 className="font-semibold mb-3 text-base sm:text-sm">SHOP</h3>
          <ul className="space-y-1.5">
            {shopLinks.map((item, index) => (
              <li key={index}>
                <Link className="hover:text-pink-300 transition-colors" to={item.path}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Customer Service - 2 columns on mobile */}
        <div>
          <h3 className="font-semibold mb-3 text-base sm:text-sm">CUSTOMER SERVICE</h3>
          <ul className="space-y-1.5">
            {customerLinks.map((item, index) => (
              <li key={index}>
                <Link className="hover:text-pink-300 transition-colors" to={item.path}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Policy and Payment - Full width on mobile */}
        <div className="xs:col-span-2 sm:col-span-2 md:col-span-1">
          <h3 className="font-semibold mb-3 text-base sm:text-sm">POLICY</h3>
          <ul className="space-y-1.5 mb-4">
            {policyLinks.map((item, index) => (
              <li key={index}>
                <Link className="hover:text-pink-300 transition-colors" to={item.path}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="flex justify-center sm:justify-start">
            <img
              src="https://codeswear.com/pay.png"
              className="w-full max-w-[150px]"
              alt="Payment methods"
            />
          </div>
        </div>
      </div>

      <div className="text-center text-gray-500 mt-8 sm:mt-10 text-xs px-2">
        © 2025 {title} — All Rights Reserved
      </div>
    </footer>
  );
};

export default Footer;