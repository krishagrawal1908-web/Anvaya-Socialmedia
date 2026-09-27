import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";

import type { INavLink } from "@/types";
import { sidebarLinks } from "@/constants";
import { Loader } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { useSignOutAccount } from "@/lib/react-query/queries";
import { useUserContext, INITIAL_USER } from "@/context/AuthContext";

const LeftSidebar = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { user, setUser, setIsAuthenticated, isLoading } = useUserContext();

  const { mutate: signOut } = useSignOutAccount();

  const handleSignOut = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault();
    signOut();
    setIsAuthenticated(false);
    setUser(INITIAL_USER);
    navigate("/sign-in");
  };

  return (
    <nav className="hidden md:flex px-6 py-8 flex-col justify-between min-w-[270px] w-72 bg-dark-2/95 border-r border-white/[0.06] backdrop-blur-xl h-screen sticky top-0">
      <div className="flex flex-col gap-8">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group px-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary-500 to-violet-500 flex items-center justify-center shadow-lg shadow-primary-500/30 group-hover:scale-105 transition-transform duration-200">
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <circle cx="12" cy="12" r="9" strokeWidth="2" />
              <circle cx="12" cy="12" r="4" strokeWidth="2" />
              <path strokeWidth="2" d="M12 3v2M12 19v2M3 12h2M19 12h2" />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-extrabold tracking-tight text-white group-hover:text-primary-500 transition-colors">
              Anvaya
            </span>
            <span className="text-[10px] uppercase tracking-wider text-light-4 font-semibold">
              Social Community
            </span>
          </div>
        </Link>

        {/* Current User Card */}
        {isLoading || !user.email ? (
          <div className="h-16 flex items-center justify-center">
            <Loader />
          </div>
        ) : (
          <Link
            to={`/profile/${user.id}`}
            className="flex items-center gap-3 p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] hover:border-white/[0.12] transition-all duration-200 group"
          >
            <div className="relative shrink-0">
              <img
                src={user.imageUrl || "/assets/icons/profile-placeholder.svg"}
                alt="profile"
                className="h-11 w-11 rounded-full object-cover ring-2 ring-primary-500/30 group-hover:ring-primary-500/70 transition-all"
                onError={(e) => {
                  e.currentTarget.src = "/assets/icons/profile-placeholder.svg";
                }}
              />
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-dark-2" />
            </div>
            <div className="flex flex-col min-w-0">
              <p className="text-sm font-bold text-white group-hover:text-primary-500 transition-colors truncate">
                {user.name}
              </p>
              <p className="text-xs text-light-3 truncate">@{user.username}</p>
            </div>
          </Link>
        )}

        {/* Nav Links */}
        <ul className="flex flex-col gap-1.5">
          {sidebarLinks.map((link: INavLink) => {
            const isActive = pathname === link.route;

            return (
              <li key={link.label}>
                <NavLink
                  to={link.route}
                  className={`flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-gradient-to-r from-primary-500 to-violet-600 text-white shadow-lg shadow-primary-500/25 font-semibold"
                      : "text-light-2 hover:text-white hover:bg-white/[0.05]"
                  }`}
                >
                  <img
                    src={link.imgURL}
                    alt={link.label}
                    className={`w-5 h-5 transition-transform duration-200 ${
                      isActive ? "invert-white scale-105" : "opacity-70 group-hover:opacity-100"
                    }`}
                  />
                  <span>{link.label}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Logout Action */}
      <Button
        variant="ghost"
        className="flex items-center justify-start gap-4 px-4 py-3 rounded-xl text-light-3 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all duration-200 w-full"
        onClick={(e) => handleSignOut(e)}
      >
        <img
          src="/assets/icons/logout.svg"
          alt="logout"
          className="w-5 h-5 opacity-70 group-hover:opacity-100"
        />
        <span className="text-sm font-medium">Log out</span>
      </Button>
    </nav>
  );
};

export default LeftSidebar;