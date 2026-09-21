import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../components/common/Toast.jsx";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "" });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(form.name, form.email, form.password, form.phone);
      addToast("Account created successfully!", "success");
      navigate("/");
    } catch (err) {
      addToast(err.response?.data?.message || "Registration failed", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="text-center mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">Create Account</h2>
          <p className="text-sm text-slate-500 mt-1">Join us and start ordering</p>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <div className="input-group">
            <label className="input-label">Full Name</label>
            <input type="text" required className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="input-group">
            <label className="input-label">Email</label>
            <input type="email" required className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div className="input-group">
            <label className="input-label">Phone</label>
            <input type="tel" className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div className="input-group">
            <label className="input-label">Password</label>
            <input type="password" required minLength={6} className="input" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full py-2.5 sm:py-3">{loading ? "Creating account..." : "Register"}</button>
        </form>
        <p className="text-center text-sm text-slate-500 mt-4">Already have an account? <Link to="/login" className="text-orange-500 font-medium hover:text-orange-600 transition-colors">Login</Link></p>
      </div>
    </div>
  );
}
