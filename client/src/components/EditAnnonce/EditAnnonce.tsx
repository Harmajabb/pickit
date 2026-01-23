import { useState } from "react";
import type { AnnounceDetail } from "../../types/Announce";

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

  const [existingImages, setExistingImages] = useState<string[]>(
    announce.all_images,
  );
  const [newImages, setNewImages] = useState<File[]>([]);
  const [deletedImages, setDeletedImages] = useState<string[]>([]);

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setNewImages([...newImages, ...Array.from(e.target.files)]);
    }
  };

  const handleRemoveExistingImage = (imageUrl: string) => {
    setExistingImages(existingImages.filter((img) => img !== imageUrl));
    setDeletedImages([...deletedImages, imageUrl]);
  };

  const handleRemoveNewImage = (fileToRemove: File) => {
    setNewImages((prev) =>
      prev.filter(
        (file) =>
          file.name !== fileToRemove.name ||
          file.lastModified !== fileToRemove.lastModified,
      ),
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const formatDateForDB = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
      };

      const formDataToSend = new FormData();
      formDataToSend.append("title", formData.title);
      formDataToSend.append("description", formData.description);
      formDataToSend.append(
        "amount_deposit",
        formData.amount_deposit.toString(),
      );
      formDataToSend.append("location", formData.location);
      formDataToSend.append("state_of_product", formData.state_of_product);
      formDataToSend.append(
        "start_borrow_date",
        formatDateForDB(formData.start_borrow_date),
      );
      formDataToSend.append(
        "end_borrow_date",
        formatDateForDB(formData.end_borrow_date),
      );
      formDataToSend.append("categorie_id", formData.categorie_id.toString());

      // Ajouter les images à supprimer
      for (const imageUrl of deletedImages) {
        formDataToSend.append("deleted_images", imageUrl);
      }

      // Ajouter les nouvelles images
      for (const file of newImages) {
        formDataToSend.append("new_images", file);
      }

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/announces/${announce.id}`,
        {
          method: "PUT",
          body: formDataToSend,
          credentials: "include",
        },
      );

      if (!res.ok) throw new Error("Erreur lors de la modification");

      const result = await res.json();

      // Utiliser l'annonce retournée par le serveur
      if (result.announce) {
        onSave({
          ...result.announce,
          start_borrow_date: new Date(result.announce.start_borrow_date),
          end_borrow_date: new Date(result.announce.end_borrow_date),
        });
      } else {
        // Fallback si le serveur ne retourne pas l'annonce complète
        onSave({
          ...formData,
          all_images: [...existingImages],
        });
      }
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la modification de l'annonce");
    }
  };

  const formatDateForInput = (date: Date) => date.toISOString().split("T")[0];
  const BASE_URL = `${import.meta.env.VITE_API_URL}/assets/images/`;

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
            onChange={(e) =>
              handleDateChange("start_borrow_date", e.target.value)
            }
            className="info-value"
          />
        </div>

        <div className="info-field">
          <p className="info-label">Date de fin</p>
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

      <div className="edit-image-mini-wrapper">
        <label htmlFor="image-upload" className="edit-image-btn">
          Ajouter des images
        </label>
        <input
          id="image-upload"
          type="file"
          accept="image/*"
          multiple
          style={{ display: "none" }}
          onChange={handleFileChange}
        />
      </div>

      <div className="image-previews-container">
        {/* Images existantes */}
        {existingImages.map((img) => (
          <div key={img} className="image-preview">
            <img src={BASE_URL + img} alt="Produit" />
            <button
              type="button"
              className="remove-image-btn"
              onClick={() => handleRemoveExistingImage(img)}
            >
              ✕
            </button>
          </div>
        ))}

        {/* Nouvelles images */}
        {newImages.map((file) => (
          <div
            key={`${file.name}-${file.lastModified}`}
            className="image-preview"
          >
            <img src={URL.createObjectURL(file)} alt={file.name} />
            <button
              type="button"
              className="remove-image-btn"
              onClick={() => handleRemoveNewImage(file)}
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      <div className="description" style={{ marginTop: "2rem" }}>
        <p className="info-label">Description</p>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={6}
          className="info-value"
        />
      </div>

      <div className="action-buttons">
        <button
          type="button"
          className="btn btn-contact"
          onClick={handleSubmit}
        >
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
