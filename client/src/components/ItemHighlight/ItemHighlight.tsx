import "./ItemHighlight.css";
import { useEffect, useState } from "react";
import { useRevealOnScroll } from "../../../hooks/useRevealOnScroll";
import CatalogCard from "../CatalogCard/CatalogCard";
import type { Announces } from "./Ts-ItemHighlight.ts";

function ItemHighlight() {
  const { ref, isVisible } = useRevealOnScroll<HTMLElement>();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<Announces[]>([]);

  useEffect(() => {
    const announcesFiltered = async () => {
      try {
        const data = await fetch(
          `${import.meta.env.VITE_API_URL}/api/announcesFiltered`,
        );
        if (!data.ok) {
          throw new Error(`Error HTTP: ${data.status}`);
        }
        const jsonData = await data.json();
        setData(jsonData);
      } catch (e) {
        setError(e as Error);
      } finally {
        setIsLoading(false);
      }
    };
    announcesFiltered();
  }, []);

  if (isLoading) {
    return <p>Loading..</p>;
  }
  if (error !== null) {
    console.log(error);
    return <p>An error has occurred</p>;
  }

  return (
    <main ref={ref} className={`reveal ${isVisible ? "is-visible" : ""}`}>
      <header className="itemHighlight-title">
        <h2>Ready to Borrow</h2>
      </header>
      <div
        className={`ItemHighlight-container reveal-stagger ${isVisible ? "is-visible" : ""}`}
      >
        {data.map((item) => (
          <CatalogCard key={item.id} data={item} />
        ))}
      </div>
    </main>
  );
}

export default ItemHighlight;
