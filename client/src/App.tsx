import "./App.css";
import Footer from "./components/Footer";
import Avis from "./components/avis";

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow">
        <Avis />
      </main>

      <Footer />
    </div>
  );
}

export default App;
