import { useContext, useState } from "react";
import { useNavigate } from "react-router";
import { AuthContext } from "../../context/AuthContext";
import type { LoginData } from "./Ts-Connexion";
import "./Connexion.css";

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
          <h1>Login</h1>
        </div>
        <form className="form-connexion" onSubmit={Submit}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="password"
          />
          <button className="btn-connexion" type="submit">
            Login
          </button>
        </form>

        {response && <p>{response}</p>}
      </div>
    </>
  );
}

export default Login;
