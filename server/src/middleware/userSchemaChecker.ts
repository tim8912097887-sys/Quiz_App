import { ZodObject } from "zod";
import { RequestHandler } from "express";
import { asyncHandler } from "@utilities/asyncHandler.js";
import { CreateUserType } from "@schema/user/signup.js";
import { LoginUserType } from "@schema/user/login.js";
import { BadRequestError } from "@custom/error/badrequest.js";

export const userSchemaChecker = (schema: ZodObject): RequestHandler => asyncHandler((req,_,next) => {
      const result = schema.safeParse(req.body);
      if(!result.success) throw new BadRequestError(result.error.issues[0].message);
      // Attach validated data
      req.user = result.data as (CreateUserType | LoginUserType);
      return next();
})