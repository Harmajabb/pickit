import express from "express";
import { upload } from "./config/multer";
const router = express.Router();

/* ************************************************************************* */
// Define Your API Routes Here
/* ************************************************************************* */

// Define Announced-related routes
import announcesActions from "./modules/announces/announcesActions";
router.get("/api/announces", announcesActions.browse);
router.get("/api/announcesFiltered", announcesActions.browseFiltered);
router.post(
  "/api/create_announce",
  upload.array("images", 10),
  announcesActions.createAnnounce,
);
// Define item-related routes
import itemActions from "./modules/item/itemActions";

router.get("/api/items", itemActions.browse);
router.get("/api/items/:id", itemActions.read);
router.post("/api/items", itemActions.add);

/* ************************************************************************* */

export default router;
