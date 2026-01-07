import { useState } from "react";

function CreateAnnonce() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    amount_deposit: "",
    creation_date: "",
    update_date: "",
    location: "",
    state: "good",
    start_borrow_date: "",
    end_borrow_date: "",
    categorie_id: "1",
    owner_id: 1,
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const response = await fetch("http://localhost:3310/api/create_announce", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    const result = await response.json();
    alert(result.message || result.error);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        name="title"
        placeholder="Titre"
        value={formData.title}
        onChange={handleChange}
        required
      />
      <textarea
        name="description"
        placeholder="Description"
        value={formData.description}
        onChange={handleChange}
        required
      />
      <input
        type="number"
        name="amount_deposit"
        placeholder="Deposit amount"
        value={formData.amount_deposit}
        onChange={handleChange}
        required
      />
      <input
        type="date"
        name="start_borrow_date"
        value={formData.start_borrow_date}
        onChange={handleChange}
        required
      />
      <input
        type="date"
        name="end_borrow_date"
        value={formData.end_borrow_date}
        onChange={handleChange}
        required
      />
      <input
        type="text"
        name="location"
        placeholder="Lieu"
        value={formData.location}
        onChange={handleChange}
        required
      />
      <select
        name="categorie_id"
        value={formData.categorie_id}
        onChange={handleChange}
        required
      >
        <option value="1">Categorie 1</option>
        <option value="2">Categorie 2</option>
        <option value="3">Categorie 3</option>
      </select>
      <button type="submit">Créer l'annonce</button>
    </form>
  );
}

export default CreateAnnonce;
