
const Header = () => {
  return (
      <header className="fixed top-0 left-0 right-0 bg-black w-full p-5 flex justify-between items-center shadow-md z-50">
         <div>
           <h1 className="text-white font-bold text-2xl">Quiz.com</h1>
         </div>
         <div className="flex gap-2 items-center text-white">
           <p className="hover:text-amber-200 transition-colors duration-300 cursor-pointer">Sign Up</p>
           <span>|</span>
           <p className="hover:text-amber-200 transition-colors duration-300 cursor-pointer">Login</p>
         </div>
      </header>
  )
}

export default Header