import type { CreateUserType } from "../../schemas/auth/createUser";
import type { LoginUserType } from "../../schemas/auth/loginUser";
import { axiosHandler, type LoginReturn, type SignupReturn } from "../../utilities/axiosHandler";
import { authAxios } from "./authAxios";

export const loginUser = axiosHandler((data: LoginUserType) => {
     return authAxios.post<LoginReturn>("/login",data);
})

export const signupUser = axiosHandler((data: CreateUserType) => {
     return authAxios.post<SignupReturn>("/signup",data);
})