import { useReducer } from "react"
import type { CreateUserType } from "../../schemas/auth/createUser"
import type { LoginUserType } from "../../schemas/auth/loginUser"
import Button from "../common/Button"
import FormField from "./FormField"

type Props = {
    isLogin: boolean
    title: string
    btn_text: string
    loading: boolean
    error: string
    onLogin?: (data: LoginUserType) => Promise<void>
    onSignup?: (data: CreateUserType) => Promise<void> 
}

type State = {
  username: string
  email: string
  password: string
  confirmPassword: string
}

type PayloadType = "username" | "email" | "password" | "confirmPassword";

type Payload = {
    type: PayloadType
    value: string
}

const reducer = (state: State,payload: Payload) => {
     switch (payload.type) {
      case "username":
        return { ...state,username: payload.value };
      case "password":
        return { ...state,password: payload.value };
      case "email":
        return { ...state,email: payload.value };
      case "confirmPassword":
        return { ...state,confirmPassword: payload.value };
      default:
        return state;
     }
}

const Form = ({ isLogin,title,btn_text,loading,error,onLogin,onSignup }: Props) => {

  const [state,dispatch] = useReducer(reducer,{ username: "",email: "",password: "",confirmPassword: "" });

  const setFormValue = (e: React.ChangeEvent<HTMLInputElement>) => dispatch({ type: e.target.name as PayloadType,value: e.target.value });
  
  const handleSubmit = async(e: React.SubmitEvent<HTMLFormElement>) => {
      e.preventDefault();
      if(isLogin && onLogin) {
         const loginInfo = { email: state.email,password: state.password };
         await onLogin(loginInfo);
      }
      if(!isLogin && onSignup) {
         await onSignup(state);
      }
  }
  return (
        <div className="rounded p-6 border-8">
            <div className="text-center w-full mb-5">
              <h2 className="text-black text-3xl font-bold">{title}</h2>
            </div>
            <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
              {!isLogin && <FormField value={state.username} onChange={setFormValue} typeString="text" labelString="username" text="Username:" />}
              <FormField value={state.email} onChange={setFormValue} typeString="email" labelString="email" text="Email:"/>
              <FormField value={state.password} onChange={setFormValue} typeString="password" labelString="password" text="Password:" />
              {!isLogin && <FormField value={state.confirmPassword} onChange={setFormValue} typeString="password" labelString="confirmPassword" text="ConfirmPassword:" />}
             <Button disable={loading} classString="w-full py-3 bg-blue-500 text-white text-2xl font-semibold hover:bg-blue-400 rounded cursor-pointer" btn_Type="submit" text={btn_text} />
            </form>
            {error && <p className="text-sm text-red-500">{error}</p>}
         </div>
  )
}

export default Form