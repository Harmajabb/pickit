import express from "express";
import { upload } from "./config/multer";
const router = express.Router();

/* ************************************************************************* */
// Define Your API Routes Here
/* ************************************************************************* */
// Define Authentication-related routes
import authActions from "./modules/authentication/authActions";
router.post("/auth/login", authActions.login);
router.post("/auth/logout", authActions.logout);
router.get("/auth/check", authActions.checkAuth, authActions.check);
router.post("/auth/reset-password", authActions.resetPassword);
router.post("/auth/init-reset-password", authActions.initResetPassword);
// Define Announced-related routes
import announcesActions from "./modules/announces/announcesActions";
router.get("/api/announces", announcesActions.browse);
router.get("/api/announcesFiltered", announcesActions.browseFiltered);
router.delete("/api/announcesDelete", announcesActions.destroy);
router.get("/api/announces/:id", announcesActions.readOne);
router.put("/api/announces/:id", announcesActions.updateAnnounce);
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

// Define search-related routes
import searchActions from "./modules/search/searchAction";

router.get("/api/search", searchActions.search);
router.get("/api/searchFullAnnounces", searchActions.searchFullAnnounces);

// Define user-related routes
import userAction from "./modules/user/userActions";

router.get("/api/users/:id/profile", userAction.readProfileById);

/* ************************************************************************* */

export default router;
