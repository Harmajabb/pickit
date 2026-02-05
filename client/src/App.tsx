import { Outlet } from "react-router";
import "./App.css";
import ChatWidget from "./components/Chat/ChatWidget";
import Footer from "./components/Footer/Footer";
import Navbar from "./components/Navbar/Navbar";

function App() {
  return (
    <>
      <Navbar />
      <Outlet />
      <Footer />
      <ChatWidget />
    </>
  );
}

export default App;
