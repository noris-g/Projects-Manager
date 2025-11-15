import { useAuth0 } from "@auth0/auth0-react";

export default function TopBar({ activePage }) {
  const { user, loginWithRedirect, logout, isAuthenticated } = useAuth0();

  return (
    <header className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center">
      <h1 className="text-lg font-semibold capitalize">
        {activePage.replace("-", " ")}
      </h1>

      <div className="flex items-center gap-4 text-sm">

        {/* -------------------- NOT LOGGED IN -------------------- */}
        {!isAuthenticated && (
          <>
            <button
              onClick={() => loginWithRedirect()}
              className="px-3 py-1.5 rounded-md bg-slate-200 hover:bg-slate-300"
            >
              Log in
            </button>

            <button
              onClick={() =>
                loginWithRedirect({
                  authorizationParams: { screen_hint: "signup" },
                })
              }
              className="px-3 py-1.5 rounded-md bg-sky-500 text-white hover:bg-sky-600"
            >
              Sign up
            </button>
          </>
        )}

        {/* -------------------- LOGGED IN -------------------- */}
        {isAuthenticated && (
          <>
            {user?.picture && (
              <img
                src={user.picture}
                alt="avatar"
                className="w-8 h-8 rounded-full"
              />
            )}
            <span>{user?.name || user?.email}</span>

            <button
              onClick={() =>
                logout({ logoutParams: { returnTo: window.location.origin } })
              }
              className="px-3 py-1.5 rounded-md bg-slate-200 hover:bg-slate-300"
            >
              Log out
            </button>
          </>
        )}
      </div>
    </header>
  );
}
