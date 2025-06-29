import Navbar from "../../components/Navbar";
import { menuItems, tshirtItems,adminItems } from "../../constants/menuItems";
import { TbShirtOff } from "react-icons/tb";
function App() {
  

  return (
      <Navbar
        menuItems={menuItems}
        productItems={tshirtItems}
        adminItems={adminItems}
        brandName="StyleScript"
        logoSrc="https://www.svgrepo.com/show/42638/clothes.svg"
        // logoSrc={TbShirtOff}
        backgroundColor="bg-white"
        textColor="text-black"
        hoverColor="hover:text-pink-300"
      />

  );
}

export default App;
