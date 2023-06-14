import express from "express";
const router = express.Router(); //maintaining urls

import UserController from "../controllers/userController.js"; // to manage login and registrations of user
import checkUserAuth from "../middlewares/auth-middleware.js";
// import getbill from "../controllers/appController.js";

// ROute Level Middleware - To Protect Route
router.use("/changepassword", checkUserAuth);
router.use("/loggeduser", checkUserAuth);

// Public Routes
router.post("/register", UserController.userRegistration);
router.post("/login", UserController.userLogin);
router.post(
  "/send-reset-password-email",
  UserController.sendUserPasswordResetEmail
);
router.post("/reset-password/:id/:token", UserController.userPasswordReset);

// for otp verification
// for testing
// object for authentication
// const { signup, getbill } = require("../controllers/appController.js");
// router.post("/user/signup", signup);
// from gmail
router.post("/otpauth", UserController.othauth);
router.post("/otpverify", UserController.verifyOTP);
// Protected Routes
router.post("/changepassword", UserController.changeUserPassword);
router.get("/loggeduser", UserController.loggedUser);
router.post("/bike", UserController.addUserBike);
router.post("/rideend", UserController.rideover);
router.post("/admin/auth", UserController.adminLogin);
router.post("/admin/register", UserController.adminRegistration);
router.post("/admin/bikecost", UserController.bikecosting);
router.post("/admin/bikediscount", UserController.discountprizes);
router.post("/admin/report", UserController.getJSONValuesByDate);
router.post("/payment", UserController.paymentmethod);

export default router;
