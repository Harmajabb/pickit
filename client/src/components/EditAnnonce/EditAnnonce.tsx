import { useEffect, useState } from "react";

type EditAnnonceProps = {
  annonceId: number;
};

function EditAnnonce({ annonceId }: EditAnnonceProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    amount_deposit: "",
    location: "",
    state: "good",
    start_borrow_date: "",
    end_borrow_date: "",
    categorie_id: "1",
    owner_id: 1,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnnonce = async () => {
      try {
        const res = await fetch(`/api/announces/${annonceId}`);
        const data = await res.json();

        setFormData({
          title: data.title,
          description: data.description,
          amount_deposit: String(data.amount_caution),
          start_borrow_date: data.start_borrow_date,
          end_borrow_date: data.end_borrow_date,
          location: data.location,
          categorie_id: String(data.categorie_id),
          state: data.state,
          owner_id: data.owner_id,
        });
        setLoading(false);
      } catch (err) {
        console.error("Erreur lors du chargement de l'annonce", err);
      }
    };

    fetchAnnonce();
  }, [annonceId]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch(`/api/announces/${annonceId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await res.json();
      alert(result.message || result.error);
    } catch (err) {
      console.error("Erreur lors de la modification", err);
    }
  };

  if (loading) return <p>Chargement de l'annonce...</p>;

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        name="title"
        placeholder="Titre de l'annonce"
        value={formData.title}
        onChange={handleChange}
        required
      />
      <textarea
        name="description"
        placeholder="Description de l'annonce"
        value={formData.description}
        onChange={handleChange}
        required
      />
      <input
        type="number"
        name="amount_deposit"
        placeholder="Montant de la caution"
        value={formData.amount_deposit}
        onChange={handleChange}
        required
      />
      <input
        type="date"
        name="start_borrow_date"
        placeholder="Date de début"
        value={formData.start_borrow_date}
        onChange={handleChange}
        required
      />
      <input
        type="date"
        name="end_borrow_date"
        placeholder="Date de fin"
        value={formData.end_borrow_date}
        onChange={handleChange}
        required
      />
      <input
        type="text"
        name="location"
        placeholder="Lieu de l'annonce"
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
      <button type="submit">Modifier l'annonce</button>
    </form>
  );
}

export default EditAnnonce;
