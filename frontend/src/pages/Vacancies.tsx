import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Briefcase, MapPin, Clock, DollarSign, ArrowRight, X, Send, CheckCircle2, ChevronDown } from 'lucide-react';
import { getVacancies, createVacancyApplication } from '../api/api';

interface Vacancy {
  id: number;
  title: string;
  description: string;
  requirements: string[];
  salary: string;
  type: string;
  location: string;
  status: string;
  date: string;
}

interface ApplicationForm {
  full_name: string;
  phone: string;
  education: string;
  certificates: string[];
  certificate_level: string;
}

const EDUCATION_OPTIONS = [
  'Oliy ta\'lim',
  'O\'rta-maxsus ta\'lim',
  'O\'rta ta\'lim',
  'Bakalavr',
  'Magistr',
  'PhD',
];

const CERTIFICATE_OPTIONS = [
  'IELTS',
  'TOEFL',
  'Milliy sertifikat',
  'Cambridge',
  'Duolingo English Test',
  'Yo\'q',
];

export const Vacancies = () => {
  const [vacancies, setVacancies] = React.useState<Vacancy[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [selectedVacancy, setSelectedVacancy] = React.useState<Vacancy | null>(null);
  const [submitted, setSubmitted] = React.useState(false);
  const [formData, setFormData] = React.useState<ApplicationForm>({
    full_name: '',
    phone: '',
    education: '',
    certificates: [],
    certificate_level: '',
  });

  React.useEffect(() => {
    getVacancies()
      .then((data: Vacancy[]) => setVacancies(data.filter(v => v.status === 'active')))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const toggleCertificate = (cert: string) => {
    setFormData(prev => ({
      ...prev,
      certificates: prev.certificates.includes(cert)
        ? prev.certificates.filter(c => c !== cert)
        : [...prev.certificates, cert]
    }));
  };

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  try {
    await createVacancyApplication({
      vacancy_id: selectedVacancy!.id,
      full_name: formData.full_name,
      phone: formData.phone,
      education: formData.education,
      certificates: formData.certificates,
      certificate_level: formData.certificate_level,
    });
    setSubmitted(true);
  } catch (err) {
    console.error('Ariza yuborishda xatolik:', err);
    alert("Ariza yuborishda xatolik yuz berdi. Qaytadan urinib ko'ring.");
  }
};

  const closeModal = () => {
    setSelectedVacancy(null);
    setSubmitted(false);
    setFormData({ full_name: '', phone: '', education: '', certificates: [], certificate_level: '' });
  };

  return (
    <div className="min-h-screen bg-slate-50 py-20">
      <div className="max-w-7xl mx-auto px-4 space-y-16">

        {/* Header */}
        <div className="text-center space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 text-indigo-600 text-sm font-bold"
          >
            <Briefcase className="w-4 h-4" /> Vakansiyalar
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-6xl font-black text-slate-900 tracking-tight"
          >
            Bizning jamoaga <span className="text-indigo-600">qo'shiling</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-slate-500 max-w-2xl mx-auto"
          >
            Kelajakni birgalikda quramiz. O'z sohangizning ustasi bo'lsangiz, biz sizni kutamiz!
          </motion.p>
        </div>

        {/* Cards */}
        {loading ? (
          <div className="text-center py-20 text-slate-400">Yuklanmoqda...</div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {vacancies.map((vacancy, i) => (
              <motion.div
                key={vacancy.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -8 }}
                className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col h-full group"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="bg-indigo-50 p-4 rounded-2xl group-hover:bg-indigo-600 transition-all">
                    <Briefcase className="w-6 h-6 text-indigo-600 group-hover:text-white transition-all" />
                  </div>
                  <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-bold uppercase tracking-wider">
                    {vacancy.type}
                  </span>
                </div>

                <div className="space-y-4 flex-1">
                  <h3 className="text-2xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                    {vacancy.title}
                  </h3>
                  <p className="text-slate-500 line-clamp-3 leading-relaxed">
                    {vacancy.description}
                  </p>

                  {/* Requirements */}
                  {vacancy.requirements?.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2">
                      {vacancy.requirements.slice(0, 3).map((req, idx) => (
                        <span key={idx} className="px-2 py-1 bg-slate-50 text-slate-500 rounded-lg text-xs font-medium border border-slate-100">
                          {req}
                        </span>
                      ))}
                      {vacancy.requirements.length > 3 && (
                        <span className="px-2 py-1 bg-slate-50 text-slate-400 rounded-lg text-xs">
                          +{vacancy.requirements.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4 pt-4">
                    <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                      <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                      {vacancy.location}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-emerald-600 font-bold">
                      <DollarSign className="w-4 h-4 shrink-0" />
                      {vacancy.salary}
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                    <Clock className="w-4 h-4" />
                    {vacancy.date}
                  </div>
                  <button
                    onClick={() => setSelectedVacancy(vacancy)}
                    className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all hover:gap-3 shadow-md shadow-indigo-200"
                  >
                    Ariza yuborish <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}

            {vacancies.length === 0 && (
              <div className="col-span-full py-20 text-center space-y-4">
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto">
                  <Briefcase className="w-10 h-10 text-slate-300" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900">Hozircha bo'sh ish o'rinlari yo'q</h3>
                <p className="text-slate-500">Keyinroq yana tekshirib ko'ring.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {selectedVacancy && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex justify-between items-start">
                <div>
                  <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-1">Ariza yuborish</p>
                  <h2 className="text-xl font-bold text-slate-900">{selectedVacancy.title}</h2>
                  <div className="flex items-center gap-3 mt-2 text-sm text-slate-500">
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{selectedVacancy.location}</span>
                    <span className="flex items-center gap-1 text-emerald-600 font-semibold"><DollarSign className="w-3 h-3" />{selectedVacancy.salary}</span>
                  </div>
                </div>
                <button onClick={closeModal} className="p-2 hover:bg-white rounded-xl transition-all text-slate-400 hover:text-slate-600">
                  <X className="w-6 h-6" />
                </button>
              </div>

              {submitted ? (
                <div className="p-12 text-center space-y-4">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                  </motion.div>
                  <h3 className="text-xl font-bold text-slate-900">Arizangiz yuborildi!</h3>
                  <p className="text-slate-500">Tez orada siz bilan bog'lanamiz.</p>
                  <button onClick={closeModal} className="text-indigo-600 font-semibold hover:underline">Yopish</button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="p-8 space-y-5 overflow-y-auto flex-1">

                  {/* Ism */}
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Ism va Familiya <span className="text-red-500">*</span></label>
                    <input
                      required
                      type="text"
                      value={formData.full_name}
                      onChange={e => setFormData({...formData, full_name: e.target.value})}
                      placeholder="Ali Valiyev"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    />
                  </div>

                  {/* Telefon */}
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Telefon raqam <span className="text-red-500">*</span></label>
                    <input
                      required
                      type="tel"
                      value={formData.phone}
                      onChange={e => setFormData({...formData, phone: e.target.value})}
                      placeholder="+998 90 123 45 67"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    />
                  </div>

                  {/* Ta'lim */}
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Ta'lim darajasi <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <select
                        required
                        value={formData.education}
                        onChange={e => setFormData({...formData, education: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all appearance-none bg-white"
                      >
                        <option value="">Tanlang...</option>
                        {EDUCATION_OPTIONS.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* Sertifikatlar */}
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">
                      Sertifikatlar
                      <span className="text-xs font-normal text-slate-400 ml-2">(bir nechtasini tanlash mumkin)</span>
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {CERTIFICATE_OPTIONS.map(cert => (
                        <button
                          key={cert}
                          type="button"
                          onClick={() => toggleCertificate(cert)}
                          className={`px-3 py-2 rounded-xl text-sm font-semibold border transition-all ${
                            formData.certificates.includes(cert)
                              ? 'bg-indigo-600 text-white border-indigo-600'
                              : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'
                          }`}
                        >
                          {cert}
                        </button>
                      ))}
                    </div>

                  </div>

                  {/* Sertifikat darajasi */}
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">
                      Sertifikat darajasi
                      <span className="text-xs font-normal text-slate-400 ml-2">(A1, A2, B1, B2, C1...)</span>
                    </label>
                    <input
                      type="text"
                      value={formData.certificate_level}
                      onChange={e => setFormData({...formData, certificate_level: e.target.value})}
                      placeholder="Masalan: B2, 6.5, Yo'q"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 mt-2"
                  >
                    <Send className="w-5 h-5" /> Yuborish
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};