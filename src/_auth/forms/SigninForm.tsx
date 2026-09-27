import { useState } from "react";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { SigninValidation } from "@/lib/validation";
import { useSignInAccount } from "@/lib/react-query/queries";
import { useUserContext } from "@/context/AuthContext";

const SigninForm = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const { checkAuthUser, isLoading: isUserLoading } = useUserContext();

  const {
    mutateAsync: signInAccount,
    isPending: isSigningIn,
  } = useSignInAccount();

  const form = useForm<z.infer<typeof SigninValidation>>({
    resolver: zodResolver(SigninValidation),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleSignin = async (user: z.infer<typeof SigninValidation>) => {
    try {
      const session = await signInAccount(user);

      if (!session) {
        toast.error("Login failed. Please check your email and password.");
        return;
      }

      const isLoggedIn = await checkAuthUser();

      if (isLoggedIn) {
        form.reset();
        navigate("/");
      } else {
        toast.error("Failed to load user profile. Please try again.");
      }
    } catch (error: unknown) {
      const err = error as { message?: string };
      console.error(error);
      toast.error(err?.message || "Login failed. Please check your email and password.");
    }
  };

  const isLoading = isSigningIn || isUserLoading;

  return (
    <Form {...form}>
      <div className="auth-form">
        {/* Heading */}
        <div className="auth-form__header">
          <h2 className="auth-form__title">Welcome back</h2>
          <p className="auth-form__subtitle">
            Sign in to continue your journey
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={form.handleSubmit(handleSignin)}
          className="auth-form__fields"
        >
          {/* Email */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="auth-field">
                <FormLabel className="auth-field__label">
                  Email address
                </FormLabel>
                <FormControl>
                  <div className="auth-field__input-wrap">
                    <span className="auth-field__icon">
                      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                      </svg>
                    </span>
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      className="auth-input auth-input--with-icon"
                      autoComplete="email"
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage className="auth-field__error" />
              </FormItem>
            )}
          />

          {/* Password */}
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem className="auth-field">
                <FormLabel className="auth-field__label">
                  Password
                </FormLabel>
                <FormControl>
                  <div className="auth-field__input-wrap">
                    <span className="auth-field__icon">
                      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                      </svg>
                    </span>
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="auth-input auth-input--with-icon auth-input--password"
                      autoComplete="current-password"
                      {...field}
                    />
                    <button
                      type="button"
                      className="auth-field__toggle"
                      onClick={() => setShowPassword((p) => !p)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                        </svg>
                      ) : (
                        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </FormControl>
                <FormMessage className="auth-field__error" />
              </FormItem>
            )}
          />

          {/* Submit */}
          <Button
            type="submit"
            className="auth-submit-btn"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="auth-submit-btn__loading">
                <span className="auth-spinner" />
                Signing in…
              </span>
            ) : (
              <span className="auth-submit-btn__text">
                Sign in
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </span>
            )}
          </Button>

          {/* Divider */}
          <div className="auth-divider">
            <span className="auth-divider__line" />
            <span className="auth-divider__text">new to anvaya?</span>
            <span className="auth-divider__line" />
          </div>

          {/* Nav to signup */}
          <Link to="/sign-up" className="auth-alt-btn">
            Create your account
          </Link>
        </form>
      </div>
    </Form>
  );
};

export default SigninForm;