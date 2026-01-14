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
router.delete("/api/announcesDelete", announcesActions.destroy);

// Define item-related routes
import itemActions from "./modules/item/itemActions";

router.get("/api/items", itemActions.browse);
router.get("/api/items/:id", itemActions.read);
router.post("/api/items", itemActions.add);

/* ************************************************************************* */

export default router;
