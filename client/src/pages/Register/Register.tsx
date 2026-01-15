import "./Register.css";
import { useState } from "react";
import { useNavigate } from "react-router";

type FormData = {
  firstName: string | undefined;
  lastName: string | undefined;
  city: string | undefined;
  zipcode: number | undefined;
  adress: string | undefined;
  email: string | undefined;
  password: string | undefined;
};
function Register() {
  const navigate = useNavigate();
  const [uncorrect, setUncorrect] = useState<boolean>(false);
  const [formStatus, setFormStatus] = useState<string>("");
  const [seePassword, setSeePassword] = useState<boolean>(false);
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [currentStep, setCurrentStep] = useState<number>(1);

  const [formData, setFormData] = useState<FormData>({
    firstName: undefined,
    lastName: undefined,
    city: undefined,
    zipcode: undefined,
    adress: undefined,
    email: undefined,
    password: undefined,
  });
  const validateStepOne = () => {
    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.adress ||
      !formData.city ||
      !formData.zipcode
    ) {
      setFormStatus("Please fill all fields.");
      setUncorrect(true);
      return;
    }
    setTimeout(() => {
      setCurrentStep(2);
      setFormStatus("");
    }, 1000);
  };
  const handleSubmit = () => {
    if (!formData.email || !formData.password || !confirmPassword) {
      setUncorrect(true);
      setFormStatus("Please fill all fields");
      return;
    }
    if (confirmPassword !== formData.password) {
      setUncorrect(true);
      setFormStatus("Passwords don't match");
      return;
    }
    setFormData({ ...formData, email: "", password: "" });
    setConfirmPassword("");
    setFormStatus("Welcome !");
    setTimeout(() => {
      navigate("/");
    }, 1500);
  };
  return (
    <div className="register-pageContainer">
      <h1>{currentStep === 1 ? "Profile Info" : "Registration"}</h1>
      <svg
        width="128"
        height="15"
        viewBox="0 0 128 12"
        fill="none"
        className="formProgress"
      >
        <title>Registration form progress indicator</title>
        <circle
          cx="30"
          cy="6"
          r="5.5"
          className={currentStep === 2 ? "doneStep-indicator" : ""}
        />
        <line x1="44" y1="5.5" x2="84" y2="5.5" />
        <circle cx="98" cy="6" r="6" />
      </svg>

      <div className="register-formContainer">
        <form
          className={`stepOne register ${currentStep === 2 && "otherStep"}`}
        >
          <div
            data-text="First Name"
            className={formData.firstName ? "filledInput" : ""}
          >
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => {
                setUncorrect(false);
                setFormData({ ...formData, firstName: e.target.value });
              }}
            />
          </div>
          <div
            data-text="Last Name"
            className={formData.lastName ? "filledInput" : ""}
          >
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => {
                setUncorrect(false);
                setFormData({ ...formData, lastName: e.target.value });
              }}
            />
          </div>
          <div
            data-text="Adress"
            className={formData.adress ? "filledInput" : ""}
          >
            <input
              type="text"
              value={formData.adress}
              onChange={(e) => {
                setUncorrect(false);
                setFormData({ ...formData, adress: e.target.value });
              }}
            />
          </div>
          <div data-text="City" className={formData.city ? "filledInput" : ""}>
            <input
              type="text"
              value={formData.city}
              onChange={(e) => {
                setUncorrect(false);
                setFormData({ ...formData, city: e.target.value });
              }}
            />
          </div>
          <div
            data-text="Zipcode"
            className={formData.zipcode ? "filledInput" : ""}
          >
            <input
              type="number"
              value={formData.zipcode}
              onChange={(e) => {
                setUncorrect(false);
                setFormData({ ...formData, zipcode: Number(e.target.value) });
              }}
            />
          </div>
          <button
            type="submit"
            className={`primary ${uncorrect && "uncorrect"}`}
            onClick={(e) => {
              e.preventDefault();
              validateStepOne();
            }}
          >
            Next step
          </button>
          <span>{formStatus}</span>
        </form>
        <form
          className={`stepTwo register ${currentStep === 1 && "otherStep"}`}
        >
          <div
            data-text="Email"
            className={formData.email ? "filledInput" : ""}
          >
            <input
              type="email"
              value={formData.email}
              onChange={(e) => {
                setUncorrect(false);
                setFormData({ ...formData, email: e.target.value });
              }}
            />
          </div>
          <div
            data-text="Password"
            className={formData.password ? "filledInput" : ""}
          >
            <input
              type={seePassword ? "text" : "password"}
              value={formData.password}
              onChange={(e) => {
                setUncorrect(false);
                setFormData({ ...formData, password: e.target.value });
              }}
            />
          </div>
          <div
            data-text="Verify password"
            className={confirmPassword ? "filledInput" : ""}
          >
            <input
              type={seePassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => {
                setUncorrect(false);
                setConfirmPassword(e.target.value);
              }}
            />
          </div>
          <button
            type="button"
            className="secondary"
            onClick={() => {
              setSeePassword((prev) => !prev);
            }}
          >
            {seePassword ? "Hide password" : "Show password"}
          </button>
          <button
            type="submit"
            className={`primary ${uncorrect && "uncorrect"}`}
            onClick={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
          >
            Register
          </button>
          <span>{formStatus}</span>
        </form>
      </div>
    </div>
  );
}
export default Register;
