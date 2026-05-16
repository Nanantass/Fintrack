import { useEffect, useState } from 'react';
import api from '../utils/api';
import { formatRupiah, formatDate } from '../utils/format';
import { Plus, Pencil, Trash2, ArrowUpRight, ArrowDownRight, Search } from 'lucide-react';

const emptyForm = {
  nominal: '', jenis: 'EXPENSE', tanggal: new Date().toISOString().split('T')[0],
  deskripsi: '', kategoriId: ''
};

export default function TransactionPage() {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [filterJenis, setFilterJenis] = useState('ALL');

  const fetchAll = async () => {
    const [txRes, catRes] = await Promise.all([
      api.get('/transactions'),
      api.get('/categories')
    ]);
    setTransactions(txRes.data);
    setCategories(catRes.data);
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const openAdd = () => { setForm(emptyForm); setEditId(null); setShowModal(true); };
  const openEdit = (t) => {
    setForm({
      nominal: t.nominal, jenis: t.jenis,
      tanggal: t.tanggal, deskripsi: t.deskripsi || '',
      kategoriId: '' // user needs to re-select; simplification
    });
    setEditId(t.id);
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, nominal: parseFloat(form.nominal), kategoriId: parseInt(form.kategoriId) };
      if (editId) {
        await api.put(`/transactions/${editId}`, payload);
      } else {
        await api.post('/transactions', payload);
      }
      setShowModal(false);
      fetchAll();
    } catch (err) {
      alert(err.response?.data?.error || 'Gagal menyimpan transaksi');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Hapus transaksi ini?')) return;
    await api.delete(`/transactions/${id}`);
    fetchAll();
  };

  const filteredCats = categories.filter(c => c.type === form.jenis);
  const filtered = transactions
    .filter(t => filterJenis === 'ALL' || t.jenis === filterJenis)
    .filter(t => !search || t.deskripsi?.toLowerCase().includes(search.toLowerCase())
                         || t.categoryName?.toLowerCase().includes(search.toLowerCase()));

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Transaksi</h1>
          <p className="text-slate-500 text-sm">Kelola pemasukan dan pengeluaran Anda.</p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Tambah Transaksi
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Cari transaksi..." className="input-field pl-9" />
        </div>
        <select value={filterJenis} onChange={e => setFilterJenis(e.target.value)} className="input-field w-36">
          <option value="ALL">Semua</option>
          <option value="INCOME">Pemasukan</option>
          <option value="EXPENSE">Pengeluaran</option>
        </select>
      </div>

      {/* List */}
      <div className="card">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-sm">
            Belum ada transaksi. Tambahkan transaksi pertama Anda.
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map(t => (
              <div key={t.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors group">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                    t.jenis === 'INCOME' ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    {t.jenis === 'INCOME'
                      ? <ArrowUpRight size={16} className="text-green-600" />
                      : <ArrowDownRight size={16} className="text-red-500" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-700">{t.deskripsi || '-'}</p>
                    <p className="text-xs text-slate-400">{t.categoryName} · {formatDate(t.tanggal)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-sm font-semibold ${t.jenis === 'INCOME' ? 'text-green-600' : 'text-red-500'}`}>
                    {t.jenis === 'INCOME' ? '+' : '-'}{formatRupiah(t.nominal)}
                  </span>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openEdit(t)} className="p-1.5 hover:bg-teal-50 rounded-lg text-slate-400 hover:text-teal-600">
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => handleDelete(t.id)} className="p-1.5 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-500">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-slate-800 mb-5">
              {editId ? 'Edit Transaksi' : 'Tambah Transaksi'}
            </h2>
            <form onSubmit={handleSave} className="space-y-4">
              {/* Jenis toggle */}
              <div className="flex gap-2">
                {['INCOME', 'EXPENSE'].map(j => (
                  <button key={j} type="button"
                    onClick={() => setForm({ ...form, jenis: j, kategoriId: '' })}
                    className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${
                      form.jenis === j
                        ? j === 'INCOME' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                        : 'bg-slate-100 text-slate-500'
                    }`}>
                    {j === 'INCOME' ? 'Pemasukan' : 'Pengeluaran'}
                  </button>
                ))}
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1.5">Nominal (Rp)</label>
                <input type="number" min="1" value={form.nominal}
                  onChange={e => setForm({ ...form, nominal: e.target.value })}
                  required placeholder="0" className="input-field" />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1.5">Kategori</label>
                <select value={form.kategoriId}
                  onChange={e => setForm({ ...form, kategoriId: e.target.value })}
                  required className="input-field">
                  <option value="">Pilih kategori</option>
                  {filteredCats.map(c => (
                    <option key={c.id} value={c.id}>{c.categoryName}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1.5">Tanggal</label>
                <input type="date" value={form.tanggal}
                  onChange={e => setForm({ ...form, tanggal: e.target.value })}
                  required className="input-field" />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1.5">Deskripsi (opsional)</label>
                <input type="text" value={form.deskripsi}
                  onChange={e => setForm({ ...form, deskripsi: e.target.value })}
                  placeholder="Catatan transaksi" className="input-field" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">
                  Batal
                </button>
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
