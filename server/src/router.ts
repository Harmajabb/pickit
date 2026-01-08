import express from "express";

const router = express.Router();

/* ************************************************************************* */
// Define Your API Routes Here
/* ************************************************************************* */

// Define Authentication-related routes
import authActions from "./modules/authentication/authActions";
router.post("/api/login", authActions.login);
router.post("/api/logout", authActions.logout);
// Define Announced-related routes
import announcesActions from "./modules/announces/announcesActions";
router.get("/api/announces", announcesActions.browse);
router.get("/api/announcesFiltered", announcesActions.browseFiltered);

// Define item-related routes
import itemActions from "./modules/item/itemActions";

router.get("/api/items", itemActions.browse);
router.get("/api/items/:id", itemActions.read);
router.post("/api/items", itemActions.add);

// Define search-related routes
import searchActions from "./modules/search/searchAction";

router.get("/api/search", searchActions.search);

/* ************************************************************************* */

export default router;
