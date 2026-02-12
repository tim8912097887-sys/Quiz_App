import { useState } from "react"
import { loginUser } from "../api/auth/authCall"
import Form from "../components/form/Form"
import type { LoginUserType } from "../schemas/auth/loginUser"

const Login = () => {

  const [loading,setLoading] = useState(false);
  const [error,setError] = useState("");

  let isCall = false;
  const handleLogin = async(user: LoginUserType) => {
    if(isCall || loading) return;
    isCall = true;
    setLoading(true);
    try {
      await loginUser(user);
      console.log("Success"); 
    } catch (error: unknown) {
      if(error instanceof Error) setError(error.message);
    } finally {
      setLoading(false);
    }
  }
  return (
    <Form onLogin={handleLogin} error={error} loading={loading} isLogin={true} btn_text="Login" title="Login Form" />
  )
}

export default Login