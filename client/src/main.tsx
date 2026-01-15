// Import necessary modules from React and React Router
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router";

import App from "./App";
import ForgotPassword from "./components/ForgotPassword/ForgotPassword";
import ResetPassword from "./components/ResetPassword/ResetPassword";
import { AnnouncesProvider } from "./context/AnnouncesContext";
import { AuthProvider } from "./context/AuthContext";
import Catalog from "./pages/Catalog/Catalog";
import Login from "./pages/Connexion/Connexion";
import CreateAnnoncePage from "./pages/CreateAnnoncePage";
import Dashboard_Admin from "./pages/Dashboard_Admin/Dashboard_Admin";
import Home from "./pages/Home";

const router = createBrowserRouter([
  {
    element: <App />,
    children: [
      { path: "/", element: <Home /> },
      { path: "/catalog", element: <Catalog /> },
      { path: "/login", element: <Login /> },
      { path: "/catalog/:id", element: <Login /> }, // add your page Teddy here
      { path: "/create-annonce", element: <CreateAnnoncePage /> },
      { path: "/reset-password/:token", element: <ResetPassword /> },
      { path: "/forgot-password", element: <ForgotPassword /> },
      { path: "/ad-dashboard", element: <Dashboard_Admin /> },
    ],
  },
]);

const rootElement = document.getElementById("root");
if (rootElement == null) {
  throw new Error(`Your HTML Document should contain a <div id="root"></div>`);
}

createRoot(rootElement).render(
  <AuthProvider>
    <AnnouncesProvider>
      <StrictMode>
        <RouterProvider router={router} />
      </StrictMode>
    </AnnouncesProvider>
  </AuthProvider>,
);
