import { useLayoutEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import gsap from "gsap";
import { useAuth } from "../AuthContext";
import heroImage from "../assets/aubrey-odom-ITzfgP77DTg-unsplash.jpg";
import {
  BD_PHONE_PATTERN,
  EMAIL_PATTERN,
  NID_PATTERN,
  PASSWORD_PATTERN,
} from "../utils/validation";

export default function SignupPage() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState("");
  const frameRef = useRef(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".auth-brand, .auth-kicker, .auth-panel h1, .auth-subtitle, .auth-content .form",
        { autoAlpha: 0, y: 14 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.6,
          ease: "power2.out",
          stagger: 0.05,
        }
      );

      gsap.fromTo(
        ".auth-visual",
        { autoAlpha: 0, scale: 1.02 },
        { autoAlpha: 1, scale: 1, duration: 0.8, ease: "power2.out" }
      );
    }, frameRef);

    return () => ctx.revert();
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  async function onSubmit(formData) {
    setServerError("");
    try {
      await signup(formData);
      navigate("/login");
    } catch (err) {
      setServerError(err.message);
    }
  }

  return (
    <div className="auth-shell" style={{ "--auth-hero-image": `url(${heroImage})` }}>
      <div className="auth-frame" ref={frameRef}>
        <section className="auth-panel">
          <header className="auth-topbar">
            <Link to="/" className="auth-brand" aria-label="Rent Ease BD">
              <img
                className="auth-brand-icon"
                src="/icons8-house-48.png"
                alt=""
                aria-hidden="true"
              />
              <span>Rent Ease BD.</span>
            </Link>
          </header>

          <div className="auth-content">
            <p className="auth-kicker">GET STARTED</p>
            <h1>
              Create account<span className="auth-title-dot">.</span>
            </h1>
            <p className="auth-subtitle">
              Already have an account? <Link to="/login">Sign in</Link>
            </p>

            <form className="form" onSubmit={handleSubmit(onSubmit)}>
              <div className="field">
                <label>Full Name</label>
                <input
                  placeholder="Alex Morgan"
                  {...register("name", {
                    required: "Name is required",
                  })}
                />
                {errors.name && <p className="field-error">{errors.name.message}</p>}
              </div>

              <div className="field">
                <label>Email Address</label>
                <input
                  type="email"
                  placeholder="alex@example.com"
                  autoComplete="email"
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: EMAIL_PATTERN,
                      message: "Please enter a valid email address.",
                    },
                  })}
                />
                {errors.email && <p className="field-error">{errors.email.message}</p>}
              </div>

              <div className="form-row">
                <div className="field">
                  <label>Phone</label>
                  <input
                    type="tel"
                    placeholder="+88017XXXXXXXX"
                    inputMode="numeric"
                    {...register("phone", {
                      required: "Phone is required",
                      pattern: {
                        value: BD_PHONE_PATTERN,
                        message: "Use a valid Bangladeshi mobile number.",
                      },
                    })}
                  />
                  {errors.phone && <p className="field-error">{errors.phone.message}</p>}
                </div>

                <div className="field">
                  <label>NID</label>
                  <input
                    placeholder="National ID"
                    inputMode="numeric"
                    {...register("NID", {
                      required: "NID is required",
                      pattern: {
                        value: NID_PATTERN,
                        message: "National ID must contain 10 to 17 digits.",
                      },
                    })}
                  />
                  {errors.NID && <p className="field-error">{errors.NID.message}</p>}
                </div>
              </div>

              <div className="form-row">
                <div className="field">
                  <label>Password</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    autoComplete="new-password"
                    {...register("password", {
                      required: "Password is required",
                      minLength: {
                        value: 6,
                        message: "Password must be between 6 and 20 characters.",
                      },
                      maxLength: {
                        value: 20,
                        message: "Password must be between 6 and 20 characters.",
                      },
                      pattern: {
                        value: PASSWORD_PATTERN,
                        message: "Password must be between 6 and 20 characters.",
                      },
                    })}
                  />
                  {errors.password && <p className="field-error">{errors.password.message}</p>}
                </div>

                <div className="field">
                  <label>Account Role</label>
                  <select {...register("role", { required: "Role is required" })}>
                    <option value="tenant">Tenant</option>
                    <option value="landlord">Landlord</option>
                  </select>
                  {errors.role && <p className="field-error">{errors.role.message}</p>}
                </div>
              </div>

              {serverError && <p className="banner-error">{serverError}</p>}

              <button className="btn auth-submit" type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating account…" : "Create Account"}
              </button>
            </form>
          </div>
        </section>

        <aside className="auth-visual" aria-hidden="true">
          <div className="auth-visual-overlay" />
        </aside>
      </div>
    </div>
  );
}
