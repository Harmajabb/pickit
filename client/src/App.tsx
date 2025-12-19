import "./App.css";
import Footer from "./components/Footer";
import ItemHighlight from "./components/itemHighlight/itemHighlight.tsx";
import Navbar from "./components/Navbar/Navbar";
import Avis from "./components/avis.tsx";


function App() {
  return (
  <>
    <Navbar />
    <ItemHighlight/>
    <Avis/>
    <Footer/>
  </>
  );
  
}

export default App;
