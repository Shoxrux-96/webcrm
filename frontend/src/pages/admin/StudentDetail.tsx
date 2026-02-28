import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Phone,
  MapPin,
  GraduationCap,
  Calendar,
  CreditCard,
  Plus,
  CheckCircle2,
  Clock,
  Loader2,
  X,
  Mail,
  BookOpen,
  AlertCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
import { getStudent } from '../../api/api';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Student {
  id: number;
  full_name: string;
  phone: string;
  email?: string;
  school: string;
  grade: string;
  address?: string;
  created_at: string;
  updated_at: string;
}

interface Payment {
  id: number;
  student_id: number;
  course_id: number;
  amount: number;
  month: string;
  status: 'paid' | 'pending';
  note?: string;
  created_at: string;
}

interface StudentCourse {
  course_id: number;
  course_name: string;
  course_price: number;
  enrollment_id: number;
  enrollment_status: string;
  payments: Payment[];
}

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

const MONTHS = [
  { value: '01', label: 'Yanvar' },
  { value: '02', label: 'Fevral' },
  { value: '03', label: 'Mart' },
  { value: '04', label: 'Aprel' },
  { value: '05', label: 'May' },
  { value: '06', label: 'Iyun' },
  { value: '07', label: 'Iyul' },
  { value: '08', label: 'Avgust' },
  { value: '09', label: 'Sentabr' },
  { value: '10', label: 'Oktabr' },
  { value: '11', label: 'Noyabr' },
  { value: '12', label: 'Dekabr' },
];

const currentMonth = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};

const monthLabel = (value: string) => {
  const [year, month] = value.split('-');
  const m = MONTHS.find((m) => m.value === month);
  return `${m?.label ?? month} ${year}`;
};

// ─── Component ────────────────────────────────────────────────────────────────

export const StudentDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const studentId = id!;

  const [student, setStudent] = useState<Student | null>(null);
  const [courses, setCourses] = useState<StudentCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedCourse, setExpandedCourse] = useState<number | null>(null);

  // Payment modal
  const [showModal, setShowModal] = useState(false);
  const [modalCourse, setModalCourse] = useState<StudentCourse | null>(null);
  const [saving, setSaving] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    month: currentMonth(),
    status: 'paid' as 'paid' | 'pending',
    note: '',
  });

  // ── Load data ─────────────────────────────────────────────────────────────

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [studentData, coursesData] = await Promise.all([
        getStudent(studentId),
        fetch(`${API_URL}/payments/student/${studentId}/courses`)
          .then((r) => r.ok ? r.json() : [])
          .catch(() => []),
      ]);

      setStudent(studentData);
      setCourses(Array.isArray(coursesData) ? coursesData : []);
      if (coursesData.length > 0) {
        setExpandedCourse(coursesData[0].course_id);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ── Add payment ───────────────────────────────────────────────────────────

  const openModal = (course: StudentCourse) => {
    setModalCourse(course);
    // Oylik qoldiqni avtomatik hisoblash
    const monthPayments = course.payments.filter(
      (p) => p.month === currentMonth() && p.status === 'paid'
    );
    const paid = monthPayments.reduce((sum, p) => sum + p.amount, 0);
    const remaining = Math.max(0, course.course_price - paid);
    setPaymentForm({
      amount: remaining > 0 ? String(remaining) : '',
      month: currentMonth(),
      status: 'paid',
      note: '',
    });
    setShowModal(true);
  };

  const handleAddPayment = async () => {
    if (!modalCourse || !student) return;
    setSaving(true);

    try {
      const res = await fetch(`${API_URL}/payments/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: Number(studentId),
          course_id: modalCourse.course_id,
          amount: Number(paymentForm.amount),
          month: paymentForm.month,
          status: paymentForm.status,
          note: paymentForm.note || null,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Xatolik yuz berdi");
      }

      setShowModal(false);
      await loadData();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "To'lov qo'shishda xatolik");
    } finally {
      setSaving(false);
    }
  };

  // ── Payment helpers ───────────────────────────────────────────────────────

  const getMonthStatus = (course: StudentCourse, month: string) => {
    const monthPayments = course.payments.filter(
      (p) => p.month === month && p.status === 'paid'
    );
    const paid = monthPayments.reduce((sum, p) => sum + p.amount, 0);
    if (paid === 0) return { paid: 0, remaining: course.course_price, complete: false };
    return {
      paid,
      remaining: Math.max(0, course.course_price - paid),
      complete: paid >= course.course_price,
    };
  };

  const thisMonth = currentMonth();

  // ─── Render states ────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-400" />
        <div className="text-red-500 font-medium">{error || "O'quvchi topilmadi"}</div>
        <button
          onClick={() => navigate('/admin/students')}
          className="text-indigo-600 font-bold flex items-center gap-2 underline"
        >
          <ArrowLeft className="w-4 h-4" /> Ro'yxatga qaytish
        </button>
      </div>
    );
  }

  // ─── Main render ──────────────────────────────────────────────────────────

  return (
    <div className="space-y-8">
      <button
        onClick={() => navigate('/admin/students')}
        className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors font-bold"
      >
        <ArrowLeft className="w-4 h-4" /> Orqaga
      </button>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* ── Profile Card ── */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-24 h-24 bg-indigo-600 rounded-3xl flex items-center justify-center text-white text-3xl font-bold">
                {student.full_name.charAt(0)}
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">{student.full_name}</h2>
                <p className="text-slate-500 text-sm">{student.school} • {student.grade}</p>
              </div>
            </div>

            <div className="space-y-4 pt-6 border-t border-slate-50">
              <div className="flex items-center gap-3 text-sm">
                <Phone className="w-4 h-4 text-slate-400" />
                <span className="text-slate-600 font-medium">{student.phone}</span>
              </div>
              {student.email && (
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-600 font-medium">{student.email}</span>
                </div>
              )}
              {student.address && (
                <div className="flex items-center gap-3 text-sm">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-600 font-medium">{student.address}</span>
                </div>
              )}
              <div className="flex items-center gap-3 text-sm">
                <GraduationCap className="w-4 h-4 text-slate-400" />
                <span className="text-slate-600 font-medium">{student.school}, {student.grade}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span className="text-slate-600 font-medium">
                  Qo'shilgan: {student.created_at?.split('T')[0]}
                </span>
              </div>
            </div>

            {/* Kurslar soni */}
            <div className="pt-4 border-t border-slate-50">
              <div className="flex items-center gap-3 text-sm">
                <BookOpen className="w-4 h-4 text-indigo-400" />
                <span className="text-slate-600 font-medium">
                  {courses.length} ta kursga yozilgan
                </span>
              </div>
            </div>
          </div>

          {/* Oy holati kartasi */}
          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-4">
              {monthLabel(thisMonth)} holati
            </h3>
            <div className="space-y-3">
              {courses.length === 0 && (
                <p className="text-slate-400 text-sm">Kurslar yo'q</p>
              )}
              {courses.map((course) => {
                const ms = getMonthStatus(course, thisMonth);
                return (
                  <div key={course.course_id} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600 font-medium truncate max-w-[140px]">
                        {course.course_name}
                      </span>
                      {ms.complete ? (
                        <span className="text-emerald-600 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> To'liq
                        </span>
                      ) : (
                        <span className="text-amber-500 font-bold">
                          -{ms.remaining.toLocaleString()}
                        </span>
                      )}
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5">
                      <div
                        className={cn(
                          'h-1.5 rounded-full transition-all',
                          ms.complete ? 'bg-emerald-500' : 'bg-amber-400'
                        )}
                        style={{
                          width: `${Math.min(100, (ms.paid / course.course_price) * 100)}%`,
                        }}
                      />
                    </div>
                    <div className="text-xs text-slate-400">
                      {ms.paid.toLocaleString()} / {course.course_price.toLocaleString()} so'm
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Courses & Payments ── */}
        <div className="lg:col-span-2 space-y-6">
          {courses.length === 0 ? (
            <div className="bg-white p-12 rounded-[2.5rem] border border-slate-100 shadow-sm text-center">
              <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-400 font-medium">Hech qanday kursga yozilmagan</p>
            </div>
          ) : (
            courses.map((course) => {
              const isExpanded = expandedCourse === course.course_id;
              const ms = getMonthStatus(course, thisMonth);

              return (
                <div
                  key={course.course_id}
                  className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden"
                >
                  {/* Kurs header */}
                  <div
                    className="p-6 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
                    onClick={() =>
                      setExpandedCourse(isExpanded ? null : course.course_id)
                    }
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center">
                        <BookOpen className="w-6 h-6 text-indigo-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900">{course.course_name}</h3>
                        <p className="text-sm text-slate-400">
                          Oylik: {course.course_price.toLocaleString()} so'm
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {ms.complete ? (
                        <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-xs font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> To'liq
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-xs font-bold flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          Qoldiq: {ms.remaining.toLocaleString()}
                        </span>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openModal(course);
                        }}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-700 transition-all text-sm"
                      >
                        <Plus className="w-4 h-4" /> To'lov
                      </button>
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-slate-400" />
                      )}
                    </div>
                  </div>

                  {/* To'lovlar ro'yxati */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden border-t border-slate-50"
                      >
                        <div className="p-6 space-y-3">
                          {course.payments.length === 0 ? (
                            <div className="text-center py-8">
                              <Clock className="w-10 h-10 text-slate-200 mx-auto mb-2" />
                              <p className="text-slate-400 text-sm">Hozircha to'lovlar yo'q</p>
                            </div>
                          ) : (
                            course.payments.map((payment) => (
                              <div
                                key={payment.id}
                                className="flex items-center justify-between p-4 rounded-2xl border border-slate-50 hover:border-indigo-100 transition-all bg-slate-50/50"
                              >
                                <div className="flex items-center gap-4">
                                  <div
                                    className={cn(
                                      'w-10 h-10 rounded-xl flex items-center justify-center',
                                      payment.status === 'paid'
                                        ? 'bg-emerald-50 text-emerald-600'
                                        : 'bg-amber-50 text-amber-600'
                                    )}
                                  >
                                    <CreditCard className="w-5 h-5" />
                                  </div>
                                  <div>
                                    <div className="font-bold text-slate-900">
                                      {payment.amount.toLocaleString()} so'm
                                    </div>
                                    <div className="text-xs text-slate-400">
                                      {monthLabel(payment.month)}
                                      {payment.note && ` • ${payment.note}`}
                                    </div>
                                  </div>
                                </div>
                                <span
                                  className={cn(
                                    'px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider',
                                    payment.status === 'paid'
                                      ? 'bg-emerald-50 text-emerald-600'
                                      : 'bg-amber-50 text-amber-600'
                                  )}
                                >
                                  {payment.status === 'paid' ? "To'langan" : 'Kutilmoqda'}
                                </span>
                              </div>
                            ))
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ── Payment Modal ── */}
      <AnimatePresence>
        {showModal && modalCourse && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">To'lov qo'shish</h2>
                  <p className="text-sm text-slate-400">{modalCourse.course_name}</p>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-white rounded-xl transition-all text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Oy holati */}
              {(() => {
                const ms = getMonthStatus(modalCourse, paymentForm.month);
                return (
                  <div className="px-6 pt-4">
                    <div className="bg-slate-50 rounded-2xl p-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">{monthLabel(paymentForm.month)} uchun:</span>
                        <span className="font-bold text-slate-700">
                          {ms.paid.toLocaleString()} / {modalCourse.course_price.toLocaleString()} so'm
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div
                          className={cn(
                            'h-2 rounded-full transition-all',
                            ms.complete ? 'bg-emerald-500' : 'bg-indigo-500'
                          )}
                          style={{
                            width: `${Math.min(100, (ms.paid / modalCourse.course_price) * 100)}%`,
                          }}
                        />
                      </div>
                      {ms.complete ? (
                        <p className="text-emerald-600 text-xs font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Bu oy to'liq to'langan
                        </p>
                      ) : (
                        <p className="text-slate-400 text-xs">
                          Qoldiq: {ms.remaining.toLocaleString()} so'm
                        </p>
                      )}
                    </div>
                  </div>
                );
              })()}

              <div className="p-6 space-y-4">
                {/* Oy tanlash */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Qaysi oy uchun</label>
                  <select
                    value={paymentForm.month}
                    onChange={(e) => setPaymentForm({ ...paymentForm, month: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  >
                    {[0, 1, 2, 3, 4, 5].map((offset) => {
                      const d = new Date();
                      d.setMonth(d.getMonth() - offset);
                      const val = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
                      return (
                        <option key={val} value={val}>
                          {monthLabel(val)}
                        </option>
                      );
                    })}
                  </select>
                </div>

                {/* Summa */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Summa (so'm)</label>
                  <input
                    required
                    type="number"
                    value={paymentForm.amount}
                    onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                    placeholder={`Oylik: ${modalCourse.course_price.toLocaleString()}`}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  />
                </div>

                {/* Holat */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Holati</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setPaymentForm({ ...paymentForm, status: 'paid' })}
                      className={cn(
                        'py-3 rounded-xl font-bold border transition-all flex items-center justify-center gap-2',
                        paymentForm.status === 'paid'
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-600'
                          : 'border-slate-100 text-slate-400'
                      )}
                    >
                      <CheckCircle2 className="w-4 h-4" /> To'langan
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentForm({ ...paymentForm, status: 'pending' })}
                      className={cn(
                        'py-3 rounded-xl font-bold border transition-all flex items-center justify-center gap-2',
                        paymentForm.status === 'pending'
                          ? 'bg-amber-50 border-amber-200 text-amber-600'
                          : 'border-slate-100 text-slate-400'
                      )}
                    >
                      <Clock className="w-4 h-4" /> Kutilmoqda
                    </button>
                  </div>
                </div>

                {/* Izoh */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">
                    Izoh <span className="text-slate-400 font-normal">(ixtiyoriy)</span>
                  </label>
                  <input
                    type="text"
                    value={paymentForm.note}
                    onChange={(e) => setPaymentForm({ ...paymentForm, note: e.target.value })}
                    placeholder="Masalan: naqd pul"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={handleAddPayment}
                    disabled={saving || !paymentForm.amount}
                    className="flex-1 bg-indigo-600 text-white py-4 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                    Saqlash
                  </button>
                  <button
                    onClick={() => setShowModal(false)}
                    className="flex-1 bg-slate-100 text-slate-600 py-4 rounded-2xl font-bold hover:bg-slate-200 transition-all"
                  >
                    Bekor qilish
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};