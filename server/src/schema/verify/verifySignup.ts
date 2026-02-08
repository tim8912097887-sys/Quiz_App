import * as z from "zod";

export const VerifySignupSchema = z.object({
    email: z.email("Invalid Email").toLowerCase(),
    otp: z.number().min(100000,"Minimal number is 100000").max(999999,"Maximize number is 999999")
})

export type VerifySignupType = z.infer<typeof VerifySignupSchema>;