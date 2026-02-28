import React, { useEffect, useState, useMemo } from 'react';
import {
  Eye, CheckCircle, X, Search, ChevronLeft, ChevronRight,
  FileSpreadsheet, Phone, MapPin, GraduationCap, Calendar,
  Filter, RefreshCw, User, Mail, Clock, CheckCircle2,
  XCircle, AlertCircle, Download, Printer, MoreVertical,
  UserCheck, UserX, Award, BookOpen, Home, School,
  Star, TrendingUp, Users, MessageSquare, Share2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { exportToExcel } from '../../lib/excel';
// API funksiyalarini import qilish
import { 
  getApplications, 
  approveApplication, 
  rejectApplication, 
  pendingApplication,
  checkApiStatus 
} from '../../api/api';

interface Application {
  id: number;
  full_name: string;
  phone: string;
  address?: string;
  school?: string;
  grade?: string;
  course_name?: string;
  status: 'active' | 'pending' | 'rejected';
  created_at: string;
  updated_at?: string;
  email?: string;
  birth_date?: string;
  parent_name?: string;
  parent_phone?: string;
  notes?: string;
}

export const Applications = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'name'>('newest');
  const [apiStatus, setApiStatus] = useState<'online' | 'offline' | 'checking'>('checking');

  const itemsPerPage = 15;

  // API statusini tekshirish
  useEffect(() => {
    const checkStatus = async () => {
      const status = await checkApiStatus();
      setApiStatus(status.status);
    };
    checkStatus();
  }, []);

  // Ma'lumotlarni yuklash
  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const data = await getApplications();
      
      // Sana bo'yicha saralash (eng oxirgisi birinchi)
      const sorted = data.sort((a: Application, b: Application) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      
      setApplications(sorted);
    } catch (error) {
      console.error('Ma\'lumotlarni yuklashda xatolik:', error);
      alert('Ma\'lumotlarni yuklashda xatolik yuz berdi. API ulanishini tekshiring.');
    } finally {
      setLoading(false);
    }
  };

  // Statusni yangilash - TO'G'RILANGAN VERSIYA
  const updateStatus = async (id: number, newStatus: 'active' | 'pending' | 'rejected') => {
    try {
      setUpdatingId(id);
      
      console.log(`Status yangilanmoqda: ID=${id}, Status=${newStatus}`);
      
      let result;
      switch (newStatus) {
        case 'active':
          result = await approveApplication(id);
          break;
        case 'rejected':
          result = await rejectApplication(id);
          break;
        case 'pending':
          result = await pendingApplication(id);
          break;
        default:
          throw new Error('Noto\'g\'ri status');
      }
      
      console.log('Server javobi:', result);

      // Lokal state ni yangilash
      setApplications(prev => prev.map(app =>
        app.id === id ? { ...app, status: newStatus, updated_at: new Date().toISOString() } : app
      ));

      // Agar modal ochiq bo'lsa, uni ham yangilash
      if (selectedApp?.id === id) {
        setSelectedApp(prev => prev ? { ...prev, status: newStatus } : null);
      }

      // Muvaffaqiyatli xabar
      alert(`Ariza statusi "${getStatusText(newStatus)}" ga o'zgartirildi!`);
      
    } catch (error: any) {
      console.error('Statusni yangilashda xatolik:', error);
      
      // Xatolik turiga qarab xabar
      if (error.message?.includes('404')) {
        alert('API endpoint topilmadi. Backend sozlamalarini tekshiring.');
      } else if (error.message?.includes('Failed to fetch')) {
        alert('Serverga ulanishda xatolik. Backend ishga tushganligini tekshiring.');
      } else {
        alert(`Status yangilanmadi: ${error.message || 'Noma\'lum xatolik'}`);
      }
    } finally {
      setUpdatingId(null);
    }
  };

  // Filterlangan va saralangan ma'lumotlar
  const filteredApps = useMemo(() => {
    let filtered = applications.filter(app => {
      const matchesSearch =
        app.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.phone.includes(searchTerm) ||
        app.course_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.school?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'all' || app.status === statusFilter;

      return matchesSearch && matchesStatus;
    });

    // Saralash
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
  }, [applications, searchTerm, statusFilter, sortBy]);

  // Pagination uchun
  const totalPages = Math.ceil(filteredApps.length / itemsPerPage);
  const currentApps = filteredApps.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Statistika
  const stats = useMemo(() => ({
    total: applications.length,
    pending: applications.filter(a => a.status === 'pending').length,
    active: applications.filter(a => a.status === 'active').length,
    rejected: applications.filter(a => a.status === 'rejected').length,
  }), [applications]);

  // Excel export
  const handleExport = () => {
    const data = filteredApps.map(app => ({
      'ID': app.id,
      'F.I.SH': app.full_name,
      'Telefon': app.phone,
      'Email': app.email || '-',
      'Kurs': app.course_name || '-',
      'Maktab': app.school || '-',
      'Sinf': app.grade || '-',
      'Holat': app.status === 'active' ? 'Tasdiqlangan' :
               app.status === 'rejected' ? 'Rad etilgan' : 'Kutilmoqda',
      'Sana': new Date(app.created_at).toLocaleDateString('uz-UZ'),
      'Manzil': app.address || '-'
    }));
    exportToExcel(data, `Arizalar_${new Date().toISOString().split('T')[0]}`);
  };

  // Status ranglari (ko'k va yashil asosida)
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-sm shadow-emerald-100';
      case 'rejected':
        return 'bg-rose-50 text-rose-700 border-rose-200 shadow-sm shadow-rose-100';
      default:
        return 'bg-sky-50 text-sky-700 border-sky-200 shadow-sm shadow-sky-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle2 className="w-4 h-4" />;
      case 'rejected':
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Tasdiqlangan';
      case 'rejected': return 'Rad etilgan';
      default: return 'Kutilmoqda';
    }
  };

  // Gradient ranglar
  const getStatusGradient = (status: string) => {
    switch (status) {
      case 'active':
        return 'from-emerald-500 to-green-600';
      case 'rejected':
        return 'from-rose-500 to-red-600';
      default:
        return 'from-sky-500 to-blue-600';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-emerald-50/30 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-12 bg-gradient-to-r from-sky-200 to-emerald-200 rounded-2xl w-64"></div>
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

  // API offline bo'lsa xabar ko'rsatish
  if (apiStatus === 'offline') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-emerald-50/30 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-2xl border-2 border-rose-200 p-8 text-center">
            <div className="w-20 h-20 bg-rose-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-10 h-10 text-rose-500" />
            </div>
            <h2 className="text-2xl font-bold text-rose-700 mb-2">API bilan bog'lanib bo'lmadi</h2>
            <p className="text-slate-500 mb-6">
              Backend server ishga tushganligini va URL manzil to'g'riligini tekshiring.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-gradient-to-r from-sky-500 to-blue-500 text-white rounded-xl font-medium"
            >
              Qayta urinish
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50/50 via-white to-emerald-50/30 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header Section with Gradient */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-sky-600 to-emerald-600 opacity-5 rounded-3xl"></div>
          <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-sky-600 to-emerald-600 bg-clip-text text-transparent">
                Arizalar
              </h1>
              <p className="text-slate-500 mt-2 flex items-center gap-2">
                <Clock className="w-4 h-4 text-sky-500" />
                <span>Jami <span className="font-bold text-sky-600">{filteredApps.length}</span> ta ariza</span>
                {searchTerm && <span> • Qidiruv: "{searchTerm}"</span>}
              </p>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowFilters(!showFilters)}
                className="px-5 py-2.5 bg-white border-2 border-sky-200 rounded-xl text-sky-700 hover:bg-sky-50 transition flex items-center gap-2 shadow-lg shadow-sky-100"
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
                className="p-2.5 bg-white border-2 border-sky-200 rounded-xl text-sky-700 hover:bg-sky-50 transition shadow-lg shadow-sky-100"
                title="Yangilash"
              >
                <RefreshCw className="w-4 h-4" />
              </motion.button>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl border-2 border-sky-200 p-5 shadow-lg shadow-sky-100 hover:shadow-xl transition"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-sky-600 font-medium">Jami arizalar</p>
                <p className="text-3xl font-bold text-sky-700">{stats.total}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-sky-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-sky-200">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl border-2 border-amber-200 p-5 shadow-lg shadow-amber-100 hover:shadow-xl transition"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-amber-600 font-medium">Kutilmoqda</p>
                <p className="text-3xl font-bold text-amber-700">{stats.pending}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-amber-200">
                <Clock className="w-6 h-6 text-white" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl border-2 border-emerald-200 p-5 shadow-lg shadow-emerald-100 hover:shadow-xl transition"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-emerald-600 font-medium">Tasdiqlangan</p>
                <p className="text-3xl font-bold text-emerald-700">{stats.active}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-200">
                <CheckCircle2 className="w-6 h-6 text-white" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl border-2 border-rose-200 p-5 shadow-lg shadow-rose-100 hover:shadow-xl transition"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-rose-600 font-medium">Rad etilgan</p>
                <p className="text-3xl font-bold text-rose-700">{stats.rejected}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-rose-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg shadow-rose-200">
                <XCircle className="w-6 h-6 text-white" />
              </div>
            </div>
          </motion.div>
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
              <div className="bg-white rounded-2xl border-2 border-sky-200 shadow-xl p-6 mb-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* Search */}
                  <div className="relative md:col-span-2">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-sky-400" />
                    <input
                      type="text"
                      placeholder="Ism, telefon, kurs yoki maktab bo'yicha qidirish..."
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="w-full pl-10 pr-4 py-3 border-2 border-sky-200 rounded-xl focus:ring-2 focus:ring-sky-300 focus:border-sky-400 outline-none transition"
                    />
                    {searchTerm && (
                      <button
                        onClick={() => setSearchTerm('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-sky-400 hover:text-sky-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Status Filter */}
                  <select
                    value={statusFilter}
                    onChange={(e) => {
                      setStatusFilter(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="px-4 py-3 border-2 border-sky-200 rounded-xl focus:ring-2 focus:ring-sky-300 focus:border-sky-400 outline-none transition"
                  >
                    <option value="all">Barcha statuslar</option>
                    <option value="pending">Kutilmoqda</option>
                    <option value="active">Tasdiqlangan</option>
                    <option value="rejected">Rad etilgan</option>
                  </select>

                  {/* Sort By */}
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="px-4 py-3 border-2 border-sky-200 rounded-xl focus:ring-2 focus:ring-sky-300 focus:border-sky-400 outline-none transition"
                  >
                    <option value="newest">Eng yangi</option>
                    <option value="oldest">Eski</option>
                    <option value="name">Ism bo'yicha</option>
                  </select>
                </div>

                {/* Active filters */}
                {(searchTerm || statusFilter !== 'all') && (
                  <div className="mt-4 flex items-center gap-2 text-sm">
                    <span className="text-slate-400">Faol filterlar:</span>
                    {searchTerm && (
                      <span className="px-3 py-1.5 bg-gradient-to-r from-sky-500 to-blue-500 text-white rounded-lg flex items-center gap-1 shadow-md">
                        {searchTerm}
                        <button onClick={() => setSearchTerm('')}>
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    )}
                    {statusFilter !== 'all' && (
                      <span className={`px-3 py-1.5 bg-gradient-to-r ${getStatusGradient(statusFilter)} text-white rounded-lg flex items-center gap-1 shadow-md`}>
                        {getStatusText(statusFilter)}
                        <button onClick={() => setStatusFilter('all')}>
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Table Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border-2 border-sky-200 shadow-xl overflow-hidden"
        >
          {/* Table Header with Gradient */}
          <div className="bg-gradient-to-r from-sky-500 to-blue-500 px-6 py-4">
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center gap-4">
                <Award className="w-5 h-5" />
                <span className="font-medium">Arizalar ro'yxati</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm bg-white/20 px-3 py-1 rounded-full">
                  {currentApps.length} / {filteredApps.length}
                </span>
              </div>
            </div>
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-sky-50 to-emerald-50 border-b-2 border-sky-200">
                  <th className="px-6 py-4 text-left font-semibold text-sky-800">F.I.SH</th>
                  <th className="px-6 py-4 text-left font-semibold text-sky-800">Kurs</th>
                  <th className="px-6 py-4 text-left font-semibold text-sky-800">Telefon</th>
                  <th className="px-6 py-4 text-left font-semibold text-sky-800">Holat</th>
                  <th className="px-6 py-4 text-left font-semibold text-sky-800">Sana</th>
                  <th className="px-6 py-4 text-right font-semibold text-sky-800">Amallar</th>
                </tr>
              </thead>
              <tbody>
                {currentApps.map((app, index) => (
                  <motion.tr
                    key={app.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    onClick={() => setSelectedApp(app)}
                    className="border-b border-sky-100 hover:bg-gradient-to-r hover:from-sky-50/50 hover:to-emerald-50/50 transition-all cursor-pointer group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-sky-500 to-blue-500 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition">
                          <User className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900 group-hover:text-sky-600 transition">
                            {app.full_name}
                          </div>
                          {app.school && (
                            <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                              <School className="w-3 h-3" />
                              {app.school}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {app.course_name ? (
                        <span className="px-3 py-1.5 bg-gradient-to-r from-sky-500 to-blue-500 text-white rounded-lg text-xs font-medium shadow-md">
                          {app.course_name}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Phone className="w-3 h-3 text-sky-500" />
                        <span className="font-mono">{app.phone}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border-2 ${getStatusStyle(app.status)}`}>
                        {getStatusIcon(app.status)}
                        {getStatusText(app.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-sm text-slate-500">
                        <Calendar className="w-3 h-3 text-sky-500" />
                        {new Date(app.created_at).toLocaleDateString('uz-UZ', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedApp(app);
                        }}
                        className="p-2 rounded-xl text-sky-400 hover:text-white hover:bg-gradient-to-r hover:from-sky-500 hover:to-blue-500 transition group/btn"
                        title="Ko'rish"
                      >
                        <Eye className="w-5 h-5 group-hover/btn:scale-110 transition" />
                      </button>
                    </td>
                  </motion.tr>
                ))}

                {currentApps.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-20 h-20 bg-gradient-to-br from-sky-100 to-emerald-100 rounded-2xl flex items-center justify-center">
                          <Search className="w-10 h-10 text-sky-500" />
                        </div>
                        <p className="text-slate-500 text-lg">Arizalar topilmadi</p>
                        <button
                          onClick={() => {
                            setSearchTerm('');
                            setStatusFilter('all');
                          }}
                          className="px-6 py-2.5 bg-gradient-to-r from-sky-500 to-blue-500 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition"
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

          {/* Mobile Cards */}
          <div className="md:hidden divide-y divide-sky-100">
            {currentApps.map(app => (
              <motion.div
                key={app.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={() => setSelectedApp(app)}
                className="p-4 hover:bg-gradient-to-r hover:from-sky-50/50 hover:to-emerald-50/50 transition cursor-pointer"
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-sky-500 to-blue-500 rounded-xl flex items-center justify-center shadow-md flex-shrink-0">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900">{app.full_name}</h3>
                    <p className="text-sm text-slate-500 flex items-center gap-1 mt-0.5">
                      <School className="w-3 h-3" />
                      {app.school || 'Maktab ko\'rsatilmagan'}
                    </p>
                  </div>
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium border-2 ${getStatusStyle(app.status)}`}>
                    {getStatusIcon(app.status)}
                    {getStatusText(app.status)}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-1 text-slate-600">
                    <Phone className="w-3 h-3 text-sky-500" />
                    {app.phone}
                  </div>
                  <div className="flex items-center gap-1 text-slate-600">
                    <BookOpen className="w-3 h-3 text-emerald-500" />
                    {app.course_name || 'Kurs yo\'q'}
                  </div>
                  <div className="flex items-center gap-1 text-slate-400">
                    <Calendar className="w-3 h-3" />
                    {new Date(app.created_at).toLocaleDateString('uz-UZ')}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t-2 border-sky-100 bg-gradient-to-r from-sky-50/50 to-emerald-50/50 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="text-sm text-sky-600 order-2 sm:order-1">
                <span className="font-medium">{filteredApps.length}</span> ta arizadan{' '}
                <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span>–
                <span className="font-medium">{Math.min(currentPage * itemsPerPage, filteredApps.length)}</span> ko‘rsatilmoqda
              </div>

              <div className="flex items-center gap-3 order-1 sm:order-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className="flex items-center gap-1 px-4 py-2 rounded-xl bg-white border-2 border-sky-200 text-sky-700 hover:bg-sky-50 disabled:opacity-40 disabled:hover:bg-white transition"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">Oldingi</span>
                </motion.button>

                <div className="flex items-center gap-1">
                  {[...Array(Math.min(5, totalPages))].map((_, i) => {
                    let pageNum = currentPage;
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
                            ? 'bg-gradient-to-r from-sky-500 to-blue-500 text-white shadow-md'
                            : 'bg-white border-2 border-sky-200 text-sky-700 hover:bg-sky-50'
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
                  className="flex items-center gap-1 px-4 py-2 rounded-xl bg-white border-2 border-sky-200 text-sky-700 hover:bg-sky-50 disabled:opacity-40 disabled:hover:bg-white transition"
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
                {/* Modal Header with Gradient */}
                <div className="bg-gradient-to-r from-sky-600 to-blue-600 p-6 text-white">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-2xl font-bold">Ariza tafsilotlari</h2>
                      <p className="text-sky-100 text-sm mt-1 flex items-center gap-2">
                        <Award className="w-4 h-4" />
                        ID: {selectedApp.id}
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

                {/* Modal Content */}
                <div className="p-6 space-y-6">
                  {/* Status buttons with gradient */}
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { status: 'pending', label: 'Kutilmoqda', gradient: 'from-amber-500 to-orange-500' },
                      { status: 'active', label: 'Tasdiqlash', gradient: 'from-emerald-500 to-green-500' },
                      { status: 'rejected', label: 'Rad etish', gradient: 'from-rose-500 to-red-500' }
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
                          <>
                            {item.label}
                            {selectedApp.status === item.status && (
                              <motion.div
                                layoutId="activeStatus"
                                className="absolute inset-0 bg-white/20"
                                initial={false}
                                transition={{ type: "spring", bounce: 0.2 }}
                              />
                            )}
                          </>
                        )}
                      </motion.button>
                    ))}
                  </div>

                  {/* Info Grid with gradient icons */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InfoCard
                      icon={User}
                      label="F.I.SH"
                      value={selectedApp.full_name}
                      gradient="from-sky-500 to-blue-500"
                    />
                    <InfoCard
                      icon={Phone}
                      label="Telefon"
                      value={selectedApp.phone}
                      gradient="from-emerald-500 to-green-500"
                    />
                    {selectedApp.email && (
                      <InfoCard
                        icon={Mail}
                        label="Email"
                        value={selectedApp.email}
                        gradient="from-purple-500 to-pink-500"
                      />
                    )}
                    {selectedApp.address && (
                      <InfoCard
                        icon={MapPin}
                        label="Manzil"
                        value={selectedApp.address}
                        gradient="from-amber-500 to-orange-500"
                      />
                    )}
                    {selectedApp.school && (
                      <InfoCard
                        icon={School}
                        label="Maktab"
                        value={selectedApp.school}
                        gradient="from-indigo-500 to-purple-500"
                      />
                    )}
                    {selectedApp.grade && (
                      <InfoCard
                        icon={GraduationCap}
                        label="Sinf"
                        value={selectedApp.grade}
                        gradient="from-cyan-500 to-teal-500"
                      />
                    )}
                    {selectedApp.course_name && (
                      <InfoCard
                        icon={BookOpen}
                        label="Kurs"
                        value={selectedApp.course_name}
                        gradient="from-violet-500 to-purple-500"
                      />
                    )}
                    {selectedApp.parent_name && (
                      <InfoCard
                        icon={UserCheck}
                        label="Ota-ona ismi"
                        value={selectedApp.parent_name}
                        gradient="from-pink-500 to-rose-500"
                      />
                    )}
                    {selectedApp.parent_phone && (
                      <InfoCard
                        icon={Phone}
                        label="Ota-ona telefoni"
                        value={selectedApp.parent_phone}
                        gradient="from-orange-500 to-red-500"
                      />
                    )}
                    <InfoCard
                      icon={Calendar}
                      label="Yuborilgan sana"
                      value={new Date(selectedApp.created_at).toLocaleString('uz-UZ', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                      gradient="from-slate-500 to-gray-600"
                    />
                  </div>

                  {/* Notes */}
                  {selectedApp.notes && (
                    <div className="p-4 bg-gradient-to-r from-sky-50 to-emerald-50 rounded-xl border-2 border-sky-100">
                      <p className="text-sm font-medium text-sky-800 mb-2 flex items-center gap-2">
                        <MessageSquare className="w-4 h-4" />
                        Qo'shimcha ma'lumot:
                      </p>
                      <p className="text-sm text-slate-600">{selectedApp.notes}</p>
                    </div>
                  )}
                </div>

                {/* Modal Footer */}
                <div className="p-6 border-t-2 border-sky-100 bg-gradient-to-r from-sky-50/50 to-emerald-50/50 flex justify-end gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedApp(null)}
                    className="px-6 py-2.5 border-2 border-sky-200 rounded-xl hover:bg-white transition font-medium text-sky-700"
                  >
                    Yopish
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-6 py-2.5 bg-gradient-to-r from-sky-500 to-blue-500 text-white rounded-xl hover:shadow-lg transition font-medium"
                  >
                    <a href={`tel:${selectedApp.phone}`} className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      Bog'lanish
                    </a>
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

// Info Card komponenti (gradient versiya)
const InfoCard = ({ icon: Icon, label, value, gradient }: { icon: any, label: string, value: string, gradient: string }) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    className="flex items-start gap-3 p-3 bg-white rounded-xl border-2 border-sky-100 hover:shadow-lg transition group"
  >
    <div className={`w-10 h-10 bg-gradient-to-r ${gradient} rounded-lg flex items-center justify-center shadow-md group-hover:scale-110 transition`}>
      <Icon className="w-5 h-5 text-white" />
    </div>
    <div>
      <p className="text-xs text-slate-400">{label}</p>
      <p className="font-medium text-slate-900">{value}</p>
    </div>
  </motion.div>
);

export default Applications;