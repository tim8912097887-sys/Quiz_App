import express from "express";
import { loginController, logoutController, refreshController, signupController, verifyOtpController } from "@routes/v1/auth/controller.js";
import { userSchemaChecker } from "@middleware/userSchemaChecker.js";
import { CreateUserSchema } from "@schema/user/signup.js";
import { refreshTokenVerify } from "@middleware/auth.js";
import { LoginUserSchema } from "@schema/user/login.js";
import { VerifySignupSchema } from "@schema/verify/verifySignup.js";

export const authRouter = express.Router();

authRouter.post("/login",userSchemaChecker(LoginUserSchema),loginController);
authRouter.post("/signup",userSchemaChecker(CreateUserSchema),signupController);
authRouter.post("/verification",userSchemaChecker(VerifySignupSchema),verifyOtpController);
authRouter.delete("/logout",logoutController);
authRouter.get("/refresh",refreshTokenVerify,refreshController);