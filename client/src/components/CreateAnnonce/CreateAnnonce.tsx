import { useState } from "react";

function CreateAnnonce() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    amount_caution: "",
    start_location_date: "",
    end_location_date: "",
    location: "",
    categorie_id: "1",
  });


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const response = await fetch("/api/announces", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    const result = await response.json();
    alert(result.message || result.error);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="text" name="title" placeholder="Titre de l'annonce" value={formData.title} onChange={handleChange} required />
      <textarea name="description" placeholder="Description de l'annonce" value={formData.description} onChange={handleChange} required />
      <input type="number" name="amount_caution" placeholder="Montant de la caution" value={formData.amount_caution} onChange={handleChange} required />
      <input type="date" name="start_location_date" placeholder="Date de début" value={formData.start_location_date} onChange={handleChange} required />
      <input type="date" name="end_location_date" placeholder="Date de fin" value={formData.end_location_date} onChange={handleChange} required />
      <input type="text" name="location" placeholder="Lieu de l'annonce" value={formData.location} onChange={handleChange} required />
      <select name="categorie_id" value={formData.categorie_id} onChange={handleChange} required>
        <option value="1">Categorie 1</option>
        <option value="2">Categorie 2</option>
        <option value="3">Categorie 3</option>
      </select>
      <button type="submit">Créer l'annonce</button>
    </form>
  );
}

export default CreateAnnonce;
