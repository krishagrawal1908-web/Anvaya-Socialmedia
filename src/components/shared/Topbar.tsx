import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

import { Button } from "../ui/button";
import { useUserContext } from "@/context/AuthContext";
import { useSignOutAccount } from "@/lib/react-query/queries";

const Topbar = () => {
  const navigate = useNavigate();
  const { user } = useUserContext();
  const { mutate: signOut, isSuccess } = useSignOutAccount();

  useEffect(() => {
    if (isSuccess) navigate(0);
  }, [isSuccess, navigate]);

  return (
    <header className="sticky top-0 z-50 md:hidden bg-dark-2/95 backdrop-blur-xl border-b border-white/[0.06] w-full px-5 py-3">
      <div className="flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary-500 to-violet-500 flex items-center justify-center shadow-md shadow-primary-500/20">
            <svg
              className="w-4 h-4 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <circle cx="12" cy="12" r="9" strokeWidth="2" />
              <circle cx="12" cy="12" r="4" strokeWidth="2" />
            </svg>
          </div>
          <span className="text-lg font-extrabold tracking-tight text-white">
            Anvaya
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            className="p-2 h-auto rounded-xl hover:bg-rose-500/10 hover:text-rose-400 text-light-3 transition-colors"
            onClick={() => signOut()}
            title="Sign out"
          >
            <img
              src="/assets/icons/logout.svg"
              alt="logout"
              className="w-5 h-5 opacity-80"
            />
          </Button>

          <Link to={`/profile/${user.id}`} className="relative shrink-0">
            <img
              src={user.imageUrl || "/assets/icons/profile-placeholder.svg"}
              alt="profile"
              className="h-8 w-8 rounded-full object-cover ring-2 ring-primary-500/30"
              onError={(e) => {
                e.currentTarget.src = "/assets/icons/profile-placeholder.svg";
              }}
            />
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Topbar;