import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { TrendingUp } from 'lucide-react';

export default function RegisterPage() {
  const { register } = useAuth();
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form.username, form.email, form.password);
    } catch (err) {
      setError(err.response?.data?.error || 'Registrasi gagal. Coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-slate-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-lg w-full max-w-md p-8">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-9 h-9 bg-teal-600 rounded-xl flex items-center justify-center">
            <TrendingUp size={18} className="text-white" />
          </div>
          <span className="text-xl font-bold text-teal-700">FinTrack</span>
        </div>

        <h1 className="text-2xl font-bold text-slate-800 mb-1">Buat akun baru</h1>
        <p className="text-slate-500 text-sm mb-6">Mulai kelola keuangan Anda dengan lebih terstruktur.</p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1.5">Username</label>
            <input type="text" name="username" value={form.username}
              onChange={handleChange} required minLength={3}
              placeholder="Nama pengguna Anda"
              className="input-field" />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1.5">Email</label>
            <input type="email" name="email" value={form.email}
              onChange={handleChange} required
              placeholder="contoh@email.com"
              className="input-field" />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1.5">Password</label>
            <input type="password" name="password" value={form.password}
              onChange={handleChange} required minLength={6}
              placeholder="Minimal 6 karakter"
              className="input-field" />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full py-3 mt-2">
            {loading ? 'Mendaftarkan...' : 'Daftar'}
          </button>
        </form>

        <p className="text-center text-sm text-slate-500 mt-6">
          Sudah punya akun?{' '}
          <Link to="/login" className="text-teal-600 font-medium hover:underline">Masuk</Link>
        </p>
      </div>
    </div>
  );
}
