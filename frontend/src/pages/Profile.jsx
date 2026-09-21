import { useEffect, useState } from "react";
import { User, Mail, Phone, Image } from "lucide-react";
import { updateProfile } from "../services/userApi.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../components/common/Toast.jsx";

export default function Profile() {
  const { user, updateUser } = useAuth();
  const { addToast } = useToast();
  const [form, setForm] = useState({ name: "", phone: "", avatar: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) setForm({ name: user.name || "", phone: user.phone || "", avatar: user.avatar || "" });
  }, [user]);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await updateProfile(form);
      updateUser(res.data.user);
      addToast("Profile updated", "success");
    } catch (err) {
      addToast(err.response?.data?.message || "Update failed", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="section">
      <div className="container max-w-3xl">
        <h1 className="section-title">Profile</h1>
        <form onSubmit={submit} className="card p-4 sm:p-6 space-y-4">
          <div className="input-group">
            <label className="input-label">Full Name</label>
            <div className="input-icon"><User className="icon" size={18} /><input required className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          </div>
          <div className="input-group">
            <label className="input-label">Email</label>
            <div className="input-icon"><Mail className="icon" size={18} /><input disabled className="input bg-slate-50" value={user?.email || ""} /></div>
          </div>
          <div className="input-group">
            <label className="input-label">Phone</label>
            <div className="input-icon"><Phone className="icon" size={18} /><input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
          </div>
          <div className="input-group">
            <label className="input-label">Avatar URL</label>
            <div className="input-icon"><Image className="icon" size={18} /><input className="input" value={form.avatar} onChange={(e) => setForm({ ...form, avatar: e.target.value })} /></div>
          </div>
          <button type="submit" disabled={loading} className="btn-primary py-2.5 sm:py-3">{loading ? "Saving..." : "Save Changes"}</button>
        </form>
      </div>
    </div>
  );
}
