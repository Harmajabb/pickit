import { useState } from "react";
import type { AnnounceDetail } from "../../types/Announce";

// interface Announce {
//   id: number;
//   title: string;
//   description: string;
//   location: string;
//   owner_id: number;
//   all_images: string[];
//   start_borrow_date: Date;
//   end_borrow_date: Date;
//   amount_deposit: number;
//   state_of_product: string;
//   name: string;
//   categorie_id: number;
// }

type EditAnnonceProps = {
  announce: AnnounceDetail;
  onCancel: () => void;
  onSave: (updatedAnnounce: AnnounceDetail) => void;
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
    >,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleDateChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: new Date(value) });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      const preview = URL.createObjectURL(file);
      setImagePreview(preview);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Fonction pour formater les dates au format YYYY-MM-DD
      const formatDateForDB = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
      };

      // Préparer les données avec les dates au bon format
      const dataToSend = {
        title: formData.title,
        description: formData.description,
        amount_deposit: Number(formData.amount_deposit),
        location: formData.location,
        state_of_product: formData.state_of_product,
        start_borrow_date: formatDateForDB(formData.start_borrow_date),
        end_borrow_date: formatDateForDB(formData.end_borrow_date),
        owner_id: formData.owner_id,
        categorie_id: formData.categorie_id,
        all_images: imagePreview
          ? [imagePreview, ...formData.all_images.slice(1)]
          : formData.all_images,
      };

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/announces/${announce.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(dataToSend),
        },
      );

      if (!res.ok) {
        const errorText = await res.text();
        console.error("Erreur serveur:", errorText);
        throw new Error("Erreur lors de la modification");
      }

      await res.json();
      onSave({
        ...formData,
        all_images: imagePreview
          ? [imagePreview, ...formData.all_images.slice(1)]
          : formData.all_images,
      });
    } catch (err) {
      console.error("Erreur lors de la modification", err);
      alert("Erreur lors de la modification de l'annonce");
    }
  };

  // Format pour input date (YYYY-MM-DD)
  const formatDateForInput = (date: Date) => {
    return date.toISOString().split("T")[0];
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
          <p className="info-label">Start date</p>
          <input
            type="date"
            value={formatDateForInput(formData.start_borrow_date)}
            onChange={(e) =>
              handleDateChange("start_borrow_date", e.target.value)
            }
            className="info-value"
          />
        </div>

        <div className="info-field">
          <p className="info-label">End date</p>
          <input
            type="date"
            value={formatDateForInput(formData.end_borrow_date)}
            onChange={(e) =>
              handleDateChange("end_borrow_date", e.target.value)
            }
            className="info-value"
          />
        </div>

        <div className="info-field">
          <p className="info-label">Overall status</p>
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
          <p className="info-label">Published by</p>
          <p className="info-value">{formData.name}</p>
        </div>
      </div>

      <div className="edit-image-mini-wrapper">
        <label htmlFor="image-upload" className="primary">
          Edit image
        </label>

        <img src={currentImage} alt="Produit" className="edit-image-mini" />

        <input
          id="image-upload"
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={handleImageChange}
        />
      </div>

      <div className="description" style={{ marginTop: "2rem" }}>
        <p
          className="info-label"
          style={{ textAlign: "left", marginBottom: "0.5rem" }}
        >
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

      <div className="action-buttons">
        <button type="button" className="primary" onClick={handleSubmit}>
          Save
        </button>
        <button type="button" className="btn btn-cancel" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </>
  );
}

export default EditAnnonce;
