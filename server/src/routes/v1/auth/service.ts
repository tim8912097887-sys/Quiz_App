import { JwtPayload } from "jsonwebtoken";
import { ServerConflictError } from "@custom/error/serverConflict.js";
import { comparePassword, hashPassword } from "@utilities/password.js";
import { createUniqueUser, dbQuery } from "@db/db.js";
import { LoginUserType } from "@schema/user/login.js";
import { CreateUserType } from "@schema/user/signup.js";
import { verifyToken } from "@utilities/token.js";
import { env } from "@configs/env.js";
import { setCache } from "@db/cachQuery.js";
import { ServerError } from "@custom/error/server.js";

export const loginUser = async({ email,password }: LoginUserType) => {
    // Check accout existence
    let queryString = `
      SELECT id,username,email,password 
      FROM users
      WHERE email = $1
    `
    let value = [email];
    const result = await dbQuery<string>("Get User with email",queryString,value);
    if(!result.rowCount) throw new ServerConflictError("Email or password is not correct");
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