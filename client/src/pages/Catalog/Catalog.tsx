import CatalogCard from "../../components/CatalogCard/CatalogCard.tsx";
import "./Catalog.css";
import { useEffect, useState } from "react";
import type { Announces } from "../../components/ItemHighlight/Ts-ItemHighlight.ts";

function Catalog() {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<Announces[]>([]);

  useEffect(() => {
    const Announces = async () => {
      try {
        const data = await fetch(
          `${import.meta.env.VITE_API_URL}/api/announces`,
        );
        if (!data.ok) {
          throw new Error(`Error HTTP: ${data.status}`);
        }
        const jsonData = await data.json();
        console.log(data);
        setData(jsonData);
      } catch (e) {
        setError(e as Error);
      } finally {
        setIsLoading(false);
      }
    };
    Announces();
  }, []);

  if (isLoading) {
    return <p>Loading..</p>;
  }
  if (error !== null) {
    console.log(error);
    return <p>An error has occurred</p>;
  }

  return (
    <div className="catalog-container">
      {data.map((announce) => (
        <CatalogCard key={announce.id} data={announce} />
      ))}
    </div>
  );
}

export default Catalog;
