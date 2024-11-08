import { asyncHandler } from "../middlewares/asyncHandler.ts";
import { User } from "../models/UserSchema.ts";

// authenticate login
const authenticateLoginAction = asyncHandler(async (req, res, next) => {
  // 1) VALIDATE & SANITISE FIELDS
  // 2) Return error in json if failed validation
  // 3) CHECK if username is in `users` collection and status is active
  // 4) CHECK if password is correct
});

const logoutAction = asyncHandler(async (req, res, next) => {});

// Restrict permission
const restrictTo = asyncHandler(async (req, res, next) => {});

const protect = asyncHandler(async (req, res, next) => {});
