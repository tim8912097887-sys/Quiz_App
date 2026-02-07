import { v4 as uuidv4 } from 'uuid';
import { JwtPayload } from 'jsonwebtoken';
import { BadRequestError } from "@custom/error/badrequest.js";
import { asyncHandler } from "@utilities/asyncHandler.js";
import { loginUser, logoutUser, signupUser } from "./service.js";
import { responseEnvelope } from "@utilities/responseEnvelope.js";
import { CreateUserType } from "@schema/user/signup.js";
import { createToken } from "@utilities/token.js";
import { env } from "@configs/env.js";
import { cookieOptions } from "@utilities/cookie.js";
import { UnauthorizedError } from '@custom/error/unauthorized.js';

export const loginController = asyncHandler(async(req,res) => {

    if(!req.user) throw new BadRequestError("User data invalid");
    const user = await loginUser(req.user as CreateUserType);
    // jwtid for token blacklist store
    const payload = { id: user.id,jwtid: uuidv4() };
    const refreshToken = createToken(payload,env.REFRESH_TOKEN_SECRET,Number(env.REFRESH_TOKEN_EXPIRED));
    const accessToken = createToken(payload,env.ACCESS_TOKEN_SECRET,Number(env.ACCESS_TOKEN_EXPIRED));
    const responseObject = {
        state: "success" as const,
        data: {
            user,
            accessToken
        }
    }
    res.cookie("refreshToken",refreshToken,cookieOptions(Number(env.REFRESH_TOKEN_EXPIRED),"/"));
    res.status(200).json(responseEnvelope(responseObject));
})

export const signupController = asyncHandler(async(req,res) => {

    if(!req.user) throw new BadRequestError("User data invalid");
    const createdUser = signupUser(req.user as CreateUserType);
    const responseObject = {
        state: "success" as const,
        data: {
            user: createdUser
        }
    }
    res.status(201).json(responseEnvelope(responseObject));
})

export const logoutController = asyncHandler(async(req,res) => {
    
    const { authorization } = req.headers;
    // Blacklist accessToken
    await logoutUser(authorization);
    const responseObject = {
        state: "success" as const,
        data: {}
    }
    res.clearCookie("refreshToken",cookieOptions(Number(env.REFRESH_TOKEN_EXPIRED),"/"));
    res.status(200).json(responseEnvelope(responseObject));
})

export const refreshController = asyncHandler(async(req,res) => {
    
    if(!req.user) throw new UnauthorizedError("Unauthenticated");
    const user = req.user as JwtPayload;
    const payload = { id: user.id,jwtid: user.jwtid };
    // RefreshToken rotation
    const rotatedRefreshToken = createToken(payload,env.REFRESH_TOKEN_SECRET,Number(env.REFRESH_TOKEN_EXPIRED));
    const accessToken = createToken(payload,env.ACCESS_TOKEN_SECRET,Number(env.ACCESS_TOKEN_EXPIRED));
    const responseObject = {
        state: "success" as const,
        data: {
            accessToken
        }
    }
    res.cookie("refreshToken",rotatedRefreshToken,cookieOptions(Number(env.REFRESH_TOKEN_EXPIRED),"/"));
    res.status(200).json(responseEnvelope(responseObject));
})