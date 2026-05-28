import { useState } from 'react';
import { useLang } from '@/contexts/LanguageContext';
import type { Lang } from '@/contexts/LanguageContext';

const l = (lang: Lang, es: string, it: string, en: string) =>
  lang === 'it' ? it : lang === 'en' ? en : es;

interface Entry {
  imageUrl: string;
  componentName: string;
  system: string;
  confidence: number;
  condition: string;
  date: string;
  issues: Array<{ title: string; severity: string }>;
  notes?: string;
}
interface Props {
  entries: Entry[];
  onClear: () => void;
  onUpdateNote: (date: string, note: string) => void;
}

const SEV_COLOR: Record<string, string> = {
  high: 'bg-red-100 text-red-700 border-red-200',
  medium: 'bg-amber-100 text-amber-700 border-amber-200',
  low: 'bg-green-100 text-green-700 border-green-200',
};
const SEV_DOT: Record<string, string> = {
  high: 'bg-red-500',
  medium: 'bg-amber-500',
  low: 'bg-green-500',
};

function NoteEditor({ entry, onUpdateNote, lang }: { entry: Entry; onUpdateNote: (date: string, note: string) => void; lang: Lang }) {
  const [draft, setDraft] = useState(entry.notes ?? '');
  const [saved, setSaved] = useState(false);

  const save = () => {
    onUpdateNote(entry.date, draft);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  return (
    <div className="pt-2 border-t border-gray-100 mt-2">
      <div className="text-xs font-bold text-gray-500 mb-1.5">
        📝 {l(lang, 'Notas manuales', 'Note manuali', 'Manual notes')}
      </div>
      <textarea
        value={draft}
        onChange={e => setDraft(e.target.value)}
        placeholder={l(lang, 'Agregar nota manual...', 'Aggiungi nota manuale...', 'Add manual note...')}
        className="w-full text-xs border border-gray-200 rounded-xl p-2.5 resize-none focus:outline-none focus:border-emerald-400 bg-white leading-relaxed"
        rows={3}
      />
      <button
        onClick={save}
        className={`mt-1.5 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors active:scale-95 ${
          saved
            ? 'bg-green-100 text-green-700'
            : 'bg-emerald-600 text-white active:bg-emerald-700'
        }`}
      >
        {saved
          ? l(lang, '✅ Guardado', '✅ Salvato', '✅ Saved')
          : l(lang, 'Guardar nota', 'Salva nota', 'Save note')}
      </button>
      {entry.notes && entry.notes.trim() && (
        <div className="mt-2 text-xs text-gray-500 italic bg-amber-50 border border-amber-100 rounded-lg p-2 leading-relaxed">
          💬 {entry.notes}
        </div>
      )}
    </div>
  );
}

export default function History({ entries, onClear, onUpdateNote }: Props) {
  const { lang } = useLang();
  const [filter, setFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [expanded, setExpanded] = useState<number | null>(null);

  const sorted = [...entries].reverse();
  const filtered = filter === 'all' ? sorted : sorted.filter(e => e.issues.some(i => i.severity === filter));

  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString(
      lang === 'en' ? 'en-US' : lang === 'it' ? 'it-IT' : 'es-AR',
      { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }
    );

  return (
    <div className="flex flex-col min-h-full">
      <div className="bg-white border-b border-gray-100 px-4 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between mb-3">
          <h1 className="font-black text-gray-900 text-lg">
            🕒 {l(lang, 'Historial', 'Cronologia', 'History')}
          </h1>
          {entries.length > 0 && (
            <button onClick={onClear} className="text-red-400 text-xs font-semibold active:text-red-600">
              🗑 {l(lang, 'Limpiar', 'Pulisci', 'Clear')}
            </button>
          )}
        </div>
        {entries.length > 0 && (
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-0.5">
            {(['all', 'high', 'medium', 'low'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${
                  filter === f ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-600'
                }`}
              >
                {f === 'all'
                  ? l(lang, 'Todos', 'Tutti', 'All')
                  : f === 'high'
                    ? l(lang, 'Alta', 'Alta', 'High')
                    : f === 'medium'
                      ? l(lang, 'Media', 'Media', 'Medium')
                      : l(lang, 'Baja', 'Bassa', 'Low')}
                {f !== 'all' && ` (${entries.filter(e => e.issues.some(i => i.severity === f)).length})`}
              </button>
            ))}
          </div>
        )}
      </div>

      {entries.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center py-16 px-6">
          <div className="text-6xl mb-4">📭</div>
          <div className="font-bold text-gray-700 text-base mb-1">
            {l(lang, 'Sin análisis previos', 'Nessuna analisi precedente', 'No previous analyses')}
          </div>
          <div className="text-gray-400 text-sm">
            {l(lang, 'Los análisis aparecerán aquí', 'Le analisi appariranno qui', 'Analyses will appear here')}
          </div>
        </div>
      ) : (
        <div className="px-4 py-4 space-y-3">
          {filtered.length === 0 && (
            <div className="text-center text-gray-400 text-sm py-8">
              {l(lang, 'Sin resultados para este filtro', 'Nessun risultato per questo filtro', 'No results for this filter')}
            </div>
          )}
          {filtered.map((e, i) => {
            const isOpen = expanded === i;
            const highCount = e.issues.filter(x => x.severity === 'high').length;
            const medCount = e.issues.filter(x => x.severity === 'medium').length;
            const hasNote = e.notes && e.notes.trim();
            return (
              <div key={i} className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                <button className="w-full text-left" onClick={() => setExpanded(isOpen ? null : i)}>
                  <div className="flex items-center gap-3 p-4">
                    <img src={e.imageUrl} alt="" className="w-14 h-14 object-cover rounded-xl border border-gray-100 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-gray-900 text-sm truncate">{e.componentName}</div>
                      <div className="text-gray-500 text-xs">{e.system}</div>
                      <div className="text-gray-400 text-xs mt-0.5">{fmtDate(e.date)}</div>
                    </div>
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      <span className="font-black text-emerald-600 text-sm">{e.confidence}%</span>
                      {hasNote && <span className="text-amber-500 text-xs">📝</span>}
                      <span className="text-gray-400 text-lg">{isOpen ? '▲' : '▼'}</span>
                    </div>
                  </div>
                  <div className="px-4 pb-3 flex gap-2 flex-wrap">
                    {highCount > 0 && (
                      <span className={`text-xs px-2 py-0.5 rounded-full border font-bold ${SEV_COLOR.high}`}>
                        🔴 {highCount} {l(lang, 'alta', 'alta', 'high')}
                      </span>
                    )}
                    {medCount > 0 && (
                      <span className={`text-xs px-2 py-0.5 rounded-full border font-bold ${SEV_COLOR.medium}`}>
                        🟡 {medCount} {l(lang, 'media', 'media', 'medium')}
                      </span>
                    )}
                    {e.condition && (
                      <span className="text-xs px-2 py-0.5 rounded-full border font-semibold bg-blue-50 text-blue-700 border-blue-200">
                        {e.condition}
                      </span>
                    )}
                  </div>
                </button>
                {isOpen && (
                  <div className="border-t border-gray-100 px-4 py-3 bg-gray-50 space-y-2">
                    {e.issues.map((iss, j) => (
                      <div key={j} className="flex items-start gap-2">
                        <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${SEV_DOT[iss.severity] || 'bg-gray-400'}`} />
                        <span className="text-gray-700 text-xs">{iss.title}</span>
                      </div>
                    ))}
                    <NoteEditor entry={e} onUpdateNote={onUpdateNote} lang={lang} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
