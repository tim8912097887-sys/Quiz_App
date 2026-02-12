import v from "validator";
import * as z from "zod";

export const CreateUserSchema = z.object({
    username: z.string("Username must be a string")
               .min(2,"Username at least two character")
               .max(60,"Username at most sixty character")
               .trim()
               .regex(/^[A-Za-z0-9_]+$/,"Username can only contain letters, numbers, and underscores")
               // Format the username 
               .toLowerCase()
               .transform((val) => {
                   const stripedString = '\'`"\\\\/<>&';
                   return v.blacklist(val,stripedString);
               }),
    email: z.email("Invalid Email").trim().toLowerCase(),
    password: z.string()
               .min(8,"Password at least eight character")
               .max(50,"Password at most fifty character")
               .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{6,}$/,"Password should include small and big letter and number and one special character"),
    confirmPassword: z.string()
               .min(8,"ConfirmPassword at least eight character")
               .max(50,"ConfirmPassword at most fifty character")
               .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{6,}$/,"Password should include small and big letter and number and one special character"),
}).refine((user) => {
    return user.password===user.confirmPassword
},{
    error: "Password didn't match",
    path: ["ConfirmPassword"],
    abort: true
})

export type CreateUserType = z.infer<typeof CreateUserSchema>;