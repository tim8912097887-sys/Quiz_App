import jwt from "jsonwebtoken"
import { logger } from "./logger.js"

type Payload = {
    id: number
    jwtid: string
}

export const createToken = (payLoad: Payload,secret: string,expiresIn: number) => {
     const token = jwt.sign(payLoad,secret,{
        expiresIn,
        algorithm: "HS256" 
     })
     return token;
}

export const verifyToken = (token: string,secret: string) => {
     try {
         const decode = jwt.verify(token,secret,{
            algorithms: ["HS256"] 
         })

         return decode;
     } catch (error) {
         logger.error(`JWT Verification: ${error}`);
         return;
     }
}