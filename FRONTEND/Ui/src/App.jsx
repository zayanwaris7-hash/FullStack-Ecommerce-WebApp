import { Show, SignInButton, SignUpButton, UserButton ,SignOutButton} from '@clerk/react'

function App() {
  return (
    <header className="flex items-center justify-between px-8 py-4 bg-white border-b border-slate-200 shadow-sm">
      {/* Logo/Brand Area */}
      <div className="text-xl font-bold text-indigo-600">
        MyBrand
      </div>

      <nav className="flex items-center gap-4">
        <Show when="signed-out">
          {/* Sign In Button */}
          <SignInButton mode="modal">
            <button className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-indigo-600 transition-colors">
              Log In
            </button>
          </SignInButton>

          {/* Sign Up Button (The CTA) */}
          <SignUpButton mode="modal">
            <button className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-all shadow-md active:scale-95">
              Get Started
            </button>
          </SignUpButton>
        </Show>

        <Show when="signed-in">
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-500">Welcome back!</span>
            <UserButton 
              appearance={{
                elements: {
                  userButtonAvatarBox: "w-10 h-10 border-2 border-indigo-100"
                }
              }}
            />
          </div>
          <div className="flex items-center gap-6">
            {/* The Sign Out Button */}
            <SignOutButton>
              <button className="text-sm font-medium text-red-500 hover:text-red-700 transition-colors">
                Sign Out
              </button>
            </SignOutButton>
          </div>
        </Show>
      </nav>
    </header>
  )
}

export default App