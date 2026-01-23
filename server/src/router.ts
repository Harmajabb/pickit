import express from "express";
import { upload } from "./config/multer";

const router = express.Router();

/* ************************************************************************* */
// Define Your API Routes Here
/* ************************************************************************* */

// Define Category-related routes
import categoryActions from "./modules/categories/categoryActions";

router.get(
  "/api/categories",
  authActions.checkAuth,
  authActions.verifyAdmin,
  categoryActions.browse,
);
router.post(
  "/api/categories",
  authActions.checkAuth,
  authActions.verifyAdmin,
  categoryActions.add,
);
router.put(
  "/api/categories/:id",
  authActions.checkAuth,
  authActions.verifyAdmin,
  categoryActions.edit,
);
router.delete(
  "/api/categories/:id",
  authActions.checkAuth,
  authActions.verifyAdmin,
  categoryActions.delete,
);

// Define Admin-related routes
import adminActions from "./modules/admin/adminActions";

router.get(
  "/api/admin/stats",
  authActions.checkAuth,
  authActions.verifyAdmin,
  adminActions.getDashboardStats,
);

// Define Authentication-related routes
import authActions from "./modules/authentication/authActions";

router.post("/auth/login", authActions.login);
router.post("/auth/logout", authActions.logout);
router.get("/auth/check", authActions.checkAuth, authActions.check);
router.post("/auth/reset-password", authActions.resetPassword);
router.post("/auth/init-reset-password", authActions.initResetPassword);
router.post("/auth/register", authActions.register, authActions.login);

// Define Announced-related routes
import announcesActions from "./modules/announces/announcesActions";

router.get("/api/announces", announcesActions.browse);
router.get("/api/announcesFiltered", announcesActions.browseFiltered);
router.delete("/api/announcesDelete", announcesActions.destroy);
router.get("/api/announces/:id", announcesActions.readOne);
router.put("/api/announces/:id", announcesActions.updateAnnounce);
router.post(
  "/api/create_announce",
  // authActions.checkAuth,
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

router.get("/api/profile/me", authActions.checkAuth, userAction.readMyProfile);
router.get(
  "/api/profile/:id",
  authActions.checkAuth,
  userAction.readProfileById,
);
router.put(
  "/api/profile/me",
  authActions.checkAuth,
  upload.single("profil_picture"),
  userAction.updateMyProfile,
);

/* ************************************************************************* */

export default router;
