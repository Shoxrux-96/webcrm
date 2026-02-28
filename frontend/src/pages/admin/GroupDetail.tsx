import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Users,
  Search,
  X,
  Trash2,
  GraduationCap,
  FileSpreadsheet,
  Loader2,
  AlertCircle,
  RefreshCw,
  Mail,
  Phone,
  MapPin,
  Award,
  Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { exportToExcel } from '../../lib/excel';
import {
  getGroup,
  getCourses,
  getTeachers,
  addStudentToGroup,
  removeStudentFromGroupByIds,
  getGroupStudentsByGroup,
  getApplications
} from '../../api/api';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Group {
  id: number;
  name: string;
  course_id: number;
  teacher_id: number;
}

interface Course {
  id: number;
  name: string;
}

interface Teacher {
  id: number;
  full_name: string;
}

interface Student {
  id: number;
  full_name: string;
  phone: string;
  school: string;
  grade: string;
  email?: string;
}

interface GroupStudent {
  id: number;
  group_id: number;
  student_id: number;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const GroupDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const groupId = Number(id);

  const [group, setGroup] = useState<Group | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [groupStudents, setGroupStudents] = useState<Student[]>([]);
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [groupStudentRelations, setGroupStudentRelations] = useState<GroupStudent[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [addingId, setAddingId] = useState<number | null>(null);
  const [removingId, setRemovingId] = useState<number | null>(null);
  const [showSearchResults, setShowSearchResults] = useState(false);

  const searchContainerRef = useRef<HTMLDivElement>(null);

  // ── Close dropdown on outside click ──────────────────────────────────────

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target as Node)
      ) {
        setShowSearchResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ── Load data ─────────────────────────────────────────────────────────────

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [groupData, groupStudentsData, coursesData, teachersData, appsData] =
        await Promise.all([
          getGroup(groupId),
          getGroupStudentsByGroup(groupId).catch(() => []),
          getCourses().catch(() => []),
          getTeachers().catch(() => []),
          getApplications().catch(() => []),
        ]);

      setGroup(groupData);
      setGroupStudentRelations(groupStudentsData);
      setCourses(coursesData);
      setTeachers(teachersData);

      // ✅ ASOSIY TUZATISH:
      // /students/ bo'sh, shuning uchun active arizalarni student sifatida ishlatamiz
      const activeStudents: Student[] = (appsData as any[])
        .filter((a) => a.status === 'active')
        .map((a) => ({
          id: a.id,
          full_name: a.full_name,
          phone: a.phone,
          school: a.school || '—',
          grade: a.grade || '—',
          email: a.email,
        }));

      setAllStudents(activeStudents);

      // Guruhdagi studentlarni topish
      const studentIds = new Set(
        (groupStudentsData as GroupStudent[]).map((rel) => rel.student_id)
      );
      const students = activeStudents.filter((s) => studentIds.has(s.id));
      setGroupStudents(students);

    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ── Helpers ───────────────────────────────────────────────────────────────

  const getCourseName = (id: number) =>
    courses.find((c) => c.id === id)?.name ?? '—';
  const getTeacherName = (id: number) =>
    teachers.find((t) => t.id === id)?.full_name ?? '—';

  // ── Add student to group ───────────────────────────────────────────────────

  const handleAddStudent = async (studentId: number) => {
    if (!group) return;

    const alreadyInGroup = groupStudentRelations.some(
      (rel) => rel.student_id === studentId
    );

    if (alreadyInGroup) {
      alert("Bu o'quvchi allaqachon guruhda mavjud!");
      return;
    }

    try {
      setAddingId(studentId);

      await addStudentToGroup({
        group_id: group.id,
        student_id: studentId,
      });

      setGroupStudentRelations((prev) => [
        ...prev,
        { id: Date.now(), group_id: group.id, student_id: studentId },
      ]);

      const student = allStudents.find((s) => s.id === studentId);
      if (student) {
        setGroupStudents((prev) => [...prev, student]);
      }

      setSearchTerm('');
      setShowSearchResults(false);

    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "O'quvchi qo'shishda xatolik";
      alert(message);
    } finally {
      setAddingId(null);
    }
  };

  // ── Remove student from group ─────────────────────────────────────────────

  const handleRemoveStudent = async (studentId: number) => {
    if (!group) return;

    const relation = groupStudentRelations.find(
      (rel) => rel.student_id === studentId
    );

    if (!relation) return;

    if (!confirm("O'quvchini guruhdan o'chirishni tasdiqlaysizmi?")) return;

    try {
      setRemovingId(studentId);

      await removeStudentFromGroupByIds(group.id, studentId);

      setGroupStudentRelations((prev) =>
        prev.filter((r) => r.id !== relation.id)
      );
      setGroupStudents((prev) => prev.filter((s) => s.id !== studentId));

    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "O'chirishda xatolik yuz berdi";
      alert(message);
    } finally {
      setRemovingId(null);
    }
  };

  // ── Export to Excel ───────────────────────────────────────────────────────

  const handleExport = () => {
    const data = groupStudents.map((s) => ({
      'F.I.SH': s.full_name,
      Telefon: s.phone,
      Maktab: s.school,
      Sinf: s.grade,
      Email: s.email ?? '—',
    }));

    exportToExcel(data, `${group?.name || 'guruh'}_oquvchilari`);
  };

  // ── Search results ────────────────────────────────────────────────────────

  const enrolledIds = new Set(groupStudents.map((s) => s.id));

  const searchResults = allStudents.filter((s) => {
    if (enrolledIds.has(s.id)) return false;
    if (searchTerm.trim() === '') return false;

    const searchLower = searchTerm.toLowerCase().trim();
    return (
      s.full_name.toLowerCase().includes(searchLower) ||
      s.phone.includes(searchLower)
    );
  });

  // ─── Loading state ────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50/50 via-white to-purple-50/30 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (error || !group) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50/50 via-white to-purple-50/30 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
          <p className="text-slate-500">{error || 'Guruh topilmadi'}</p>
          <button
            onClick={() => navigate('/admin/groups')}
            className="text-indigo-600 mt-4 hover:underline"
          >
            Orqaga qaytish
          </button>
        </div>
      </div>
    );
  }

  // ─── Main render ──────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50/50 via-white to-purple-50/30">
      {/* Navbar */}
      <div className="bg-white border-b border-indigo-100 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/admin/groups')}
                className="p-2 hover:bg-indigo-50 rounded-xl transition text-indigo-600"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-indigo-900">
                  {group.name}
                </h1>
                <p className="text-xs text-slate-500">
                  {getCourseName(group.course_id)} •{' '}
                  {getTeacherName(group.teacher_id)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleExport}
                className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-xl transition"
                title="Excel yuklash"
              >
                <FileSpreadsheet className="w-5 h-5" />
              </button>
              <button
                onClick={loadData}
                className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl transition"
                title="Yangilash"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        {/* Search Bar */}
        <div className="mb-6 relative" ref={searchContainerRef}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-400" />
            <input
              type="text"
              placeholder="O'quvchi ismi yoki telefon raqamini yozing..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setShowSearchResults(true);
              }}
              onFocus={() => setShowSearchResults(true)}
              className="w-full pl-10 pr-4 py-3 bg-white border-2 border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 outline-none transition"
            />
            {searchTerm && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setShowSearchResults(false);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-indigo-400 hover:text-indigo-600"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Search Results Dropdown */}
          <AnimatePresence>
            {showSearchResults && searchTerm.trim() !== '' && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute z-20 mt-2 w-full bg-white rounded-xl border-2 border-indigo-200 shadow-xl overflow-hidden"
              >
                <div className="max-h-96 overflow-y-auto">
                  {searchResults.length > 0 ? (
                    searchResults.map((student) => (
                      <div
                        key={student.id}
                        onClick={() => handleAddStudent(student.id)}
                        className="flex items-center justify-between p-4 hover:bg-indigo-50 cursor-pointer transition border-b border-indigo-100 last:border-b-0"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                            <GraduationCap className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-slate-900">
                              {student.full_name}
                            </h3>
                            <div className="flex items-center gap-3 text-sm text-slate-500">
                              <span className="flex items-center gap-1">
                                <Phone className="w-3 h-3" />
                                {student.phone}
                              </span>
                              <span className="w-1 h-1 bg-slate-300 rounded-full" />
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {student.school}, {student.grade}
                              </span>
                            </div>
                          </div>
                        </div>
                        {addingId === student.id ? (
                          <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
                        ) : (
                          <Plus className="w-5 h-5 text-indigo-400 hover:text-indigo-600" />
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center text-slate-500">
                      <Search className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                      <p>"{searchTerm}" bo'yicha hech narsa topilmadi</p>
                      <p className="text-sm text-slate-400 mt-2">
                        Boshqa so'z bilan qayta urinib ko'ring
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Students Table */}
        <div className="bg-white rounded-2xl border-2 border-indigo-200 shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-4">
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center gap-4">
                <Award className="w-5 h-5" />
                <span className="font-medium">Guruh o'quvchilari</span>
              </div>
              <span className="text-sm bg-white/20 px-3 py-1 rounded-full">
                {groupStudents.length} ta
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b-2 border-indigo-200">
                  <th className="px-6 py-4 text-left font-semibold text-indigo-800">#</th>
                  <th className="px-6 py-4 text-left font-semibold text-indigo-800">O'quvchi</th>
                  <th className="px-6 py-4 text-left font-semibold text-indigo-800">Telefon</th>
                  <th className="px-6 py-4 text-left font-semibold text-indigo-800">Maktab</th>
                  <th className="px-6 py-4 text-left font-semibold text-indigo-800">Sinf</th>
                  <th className="px-6 py-4 text-right font-semibold text-indigo-800">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-indigo-100">
                {groupStudents.map((student, index) => (
                  <motion.tr
                    key={student.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="hover:bg-indigo-50/50 transition-colors cursor-pointer group"
                  >
                    <td className="px-6 py-4 text-sm text-indigo-400">{index + 1}</td>
                    <td
                      className="px-6 py-4"
                      onClick={() => navigate(`/admin/students/${student.id}`)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition">
                          <GraduationCap className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900 group-hover:text-indigo-600 transition">
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
                    <td
                      className="px-6 py-4 text-sm text-slate-600"
                      onClick={() => navigate(`/admin/students/${student.id}`)}
                    >
                      {student.phone}
                    </td>
                    <td
                      className="px-6 py-4 text-sm text-slate-600"
                      onClick={() => navigate(`/admin/students/${student.id}`)}
                    >
                      {student.school}
                    </td>
                    <td
                      className="px-6 py-4"
                      onClick={() => navigate(`/admin/students/${student.id}`)}
                    >
                      <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-medium">
                        {student.grade}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveStudent(student.id);
                        }}
                        disabled={removingId === student.id}
                        className="p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition disabled:opacity-40"
                      >
                        {removingId === student.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </td>
                  </motion.tr>
                ))}

                {groupStudents.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <Users className="w-12 h-12 text-slate-300" />
                        <p className="text-slate-500">Guruhda hozircha o'quvchilar yo'q</p>
                        <p className="text-sm text-slate-400">
                          Yuqoridagi qidiruv orqali o'quvchilar qo'shing
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupDetail;