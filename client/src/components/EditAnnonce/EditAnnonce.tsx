import { useEffect, useState} from "react";

type EditAnnonceProps = {
  annonceId: number;
};

function EditAnnonce({ annonceId }: EditAnnonceProps) {
  const [formData, setFormData] = useState({
   title: "",
    description: "",
    amount_deposit: "",
    location: "",
    state_of_product: "good",
    start_borrow_date: "",
    end_borrow_date: "",
    categorie_id: "1",
    owner_id: 1,
    files: [] as File[],
  });

  const [loading, setLoading] = useState(true);

useEffect(() => {
    const fetchAnnonce = async () => {
      try {
        const res = await fetch(`/api/announces/${annonceId}`);
        const data = await res.json();

        setFormData((prev) => ({
          ...prev,
          title: data.title ?? "",
          description: data.description ?? "",
          amount_deposit: String(data.amount_caution ?? ""),
          start_borrow_date: data.start_borrow_date ?? "",
          end_borrow_date: data.end_borrow_date ?? "",
          location: data.location ?? "",
          categorie_id: String(data.categorie_id ?? "1"),
          state_of_product: data.state_of_product ?? "good",
          owner_id: data.owner_id ?? 1,
          files: [],
        }));

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
    >
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    setFormData({ ...formData, files: Array.from(e.target.files) });
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
    <div className="create-annonce-page">
      <h1 className="create-annonce-title">Create Your Ad</h1>

      <div className="form-container">
        <div className="image-column">
          <input type="file" multiple onChange={handleFileChange} />

          {formData.files.length > 0 && (
            <div className="image-preview-container">
              {formData.files.map((file, index) => (
                <div key={file.name + index} className="image-preview">
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`Prévisualisation ${index + 1}`}
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

      <button type="submit" className="cta">Modifier l'annonce</button>
    </form>
  </div>
</div>


  );
}


export default EditAnnonce;
