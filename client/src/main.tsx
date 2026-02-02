import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
// ICI : "create" vient avant "Router"
import { createBrowserRouter, RouterProvider } from "react-router";

import App from "./App";
import CategoryManager from "./components/CategoryManager/CategoryManager";
import ForgotPassword from "./components/ForgotPassword/ForgotPassword";
import MyAnnouncesList from "./components/MyAnnouncesList/MyAnnouncesList";
import MyRequests from "./components/MyRequest/MyRequest";
import ProductSheet from "./components/ProductSheet/ProductSheet";
import ResetPassword from "./components/ResetPassword/ResetPassword";
import UserManager from "./components/UserManager/UserManager";
import { AnnouncesProvider } from "./context/AnnouncesContext";
import { AuthProvider } from "./context/AuthContext";
import Catalog from "./pages/Catalog/Catalog";
import Login from "./pages/Connexion/Connexion";
import CreateAnnoncePage from "./pages/CreateAnnoncePage";
import Dashboard_Admin from "./pages/Dashboard_Admin/Dashboard_Admin";
import Home from "./pages/Home";
import Profile from "./pages/Profile/Profile";
import Register from "./pages/Register/Register";

const router = createBrowserRouter([
  {
    element: <App />,
    children: [
      { path: "/", element: <Home /> },
      { path: "/catalog", element: <Catalog /> },
      { path: "/login", element: <Login /> },
      { path: "/announce/:announceId", element: <ProductSheet /> },
      { path: "/create-annonce", element: <CreateAnnoncePage /> },
      { path: "/my-announces", element: <MyAnnouncesList /> },
      { path: "/register", element: <Register /> },
      { path: "/reset-password/:token", element: <ResetPassword /> },
      { path: "/forgot-password", element: <ForgotPassword /> },
      { path: "/ad-dashboard", element: <Dashboard_Admin /> },
      { path: "/profile/me", element: <Profile mode="me" /> },
      { path: "/profile/:id", element: <Profile mode="member" /> },
      { path: "/profile/requests", element: <MyRequests /> },
      { path: "/ad-dashboard/categories", element: <CategoryManager /> },
      { path: "/ad-dashboard/users", element: <UserManager /> },
    ],
  },
]);

const rootElement = document.getElementById("root");
if (rootElement == null) {
  throw new Error("Your HTML Document should contain a <div id='root'></div>");
}

createRoot(rootElement).render(
  <StrictMode>
    <AuthProvider>
      <AnnouncesProvider>
        <RouterProvider router={router} />
      </AnnouncesProvider>
    </AuthProvider>
  </StrictMode>,
);
