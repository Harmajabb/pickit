import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import "./CreateAnnonce.css";
import { AuthContext } from "../../context/AuthContext";

function CreateAnnonce() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  // ✅ TOUS les hooks AVANT le early return
  const [showConfirm, setShowConfirm] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedPath, setSelectedPath] = useState<any[]>([]);

  const [categoryLevels, setCategoryLevels] = useState<any[][]>([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    amount_deposit: "",
    location: "",
    state_of_product: "good",
    start_borrow_date: "",
    end_borrow_date: "",
    categorie_id: "",
    files: [] as File[],
  });
  // Auth
  useEffect(() => {
    if (user === null) {
      navigate("/login");
    }
  }, [user, navigate]);

  // Charger les catégories depuis l'API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("http://localhost:3310/api/categories", {
          credentials: "include", // Envoie les cookies d'authentification
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setCategories(data);
        setCategoryLevels([data]);
      } catch (error) {
        console.error("Error loading categories:", error);
      }
    };
    fetchCategories();
  }, []);

  if (!user) {
    return null;
  }
  // Gestion cascade
  const handleCategoryChange = (
    e: React.ChangeEvent<HTMLSelectElement>,
    levelIndex: number,
  ) => {
    const selectedId = Number(e.target.value);

    const newLevels = categoryLevels.slice(0, levelIndex + 1);
    const newPath = selectedPath.slice(0, levelIndex);

    const selectedCategory = categoryLevels[levelIndex].find(
      (cat) => cat.id === selectedId,
    );

    if (!selectedCategory) return;

    newPath.push(selectedCategory);

    setFormData({
      ...formData,
      categorie_id: selectedId.toString(),
    });

    if (selectedCategory.children?.length > 0) {
      newLevels.push(selectedCategory.children);
    }

    setCategoryLevels(newLevels);
    setSelectedPath(newPath);
  };

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

  const handleRemoveFile = (indexToRemove: number) => {
    setFormData({
      ...formData,
      files: formData.files.filter((_, index) => index !== indexToRemove),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowConfirm(true);
  };

  const submitAnnonce = async () => {
    const formDataToSend = new FormData();

    formDataToSend.append("title", formData.title);
    formDataToSend.append("description", formData.description);
    formDataToSend.append("amount_deposit", formData.amount_deposit.toString());
    formDataToSend.append("location", formData.location);
    formDataToSend.append("state_of_product", formData.state_of_product);
    formDataToSend.append("start_borrow_date", formData.start_borrow_date);
    formDataToSend.append("end_borrow_date", formData.end_borrow_date);
    formDataToSend.append("categorie_id", formData.categorie_id);
    formDataToSend.append("owner_id", user.id.toString());

    for (const file of formData.files) {
      formDataToSend.append("images", file);
    }
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
    } catch (error) {
      alert("Error while sending");
    }
  };

  return (
    <div className="create-annonce-page">
      <h1 className="create-annonce-title">Create Your Ad</h1>

      <div className="form-container">
        <div className="image-column">
          <div className="image-upload-wrapper">
            <label htmlFor="images-upload" className="image-upload-btn">
              Add images
            </label>

            <input
              id="images-upload"
              type="file"
              name="images"
              multiple
              accept="image/*"
              onChange={handleFileChange}
            />
          </div>

          {formData.files.length > 0 && (
            <div className="image-preview-container">
              {formData.files.map((file, index) => (
                <div key={file.name} className="image-preview">
                  <img src={URL.createObjectURL(file)} alt={file.name} />
                  <button
                    type="button"
                    className="remove-image-button"
                    onClick={() => handleRemoveFile(index)}
                  >
                    ×
                  </button>
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
              <label htmlFor="categorie_id">Categories</label>
              {categoryLevels.map((levelCategories, levelIndex) => {
                const parent = selectedPath[levelIndex - 1];

                return (
                  <select
                    key={parent ? parent.id : "root"}
                    className="auto-width-input"
                    onChange={(e) => handleCategoryChange(e, levelIndex)}
                  >
                    <option value="">Select a category</option>

                    {levelCategories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.category}
                      </option>
                    ))}
                  </select>
                );
              })}
            </div>
          </div>
          <div className="field-group">
            <label htmlFor="state_of_product">Product condition</label>
            <select
              name="state_of_product"
              value={formData.state_of_product}
              onChange={handleChange}
              className="auto-width-input"
              required
            >
              <option value="new">New</option>
              <option value="excellent">Excellent</option>
              <option value="good">Good</option>
              <option value="fair">Fair</option>
              <option value="poor">Poor</option>
            </select>
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

          <button type="submit" className="cta">
            Create Ad
          </button>
        </form>
      </div>
      {/* MODAL CONFIRMATION */}
      {showConfirm && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Confirm creation</h2>
            <p>Do you really want to create this ad?</p>

            <div className="modal-actions">
              <button
                type="button"
                className="btn-cancel"
                onClick={() => setShowConfirm(false)}
              >
                Cancel
              </button>

              <button
                type="button"
                className="btn-confirm"
                onClick={() => {
                  submitAnnonce();
                  setShowConfirm(false);
                }}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CreateAnnonce;
