import { v4 as uuidv4 } from 'uuid';
import { JwtPayload } from 'jsonwebtoken';
import { BadRequestError } from "@custom/error/badrequest.js";
import { asyncHandler } from "@utilities/asyncHandler.js";
import { createOtp, loginUser, logoutUser, signupUser, verifyOtp } from "./service.js";
import { responseEnvelope } from "@utilities/responseEnvelope.js";
import { CreateUserType } from "@schema/user/signup.js";
import { createToken } from "@utilities/token.js";
import { env } from "@configs/env.js";
import { cookieOptions } from "@utilities/cookie.js";
import { UnauthorizedError } from '@custom/error/unauthorized.js';
import { LoginUserType } from '@schema/user/login.js';
import { sendEmail } from '@utilities/sendEmail.js';
import { generateOTP } from '@utilities/otp.js';
import { ServerError } from '@custom/error/server.js';
import { VerifySignupType } from '@/schema/verify/verifySignup.js';

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
    const otp = generateOTP();
    // Send verification email
    const result = await sendEmail(createdUser.email,"Verify Success Signup",`<p>Your OTP code: ${otp}</p>`);
    if(result) throw new ServerError("Fail to send the email");
    await createOtp(otp);
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