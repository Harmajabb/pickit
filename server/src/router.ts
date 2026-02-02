import express from "express";
import { upload } from "./config/multer";

const router = express.Router();

/* ************************************************************************* */
// Define Your API Routes Here
/* ************************************************************************* */

// Define Category-related routes
import categoryActions from "./modules/categories/categoryActions";

router.get("/api/categories", categoryActions.browse);

router.post(
  "/api/categories",
  authActions.checkAuth,
  authActions.verifyAdmin,
  authActions.adminLogMiddleware,
  categoryActions.add,
);
router.put(
  "/api/categories/:id",
  authActions.checkAuth,
  authActions.verifyAdmin,
  authActions.adminLogMiddleware,
  categoryActions.edit,
);
router.delete(
  "/api/categories/:id",
  authActions.checkAuth,
  authActions.verifyAdmin,
  authActions.adminLogMiddleware,
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

// Define Borrow-related routes
import borrowActions from "./modules/borrows/borrowActions";

router.post(
  "/api/borrows/secure-deposit",
  authActions.checkAuth,
  borrowActions.secureDeposit,
);

router.get(
  "/api/borrows/:id",
  authActions.checkAuth,
  borrowActions.getBorrowById,
);

router.post(
  "/api/borrows/create-payment-intent",
  borrowActions.createPaymentIntent,
);

router.post(
  "/api/loan-requests",
  authActions.checkAuth,
  borrowActions.createLoanRequest,
);

/* ************************************************************************* */

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

router.get(
  "/api/announces/my-announces",
  authActions.checkAuth,
  announcesActions.readMyAnnounces,
);

router.get("/api/announces", announcesActions.browse);
router.get("/api/announcesFiltered", announcesActions.browseFiltered);
router.delete("/api/announcesDelete", announcesActions.destroy);

router.post(
  "/api/create_announce",
  // authActions.checkAuth,
  upload.array("images", 10),
  announcesActions.createAnnounce,
);

router.get("/api/announces/:id", announcesActions.readOne);
router.put(
  "/api/announces/:id",
  upload.array("new_images", 10),
  announcesActions.updateAnnounce,
);
router.delete(
  "/api/announces/:id",
  authActions.checkAuth,
  announcesActions.destroy,
);

// Créer une demande de prêt
router.post(
  "/api/loan-requests",
  authActions.checkAuth,
  borrowActions.createLoanRequest,
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
router.post(
  "/api/users/:id/ban-user",
  authActions.checkAuth,
  authActions.verifyAdmin,
  authActions.adminLogMiddleware,
  userAction.banUser,
);
router.delete(
  "/api/users/:id/delete-user",
  authActions.checkAuth,
  authActions.verifyAdmin,
  authActions.adminLogMiddleware,
  userAction.deleteUser,
);
router.post(
  "/api/users/:id/change-user-role",
  authActions.checkAuth,
  authActions.verifyAdmin,
  authActions.adminLogMiddleware,
  userAction.changeUserRole,
);
router.get(
  "/api/users",
  authActions.checkAuth,
  authActions.verifyAdmin,
  userAction.readAllUsers,
);
router.post(
  "/api/users/:id/unban-user",
  authActions.checkAuth,
  authActions.verifyAdmin,
  authActions.adminLogMiddleware,
  userAction.unbanUser,
);
router.put(
  "/api/profile/me",
  authActions.checkAuth,
  upload.single("profil_picture"),
  userAction.updateMyProfile,
);

// Define favorites routes
import favoriteAction from "./modules/favorites/favoriteAction";

router.get(
  "/api/favorites/me",
  authActions.checkAuth,
  favoriteAction.getMyFavorites,
);
router.get(
  "/api/favorites/:id",
  authActions.checkAuth,
  favoriteAction.getFavoritesByUserId,
);
router.post("/api/favorite/addFav", favoriteAction.addFavoriteHandler);
router.delete("/api/favorite/removeFav", favoriteAction.delFavoriteHandler);

/* ************************************************************************* */

export default router;
