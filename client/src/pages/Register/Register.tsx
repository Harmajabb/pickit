import "./Register.css";
import { useState } from "react";

type FormData = {
  firstName?: string;
  lastName?: string;
  city?: string;
  zipcode?: number;
  adress?: string;
  email?: string;
  password?: string;
};
function Register() {
  const [uncorrect, setUncorrect] = useState<Boolean>(false);
  const [formStatus, setFormStatus] = useState<String>("");
  const [seePassword, setSeePassword] = useState<Boolean>(false);
  const [step, setStep] = useState<Number>(1);
  const [formData, setFormData] = useState<FormData>({
    firstName: undefined,
    lastName: undefined,
    city: undefined,
    zipcode: undefined,
    adress: undefined,
    email: undefined,
    password: undefined,
  });
  const handleSubmit = () => {};
  const validateStepOne = () => {
    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.adress ||
      !formData.city ||
      !formData.zipcode
    ) {
      setFormStatus("please fill all fields.");
      setUncorrect(true);
      return;
    }
  };
  return (
    <div className="register-pageContainer">
      <form className="stepOne register">
        <div data-text="First Name">
          <input
            type="text"
            value={formData.firstName}
            onChange={(e) => {
              setFormData({ ...formData, firstName: e.target.value });
            }}
          />
        </div>
        <div data-text="Last Name">
          <input
            type="text"
            value={formData.lastName}
            onChange={(e) => {
              setFormData({ ...formData, lastName: e.target.value });
            }}
          />
        </div>
        <div data-text="Adress">
          <input
            type="text"
            value={formData.adress}
            onChange={(e) => {
              setFormData({ ...formData, adress: e.target.value });
            }}
          />
        </div>
        <div data-text="City">
          <input
            type="text"
            value={formData.city}
            onChange={(e) => {
              setFormData({ ...formData, city: e.target.value });
            }}
          />
        </div>
        {/* <div data-text="Zipcode">
          <input
            type="text"
            value={formData.zipcode}
            onChange={(e) => {
              setFormData({ ...formData, zipcode: e.target.value });
            }}
          />
        </div> */}
      </form>
    </div>
  );
}
export default Register;
