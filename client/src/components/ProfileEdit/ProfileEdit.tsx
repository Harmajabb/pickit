import { Handshake, Heart, Package } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";
import type { UserPrivate } from "../../types/User";
import "../ProfileView/ProfileView.css";
import "./ProfileEdit.css";

type ProfileEditProps = {
  user: UserPrivate;
  onCancel: () => void;
  onSave: (updatedUser: UserPrivate) => void;
};

function ProfileEdit({ user, onCancel, onSave }: ProfileEditProps) {
  const API_URL = import.meta.env.VITE_API_URL;

  // form state
  const [formData, setFormData] = useState({
    firstname: user.firstname,
    lastname: user.lastname,
    email: user.email,
    address: user.address,
    city: user.city,
    zipcode: user.zipcode,
  });

  // Profile picture
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Error message
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const currentAvatarSrc = imagePreview
    ? imagePreview
    : user.profile_picture
      ? `${API_URL}${user.profile_picture}`
      : `${API_URL}/assets/images/avatar-default.png`;

  // Changing input
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Changing picture
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);
      const preview = URL.createObjectURL(file);
      setImagePreview(preview);
    }
  };

  // When you submit the form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (!formData.firstname.trim() || !formData.lastname.trim()) {
        throw new Error("Firstname and lastname are required");
      }

      if (!formData.email.trim()) {
        throw new Error("Email is required");
      }

      if (!formData.address.trim() || !formData.city.trim()) {
        throw new Error("Address and city are required");
      }

      // email with regex
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        throw new Error("Please enter a valid email address");
      }

      // Zipcode with regex
      const zipcodeRegex = /^\d{5}$/;
      const zipcodeStr = formData.zipcode.trim();

      if (!zipcodeRegex.test(zipcodeStr)) {
        throw new Error("Zipcode must be exactly 5 digits (e.g., 01000)");
      }

      // request PUT in the backend
      const submitData = new FormData();
      submitData.append("firstname", formData.firstname.trim());
      submitData.append("lastname", formData.lastname.trim());
      submitData.append("email", formData.email.trim());
      submitData.append("address", formData.address.trim());
      submitData.append("city", formData.city.trim());
      submitData.append("zipcode", formData.zipcode.trim());

      if (selectedImage) {
        submitData.append("profil_picture", selectedImage);
      }

      const response = await fetch(`${API_URL}/api/profile/me`, {
        method: "PUT",
        credentials: "include",
        body: submitData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update profile");
      }

      const { user: updatedUser } = await response.json();
      onSave(updatedUser);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error("Error updating profile:", err);
    } finally {
      setIsLoading(false);
    }
  };

  //when you cancel your modifications
  const handleCancel = () => {
    setFormData({
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email,
      address: user.address,
      city: user.city,
      zipcode: user.zipcode,
    });

    setSelectedImage(null);
    setImagePreview(null);
    setError(null);
    onCancel();
  };
  return (
    <section
      className="profile profile--me profile--editing"
      aria-labelledby="edit-profile-title"
    >
      <form onSubmit={handleSubmit} aria-describedby="form-error">
        <header className="profile-header">
          <h1 id="edit-profile-title">My account</h1>
          <p className="profile-subtitle">Update your personal information</p>

          {/* Avatar with edition option */}
          <div className="profile-avatar-edit-wrapper">
            <img
              src={currentAvatarSrc}
              alt={`${formData.firstname} ${formData.lastname}`}
              className="profile-avatar"
            />
            <label htmlFor="profile-picture-upload" className="primary">
              Change photo
            </label>
            <input
              id="profile-picture-upload"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
            />
          </div>
        </header>

        {/* Error message */}
        {error && (
          <div id="form-error" className="cta uncorrect" role="alert">
            {error}
          </div>
        )}

        {/* Personnal informations */}
        <section className="profile-info" aria-labelledby="personal-info-title">
          <h3 id="personal-info-title" className="sr-only">
            Personal Information
          </h3>

          <dl className="profile-info-grid">
            {/* Firstname*/}
            <div className="profile-info-item profile-info-item--edit">
              <dt>
                <label htmlFor="edit-first-name">First name:</label>
              </dt>
              <dd>
                <input
                  type="text"
                  name="firstname"
                  value={formData.firstname}
                  onChange={handleChange}
                  placeholder="First name"
                  className="profile-edit-input"
                  title="Please enter a valid first name"
                  required
                />
              </dd>
            </div>

            {/* Name */}
            <div className="profile-info-item profile-info-item--edit">
              <dt>
                <label htmlFor="edit-lastname">Lastname:</label>
              </dt>
              <dd>
                <input
                  type="text"
                  name="lastname"
                  value={formData.lastname}
                  onChange={handleChange}
                  placeholder="Last name"
                  className="profile-edit-input"
                  title="Please enter a valid last name"
                  required
                />
              </dd>
            </div>

            {/* Email */}
            <div className="profile-info-item profile-info-item--edit">
              <dt>
                <label htmlFor="edit-email">Email:</label>
              </dt>
              <dd>
                <input
                  type="email"
                  id="edit-email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  pattern="[^\s@]+@[^\s@]+\.[^\s@]+"
                  title="Please enter a valid email address"
                  placeholder="example@gmail.com"
                  className="profile-edit-input"
                />
              </dd>
            </div>

            {/* Address */}
            <div className="profile-info-item profile-info-item--edit">
              <dt>
                <label htmlFor="edit-address">Address:</label>
              </dt>
              <dd>
                <input
                  type="text"
                  id="edit-address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  title="Please enter a valid address"
                  placeholder="123 rue smallville"
                  required
                  className="profile-edit-input"
                />
              </dd>
            </div>

            {/* City */}
            <div className="profile-info-item profile-info-item--edit">
              <dt>
                <label htmlFor="edit-city">City:</label>
              </dt>
              <dd>
                <input
                  type="text"
                  id="edit-city"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  title="Please enter a valid email city"
                  placeholder="Bourg-En-Bresse"
                  required
                  className="profile-edit-input"
                />
              </dd>
            </div>

            {/* Zipcode */}
            <div className="profile-info-item profile-info-item--edit">
              <dt>
                <label htmlFor="edit-zipcode">Zipcode:</label>
              </dt>
              <dd>
                <input
                  type="text"
                  id="edit-zipcode"
                  name="zipcode"
                  value={formData.zipcode}
                  onChange={handleChange}
                  required
                  pattern="\d{5}"
                  maxLength={5}
                  placeholder="01000"
                  title="5-digit postal code (e.g. 01000)"
                  className="profile-edit-input"
                  inputMode="numeric" // for mobile phone
                />
              </dd>
            </div>
          </dl>

          {/* Action button */}
          <div className="profile-edit-actions">
            <button type="submit" className="primary" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save changes"}
            </button>
            <button
              type="button"
              className="secondary"
              onClick={handleCancel}
              disabled={isLoading}
            >
              Cancel
            </button>
          </div>
        </section>
      </form>

      {/* Action cards */}
      <section
        className="profile-actions"
        aria-labelledby="account-actions-title"
      >
        <h3 id="account-actions-title" className="sr-only">
          Quick Actions
        </h3>

        <div className="profile-actions-grid">
          <Link to="/my-announces" className="profile-action-card" tabIndex={0}>
            <div className="profile-action-icon">
              <Package size={40} strokeWidth={1.5} />
            </div>
            <h4>My Announcements</h4>
            <p>Manage your items</p>
          </Link>

          <Link to="/my-favorites" className="profile-action-card" tabIndex={0}>
            <div className="profile-action-icon">
              <Heart size={40} strokeWidth={1.5} />
            </div>
            <h4>My Favorites</h4>
            <p>Find your favorites</p>
          </Link>
          <Link
            to="/profile/requests"
            className="profile-action-card"
            tabIndex={0}
          >
            <div className="profile-action-icon">
              <Handshake size={40} strokeWidth={1.5} />
            </div>
            <h4>My Requests</h4>
            <p>Manage borrow requests</p>
          </Link>
        </div>
      </section>
    </section>
  );
}

export default ProfileEdit;
