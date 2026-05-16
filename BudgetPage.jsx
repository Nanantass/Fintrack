import { useEffect, useState } from 'react';
import api from '../utils/api';
import { formatRupiah, getCurrentPeriode } from '../utils/format';
import { Plus, Trash2, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

const emptyForm = { namaAnggaran: '', limitBulanan: '', periode: getCurrentPeriode(), kategoriId: '' };

export default function BudgetPage() {
  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchAll = async () => {
    const [bRes, cRes] = await Promise.all([
      api.get('/budgets'),
      api.get('/categories/expense')
    ]);
    setBudgets(bRes.data);
    setCategories(cRes.data);
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        limitBulanan: parseFloat(form.limitBulanan),
        kategoriId: form.kategoriId ? parseInt(form.kategoriId) : null
      };
      await api.post('/budgets', payload);
      setShowModal(false);
      setForm(emptyForm);
      fetchAll();
    } catch (err) {
      alert(err.response?.data?.error || 'Gagal menyimpan budget');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Hapus budget ini?')) return;
    await api.delete(`/budgets/${id}`);
    fetchAll();
  };

  const getStatus = (b) => {
    if (b.overLimit) return { icon: <XCircle size={16} className="text-red-500" />, color: 'bg-red-500', label: 'Melebihi Limit' };
    if (b.warning)   return { icon: <AlertTriangle size={16} className="text-yellow-500" />, color: 'bg-yellow-400', label: 'Hampir Habis' };
    return { icon: <CheckCircle size={16} className="text-green-500" />, color: 'bg-green-500', label: 'Aman' };
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Budget</h1>
          <p className="text-slate-500 text-sm">Atur dan pantau anggaran pengeluaran Anda.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Buat Budget
        </button>
      </div>

      {budgets.length === 0 ? (
        <div className="card text-center py-14 text-slate-400 text-sm">
          Belum ada budget aktif. Buat budget sekarang.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {budgets.map(b => {
            const status = getStatus(b);
            const pct = Math.min(b.persentasePenggunaan, 100);
            return (
              <div key={b.id} className="card space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-slate-800 text-sm">{b.namaAnggaran}</p>
                    <p className="text-xs text-slate-400">{b.categoryName} · {b.periode}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {status.icon}
                    <button onClick={() => handleDelete(b.id)} className="text-slate-300 hover:text-red-400 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>{formatRupiah(b.totalTerpakai)} terpakai</span>
                    <span>{Math.round(b.persentasePenggunaan)}%</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${status.color}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className={`font-medium ${b.overLimit ? 'text-red-500' : b.warning ? 'text-yellow-500' : 'text-green-500'}`}>
                      {status.label}
                    </span>
                    <span className="text-slate-400">Limit: {formatRupiah(b.limitBulanan)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-slate-800 mb-5">Buat Budget Baru</h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1.5">Nama Anggaran</label>
                <input type="text" value={form.namaAnggaran}
                  onChange={e => setForm({ ...form, namaAnggaran: e.target.value })}
                  required placeholder="cth. Budget Makan Maret"
                  className="input-field" />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1.5">Limit Bulanan (Rp)</label>
                <input type="number" min="1" value={form.limitBulanan}
                  onChange={e => setForm({ ...form, limitBulanan: e.target.value })}
                  required placeholder="0" className="input-field" />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1.5">Periode (YYYY-MM)</label>
                <input type="month" value={form.periode}
                  onChange={e => setForm({ ...form, periode: e.target.value })}
                  required className="input-field" />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1.5">Kategori (opsional)</label>
                <select value={form.kategoriId}
                  onChange={e => setForm({ ...form, kategoriId: e.target.value })}
                  className="input-field">
                  <option value="">Semua Kategori</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.categoryName}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">Batal</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1">
                  {saving ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
