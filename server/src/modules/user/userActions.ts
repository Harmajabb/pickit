import type { RequestHandler } from "express";
import type { JwtPayload } from "jsonwebtoken"; // allow to get the token from req.auth
import announcesRepository from "../announces/announcesRepository";
import userRepository, { type UserUpdateData } from "./userRepository";

// get my profile (only for authenticated user - private data only)
const readMyProfile: RequestHandler = async (req, res, next) => {
  try {
    const decoded = req.auth as JwtPayload; //middleware checkAuth
    const userId = Number(decoded.sub);

    //unauthorized user if no good ID
    if (!Number.isInteger(userId) || userId <= 0) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    // only private user data
    const user = await userRepository.readPrivateById(userId);

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // only user is back
    res.json({ user });
  } catch (err) {
    next(err);
  }
};

// get user profile (we got user, item, favorites)
const readProfileById: RequestHandler = async (req, res, next) => {
  try {
    const id = Number(req.params.id); // take ID from URL

    if (!Number.isInteger(id) || id <= 0) {
      res.status(400).json({ message: "Invalid user id" });
      return;
    }

    // fetch public data
    const user = await userRepository.readById(id);

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // take back items and favorites for user profile seen by others
    const items = await announcesRepository.readByOwnerId(id);
    const favorites = await announcesRepository.readFavoritesByUserId(id);

    res.json({ user, items, favorites });
  } catch (err) {
    next(err);
  }
};

const readAllUsers: RequestHandler = async (_req, res, next) => {
  try {
    const users = await userRepository.readAllMembers();
    res.json({ users });
  } catch (err) {
    next(err);
  }
};

// Admin ban user
const banUser: RequestHandler = async (req, res, next) => {
  try {
    const userId = Number(req.params.id);
    const adminId = Number(req.auth?.sub);
    const { reason, days } = req.body;

    const existingBan = await userRepository.checkBanStatus(userId);

    if (existingBan) {
      return res.status(409).json({
        message: "User is already banned.",
        details: existingBan,
      });
    }

    await userRepository.ban(userId, adminId, reason, days);
    res.status(201).json({ message: "User banned successfully." });
  } catch (err) {
    next(err);
  }
};
const unbanUser: RequestHandler = async (req, res, next) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({
        message: "data missing or invalid.",
      });
    }
    await userRepository.unban(userId);

    res.status(201).json({ message: "user unbanned successfully." });
  } catch (err) {
    next(err);
  }
};
const changeUserRole: RequestHandler = async (req, res, next) => {
  try {
    const { userId, newRole } = req.body;
    const adminId = Number(req.auth?.sub);
    if (Number(userId) === Number(adminId)) {
      return res.status(403).json({
        message: "Forbidden Action : You cannot change your own role.",
      });
    }

    if (newRole !== 0 && newRole !== 1) {
      return res.status(400).json({ message: "Invalid role." });
    }

    await userRepository.updateRole(userId, newRole);
    res.status(201).json({ message: "user role updated successfully." });
  } catch (err) {
    next(err);
  }
};
const deleteUser: RequestHandler = async (req, res, next) => {
  try {
    const userId = Number(req.params.id);
    const adminId = Number(req.auth?.sub);

    if (Number(userId) === Number(adminId)) {
      return res.status(403).json({
        message: "Forbidden Action : You cannot delete your own account.",
      });
    }

    await userRepository.deleteById(userId);

    res
      .status(200)
      .json({ message: "User and associated data deleted successfully." });
  } catch (err) {
    next(err);
  }
};

const updateMyProfile: RequestHandler = async (req, res, next) => {
  try {
    //extract user id from jwt
    const userAuth = req.auth as JwtPayload;
    const userId = Number(userAuth.sub);

    if (!Number.isInteger(userId) || userId <= 0) {
      res.status(401).json({ message: "Unauthorized user" });
      return;
    }

    // extractdata - field from request body
    const { firstname, lastname, email, address, city, zipcode } = req.body;

    // valdation - required fields
    if (!firstname?.trim() || !lastname?.trim() || !email?.trim()) {
      res.status(400).json({
        message: "Firstname, lastname and email are required",
      });
      return;
    }
    if (!address?.trim() || !city?.trim()) {
      res.status(400).json({
        message: "Address and city are required",
      });
      return;
    }

    if (!zipcode) {
      res.status(400).json({ message: "Zipcode is required" });
      return;
    }

    // zipcode validation (keep as string to preserve leading zeros)
    const zipcodeRegex = /^\d{5}$/;
    const zipcodeStr = String(zipcode).trim();

    if (!zipcodeRegex.test(zipcodeStr)) {
      res.status(400).json({
        message: "Zipcode must be exactly 5 digits",
      });
      return;
    }

    //validation email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({ message: "Invalid email format" });
      return;
    }
    //verification if email is already used
    const emailExists = await userRepository.checkExistEmail(
      email.trim().toLowerCase(),
      userId,
    );
    if (emailExists) {
      res.status(409).json({ message: "Email already in use" });
      return;
    }

    //security: only authorized label
    const updateData: UserUpdateData = {
      firstname: firstname.trim(),
      lastname: lastname.trim(),
      email: email.trim().toLowerCase(),
      address: address.trim(),
      city: city.trim(),
      zipcode: zipcodeStr.trim(),
      ...(req.file && {
        profil_picture: `/assets/images/${req.file.filename}`,
      }),
    };

    // update database
    const updatedUser = await userRepository.update(userId, updateData);
    if (!updatedUser) {
      res.status(500).json({ message: "Failed to update the profile" });
      return;
    }
    res.json({
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (err) {
    next(err);
  }
};

export default {
  unbanUser,
  deleteUser,
  changeUserRole,
  banUser,
  readAllUsers,
  readProfileById,
  readMyProfile,
  updateMyProfile,
};
