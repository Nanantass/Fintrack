import { useEffect, useState } from 'react';
import api from '../utils/api';
import { formatRupiah } from '../utils/format';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const COLORS = ['#14b8a6', '#6366f1', '#f59e0b', '#ef4444', '#22c55e', '#8b5cf6', '#f97316', '#06b6d4'];

export default function ReportPage() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetch = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/reports/monthly?year=${year}&month=${month}`);
      setData(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetch(); }, [year, month]);

  const expenseChartData = data
    ? Object.entries(data.expenseByCategory || {}).map(([name, value]) => ({ name, value }))
    : [];

  const incomeChartData = data
    ? Object.entries(data.incomeByCategory || {}).map(([name, value]) => ({ name, value }))
    : [];

  const cashflowData = [
    { name: 'Pemasukan', value: data?.totalIncome || 0, fill: '#22c55e' },
    { name: 'Pengeluaran', value: data?.totalExpense || 0, fill: '#ef4444' },
    { name: 'Net Cashflow', value: Math.abs(data?.netCashflow || 0), fill: '#14b8a6' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Laporan Keuangan</h1>
          <p className="text-slate-500 text-sm">Analisis pemasukan dan pengeluaran per bulan.</p>
        </div>
        <div className="flex gap-2">
          <select value={month} onChange={e => setMonth(Number(e.target.value))} className="input-field w-36">
            {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
              <option key={m} value={m}>
                {new Date(2000, m - 1).toLocaleString('id-ID', { month: 'long' })}
              </option>
            ))}
          </select>
          <select value={year} onChange={e => setYear(Number(e.target.value))} className="input-field w-24">
            {[2023, 2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-3 gap-4">
            <div className="card text-center">
              <p className="text-xs text-slate-500 mb-1">Total Pemasukan</p>
              <p className="text-lg font-bold text-green-600">{formatRupiah(data?.totalIncome)}</p>
            </div>
            <div className="card text-center">
              <p className="text-xs text-slate-500 mb-1">Total Pengeluaran</p>
              <p className="text-lg font-bold text-red-500">{formatRupiah(data?.totalExpense)}</p>
            </div>
            <div className="card text-center">
              <p className="text-xs text-slate-500 mb-1">Net Cashflow</p>
              <p className={`text-lg font-bold ${(data?.netCashflow || 0) >= 0 ? 'text-teal-600' : 'text-red-500'}`}>
                {formatRupiah(data?.netCashflow)}
              </p>
            </div>
          </div>

          {/* Bar chart - cashflow */}
          <div className="card">
            <h2 className="text-sm font-semibold text-slate-700 mb-4">Ringkasan Cashflow</h2>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={cashflowData} barSize={40}>
                <XAxis dataKey="name" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false}
                  tickFormatter={v => `${(v/1000000).toFixed(1)}jt`} />
                <Tooltip formatter={(v) => formatRupiah(v)} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {cashflowData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Pie charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Expense by category */}
            <div className="card">
              <h2 className="text-sm font-semibold text-slate-700 mb-4">Pengeluaran per Kategori</h2>
              {expenseChartData.length === 0 ? (
                <p className="text-center text-slate-400 text-sm py-8">Belum ada data pengeluaran</p>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={expenseChartData} cx="50%" cy="50%" outerRadius={80}
                      dataKey="value" label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`}
                      labelLine={false} fontSize={11}>
                      {expenseChartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={v => formatRupiah(v)} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Income by category */}
            <div className="card">
              <h2 className="text-sm font-semibold text-slate-700 mb-4">Pemasukan per Kategori</h2>
              {incomeChartData.length === 0 ? (
                <p className="text-center text-slate-400 text-sm py-8">Belum ada data pemasukan</p>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={incomeChartData} cx="50%" cy="50%" outerRadius={80}
                      dataKey="value" label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`}
                      labelLine={false} fontSize={11}>
                      {incomeChartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={v => formatRupiah(v)} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
