import { useState } from "react";
import { signupUser } from "../api/auth/authCall";
import Form from "../components/form/Form"
import type { CreateUserType } from "../schemas/auth/createUser";

const SignUp = () => {

    const [loading,setLoading] = useState(false);
    const [error,setError] = useState("");
  
    let isCall = false;
    const handleSignup = async(user: CreateUserType) => {
      if(isCall || loading) return;
      isCall = true;
      setLoading(true);
      try {
        await signupUser(user);
        console.log("Success"); 
      } catch (error: unknown) {
        if(error instanceof Error) setError(error.message);
      } finally {
        setLoading(false);
      }
    }
  return (
    <Form loading={loading} error={error} onSignup={handleSignup} isLogin={false} btn_text="Sign Up" title="Sign Up Form" />
  )
}

export default SignUp