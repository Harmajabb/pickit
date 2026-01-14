import { useState } from "react";

type EditAnnonceProps = {
  announce: any;
  onCancel: () => void;
  onSave: (updatedAnnounce: any) => void;
};

function EditAnnonce({ announce, onCancel, onSave }: EditAnnonceProps) {
  const [formData, setFormData] = useState({
    ...announce,
    start_borrow_date: new Date(announce.start_borrow_date),
    end_borrow_date: new Date(announce.end_borrow_date),
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleDateChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: new Date(value) });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const preview = URL.createObjectURL(file);
      setImagePreview(preview);
      
      // TODO: Upload réel vers le serveur
      // Pour l'instant, on garde juste la preview
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/announces/${announce.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...formData,
            // Si une nouvelle image a été sélectionnée, l'ajouter
            all_images: imagePreview 
              ? [imagePreview, ...formData.all_images.slice(1)]
              : formData.all_images
          }),
        }
      );

      if (!res.ok) throw new Error("Erreur lors de la modification");
      
      const updatedData = await res.json();
      onSave({
        ...formData,
        all_images: imagePreview 
          ? [imagePreview, ...formData.all_images.slice(1)]
          : formData.all_images
      });
    } catch (err) {
      console.error("Erreur lors de la modification", err);
      alert("Erreur lors de la modification de l'annonce");
    }
  };

  // Format pour input date (YYYY-MM-DD)
  const formatDateForInput = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const currentImage = imagePreview || formData.all_images[0];

  return (
    <>
      <h1 className="product-title">
        <textarea
          name="title"
          value={formData.title}
          onChange={handleChange}
          rows={2}
        />
      </h1>

      <div className="info-fields">
        <div className="info-field">
          <p className="info-label">Location</p>
          <input
            name="location"
            value={formData.location}
            onChange={handleChange}
            className="info-value"
          />
        </div>

        <div className="info-field">
          <p className="info-label">Caution</p>
          <input
            type="number"
            name="amount_deposit"
            value={formData.amount_deposit}
            onChange={handleChange}
            className="info-value"
          />
        </div>

        <div className="info-field">
          <p className="info-label">Date de début</p>
          <input
            type="date"
            value={formatDateForInput(formData.start_borrow_date)}
            onChange={(e) => handleDateChange('start_borrow_date', e.target.value)}
            className="info-value"
          />
        </div>

        <div className="info-field">
          <p className="info-label">Date de fin</p>
          <input
            type="date"
            value={formatDateForInput(formData.end_borrow_date)}
            onChange={(e) => handleDateChange('end_borrow_date', e.target.value)}
            className="info-value"
          />
        </div>

        <div className="info-field">
          <p className="info-label">État global</p>
          <select
            name="state_of_product"
            value={formData.state_of_product}
            onChange={handleChange}
            className="info-value"
          >
            <option value="new">New</option>
            <option value="excellent">Excellent</option>
            <option value="good">Good</option>
            <option value="fair">Fair</option>
            <option value="poor">Poor</option>
          </select>
        </div>

        <div className="info-field">
          <p className="info-label">Publié par</p>
          <p className="info-value">{formData.name}</p>
        </div>
      </div>

      {/* Édition de l'image */}
      <div className="edit-image-mini-wrapper">
        <label htmlFor="image-upload" className="edit-image-btn">
          Modifier l'image
        </label>
        
        <img
          src={currentImage}
          alt="Produit"
          className="edit-image-mini"
        />

        <input
          id="image-upload"
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={handleImageChange}
        />
      </div>

      {/* Description */}
      <div className="description" style={{ marginTop: '2rem' }}>
        <p className="info-label" style={{ textAlign: 'left', marginBottom: '0.5rem' }}>
          Description
        </p>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={6}
          className="info-value"
        />
      </div>

      {/* Boutons d'action à la fin */}
      <div className="action-buttons">
        <button type="button" className="btn btn-contact" onClick={handleSubmit}>
          Enregistrer
        </button>
        <button type="button" className="btn btn-cancel" onClick={onCancel}>
          Annuler
        </button>
      </div>
    </>
  );
}

export default EditAnnonce;