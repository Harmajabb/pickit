import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router";
import { AuthContext } from "../../context/AuthContext";
import type { LoginData } from "./Ts-Connexion";
import "./Connexion.css";
import "../../App.css";

const Base_URL = `${import.meta.env.VITE_API_URL}`;

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [response, setResponse] = useState<string>("");
  const { login } = useContext(AuthContext);

  async function Submit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const data: LoginData = {
        email,
        password,
      };
      const responseData = await fetch(`${Base_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(data),
      });
      const res = await responseData.json();
      if (!responseData.ok) {
        setResponse(res.message || "Connexion failed");
        return;
      }
      login(res.user);
      navigate("/");
      setResponse(res.message);
      console.log("user logged :", res.user);
    } catch (error) {
      console.error("Error during login:", error);
      setResponse("Login failed");
    }
  }

  return (
    <>
      <div className="background-connexion">
        <div className="title-connexion">
          <h1>CONNEXION</h1>
          <p>Welcome back</p>
        </div>
        <form className="form-connexion" onSubmit={Submit}>
          <p>Mail</p>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
          />
          <p>Password</p>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="password"
          />
          <Link to="/forgot-password" className="forgot-password-link">
            Oops i forgot my password
          </Link>
          <Link to="" className="register-link">
            Not registered ?
          </Link>
          <button className="primary loginbtn" type="submit">
            Login
          </button>
        </form>

        {response && <p>{response}</p>}
      </div>
    </>
  );
}

export default Login;
