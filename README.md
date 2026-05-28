# 🌿 Sa.To DiagnosticAI — v3.0

**AI-powered industrial plant diagnostic app**  
Sa.To Green Energy S.A. · Argentina · Italia · Europa

---

## 🚀 Avvio rapido (3 comandi)

```bash
# 1. Installa dipendenze
pnpm install   # oppure: npm install

# 2. Avvia in sviluppo
pnpm dev       # oppure: npm run dev

# 3. Build produzione
pnpm build     # oppure: npm run build
```

L'app sarà disponibile su **http://localhost:5173**

---

## 📁 Struttura del progetto

```
src/
├── App.tsx                          # App root + navigazione + stato globale
├── contexts/
│   └── LanguageContext.tsx          # i18n: Español / Italiano / English
├── data/
│   └── catalog.ts                   # Catalogo 15 equipment (7 categorie)
└── components/app/
    ├── Onboarding.tsx               # Schermate introduttive + selezione lingua
    ├── Dashboard.tsx                # Pannello statistiche + accesso rapido
    ├── Scan.tsx                     # ⭐ CORE: scanner IA + diagnosi + report
    ├── Catalog.tsx                  # Catalogo filtrato per categoria
    ├── History.tsx                  # Storico analisi con filtri severità
    ├── Contact.tsx                  # Contatti Sa.To (CEO + PM)
    └── Premium.tsx                  # Freemium: Free / Premium $49 / Enterprise
```

---

## ⚙️ Configurazione API

L'app usa **Claude claude-sonnet-4-20250514** per l'analisi delle immagini.

La chiave API viene gestita automaticamente nell'ambiente Claude.ai.

Per girare in locale aggiungi in `src/components/app/Scan.tsx`:
```typescript
headers: {
  'Content-Type': 'application/json',
  'x-api-key': import.meta.env.VITE_ANTHROPIC_API_KEY,
  'anthropic-version': '2023-06-01',
  'anthropic-dangerous-direct-browser-access': 'true',
}
```
Crea `.env.local`:
```
VITE_ANTHROPIC_API_KEY=sk-ant-...
```

---

## 💰 Modello Freemium

| Piano | Prezzo | Limiti | Funzioni |
|-------|--------|--------|----------|
| **Free** | $0 | 5 analisi/mese | Diagnosi base, Catalogo, Contatti |
| **Premium** | $49/mese | Illimitato | +PDF Report, +Storico, +Dashboard stats |
| **Enterprise** | Contatto | Multi-utente | White-label, API, supporto dedicato |

> Per attivare i pagamenti reali: integra **Stripe Checkout** in `Premium.tsx` → funzione `onActivate()`

---

## 🌍 Lingue supportate

- 🇦🇷 **Español** (default)
- 🇮🇹 **Italiano**
- 🇬🇧 **English**

Aggiungi traduzioni in `src/contexts/LanguageContext.tsx` → oggetto `translations`

---

## 🏭 Sistemi industriali coperti dalla diagnosi IA

| Sistema | Tecnologie incluse |
|---------|-------------------|
| 💧 **Efluentes / PTAR** | DAF, MBBR, Centrífuga, Bomba, Clarificador |
| ⚙️ **Biogas** | CSTR Digestor, E.R.A.S. 309©, Purificador H2S |
| ⚡ **Cogeneración CHP** | Motores FAW, Intercambiadores calor |
| ☀️ **Solar FV** | Paneles monocristalinos, Inversores |
| 💨 **Eólico** | Aerogeneradores industriales |
| 🍺 **Bioetanol** | Tanques fermentación, Columnas destilación |
| 🔥 **Pirólisis** | Reactores pirólisis, GreenDRY BioDryer© |

---

## 📦 Aggiungere equipment al catalogo

Modifica `src/data/catalog.ts` aggiungendo un oggetto `Equipment`:

```typescript
{
  id: 'nuovo-equip',
  nameEs: 'Nombre en español',
  nameIt: 'Nome in italiano', 
  nameEn: 'Name in English',
  category: 'water', // water|biogas|energy|solar|wind|ethanol|pyrolysis
  descEs: 'Descripción técnica...',
  descIt: 'Descrizione tecnica...',
  descEn: 'Technical description...',
  priceMin: 5000,
  priceMax: 25000,
  currency: 'USD',
  leadTimeDays: 60,
  icon: '🔧',
  commonIssues: {
    es: ['Problema 1', 'Problema 2'],
    it: ['Problema 1', 'Problema 2'],
    en: ['Problem 1', 'Problem 2'],
  }
}
```

---

## 📱 Deploy come PWA (Progressive Web App)

### Netlify (gratis, 5 minuti)
```bash
pnpm build
# Vai su netlify.com → drag & drop della cartella dist/
```

### Configurazione PWA (da aggiungere per installazione su telefono)
```bash
pnpm add -D vite-plugin-pwa
```
Aggiungere in `vite.config.ts`:
```typescript
import { VitePWA } from 'vite-plugin-pwa'

plugins: [
  react(),
  VitePWA({
    registerType: 'autoUpdate',
    manifest: {
      name: 'Sa.To DiagnosticAI',
      short_name: 'DiagnosticAI',
      theme_color: '#065f46',
      icons: [{ src: '/icon-192.png', sizes: '192x192', type: 'image/png' }]
    }
  })
]
```

---

## 🔧 Modifiche rapide consigliate per test

### 1. Testare con un'immagine reale di pompa
→ Tab **Scan** → carica foto → analizza

### 2. Aumentare limite Free
In `src/components/app/Scan.tsx`:
```typescript
const FREE_LIMIT = 5  // ← cambia questo numero
```

### 3. Cambiare prezzi nel catalogo
→ `src/data/catalog.ts` → modifica `priceMin` / `priceMax`

### 4. Aggiungere contatti
→ `src/components/app/Contact.tsx` → array `contacts`

### 5. Simulare Premium attivato
In `src/App.tsx`, cambia:
```typescript
const [isPremium, setIsPremium] = useState(true) // sempre Premium
```

---

## 📞 Contatti Sa.To Green Energy

| Nome | Ruolo | Telefono | Email |
|------|-------|---------|-------|
| Sara Miotto | CEO Argentina | +54 9 3516 97-3809 | gerencia@satogreenenergy.com |
| Tomas Loppo | CEO Argentina | +54 9 2216 81-5742 | gerencia@satogreenenergy.com |
| Luigi Casto | Project & Process Manager | +39 391 347 0831 | lcasto@satogreenenergy.com |

---

*Sa.To DiagnosticAI v3.0 — Built with React + TypeScript + Vite + Tailwind CSS + Claude AI*
