import express from "express";
import { loginController, logoutController, refreshController, signupController } from "@routes/v1/auth/controller.js";
import { userSchemaChecker } from "@middleware/userSchemaChecker.js";
import { LoginUserSchema } from "@schema/user/login.js";
import { CreateUserSchema } from "@schema/user/signup.js";
import { refreshTokenVerify } from "@middleware/auth.js";

export const authRouter = express.Router();

authRouter.post("/login",userSchemaChecker(LoginUserSchema),loginController);
authRouter.post("/signup",userSchemaChecker(CreateUserSchema),signupController);
authRouter.delete("/logout",logoutController);
authRouter.get("/refresh",refreshTokenVerify,refreshController);