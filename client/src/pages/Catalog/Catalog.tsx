import CatalogCard from "../../components/CatalogCard/CatalogCard.tsx";
import "./Catalog.css";
import { useEffect } from "react";
import { useAnnounces } from "../../context/AnnouncesContext.tsx";
import type { Announce } from "../../types/Announce.ts";

function Catalog() {
  const { announces, isLoading, error, refreshAnnounces } = useAnnounces();
  const data = announces as Announce[];

  useEffect(() => {
    refreshAnnounces();
  }, [refreshAnnounces]);

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
