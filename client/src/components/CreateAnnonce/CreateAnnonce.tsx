import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import "./CreateAnnonce.css";
import { AuthContext } from "../../context/AuthContext";

function CreateAnnonce() {
  const { user } = useContext(AuthContext);

  const navigate = useNavigate();
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
    files: [] as File[],
  });

  // biome-ignore lint/correctness/useExhaustiveDependencies: this hook does not need to specify its depedency on navigate.
  useEffect(() => {
    if (user === null) {
      navigate("/login");
    }
  }, []);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      setFormData({
        ...formData,
        files: Array.from(files),
      });
    }
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formDataToSend = new FormData();

    formDataToSend.append("title", formData.title);
    formDataToSend.append("description", formData.description);
    formDataToSend.append("amount_deposit", formData.amount_deposit);
    formDataToSend.append("location", formData.location);
    formDataToSend.append("state", formData.state);
    formDataToSend.append("start_borrow_date", formData.start_borrow_date);
    formDataToSend.append("end_borrow_date", formData.end_borrow_date);
    formDataToSend.append("categorie_id", formData.categorie_id);
    formDataToSend.append("owner_id", formData.owner_id.toString());

    formData.files.forEach((file) => {
      formDataToSend.append("images", file);
    });

    console.log("Fichiers à envoyer:", formData.files);

    try {
      const response = await fetch(
        "http://localhost:3310/api/create_announce",
        {
          method: "POST",
          credentials: "include",
          body: formDataToSend,
        },
      );

      const result = await response.json();
      alert(result.message || result.error);
      console.log("Résultat:", result);
    } catch (error) {
      console.error("Erreur:", error);
      alert("Erreur lors de l'envoi");
    }
  };

  return (
    <div className="create-annonce-page">
      <form onSubmit={handleSubmit}>
        <input type="file" name="images" multiple onChange={handleFileChange} />
        <input
          type="text"
          name="title"
          placeholder="Titre de l'annonce"
          value={formData.title}
          onChange={handleChange}
          // required
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
        <button type="submit">Créer l'annonce</button>
      </form>
    </div>
  );
}

export default CreateAnnonce;
