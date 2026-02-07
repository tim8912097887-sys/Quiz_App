import { JwtPayload } from "jsonwebtoken";
import { env } from "@configs/env.js";
import { UnauthorizedError } from "@custom/error/unauthorized.js";
import { asyncHandler } from "@utilities/asyncHandler.js";
import { verifyToken } from "@utilities/token.js";

export const refreshTokenVerify = asyncHandler((req,_,next) => {
       const { refreshToken } = req.cookies;
       if(!refreshToken) throw new UnauthorizedError("Unauthicated");
       const decode = verifyToken(refreshToken,env.REFRESH_TOKEN_SECRET) as (JwtPayload | undefined);
       if(!decode) throw new UnauthorizedError("Unauthicated");
       req.user = decode;
       return next();
})