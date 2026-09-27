import { Outlet, Navigate } from "react-router-dom";

import Topbar from "@/components/shared/Topbar";
import Bottombar from "@/components/shared/Bottombar";
import LeftSidebar from "@/components/shared/LeftSidebar";
import { useUserContext } from "@/context/AuthContext";
import { useRealtimeSync } from "@/hooks/useRealtimeSync";

const RootLayout = () => {
  const { isAuthenticated, isLoading } = useUserContext();

  // Enable live real-time synchronization across Appwrite databases
  useRealtimeSync();

  if (!isLoading && !isAuthenticated) {
    return <Navigate to="/sign-in" />;
  }

  return (
    <div className="w-full md:flex">
      <Topbar />
      <LeftSidebar />

      <section className="flex flex-1 h-full">
        <Outlet />
      </section>

      <Bottombar />
    </div>
  );
};

export default RootLayout;