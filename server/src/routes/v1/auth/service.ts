// Third party
import { JwtPayload } from "jsonwebtoken";
// Custom
import { ServerError } from "@custom/error/server.js";
import { ServerConflictError } from "@custom/error/serverConflict.js";
import { NotFoundError } from "@custom/error/notFound.js";
import { UnauthorizedError } from "@custom/error/unauthorized.js";
// Utilities
import { comparePassword, hashPassword } from "@utilities/password.js";
import { verifyToken } from "@utilities/token.js";
import { generateOTP } from "@utilities/otp.js";
import { sendEmail } from "@utilities/sendEmail.js";
import { futureDate } from "@utilities/date.js";
// db
import { setCache } from "@db/cachQuery.js";
import { createUniqueUser, dbQuery } from "@db/db.js";
// Schema
import { LoginUserType } from "@schema/user/login.js";
import { CreateUserType } from "@schema/user/signup.js";
import { VerifySignupType } from "@schema/verify/verifySignup.js";
import { PasswordResetType } from "@schema/verify/passwordReset.js";
// Config
import { env } from "@configs/env.js";

export const getUserFromEmail = async(email: string) => {
     // Check accout existence
    const queryString = `
      SELECT id,username,email,password,is_verify
      FROM users
      WHERE email = $1
    `
    const value = [email];
    const result = await dbQuery<string>("Get User with email",queryString,value);
    return result;
}
export const loginUser = async({ email,password }: LoginUserType) => {
    // Check accout existence
    const result = await getUserFromEmail(email);
    if(!result.rowCount) throw new ServerConflictError("Email or password is not correct");
    if(!result.rows[0].is_verify) throw new UnauthorizedError("Account not verify yet");
    const isMatch = await comparePassword(password,result.rows[0].password);
    if(!isMatch) throw new ServerConflictError("Email or password is not correct"); 
    const user = result.rows[0];
    const { password: hashedPassword,...withOutPassword } = user;
    return withOutPassword;
}

export const signupUser = async({ username,email,password }: CreateUserType) => {
 
    const hashedPassword = await hashPassword(password);
    const user = await createUniqueUser(username,email,hashedPassword);
    return user;
}

export const logoutUser = async(authorization: (string | undefined)) => {
    if(authorization) {
        const token = authorization.split(" ")[1];
        if(token) {
            const decode = verifyToken(token,env.ACCESS_TOKEN_SECRET) as (JwtPayload | undefined);
            if(decode) {
                if(decode.exp) {
                    console.log(decode.exp*1000);
                    console.log(Date.now())
                    const duration = decode.exp*1000-Date.now();
                    if(duration>0) {
                       const key = `JwtBlacklist:${decode.jwtid}`
                       const result = await setCache(key,"true",duration);
                       if(!result) throw new ServerError("Fail to logout");
                    }
                }
            }
        }
    }
    return;
}

export const createOtp = async(email: string) => {
    
    const otp = generateOTP();
    // Send verification email
    const sendingResult = await sendEmail(email,"Verify Success Signup",`<p>Your OTP code: ${otp}</p>`);
    if(sendingResult) throw new ServerError("Fail to send the email");
    const expired_at = futureDate(60).toString();
    const value = [otp,expired_at];
    const result = await dbQuery("Insert otp code",`
        INSERT INTO otp (code,expired_at)
        VALUES ($1,$2)    
    `,value);
    if(!result.rowCount) throw new ServerError("Fail to create otp");
    return;
}

export const verifyOtp = async({ email,otp }: VerifySignupType) => {

    const queryString = `
      SELECT expired_at FROM otp 
      WHERE code = $1
    `
    const value = [otp];

    const result = await dbQuery("Select Otp",queryString,value);
    if(!result.rowCount) throw new NotFoundError(`Code ${otp} not exist`);
    const expired_at = Number(result.rows[0].expired_at);
    const currentTime = Date.now();
    if(expired_at<currentTime) {
         const deleteString = `
            DELETE FROM otp
            WHERE code = $1
         `; 
         const deleteValue = [otp];
         const result = await dbQuery("Delete Otp",deleteString,deleteValue);
         if(!result.rowCount) throw new ServerError("Fail to Delete");
         throw new UnauthorizedError("Otp expired");
    } else {
         const updateString = `
            UPDATE users
            SET is_verify = true
            WHERE email = $1
            RETURNING id, username, email
         `
         const  updatedValue = [email];

         const result = await dbQuery("Update user",updateString,updatedValue);
         if(!result.rowCount) throw new ServerError(`Fail to verify`);
         const deleteString = `
            DELETE FROM otp
            WHERE code = $1
         `; 
         const deleteValue = [otp];
         const deleteResult = await dbQuery("Delete Otp",deleteString,deleteValue);
         if(!deleteResult.rowCount) throw new ServerError("Fail to Delete");
         return result.rows[0];
    }
}

export const resetPassword = async({ email,password,otp }: PasswordResetType) => {
    // Check email and otp 
    const checkResult = await getUserFromEmail(email);
    if(!checkResult.rowCount) throw new NotFoundError("User not Found");
    if(!checkResult.rows[0].is_verify) throw new UnauthorizedError("Account not verify yet");
    await verifyOtp({ email,otp });
    // Modify password
    const hashedPassword = await hashPassword(password);
    const queryString = `
      UPDATE users
      SET password = $1
      WHERE email = $2
      RETURNING id, username, email
    `
    const value = [hashedPassword,email];
    const result = await dbQuery("Update password",queryString,value);
    if(!result.rowCount) throw new ServerError("Fail to update password");
    return result.rows[0];
}