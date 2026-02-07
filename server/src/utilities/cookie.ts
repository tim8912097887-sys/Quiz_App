import { env } from "@configs/env.js"

export const cookieOptions = (maxAge: number,path: string) => {
     return {
                sameSite: "lax" as const,
                httpOnly: true,
                maxAge,
                secure: env.NODE_ENV==="production",
                path,
     }
}