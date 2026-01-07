import About from "../components/About/About";
import CreateAnnonce from "../components/CreateAnnonce/CreateAnnonce";
import Hero from "../components/Hero/Hero";
import ItemHighlight from "../components/ItemHighlight/ItemHighlight";
import Testimony from "../components/Testimony/Testimony";

import "./Home.css";

function Home() {
  return (
    <>
      <Hero />
      <CreateAnnonce />
      <ItemHighlight />
      <About />
      <Testimony />
    </>
  );
}
export default Home;
