import { Link, useLocation } from "react-router-dom";
import { bottombarLinks } from "@/constants";

const Bottombar = () => {
  const { pathname } = useLocation();

  return (
    <nav className="fixed bottom-0 z-50 flex items-center justify-around w-full bg-dark-2/95 backdrop-blur-xl border-t border-white/[0.08] px-3 py-2 md:hidden">
      {bottombarLinks.map((link) => {
        const isActive = pathname === link.route;

        return (
          <Link
            key={link.label}
            to={link.route}
            className={`flex flex-col items-center gap-1 py-1.5 px-3 rounded-2xl transition-all duration-200 ${
              isActive
                ? "bg-primary-500/15 text-primary-500 font-semibold"
                : "text-light-3 hover:text-white"
            }`}
          >
            <img
              src={link.imgURL}
              alt={link.label}
              width={20}
              height={20}
              className={`transition-transform duration-200 ${
                isActive ? "invert-white scale-110" : "opacity-70"
              }`}
            />
            <span className="text-[10px] tracking-tight">{link.label}</span>
          </Link>
        );
      })}
    </nav>
  );
};

export default Bottombar;