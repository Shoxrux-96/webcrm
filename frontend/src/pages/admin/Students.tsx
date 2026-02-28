// src/pages/admin/Students.tsx
import React, { useEffect, useState, useMemo } from 'react';
import { 
  Search, Trash2, Phone, ExternalLink, FileSpreadsheet, 
  ChevronLeft, ChevronRight, GraduationCap, MapPin, 
  Mail, Calendar, Filter, RefreshCw, Download,
  UserCheck, UserX, Eye, Edit, MoreVertical, AlertCircle,
  X, BookOpen, Award, Users, Clock, School
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { exportToExcel } from '../../lib/excel';

interface Student {
  id: number;
  full_name: string;
  phone: string;
  email?: string;
  school: string;
  grade: string;
  address?: string;
  course_name?: string;
  status: 'active' | 'pending' | 'rejected';
  created_at: string;
  updated_at: string;
  application_id?: number;
  parent_name?: string;
  parent_phone?: string;
  birth_date?: string;
  notes?: string;
}

export const Students = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [gradeFilter, setGradeFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'name'>('newest');
  
  const rowsPerPage = 50;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const appsResponse = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/applications`);
      const appsData = await appsResponse.json();
      setApplications(appsData);

      const activeStudents = appsData
        .filter((app: any) => app.status === 'active')
        .map((app: any) => ({
          id: app.id,
          full_name: app.full_name,
          phone: app.phone,
          email: app.email,
          school: app.school || 'Maktab ko\'rsatilmagan',
          grade: app.grade || 'Sinf ko\'rsatilmagan',
          address: app.address,
          course_name: app.course_name,
          status: app.status,
          created_at: app.created_at,
          updated_at: app.updated_at || app.created_at,
          application_id: app.id,
          parent_name: app.parent_name,
          parent_phone: app.parent_phone,
          birth_date: app.birth_date,
          notes: app.notes
        }));

      const sorted = activeStudents.sort((a: Student, b: Student) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      setStudents(sorted);
    } catch (error) {
      console.error('Ma\'lumotlarni yuklashda xatolik:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("O'quvchini ro'yxatdan o'chirishni tasdiqlaysizmi?")) return;
    
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/applications/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'pending' })
      });
      
      setStudents(prev => prev.filter(s => s.id !== id));
      alert('O\'quvchi ro\'yxatdan o\'chirildi');
    } catch (error) {
      console.error('O\'chirishda xatolik:', error);
      alert('O\'chirishda xatolik yuz berdi');
    }
  };

  const handleExport = () => {
    const data = filteredStudents.map(s => ({
      'ID': s.id,
      'F.I.O': s.full_name,
      'Telefon': s.phone,
      'Email': s.email || '—',
      'Maktab': s.school,
      'Sinf': s.grade,
      'Kurs': s.course_name || '—',
      'Manzil': s.address || '—',
      'Ota-ona ismi': s.parent_name || '—',
      'Ota-ona telefoni': s.parent_phone || '—',
      "Qo'shilgan sana": new Date(s.created_at).toLocaleDateString('uz-UZ')
    }));
    
    exportToExcel(data, `Oquvchilar_${new Date().toISOString().split('T')[0]}`);
  };

  const filteredStudents = useMemo(() => {
    let filtered = students.filter(student => {
      const matchesSearch = 
        student.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.phone.includes(searchTerm) ||
        (student.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (student.school || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (student.course_name || '').toLowerCase().includes(searchTerm.toLowerCase());

      const matchesGrade = gradeFilter === 'all' || student.grade === gradeFilter;

      return matchesSearch && matchesGrade;
    });

    switch(sortBy) {
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
  }, [students, searchTerm, gradeFilter, sortBy]);

  const gradeOptions = useMemo(() => {
    const grades = students.map(s => s.grade).filter(Boolean);
    return ['all', ...new Set(grades)];
  }, [students]);

  const totalPages = Math.ceil(filteredStudents.length / rowsPerPage);
  const currentStudents = filteredStudents.slice(
    (currentPage - 1) * rowsPerPage, 
    currentPage * rowsPerPage
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-emerald-50/30 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-12 bg-gradient-to-r from-sky-200 to-emerald-200 rounded-2xl w-64"></div>
            <div className="h-96 bg-white rounded-2xl shadow-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50/50 via-white to-emerald-50/30 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header with Gradient */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-sky-600 to-emerald-600 opacity-5 rounded-3xl"></div>
          <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-sky-600 to-emerald-600 bg-clip-text text-transparent">
                O'quvchilar
              </h1>
              <p className="text-slate-500 mt-2 flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-sky-500" />
                <span>Jami <span className="font-bold text-sky-600">{students.length}</span> ta o'quvchi</span>
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
                onClick={fetchData}
                className="p-2.5 bg-white border-2 border-sky-200 rounded-xl text-sky-700 hover:bg-sky-50 transition shadow-lg shadow-sky-100"
                title="Yangilash"
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
              <div className="bg-white rounded-2xl border-2 border-sky-200 shadow-xl p-6 mb-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* Search */}
                  <div className="relative md:col-span-2">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-sky-400" />
                    <input
                      type="text"
                      placeholder="Ism, telefon, email yoki maktab bo'yicha qidirish..."
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

                  {/* Grade Filter */}
                  <select
                    value={gradeFilter}
                    onChange={(e) => {
                      setGradeFilter(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="px-4 py-3 border-2 border-sky-200 rounded-xl focus:ring-2 focus:ring-sky-300 focus:border-sky-400 outline-none transition"
                  >
                    <option value="all">Barcha sinflar</option>
                    {gradeOptions.filter(g => g !== 'all').map(grade => (
                      <option key={grade} value={grade}>{grade}</option>
                    ))}
                  </select>

                  {/* Sort */}
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
                {(searchTerm || gradeFilter !== 'all') && (
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
                    {gradeFilter !== 'all' && (
                      <span className="px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-lg flex items-center gap-1 shadow-md">
                        Sinf: {gradeFilter}
                        <button onClick={() => setGradeFilter('all')}>
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

        {/* Students count info */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-sky-600">
            <span className="font-medium">{filteredStudents.length}</span> ta o'quvchidan{' '}
            <span className="font-medium">{(currentPage - 1) * rowsPerPage + 1}</span>–
            <span className="font-medium">{Math.min(currentPage * rowsPerPage, filteredStudents.length)}</span> ko'rsatilmoqda
          </div>
          {filteredStudents.length === 0 && (
            <div className="text-amber-600 text-sm flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              Hech qanday o'quvchi topilmadi
            </div>
          )}
        </div>

        {/* Students Table */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border-2 border-sky-200 shadow-xl overflow-hidden"
        >
          {/* Table Header */}
          <div className="bg-gradient-to-r from-sky-500 to-blue-500 px-6 py-4">
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center gap-4">
                <Award className="w-5 h-5" />
                <span className="font-medium">O'quvchilar ro'yxati</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm bg-white/20 px-3 py-1 rounded-full">
                  {currentStudents.length} / {filteredStudents.length}
                </span>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-sky-50 to-emerald-50 border-b-2 border-sky-200">
                  <th className="px-6 py-4 text-left font-semibold text-sky-800">#</th>
                  <th className="px-6 py-4 text-left font-semibold text-sky-800">O'quvchi</th>
                  <th className="px-6 py-4 text-left font-semibold text-sky-800">Kurs</th>
                  <th className="px-6 py-4 text-left font-semibold text-sky-800">Telefon</th>
                  <th className="px-6 py-4 text-left font-semibold text-sky-800">Maktab / Sinf</th>
                  <th className="px-6 py-4 text-left font-semibold text-sky-800">Qo'shilgan sana</th>
                  <th className="px-6 py-4 text-right font-semibold text-sky-800">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sky-100">
                {currentStudents.map((student, index) => (
                  <motion.tr
                    key={student.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    onClick={() => setSelectedStudent(student)}
                    className="hover:bg-gradient-to-r hover:from-sky-50/50 hover:to-emerald-50/50 transition-colors cursor-pointer group"
                  >
                    <td className="px-6 py-4 text-sm text-sky-400">
                      {(currentPage - 1) * rowsPerPage + index + 1}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-sky-500 to-blue-500 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition">
                          <UserCheck className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900 group-hover:text-sky-600 transition">
                            {student.full_name}
                          </div>
                          {student.email && (
                            <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                              <Mail className="w-3 h-3" />
                              {student.email}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {student.course_name ? (
                        <span className="px-3 py-1.5 bg-gradient-to-r from-sky-500 to-blue-500 text-white rounded-lg text-xs font-medium shadow-md">
                          {student.course_name}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Phone className="w-3 h-3 text-sky-500" />
                        <span className="font-mono">{student.phone}</span>
                      </div>
                      {student.parent_phone && (
                        <div className="text-xs text-slate-400 mt-1">
                          Ota-ona: {student.parent_phone}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-sm text-slate-600">
                        <School className="w-3 h-3 text-sky-500" />
                        {student.school}
                      </div>
                      <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                        <GraduationCap className="w-3 h-3" />
                        {student.grade}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-sm text-slate-500">
                        <Calendar className="w-3 h-3 text-sky-500" />
                        {new Date(student.created_at).toLocaleDateString('uz-UZ')}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedStudent(student);
                          }}
                          className="p-2 rounded-xl text-sky-400 hover:text-white hover:bg-gradient-to-r hover:from-sky-500 hover:to-blue-500 transition group/btn"
                          title="Ko'rish"
                        >
                          <Eye className="w-4 h-4 group-hover/btn:scale-110 transition" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(student.id);
                          }}
                          className="p-2 rounded-xl text-rose-400 hover:text-white hover:bg-gradient-to-r hover:from-rose-500 hover:to-red-500 transition group/btn"
                          title="O'chirish"
                        >
                          <Trash2 className="w-4 h-4 group-hover/btn:scale-110 transition" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}

                {currentStudents.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-20 h-20 bg-gradient-to-br from-sky-100 to-emerald-100 rounded-2xl flex items-center justify-center">
                          <UserX className="w-10 h-10 text-sky-500" />
                        </div>
                        <p className="text-slate-500 text-lg">Hozircha tasdiqlangan o'quvchilar yo'q</p>
                        <p className="text-sm text-slate-400">
                          Arizalar sahifasida arizalarni tasdiqlang
                        </p>
                        <Link
                          to="/admin/applications"
                          className="px-6 py-2.5 bg-gradient-to-r from-sky-500 to-blue-500 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition"
                        >
                          Arizalarga o'tish
                        </Link>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t-2 border-sky-100 bg-gradient-to-r from-sky-50/50 to-emerald-50/50 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="text-sm text-sky-600 order-2 sm:order-1">
                <span className="font-medium">{filteredStudents.length}</span> ta o'quvchidan{' '}
                <span className="font-medium">{(currentPage - 1) * rowsPerPage + 1}</span>–
                <span className="font-medium">{Math.min(currentPage * rowsPerPage, filteredStudents.length)}</span> ko'rsatilmoqda
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

        {/* Student Detail Modal */}
        <AnimatePresence>
          {selectedStudent && (
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
                      <h2 className="text-2xl font-bold">O'quvchi ma'lumotlari</h2>
                      <p className="text-sky-100 text-sm mt-1 flex items-center gap-2">
                        <Award className="w-4 h-4" />
                        ID: {selectedStudent.id}
                      </p>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.1, rotate: 90 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setSelectedStudent(null)}
                      className="p-2 hover:bg-white/20 rounded-xl transition"
                    >
                      <X className="w-5 h-5" />
                    </motion.button>
                  </div>
                </div>

                {/* Modal Content */}
                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InfoCard 
                      icon={UserCheck} 
                      label="F.I.O" 
                      value={selectedStudent.full_name}
                      gradient="from-sky-500 to-blue-500" 
                    />
                    <InfoCard 
                      icon={Phone} 
                      label="Telefon" 
                      value={selectedStudent.phone}
                      gradient="from-emerald-500 to-green-500" 
                    />
                    {selectedStudent.email && (
                      <InfoCard 
                        icon={Mail} 
                        label="Email" 
                        value={selectedStudent.email}
                        gradient="from-purple-500 to-pink-500" 
                      />
                    )}
                    <InfoCard 
                      icon={School} 
                      label="Maktab" 
                      value={selectedStudent.school}
                      gradient="from-indigo-500 to-purple-500" 
                    />
                    <InfoCard 
                      icon={GraduationCap} 
                      label="Sinf" 
                      value={selectedStudent.grade}
                      gradient="from-cyan-500 to-teal-500" 
                    />
                    {selectedStudent.course_name && (
                      <InfoCard 
                        icon={BookOpen} 
                        label="Kurs" 
                        value={selectedStudent.course_name}
                        gradient="from-violet-500 to-purple-500" 
                      />
                    )}
                    {selectedStudent.address && (
                      <InfoCard 
                        icon={MapPin} 
                        label="Manzil" 
                        value={selectedStudent.address}
                        gradient="from-amber-500 to-orange-500" 
                      />
                    )}
                    {selectedStudent.parent_name && (
                      <InfoCard 
                        icon={UserCheck} 
                        label="Ota-ona" 
                        value={selectedStudent.parent_name}
                        gradient="from-pink-500 to-rose-500" 
                      />
                    )}
                    {selectedStudent.parent_phone && (
                      <InfoCard 
                        icon={Phone} 
                        label="Ota-ona telefoni" 
                        value={selectedStudent.parent_phone}
                        gradient="from-orange-500 to-red-500" 
                      />
                    )}
                    <InfoCard 
                      icon={Calendar} 
                      label="Qo'shilgan sana" 
                      value={new Date(selectedStudent.created_at).toLocaleString('uz-UZ', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })} 
                      gradient="from-slate-500 to-gray-600"
                    />
                  </div>

                  {selectedStudent.notes && (
                    <div className="p-4 bg-gradient-to-r from-sky-50 to-emerald-50 rounded-xl border-2 border-sky-100">
                      <p className="text-sm font-medium text-sky-800 mb-2 flex items-center gap-2">
                        <BookOpen className="w-4 h-4" />
                        Qo'shimcha ma'lumot:
                      </p>
                      <p className="text-sm text-slate-600">{selectedStudent.notes}</p>
                    </div>
                  )}
                </div>

                {/* Modal Footer */}
                <div className="p-6 border-t-2 border-sky-100 bg-gradient-to-r from-sky-50/50 to-emerald-50/50 flex justify-end">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedStudent(null)}
                    className="px-8 py-2.5 bg-gradient-to-r from-sky-500 to-blue-500 text-white rounded-xl hover:shadow-lg transition font-medium"
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

// Info Card komponenti
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

export default Students;