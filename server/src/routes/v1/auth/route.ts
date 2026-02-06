import express from "express";
import { loginController, signupController } from "@routes/v1/auth/controller.js";

export const authRouter = express.Router();

authRouter.post("/login",loginController);
authRouter.post("/signup",signupController);