import { Link } from "react-router-dom";

const Footer = ({ shopLinks = [], customerLinks = [], policyLinks = [] ,title ,logo}) => {
  return (
    <footer className="bg-[#f6f9fc] text-gray-700 text-sm px-6 py-10">
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
        {/* Brand Section */}
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <img src={logo} alt="Logo" className="w-8 h-8" />
            <h2 className="text-lg font-bold text-pink-600">{title}</h2>
          </div>
          <p>Wear the &lt;code/&gt;</p>
          <p>Premium coding tshirts, hoodies<br />and apparels</p>
        </div>

        {/* Shop Links */}
        <div>
          <h3 className="font-semibold mb-2">SHOP</h3>
          <ul className="space-y-1">
            {shopLinks.map((item, index) => (
              <li key={index}>
                <Link className="hover:text-pink-300" to={item.path}>{item.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Customer Service */}
        <div>
          <h3 className="font-semibold mb-2">CUSTOMER SERVICE</h3>
          <ul className="space-y-1">
            {customerLinks.map((item, index) => (
              <li key={index}>
                <Link className="hover:text-pink-300" to={item.path}>{item.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Policy and Payment */}
        <div>
          <h3 className="font-semibold mb-2">POLICY</h3>
          <ul className="space-y-1 mb-4">
            {policyLinks.map((item, index) => (
              <li key={index}>
                <Link className="hover:text-pink-300" to={item.path}>{item.label}</Link>
              </li>
            ))}
          </ul>
          <img
            src="https://codeswear.com/pay.png"
            className="w-full max-w-[150px]"
          />
        </div>
      </div>

      <div className="text-center text-gray-500 mt-10 text-xs">
        © 2025 {title} — All Rights Reserved
      </div>
    </footer>
  );
};

export default Footer;
