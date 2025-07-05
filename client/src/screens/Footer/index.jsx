import Footer from "../../components/Footer";
import { shopLinks } from "../../constants/menuItems";

const customerLinks = [
  { label: "Contact Us", path: "/contact" },
  { label: "About Us", path: "/about" },
  { label: "Return Policy", path: "/return-policy" },
  { label: "Shipping Policy", path: "/shipping-policy" },
];

const policyLinks = [
  { label: "Privacy Policy", path: "/privacy-policy" },
  { label: "Terms and Conditions", path: "/terms-and-conditions" },
];

function App() {
  return (
    <>
      <Footer
        shopLinks={shopLinks}
        customerLinks={customerLinks}
        policyLinks={policyLinks}
        title="StyleScript"
        logo="https://www.svgrepo.com/show/42638/clothes.svg"
      />
    </>
  );
}

export default App;