import Navbar from "../../components/Navbar";
import { shopLinks, tshirtItems,userLinks} from "../../constants/menuItems";
import { TbShirtOff } from "react-icons/tb";
function App() {
  

  return (
      <Navbar
        shopLinks={shopLinks}
        tshirtItems={tshirtItems}
        brandName="StyleScript"
        logo="https://www.svgrepo.com/show/42638/clothes.svg"
        // logoSrc={TbShirtOff}
        backgroundColor="bg-white"
        textColor="text-black"
        hoverColor="hover:text-pink-300"
        cartIconColor = "text-pink-600"
        cartIconHover = "hover:text-pink-700"
        userLinks={userLinks}
      />

  );
}

export default App;