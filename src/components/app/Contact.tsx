import { useLang } from '@/contexts/LanguageContext';

const contacts = [
  {
    role: 'ceo',
    name: 'Sara Miotto',
    title: 'CEO',
    phone: '+54 9 3516 97-3809',
    wa: 'https://wa.me/5493516973809',
    email: 'gerencia@satogreenenergy.com',
    avatar: '👩‍💼',
    flag: '🇦🇷',
    location: 'Argentina',
  },
  {
    role: 'ceo',
    name: 'Tomas Loppo',
    title: 'CEO',
    phone: '+54 9 2216 81-5742',
    wa: 'https://wa.me/5492216815742',
    email: 'gerencia@satogreenenergy.com',
    avatar: '👨‍💼',
    flag: '🇦🇷',
    location: 'Argentina',
  },
  {
    role: 'projectManager',
    name: 'Luigi Casto',
    title: 'Project & Process Manager',
    phone: '+39 391 347 0831',
    wa: 'https://wa.me/393913470831',
    email: 'lcasto@satogreenenergy.com',
    avatar: '👨‍🔬',
    flag: '🇮🇹',
    location: 'Italia / Europa',
  },
];

const offices = [
  { flag: '🇦🇷', country: 'Argentina', city: 'Buenos Aires / Córdoba', detail: 'Operaciones Cono Sur' },
  { flag: '🇮🇹', country: 'Italia', city: 'Veneto / Norte Italia', detail: 'Operazioni Europee' },
  { flag: '🇪🇺', country: 'Europa', city: 'España, Italia', detail: 'Water Credit / Agua Positiva' },
];

export default function Contact() {
  const { t, lang } = useLang();

  const openEmail = (to = 'gerencia@satogreenenergy.com') => {
    const subject = encodeURIComponent(t('subjectEmail'));
    const body = encodeURIComponent(t('msgBody'));
    window.open(`mailto:${to}?subject=${subject}&body=${body}`);
  };

  return (
    <div className="flex flex-col min-h-full px-4 py-5 space-y-5">
      {/* Header */}
      <div className="bg-gradient-to-br from-emerald-900 to-teal-800 rounded-2xl p-5 text-white">
        <div className="text-3xl mb-2">🌿</div>
        <h1 className="font-extrabold text-xl leading-tight mb-1">{t('contactTitle')}</h1>
        <p className="text-emerald-200 text-xs leading-relaxed">{t('contactSubtitle')}</p>
      </div>

      {/* Team contacts */}
      <div className="space-y-3">
        {contacts.map((c, i) => (
          <div key={i} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                {c.avatar}
              </div>
              <div className="flex-1">
                <div className="font-bold text-gray-900 text-base">{c.name}</div>
                <div className="text-emerald-700 text-xs font-semibold">{t(c.role)} — {c.title}</div>
                <div className="text-gray-400 text-xs mt-0.5">{c.flag} {c.location}</div>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => window.open(c.wa)}
                className="flex-1 bg-green-500 text-white font-bold py-2.5 rounded-xl text-xs active:scale-95 transition-transform flex items-center justify-center gap-1.5"
              >
                💬 WhatsApp
              </button>
              <button
                onClick={() => window.open(`tel:${c.phone.replace(/\s/g, '')}`)}
                className="flex-1 border border-gray-200 text-gray-700 font-semibold py-2.5 rounded-xl text-xs active:scale-95 transition-transform flex items-center justify-center gap-1.5"
              >
                📞 {t('call')}
              </button>
              <button
                onClick={() => openEmail(c.email)}
                className="flex-1 bg-emerald-600 text-white font-bold py-2.5 rounded-xl text-xs active:scale-95 transition-transform flex items-center justify-center gap-1.5"
              >
                ✉️ Email
              </button>
            </div>
            <div className="mt-2 text-center text-gray-400 text-xs">{c.phone}</div>
          </div>
        ))}
      </div>

      {/* Corporate email */}
      <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-xl">📧</div>
          <div>
            <div className="font-bold text-gray-900 text-sm">{t('email')}</div>
            <div className="text-gray-500 text-xs">gerencia@satogreenenergy.com</div>
          </div>
        </div>
        <button
          onClick={() => openEmail()}
          className="w-full bg-emerald-600 text-white font-bold py-3 rounded-xl text-sm active:scale-95 transition-transform"
        >
          📩 {t('sendEmail')}
        </button>
      </div>

      {/* Offices */}
      <div>
        <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">
          {lang === 'es' ? 'Presencia Internacional' : lang === 'it' ? 'Presenza Internazionale' : 'International Presence'}
        </h2>
        <div className="space-y-2">
          {offices.map((o, i) => (
            <div key={i} className="bg-white border border-gray-100 rounded-xl px-4 py-3 flex items-center gap-3 shadow-sm">
              <span className="text-2xl">{o.flag}</span>
              <div>
                <div className="font-semibold text-gray-900 text-sm">{o.country} — {o.city}</div>
                <div className="text-gray-500 text-xs">{o.detail}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Agua Positiva / Water Credit */}
      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xl">💧</span>
          <span className="font-bold text-blue-800 text-sm">Water Credit / Agua Positiva</span>
        </div>
        <p className="text-blue-700 text-xs leading-relaxed">
          {lang === 'es' && 'Sa.To es representante oficial del programa Water Credit / Agua Positiva en Italia, España y Argentina. USD 3.11/m³ de agua recuperada certificada.'}
          {lang === 'it' && 'Sa.To è rappresentante ufficiale del programma Water Credit / Agua Positiva in Italia, Spagna e Argentina. USD 3,11/m³ di acqua recuperata certificata.'}
          {lang === 'en' && 'Sa.To is the official representative of the Water Credit / Agua Positiva program in Italy, Spain and Argentina. USD 3.11/m³ of certified recovered water.'}
        </p>
      </div>

      <div className="h-4" />
    </div>
  );
}
