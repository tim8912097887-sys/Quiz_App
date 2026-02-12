import Header from "./components/layout/Header"
import Login from "./pages/Login"
import SignUp from "./pages/SignUp"


function App() {

  return (
    <>
      <Header/>
      <div className="w-full h-dvh bg-amber-200 flex justify-center items-center">
         <SignUp/>
      </div>
    </>
  )
}

export default App
