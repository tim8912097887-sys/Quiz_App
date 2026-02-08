import * as z from "zod";

export const PasswordResetSchema = z.object({
    email: z.email("Invalid Email").toLowerCase(),
    password: z.string()
               .min(8,"Password at least eight character")
               .max(50,"Password at most fifty character")
               .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/,"Password should include small and big letter and number and one special character"),
    otp: z.number().min(100000,"Minimal number is 100000").max(999999,"Maximize number is 999999")
})

export type PasswordResetType = z.infer<typeof PasswordResetSchema>;