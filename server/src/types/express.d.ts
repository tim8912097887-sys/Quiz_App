// Third party
import { JwtPayload } from "jsonwebtoken";
// Schema
import { LoginUserType } from "@schema/user/login.ts"
import { GetOtpType } from "@schema/verify/getOtp.ts";
import { PasswordResetType } from "@schema/verify/passwordReset.ts";
import { VerifySignupType } from "@schema/verify/verifySignup.ts";
import { CreateUserType } from "@schema/user/signup.ts"

type User = CreateUserType | LoginUserType;

declare global {
    namespace Express {
       interface Request {
          user?: User | JwtPayload | VerifySignupType | GetOtpType | PasswordResetType
       }        
    }
}

export {}