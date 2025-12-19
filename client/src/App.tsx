import "./App.css";
import Footer from "./components/Footer";
import ItemHighlight from "./components/itemHighlight/itemHighlight.tsx";
import Navbar from "./components/Navbar/Navbar";


function App() {
  return (
  <>
    <Navbar />
    <ItemHighlight/>
    <Footer/>
  </>
  );
  
}

export default App;
