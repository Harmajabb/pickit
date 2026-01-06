// Import necessary modules from React and React Router
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider, createBrowserRouter } from "react-router";

import App from "./App";
import { AnnouncesProvider } from "./context/AnnouncesContext";
import Home from "./pages/Home";

const router = createBrowserRouter([
  {
    element: <App />,
    children: [{ path: "/", element: <Home /> }],
  },
]);

const rootElement = document.getElementById("root");
if (rootElement == null) {
  throw new Error(`Your HTML Document should contain a <div id="root"></div>`);
}

createRoot(rootElement).render(
  <AnnouncesProvider>
    <StrictMode>
      <RouterProvider router={router} />
    </StrictMode>
  </AnnouncesProvider>,
);
