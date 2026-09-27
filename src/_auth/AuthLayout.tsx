import { Outlet, Navigate } from "react-router-dom";
import { useUserContext } from "@/context/AuthContext";

export default function AuthLayout() {
  const { isAuthenticated } = useUserContext();

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="auth-layout">
      {/* ── LEFT: cinematic brand panel ── */}
      <div className="auth-hero">
        {/* Atmospheric background image */}
        <div
          className="auth-hero__bg"
          style={{
            backgroundImage: "url('/assets/images/auth-hero-bg.jpg')",
          }}
        />

        {/* Dark gradient overlay for readability */}
        <div className="auth-hero__overlay" />

        {/* Floating glow orbs - purely CSS, lightweight */}
        <div className="auth-hero__glow auth-hero__glow--1" />
        <div className="auth-hero__glow auth-hero__glow--2" />

        {/* Content */}
        <div className="auth-hero__content">
          {/* Brand */}
          <div className="auth-hero__brand">
            <img
              src="/assets/images/logo.svg"
              alt="Anvaya"
              className="auth-hero__logo"
            />
          </div>

          {/* Headline */}
          <div className="auth-hero__headline">
            <h1 className="auth-hero__title">
              Share moments.<br />
              <span className="auth-hero__title-accent">Discover people.</span>
            </h1>
            <p className="auth-hero__subtitle">
              A space where your stories matter and every connection is genuine.
            </p>
          </div>

          {/* Floating feature pills */}
          <div className="auth-hero__pills">
            <div className="auth-pill">
              <span className="auth-pill__dot auth-pill__dot--purple" />
              Real connections
            </div>
            <div className="auth-pill">
              <span className="auth-pill__dot auth-pill__dot--blue" />
              Visual stories
            </div>
            <div className="auth-pill">
              <span className="auth-pill__dot auth-pill__dot--indigo" />
              Your world
            </div>
          </div>

          {/* Footer note */}
          <p className="auth-hero__footer-note">
            Join thousands sharing their world every day.
          </p>
        </div>
      </div>

      {/* ── RIGHT: auth form panel ── */}
      <div className="auth-form-panel">
        <div className="auth-form-panel__inner">
          {/* Mobile-only logo */}
          <div className="auth-form-panel__mobile-logo">
            <img src="/assets/images/logo.svg" alt="Anvaya" />
          </div>
          <Outlet />
        </div>
      </div>
    </div>
  );
}