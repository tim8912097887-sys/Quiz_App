// Third party
import { v4 as uuidv4 } from 'uuid';
import { JwtPayload } from 'jsonwebtoken';
// Custom
import { BadRequestError } from "@custom/error/badrequest.js";
import { UnauthorizedError } from '@custom/error/unauthorized.js';
// Utilities
import { asyncHandler } from "@utilities/asyncHandler.js";
import { responseEnvelope } from "@utilities/responseEnvelope.js";
import { createToken } from "@utilities/token.js";
import { cookieOptions } from "@utilities/cookie.js";
// Services
import { createOtp, getUserFromEmail, loginUser, logoutUser, resetPassword, signupUser, verifyOtp } from "./service.js";
// Config
import { env } from "@configs/env.js";
// Schema
import { CreateUserType } from "@schema/user/signup.js";
import { LoginUserType } from '@schema/user/login.js';
import { VerifySignupType } from '@schema/verify/verifySignup.js';
import { GetOtpType } from '@schema/verify/getOtp.js';
import { PasswordResetType } from '@schema/verify/passwordReset.js';
import { NotFoundError } from '@/custom/error/notFound.js';

export const loginController = asyncHandler(async(req,res) => {

    if(!req.user) throw new BadRequestError("User data invalid");
    const user = await loginUser(req.user as LoginUserType);
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
    const createdUser = await signupUser(req.user as CreateUserType);
    console.log(createdUser.email);
    await createOtp(createdUser.email);
    const responseObject = {
        state: "success" as const,
        data: {
            user: createdUser
        }
    }
    res.status(201).json(responseEnvelope(responseObject));
})

export const verifyOtpController = asyncHandler(async(req,res) => {
    if(!req.user) throw new BadRequestError("User data invalid");
    const user = req.user as VerifySignupType;
    const updatedUser = await verifyOtp(user);
    res.status(201).json(responseEnvelope({ state: "success",data: { user: updatedUser } }));
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

export const getOtpController = asyncHandler(async(req,res) => {
    
    if(!req.user) throw new BadRequestError("User data invalid");
    const user = req.user as GetOtpType;
    const result = await getUserFromEmail(user.email);
    if(!result.rowCount) throw new NotFoundError("User not exist");
    await createOtp(user.email);
    const responseObject = {
        state: "success" as const,
        data: {}
    }
    res.status(200).json(responseEnvelope(responseObject));
})

export const passwordResetController = asyncHandler(async(req,res) => {
    
    if(!req.user) throw new BadRequestError("User data invalid");
    const user = req.user as PasswordResetType;
    const updatedUser = await resetPassword(user);
    const responseObject = {
        state: "success" as const,
        data: updatedUser
    }
    res.status(200).json(responseEnvelope(responseObject));
})

