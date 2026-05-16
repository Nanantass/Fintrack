import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import api from '../utils/api';
import { formatRupiah, formatDate } from '../utils/format';
import { TrendingUp, TrendingDown, Wallet, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/reports/summary')
      .then(res => setSummary(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          Halo, {user?.username}! 👋
        </h1>
        <p className="text-slate-500 text-sm mt-1">Berikut ringkasan keuangan Anda hari ini.</p>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Saldo */}
        <div className="card bg-gradient-to-br from-teal-600 to-teal-700 text-white border-0">
          <div className="flex items-center justify-between mb-4">
            <span className="text-teal-100 text-sm font-medium">Total Saldo</span>
            <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
              <Wallet size={18} />
            </div>
          </div>
          <p className="text-2xl font-bold">{formatRupiah(summary?.totalSaldo)}</p>
          <p className="text-teal-200 text-xs mt-1">Saldo tersedia</p>
        </div>

        {/* Total Income */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <span className="text-slate-500 text-sm font-medium">Total Pemasukan</span>
            <div className="w-9 h-9 bg-green-100 rounded-xl flex items-center justify-center">
              <TrendingUp size={18} className="text-green-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-800">{formatRupiah(summary?.totalIncome)}</p>
          <p className="text-green-600 text-xs mt-1 flex items-center gap-1">
            <ArrowUpRight size={12} /> Semua waktu
          </p>
        </div>

        {/* Total Expense */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <span className="text-slate-500 text-sm font-medium">Total Pengeluaran</span>
            <div className="w-9 h-9 bg-red-100 rounded-xl flex items-center justify-center">
              <TrendingDown size={18} className="text-red-500" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-800">{formatRupiah(summary?.totalExpense)}</p>
          <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
            <ArrowDownRight size={12} /> Semua waktu
          </p>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="card">
        <h2 className="text-base font-semibold text-slate-700 mb-4">Transaksi Terbaru</h2>
        {summary?.recentTransactions?.length === 0 ? (
          <div className="text-center py-10 text-slate-400">
            <p className="text-sm">Belum ada transaksi. Tambahkan transaksi pertama Anda.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {summary?.recentTransactions?.map(t => (
              <div key={t.id} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                    t.jenis === 'INCOME' ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    {t.jenis === 'INCOME'
                      ? <ArrowUpRight size={16} className="text-green-600" />
                      : <ArrowDownRight size={16} className="text-red-500" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-700">{t.deskripsi || t.categoryName}</p>
                    <p className="text-xs text-slate-400">{t.categoryName} · {formatDate(t.tanggal)}</p>
                  </div>
                </div>
                <span className={`text-sm font-semibold ${t.jenis === 'INCOME' ? 'text-green-600' : 'text-red-500'}`}>
                  {t.jenis === 'INCOME' ? '+' : '-'}{formatRupiah(t.nominal)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
