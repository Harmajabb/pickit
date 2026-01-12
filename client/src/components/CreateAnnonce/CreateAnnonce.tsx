import { useState } from "react";
import "./CreateAnnonce.css";

function CreateAnnonce() {
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
      files: [...formData.files, ...Array.from(files)],
    });
  }
};

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formDataToSend = new FormData();

    formDataToSend.append("title", formData.title);
    formDataToSend.append("description", formData.description);
    formDataToSend.append(
      "amount_deposit",
      formData.amount_deposit.toString());
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
  <h1 className="create-annonce-title">Create Your Ad</h1>

  <div className="form-container">
    <div className="image-column">
      <input type="file" name="images" multiple onChange={handleFileChange} />
      {formData.files.length > 0 && (
        <div className="image-preview-container">
      {formData.files.map((file, index) => (
        <div key={file.name +index} className="image-preview">
          <img src={URL.createObjectURL(file)} alt={`Prévisualisation ${index + 1}`} />
        </div>
      ))}
    </div>
      )}
    </div>

    <form className="create-annonce-form" onSubmit={handleSubmit}>
      <div className="main-info-container">
      <div className="field-group">
              <label htmlFor="title">Title</label>
        <input
          type="text"
          name="title"
          placeholder="Title"
          value={formData.title}
          onChange={handleChange}
          className="auto-width-input"
        />
      </div>
      <div className="field-group">
              <label htmlFor="location">Location</label>
        <input
          type="text"
          name="location"
          placeholder="Location"
          value={formData.location}
          onChange={handleChange}
          className="auto-width-input"
        />
      </div>
      <div className="field-group">
              <label htmlFor="categorie_id">Category</label>
        <select
          name="categorie_id"
          value={formData.categorie_id}
          onChange={handleChange}
          className="auto-width-input"
        >
          <option value="1">Category 1</option>
          <option value="2">Category 2</option>
          <option value="3">Category 3</option>
        </select>
      </div>
      </div>
<div className="field-group">
            <label htmlFor="description">Description</label>
      <textarea
      className="auto-width-input"
        name="description"
        placeholder="Ad Description"
        value={formData.description}
        onChange={handleChange}
        required
      />
    </div>

      <div className="small-inputs-container">
        <div className="field-group">
              <label htmlFor="amount_deposit">Deposit (in €)</label>
        <input
          type="number"
          name="amount_deposit"
          placeholder="Deposit"
          value={formData.amount_deposit}
          onChange={handleChange}
          className="auto-width-input"
        />
        </div>
        <div className="field-group">
              <label htmlFor="start_borrow_date">Start date</label>
        <input
          type="date"
          name="start_borrow_date"
          placeholder="Start Date"
          value={formData.start_borrow_date}
          onChange={handleChange}
          className="auto-width-input"
        />
        </div>
        <div className="field-group">
              <label htmlFor="end_borrow_date">End date</label>
        <input
          type="date"
          name="end_borrow_date"
          placeholder="End Date"
          value={formData.end_borrow_date}
          onChange={handleChange}
          className="auto-width-input"
        />
      </div>
      </div>

      <button type="submit" className="cta">Create Ad</button>
    </form>
  </div>
</div>


  );
}

export default CreateAnnonce;
