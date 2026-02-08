import * as z from "zod";

export const GetOtpSchema = z.object({
    email: z.email("Invalid Email").toLowerCase(),
})

export type GetOtpType = z.infer<typeof GetOtpSchema>;