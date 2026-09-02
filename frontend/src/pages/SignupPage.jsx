import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../AuthContext";

export default function SignupPage() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState("");

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
    <div className="auth-shell">
      <div className="auth-card">
        <h1>Create an account</h1>
        <p className="auth-subtitle">List a property, or find one to rent.</p>

        <form className="form" onSubmit={handleSubmit(onSubmit)}>
          <div className="field">
            <label>Name</label>
            <input {...register("name", { required: "Name is required" })} />
            {errors.name && <p className="field-error">{errors.name.message}</p>}
          </div>

          <div className="field">
            <label>Email</label>
            <input
              type="email"
              {...register("email", { required: "Email is required" })}
            />
            {errors.email && <p className="field-error">{errors.email.message}</p>}
          </div>

          <div className="form-row">
            <div className="field">
              <label>Phone</label>
              <input {...register("phone", { required: "Phone is required" })} />
              {errors.phone && <p className="field-error">{errors.phone.message}</p>}
            </div>

            <div className="field">
              <label>NID</label>
              <input {...register("NID", { required: "NID is required" })} />
              {errors.NID && <p className="field-error">{errors.NID.message}</p>}
            </div>
          </div>

          <div className="field">
            <label>Password</label>
            <input
              type="password"
              {...register("password", { required: "Password is required" })}
            />
            {errors.password && <p className="field-error">{errors.password.message}</p>}
          </div>

          <div className="field">
            <label>I am a</label>
            <select {...register("role", { required: true })}>
              <option value="tenant">Tenant</option>
              <option value="landlord">Landlord</option>
            </select>
          </div>

          {serverError && <p className="banner-error">{serverError}</p>}

          <button className="btn" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Signing up…" : "Sign up"}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
}
