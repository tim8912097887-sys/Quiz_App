import { LoginUserType } from "@/schema/user/login.ts"
import { CreateUserType } from "@schema/user/signup.ts"
import { JwtPayload } from "jsonwebtoken";

type User = CreateUserType | LoginUserType;

declare global {
    namespace Express {
       interface Request {
          user?: User | JwtPayload
       }        
    }
}

export {}