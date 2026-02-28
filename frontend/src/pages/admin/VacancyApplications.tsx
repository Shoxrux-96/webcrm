// src/pages/admin/VacancyApplications.tsx

import React, { useEffect, useState, useMemo } from 'react';
import {
  Eye,
  X,
  Search,
  ChevronLeft,
  ChevronRight,
  FileSpreadsheet,
  Phone,
  Calendar,
  Filter,
  RefreshCw,
  User,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Briefcase,
  Award,
  BookOpen
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { exportToExcel } from '../../lib/excel';
import { getVacancyApplications, patchVacancyApplication } from '../../api/api';

interface VacancyApplication {
  id: number;
  full_name: string;
  phone: string;
  education: string;
  certificates: string[];
  certificate_level: string;
  vacancy_id: number;
  vacancy_title: string;
  status: 'pending' | 'active' | 'rejected';
  created_at: string;
  updated_at?: string;
  notes?: string;
}

export const VacancyApplications = () => {
  const [applications, setApplications] = useState<VacancyApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<VacancyApplication | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [vacancyFilter, setVacancyFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'name'>('newest');
  const [error, setError] = useState<string | null>(null);

  const itemsPerPage = 15;

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getVacancyApplications();
      setApplications(data);
    } catch (err) {
      console.error('Maʼlumotlarni yuklashda xatolik:', err);
      setError('Maʼlumotlarni yuklashda xatolik yuz berdi. Qaytadan urinib koʻring.');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: number, newStatus: 'pending' | 'active' | 'rejected') => {
    try {
      setUpdatingId(id);
      await patchVacancyApplication(id, { status: newStatus });

      setApplications(prev =>
        prev.map(app => app.id === id ? { ...app, status: newStatus } : app)
      );

      if (selectedApp?.id === id) {
        setSelectedApp(prev => prev ? { ...prev, status: newStatus } : null);
      }
    } catch (err) {
      console.error('Statusni yangilashda xatolik:', err);
      alert("Status yangilanmadi. Qaytadan urinib ko'ring.");
    } finally {
      setUpdatingId(null);
    }
  };

  const vacancyTitles = useMemo(() => {
    const titles = applications.map(app => app.vacancy_title).filter(Boolean);
    return ['all', ...new Set(titles)];
  }, [applications]);

  const filteredApps = useMemo(() => {
    let filtered = applications.filter(app => {
      const matchesSearch =
        app.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.phone.includes(searchTerm) ||
        (app.vacancy_title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.education.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
      const matchesVacancy = vacancyFilter === 'all' || app.vacancy_title === vacancyFilter;

      return matchesSearch && matchesStatus && matchesVacancy;
    });

    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        break;
      case 'name':
        filtered.sort((a, b) => a.full_name.localeCompare(b.full_name));
        break;
    }

    return filtered;
  }, [applications, searchTerm, statusFilter, vacancyFilter, sortBy]);

  const totalPages = Math.ceil(filteredApps.length / itemsPerPage);
  const currentApps = filteredApps.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleExport = () => {
    const data = filteredApps.map(app => ({
      'ID': app.id,
      'F.I.SH': app.full_name,
      'Telefon': app.phone,
      'Vakansiya': app.vacancy_title || '—',
      "Ta'lim": app.education,
      'Sertifikatlar': (app.certificates || []).join(', '),
      'Sertifikat darajasi': app.certificate_level || '—',
      'Holat': app.status === 'active' ? 'Tasdiqlangan' :
               app.status === 'rejected' ? 'Rad etilgan' : 'Kutilmoqda',
      'Sana': new Date(app.created_at).toLocaleDateString('uz-UZ')
    }));
    exportToExcel(data, `Vakansiya_arizalari_${new Date().toISOString().split('T')[0]}`);
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'active': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'rejected': return 'bg-rose-50 text-rose-700 border-rose-200';
      default: return 'bg-amber-50 text-amber-700 border-amber-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle2 className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Tasdiqlangan';
      case 'rejected': return 'Rad etilgan';
      default: return 'Kutilmoqda';
    }
  };

  const getStatusGradient = (status: string) => {
    switch (status) {
      case 'active': return 'from-emerald-500 to-green-600';
      case 'rejected': return 'from-rose-500 to-red-600';
      default: return 'from-amber-500 to-orange-600';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50/30 p-6">
        <div className="max-w-full mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-12 bg-gradient-to-r from-indigo-200 to-purple-200 rounded-2xl w-64"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-24 bg-white rounded-2xl shadow-sm"></div>
              ))}
            </div>
            <div className="h-96 bg-white rounded-2xl shadow-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50/30 p-6 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-rose-100 rounded-2xl flex items-center justify-center mx-auto">
            <XCircle className="w-10 h-10 text-rose-500" />
          </div>
          <p className="text-slate-600 text-lg">{error}</p>
          <button
            onClick={fetchApplications}
            className="px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition flex items-center gap-2 mx-auto"
          >
            <RefreshCw className="w-4 h-4" />
            Qaytadan yuklash
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50/50 via-white to-purple-50/30 p-4 md:p-6">
      <div className="max-w-full mx-auto space-y-6">

        {/* Header */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 opacity-5 rounded-3xl"></div>
          <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Vakansiya arizalari
              </h1>
              <p className="text-slate-500 mt-2 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-indigo-500" />
                <span>Jami <span className="font-bold text-indigo-600">{filteredApps.length}</span> ta ariza</span>
                {searchTerm && <span> • Qidiruv: "{searchTerm}"</span>}
              </p>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowFilters(!showFilters)}
                className="px-5 py-2.5 bg-white border-2 border-indigo-200 rounded-xl text-indigo-700 hover:bg-indigo-50 transition flex items-center gap-2 shadow-lg shadow-indigo-100"
              >
                <Filter className="w-4 h-4" />
                <span className="hidden sm:inline">Filter</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleExport}
                className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-medium flex items-center gap-2 shadow-lg shadow-emerald-200 hover:shadow-xl transition"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span className="hidden sm:inline">Excel</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={fetchApplications}
                className="p-2.5 bg-white border-2 border-indigo-200 rounded-xl text-indigo-700 hover:bg-indigo-50 transition shadow-lg shadow-indigo-100"
              >
                <RefreshCw className="w-4 h-4" />
              </motion.button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="bg-white rounded-2xl border-2 border-indigo-200 shadow-xl p-6 mb-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="relative md:col-span-2">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400" />
                    <input
                      type="text"
                      placeholder="Ism, telefon, vakansiya yoki ta'lim bo'yicha qidirish..."
                      value={searchTerm}
                      onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                      className="w-full pl-10 pr-4 py-3 border-2 border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 outline-none transition"
                    />
                    {searchTerm && (
                      <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-indigo-400 hover:text-indigo-600">
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <select
                    value={statusFilter}
                    onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                    className="px-4 py-3 border-2 border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 outline-none transition"
                  >
                    <option value="all">Barcha statuslar</option>
                    <option value="pending">Kutilmoqda</option>
                    <option value="active">Tasdiqlangan</option>
                    <option value="rejected">Rad etilgan</option>
                  </select>

                  <select
                    value={vacancyFilter}
                    onChange={(e) => { setVacancyFilter(e.target.value); setCurrentPage(1); }}
                    className="px-4 py-3 border-2 border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 outline-none transition"
                  >
                    <option value="all">Barcha vakansiyalar</option>
                    {vacancyTitles.filter(t => t !== 'all').map(title => (
                      <option key={title} value={title}>{title}</option>
                    ))}
                  </select>
                </div>

                {/* Sort */}
                <div className="mt-4 flex items-center gap-3">
                  <span className="text-sm text-slate-400">Saralash:</span>
                  {[
                    { key: 'newest', label: "Eng yangi" },
                    { key: 'oldest', label: "Eng eski" },
                    { key: 'name', label: "Ism bo'yicha" }
                  ].map(s => (
                    <button
                      key={s.key}
                      onClick={() => setSortBy(s.key as any)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                        sortBy === s.key
                          ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md'
                          : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>

                {(searchTerm || statusFilter !== 'all' || vacancyFilter !== 'all') && (
                  <div className="mt-4 flex items-center gap-2 text-sm flex-wrap">
                    <span className="text-slate-400">Faol filterlar:</span>
                    {searchTerm && (
                      <span className="px-3 py-1.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg flex items-center gap-1 shadow-md">
                        {searchTerm}
                        <button onClick={() => setSearchTerm('')}><X className="w-3 h-3" /></button>
                      </span>
                    )}
                    {statusFilter !== 'all' && (
                      <span className={`px-3 py-1.5 bg-gradient-to-r ${getStatusGradient(statusFilter)} text-white rounded-lg flex items-center gap-1 shadow-md`}>
                        {getStatusText(statusFilter)}
                        <button onClick={() => setStatusFilter('all')}><X className="w-3 h-3" /></button>
                      </span>
                    )}
                    {vacancyFilter !== 'all' && (
                      <span className="px-3 py-1.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg flex items-center gap-1 shadow-md">
                        {vacancyFilter}
                        <button onClick={() => setVacancyFilter('all')}><X className="w-3 h-3" /></button>
                      </span>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border-2 border-indigo-200 shadow-xl overflow-hidden"
        >
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-4">
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center gap-4">
                <Briefcase className="w-5 h-5" />
                <span className="font-medium">Arizalar ro'yxati</span>
              </div>
              <span className="text-sm bg-white/20 px-3 py-1 rounded-full">
                {currentApps.length} / {filteredApps.length}
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b-2 border-indigo-200">
                  <th className="px-4 py-4 text-left font-semibold text-indigo-800">F.I.SH</th>
                  <th className="px-4 py-4 text-left font-semibold text-indigo-800">Vakansiya</th>
                  <th className="px-4 py-4 text-left font-semibold text-indigo-800">Telefon</th>
                  <th className="px-4 py-4 text-left font-semibold text-indigo-800">Ta'lim</th>
                  <th className="px-4 py-4 text-left font-semibold text-indigo-800">Sertifikat</th>
                  <th className="px-4 py-4 text-left font-semibold text-indigo-800">Holat</th>
                  <th className="px-4 py-4 text-left font-semibold text-indigo-800">Sana</th>
                  <th className="px-4 py-4 text-right font-semibold text-indigo-800">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-indigo-100">
                {currentApps.map((app, index) => (
                  <motion.tr
                    key={app.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    onClick={() => setSelectedApp(app)}
                    className="hover:bg-gradient-to-r hover:from-indigo-50/50 hover:to-purple-50/50 transition-colors cursor-pointer group"
                  >
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition">
                          <User className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-semibold text-slate-900 group-hover:text-indigo-600 transition">
                          {app.full_name}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="px-3 py-1.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg text-xs font-medium shadow-md">
                        {app.vacancy_title || '—'}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Phone className="w-3 h-3 text-indigo-500" />
                        <span className="font-mono">{app.phone}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-600">{app.education}</td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-1">
                        {(app.certificates || []).slice(0, 2).map((cert, idx) => (
                          <span key={idx} className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-medium border border-indigo-100">
                            {cert}
                          </span>
                        ))}
                        {(app.certificates || []).length > 2 && (
                          <span className="px-2 py-0.5 bg-indigo-50 text-indigo-400 rounded-full text-[10px]">
                            +{app.certificates.length - 2}
                          </span>
                        )}
                        {app.certificate_level && (
                          <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-medium border border-emerald-100">
                            {app.certificate_level}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border-2 ${getStatusStyle(app.status)}`}>
                        {getStatusIcon(app.status)}
                        {getStatusText(app.status)}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1 text-sm text-slate-500">
                        <Calendar className="w-3 h-3 text-indigo-500" />
                        {new Date(app.created_at).toLocaleDateString('uz-UZ')}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <button
                        onClick={(e) => { e.stopPropagation(); setSelectedApp(app); }}
                        className="p-2 rounded-xl text-indigo-400 hover:text-white hover:bg-gradient-to-r hover:from-indigo-500 hover:to-purple-600 transition group/btn"
                        title="Ko'rish"
                      >
                        <Eye className="w-5 h-5 group-hover/btn:scale-110 transition" />
                      </button>
                    </td>
                  </motion.tr>
                ))}

                {currentApps.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl flex items-center justify-center">
                          <Briefcase className="w-10 h-10 text-indigo-500" />
                        </div>
                        <p className="text-slate-500 text-lg">Arizalar topilmadi</p>
                        <button
                          onClick={() => { setSearchTerm(''); setStatusFilter('all'); setVacancyFilter('all'); }}
                          className="px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition"
                        >
                          Filtrlarni tozalash
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-4 py-4 border-t-2 border-indigo-100 bg-gradient-to-r from-indigo-50/50 to-purple-50/50 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="text-sm text-indigo-600 order-2 sm:order-1">
                <span className="font-medium">{filteredApps.length}</span> ta arizadan{' '}
                <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span>–
                <span className="font-medium">{Math.min(currentPage * itemsPerPage, filteredApps.length)}</span> ko'rsatilmoqda
              </div>

              <div className="flex items-center gap-3 order-1 sm:order-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className="flex items-center gap-1 px-4 py-2 rounded-xl bg-white border-2 border-indigo-200 text-indigo-700 hover:bg-indigo-50 disabled:opacity-40 transition"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">Oldingi</span>
                </motion.button>

                <div className="flex items-center gap-1">
                  {[...Array(Math.min(5, totalPages))].map((_, i) => {
                    let pageNum: number;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <button
                        key={i}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-10 h-10 rounded-xl font-medium transition ${
                          currentPage === pageNum
                            ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md'
                            : 'bg-white border-2 border-indigo-200 text-indigo-700 hover:bg-indigo-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-1 px-4 py-2 rounded-xl bg-white border-2 border-indigo-200 text-indigo-700 hover:bg-indigo-50 disabled:opacity-40 transition"
                >
                  <span className="hidden sm:inline">Keyingi</span>
                  <ChevronRight className="w-4 h-4" />
                </motion.button>
              </div>
            </div>
          )}
        </motion.div>

        {/* Detail Modal */}
        <AnimatePresence>
          {selectedApp && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden"
              >
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-2xl font-bold">Ariza tafsilotlari</h2>
                      <p className="text-indigo-100 text-sm mt-1 flex items-center gap-2">
                        <Briefcase className="w-4 h-4" />
                        {selectedApp.vacancy_title || '—'} • ID: {selectedApp.id}
                      </p>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.1, rotate: 90 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setSelectedApp(null)}
                      className="p-2 hover:bg-white/20 rounded-xl transition"
                    >
                      <X className="w-5 h-5" />
                    </motion.button>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  {/* Status buttons */}
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { status: 'pending', label: 'Kutilmoqda', gradient: 'from-amber-500 to-orange-600' },
                      { status: 'active', label: 'Tasdiqlash', gradient: 'from-emerald-500 to-green-600' },
                      { status: 'rejected', label: 'Rad etish', gradient: 'from-rose-500 to-red-600' }
                    ].map((item) => (
                      <motion.button
                        key={item.status}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => updateStatus(selectedApp.id, item.status as any)}
                        disabled={updatingId === selectedApp.id}
                        className={`relative py-3 rounded-xl font-medium transition overflow-hidden ${
                          selectedApp.status === item.status
                            ? `bg-gradient-to-r ${item.gradient} text-white shadow-lg`
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {updatingId === selectedApp.id ? (
                          <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin mx-auto" />
                        ) : (
                          item.label
                        )}
                      </motion.button>
                    ))}
                  </div>

                  {/* Info Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InfoCard icon={User} label="F.I.SH" value={selectedApp.full_name} />
                    <InfoCard icon={Phone} label="Telefon" value={selectedApp.phone} />
                    <InfoCard icon={BookOpen} label="Ta'lim" value={selectedApp.education} />
                    <InfoCard icon={Award} label="Sertifikat darajasi" value={selectedApp.certificate_level || '—'} />
                    <InfoCard icon={Briefcase} label="Vakansiya" value={selectedApp.vacancy_title || '—'} />
                    <InfoCard icon={Calendar} label="Yuborilgan sana" value={new Date(selectedApp.created_at).toLocaleString('uz-UZ')} />
                  </div>

                  {/* Certificates */}
                  {(selectedApp.certificates || []).length > 0 && (
                    <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border-2 border-indigo-100">
                      <p className="text-sm font-medium text-indigo-800 mb-2 flex items-center gap-2">
                        <Award className="w-4 h-4" />
                        Sertifikatlar:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {selectedApp.certificates.map((cert, idx) => (
                          <span key={idx} className="px-3 py-1 bg-white text-indigo-600 rounded-lg text-sm font-medium border border-indigo-200">
                            {cert}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Notes */}
                  {selectedApp.notes && (
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                      <p className="text-xs text-slate-400 mb-1">Izoh:</p>
                      <p className="text-sm text-slate-700">{selectedApp.notes}</p>
                    </div>
                  )}
                </div>

                <div className="p-6 border-t-2 border-indigo-100 bg-gradient-to-r from-indigo-50/50 to-purple-50/50 flex justify-end">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedApp(null)}
                    className="px-8 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:shadow-lg transition font-medium"
                  >
                    Yopish
                  </motion.button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};

const InfoCard = ({ icon: Icon, label, value }: { icon: any; label: string; value: string }) => (
  <div className="flex items-start gap-3 p-3 bg-indigo-50/30 rounded-xl hover:bg-white hover:shadow-md transition group">
    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition">
      <Icon className="w-5 h-5 text-white" />
    </div>
    <div>
      <p className="text-xs text-slate-400">{label}</p>
      <p className="font-medium text-slate-900">{value}</p>
    </div>
  </div>
);

export default VacancyApplications;