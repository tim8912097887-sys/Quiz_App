// Third party
import express from "express";
// Services
import { getOtpController, loginController, logoutController, passwordResetController, refreshController, signupController, verifyOtpController } from "@routes/v1/auth/controller.js";
// Middleware
import { refreshTokenVerify } from "@middleware/auth.js";
import { userSchemaChecker } from "@middleware/userSchemaChecker.js";
// Schema
import { CreateUserSchema } from "@schema/user/signup.js";
import { LoginUserSchema } from "@schema/user/login.js";
import { VerifySignupSchema } from "@schema/verify/verifySignup.js";
import { GetOtpSchema } from "@schema/verify/getOtp.js";
import { PasswordResetSchema } from "@schema/verify/passwordReset.js";

export const authRouter = express.Router();

authRouter.post("/login",userSchemaChecker(LoginUserSchema),loginController);
authRouter.post("/signup",userSchemaChecker(CreateUserSchema),signupController);
authRouter.post("/verification",userSchemaChecker(VerifySignupSchema),verifyOtpController);
authRouter.get("/getotp",userSchemaChecker(GetOtpSchema),getOtpController);
authRouter.post("/resetpassword",userSchemaChecker(PasswordResetSchema),passwordResetController);
authRouter.delete("/logout",logoutController);
authRouter.get("/refresh",refreshTokenVerify,refreshController);