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
    state_of_product: "good",
    start_borrow_date: "",
    end_borrow_date: "",
    categorie_id: "1",
    owner_id: user?.id,
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
        files: [...formData.files, ...Array.from(files)],
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      alert("User not found");
      return;
    }

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

    console.log("Files to send:", formData.files);

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
      console.log("Result:", result);
    } catch (error) {
      console.error("Error:", error);
      alert("Error while sending");
    }
  };

  return (
    <div className="create-annonce-page">
      <h1 className="create-annonce-title">Create Your Ad</h1>

      <div className="form-container">
        <div className="image-column">
          <input
            type="file"
            name="images"
            multiple
            onChange={handleFileChange}
          />
          {formData.files.length > 0 && (
            <div className="image-preview-container">
              {formData.files.map((file) => (
                <div key={file.name} className="image-preview">
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`Prévisualisation ${file.name}`}
                  />
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
    </div>
  );
}

export default CreateAnnonce;
