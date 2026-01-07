import About from "../components/About/About";
import Hero from "../components/Hero/Hero";
import Testimony from "../components/Testimony/Testimony";
import ItemHighlight from "../components/ItemHighlight/ItemHighlight";

import "./Home.css";

function Home() {
  return (
    <>
      <Hero />
      <ItemHighlight />
      <About />
      <Testimony />
    </>
  );
}
export default Home;
