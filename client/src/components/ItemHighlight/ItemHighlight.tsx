import "./ItemHighlight.css";
import { useEffect, useState } from "react";
import CatalogCard from "../CatalogCard/CatalogCard";
import type { Announces } from "./Ts-ItemHighlight.ts";

function ItemHighlight() {
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
    <>
      <header className="itemHighlight-title">
        <h2>Our featured listing</h2>
      </header>
      <div className="ItemHighlight-container">
        {data.map((item) => (
          <CatalogCard key={item.id} data={item} />
        ))}
      </div>
    </>
  );
}

export default ItemHighlight;
