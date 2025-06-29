import Footer from "../../components/Footer";

const shopLinks = [
  { label: "T-Shirts", path: "/category/tshirts" },
  { label: "Sweatshirts", path: "/category/sweatshirts" },
  { label: "Hoodies", path: "/category/hoodies" },
  { label: "Zipper Hoodies", path: "/category/zipperhoodies" },
];

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
      {/* your main content */}
      <Footer
        shopLinks={shopLinks}
        customerLinks={customerLinks}
        policyLinks={policyLinks}
      />
    </>
  );
}

export default App;
