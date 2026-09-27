import { Routes, Route } from "react-router-dom";

import AuthLayout from "./_auth/AuthLayout";
import SigninForm from "./_auth/forms/SigninForm";
import SignupForm from "./_auth/forms/SignupForm";
import RootLayout from "./_root/RootLayout";

import {
  Home,
  Explore,
  Saved,
  CreatePost,
  Profile,
  UpdateProfile,
  EditPost,
  PostDetails,
  LikedPosts,
  AllUsers,
} from "./_root/pages";

import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "@/components/ui/sonner";

import "./global.css";

const App = () => {
  return (
    <main className="flex h-screen">
      <AuthProvider>
        <Routes>
          {/* ── Public / Auth routes ── */}
          <Route element={<AuthLayout />}>
            <Route path="/sign-in" element={<SigninForm />} />
            <Route path="/sign-up" element={<SignupForm />} />
          </Route>

          {/* ── Private / Root routes ── */}
          <Route element={<RootLayout />}>
            <Route index element={<Home />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/saved" element={<Saved />} />
            <Route path="/all-users" element={<AllUsers />} />
            <Route path="/create-post" element={<CreatePost />} />
            <Route path="/update-post/:id" element={<EditPost />} />
            <Route path="/posts/:id" element={<PostDetails />} />
            <Route path="/profile/:id/*" element={<Profile />} />
            <Route path="/update-profile/:id" element={<UpdateProfile />} />
            <Route path="/liked-posts" element={<LikedPosts />} />
          </Route>
        </Routes>
        <Toaster />
      </AuthProvider>
    </main>
  );
};

export default App;