'use client';
import { useState, useEffect, useRef } from "react";

// ─── THEME ───
const T = { primary: "#F47B20", primaryLight: "#FFF3E8", bg: "#F2F2F7", card: "#FFFFFF", text: "#1A1A1A", mid: "#6B6B6B", light: "#999", border: "#E5E5E5", borderL: "#F0F0F0", sh: "0 2px 12px rgba(0,0,0,0.06)", shH: "0 4px 20px rgba(0,0,0,0.1)", r: 16, rs: 12 };

// ─── DISTRICTS ───
const DISTRICTS = [
  { id: "weho", name: "West Hollywood", emoji: "🌈", desc: "Русские рестораны, ночная жизнь" },
  { id: "hollywood", name: "Hollywood", emoji: "⭐", desc: "Бары, хайкинг, концерты" },
  { id: "glendale", name: "Glendale", emoji: "🏔️", desc: "Армянская кухня, семьи" },
  { id: "dtla", name: "Downtown LA", emoji: "🏙️", desc: "Кофе, книжные, лофты" },
  { id: "valley", name: "Studio City / Valley", emoji: "🌴", desc: "Speakeasy бары, тихо" },
  { id: "silverlake", name: "Silver Lake / Los Feliz", emoji: "🎨", desc: "Инди-сцена, обсерватория" },
  { id: "westside", name: "Santa Monica / Venice", emoji: "🏖️", desc: "Пляж, каналы, серфинг" },
  { id: "pasadena", name: "Pasadena", emoji: "🌸", desc: "Водопады, природа" },
  { id: "midcity", name: "Mid-City / Melrose", emoji: "🛍️", desc: "Кино, шоппинг, кафе" },
];

// ─── PLACE CATEGORIES ───
const PLACE_CATS = [
  { id: "restaurants", icon: "🍽️", title: "Рестораны", color: "#E74C3C" },
  { id: "bars", icon: "🍸", title: "Бары", color: "#8E44AD" },
  { id: "coffee", icon: "☕", title: "Кофе", color: "#F47B20" },
  { id: "hiking", icon: "🥾", title: "Хайкинг", color: "#27AE60" },
  { id: "interesting", icon: "✨", title: "Интересно", color: "#2980B9" },
  { id: "music", icon: "🎵", title: "Музыка", color: "#E91E8C" },
  { id: "cinema", icon: "🎬", title: "Кино", color: "#E67E22" },
];

const INITIAL_PLACES = [
  { id: 1, cat: "restaurants", district: "weho", name: "Тройка", address: "8826 Sunset Blvd, West Hollywood, CA", tip: "Настоящие пельмени. По четвергам живая музыка.", rating: 4.8, addedBy: "Мария К.", img: "🥟", photos: ["🍽️ Уютный зал", "📖 Пельмени, борщ, котлеты"], likes: 34 },
  { id: 2, cat: "restaurants", district: "hollywood", name: "Sochi Restaurant", address: "5765 Melrose Ave, Hollywood, CA", tip: "Хинкали 10/10, хачапури огонь. Летняя терраса.", rating: 4.7, addedBy: "Дима С.", img: "🫓", photos: ["☀️ Терраса", "🫓 Хачапури по-аджарски"], likes: 28 },
  { id: 3, cat: "restaurants", district: "glendale", name: "Ararat", address: "1000 S Glendale Ave, Glendale, CA", tip: "Армянская кухня, порции огромные.", rating: 4.6, addedBy: "Артур М.", img: "🍖", photos: ["🍖 Кебаб с рисом"], likes: 19 },
  { id: 4, cat: "bars", district: "valley", name: "The Other Door", address: "10437 Burbank Blvd, North Hollywood, CA", tip: "Speakeasy, пароль меняется каждую неделю.", rating: 4.9, addedBy: "Алекс Р.", img: "🥃", photos: ["🥃 Old Fashioned", "🚪 Секретная дверь"], likes: 52 },
  { id: 5, cat: "bars", district: "hollywood", name: "Good Times at Davey Wayne's", address: "1611 N El Centro Ave, Hollywood, CA", tip: "Вход через холодильник! 70-е стиль.", rating: 4.7, addedBy: "Лена В.", img: "🪩", photos: ["🧊 Вход через холодильник", "🪩 Диско-двор"], likes: 41 },
  { id: 6, cat: "coffee", district: "dtla", name: "Verve Coffee", address: "833 S Spring St, LA, CA", tip: "Pour-over на уровне. Лофт, свет идеальный.", rating: 4.8, addedBy: "Саша К.", img: "☕", photos: ["☕ Pour-over", "🏗️ Лофт"], likes: 37 },
  { id: 7, cat: "coffee", district: "midcity", name: "Alfred", address: "7580 Melrose Ave, LA, CA", tip: "Капучино хорош. Утром до 9 — пусто.", rating: 4.3, addedBy: "Оля Т.", img: "🥛", photos: ["🥛 Арт-капучино"], likes: 12 },
  { id: 8, cat: "hiking", district: "hollywood", name: "Runyon Canyon", address: "2000 N Fuller Ave, LA, CA", tip: "Правая тропа — виды лучше, людей меньше.", rating: 4.4, addedBy: "Макс Д.", img: "⛰️", photos: ["⛰️ Вид на LA", "🌅 Закат"], likes: 23 },
  { id: 9, cat: "hiking", district: "pasadena", name: "Eaton Canyon Falls", address: "1750 N Altadena Dr, Pasadena, CA", tip: "Водопад 12м! Лёгкий маршрут 5.5 км.", rating: 4.9, addedBy: "Игорь Н.", img: "💧", photos: ["💧 Водопад!", "🌿 Тропа для детей"], likes: 48 },
  { id: 10, cat: "hiking", district: "silverlake", name: "Griffith Observatory Trail", address: "2800 E Observatory Rd, LA, CA", tip: "На закате обязательно. Парковка бесплатная после 6.", rating: 4.8, addedBy: "Катя Л.", img: "🌅", photos: ["🌅 Hollywood Sign", "🌃 Ночной downtown"], likes: 55 },
  { id: 11, cat: "interesting", district: "dtla", name: "The Last Bookstore", address: "453 S Spring St, LA, CA", tip: "Тоннель из книг на 2 этаже.", rating: 4.7, addedBy: "Вера П.", img: "📚", photos: ["📚 Тоннель из книг", "🎨 Арт-инсталляции"], likes: 33 },
  { id: 12, cat: "interesting", district: "westside", name: "Venice Canals", address: "Venice Canals, Venice, CA", tip: "Тихие каналы рядом с Boardwalk.", rating: 4.6, addedBy: "Рома Г.", img: "🌊", photos: ["🌊 Каналы, утки", "🏡 Домики"], likes: 26 },
  { id: 13, cat: "music", district: "silverlake", name: "The Satellite", address: "1717 Silver Lake Blvd, LA, CA", tip: "Инди каждый вечер. ПН — бесплатный вход!", rating: 4.5, addedBy: "Паша Ж.", img: "🎸", photos: ["🎸 Интимная сцена"], likes: 18 },
  { id: 14, cat: "music", district: "hollywood", name: "Hollywood Bowl", address: "2301 N Highland Ave, LA, CA", tip: "Своё вино и еду можно! Приходи за час.", rating: 4.9, addedBy: "Наташа Ф.", img: "🎶", photos: ["🎶 Сцена-раковина", "🧺 Пикник"], likes: 61 },
  { id: 15, cat: "cinema", district: "hollywood", name: "El Capitan Theatre", address: "6838 Hollywood Blvd, CA", tip: "Диснеевские премьеры, органист перед показом.", rating: 4.8, addedBy: "Женя С.", img: "🎭", photos: ["🎭 Ар-деко зал", "🎹 Органист"], likes: 29 },
  { id: 16, cat: "cinema", district: "midcity", name: "New Beverly Cinema", address: "7165 Beverly Blvd, LA, CA", tip: "Тарантино выбирает фильмы. $12 двойной сеанс.", rating: 4.9, addedBy: "Кирилл М.", img: "🎞️", photos: ["🎞️ 35мм плёнка!", "🍿 Ретро-атмосфера"], likes: 44 },
];

// ─── USCIS ───
const USCIS_CATS = [
  { id: "greencard", icon: "🪪", title: "Грин-карта", subtitle: "Формы, сроки", docs: [
    { form: "I-485", name: "Заявление на грин-карту", desc: "Adjustment of Status" },
    { form: "I-130", name: "Петиция для родственника", desc: "Спонсирование через семью" },
    { form: "I-140", name: "Петиция от работодателя", desc: "Employment-based" },
    { form: "I-765", name: "Разрешение на работу (EAD)", desc: "Пока ждёте грин-карту" },
  ]},
  { id: "visa", icon: "✈️", title: "Визы", subtitle: "Рабочие, студенческие", docs: [
    { form: "I-129", name: "H-1B рабочая виза", desc: "Для специалистов" },
    { form: "I-20", name: "F-1 студенческая", desc: "Форма от учебного заведения" },
    { form: "DS-160", name: "Неиммиграционная виза", desc: "Заполняется онлайн" },
  ]},
  { id: "citizenship", icon: "🇺🇸", title: "Гражданство", subtitle: "Натурализация", docs: [
    { form: "N-400", name: "Заявление на натурализацию", desc: "Основная форма" },
    { form: "N-600", name: "Сертификат о гражданстве", desc: "Если уже гражданин" },
  ]},
  { id: "asylum", icon: "🛡️", title: "Убежище", subtitle: "Asylum, TPS", docs: [
    { form: "I-589", name: "Заявление на убежище", desc: "В течение 1 года" },
    { form: "I-821", name: "TPS", desc: "Temporary Protected Status" },
  ]},
];

const SECTIONS = [
  { id: "uscis", icon: "📋", title: "USCIS", desc: "Документы" },
  { id: "places", icon: "📍", title: "Места", desc: "От своих" },
  { id: "housing", icon: "🏠", title: "Жильё", desc: "Аренда", soon: true },
  { id: "jobs", icon: "💼", title: "Работа", desc: "Вакансии", soon: true },
  { id: "events", icon: "🎉", title: "События", desc: "Встречи", soon: true },
  { id: "chat-sec", icon: "💬", title: "AI Чат", desc: "Помощник" },
];

const CHAT_HINTS = ["Документы для грин-карты через брак?", "Сколько стоит N-400?", "Можно ли работать без EAD?", "Как проверить статус кейса?"];

export default function SvoiLA() {
  const [screen, setScreen] = useState("home");
  const [selUscis, setSelUscis] = useState(null);
  const [selDistrict, setSelDistrict] = useState(null);
  const [selPlaceCat, setSelPlaceCat] = useState(null);
  const [expanded, setExpanded] = useState(null);
  const [mapPicker, setMapPicker] = useState(null);
  const [liked, setLiked] = useState({});
  const [search, setSearch] = useState("");
  const [places, setPlaces] = useState(INITIAL_PLACES);
  const [user, setUser] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPlace, setNewPlace] = useState({ name: "", cat: "", address: "", tip: "" });
  const [chat, setChat] = useState([{ role: "assistant", text: "Привет! 👋 Я помощник для русскоязычных в LA. Спрашивай про USCIS, визы, грин-карты — отвечу понятно." }]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [mounted, setMounted] = useState(false);
  const chatEnd = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => setMounted(true), []);
  useEffect(() => { chatEnd.current?.scrollIntoView({ behavior: "smooth" }); }, [chat, typing]);

  const goHome = () => { setScreen("home"); setSelUscis(null); setSelDistrict(null); setSelPlaceCat(null); setExpanded(null); setMapPicker(null); setSearch(""); setShowAddForm(false); };
  const toggleLike = (id) => setLiked((p) => ({ ...p, [id]: !p[id] }));
  const openMap = (p, t) => { const q = encodeURIComponent(p.address); window.open(t === "google" ? `https://www.google.com/maps/search/?api=1&query=${q}` : `https://maps.apple.com/?q=${q}`, "_blank"); setMapPicker(null); };

  const handleSend = (t) => {
    const msg = t || input.trim(); if (!msg) return;
    setChat((p) => [...p, { role: "user", text: msg }]); setInput(""); setTyping(true);
    setTimeout(() => { setChat((p) => [...p, { role: "assistant", text: "В реальном приложении здесь будет ответ AI с данными из USCIS и базы мест. Это демо — скоро заработает! 🚀" }]); setTyping(false); }, 1200);
  };

  const handleGoogleLogin = () => {
    // Mock — in production: Supabase Auth with Google
    setUser({ name: "Пользователь", email: "user@gmail.com", avatar: "👤" });
  };

  const handleAddPlace = () => {
    if (!newPlace.name || !newPlace.cat || !newPlace.tip) return;
    const p = { id: Date.now(), ...newPlace, district: selDistrict.id, rating: 0, addedBy: user.name, img: PLACE_CATS.find(c => c.id === newPlace.cat)?.icon || "📍", photos: [], likes: 0 };
    setPlaces((prev) => [...prev, p]);
    setNewPlace({ name: "", cat: "", address: "", tip: "" });
    setShowAddForm(false);
  };

  const searchRes = search.trim().length >= 2 ? USCIS_CATS.flatMap(c => c.docs.filter(d => { const q = search.toLowerCase(); return d.form.toLowerCase().includes(q) || d.name.toLowerCase().includes(q); }).map(d => ({ ...d, catTitle: c.title, catIcon: c.icon }))) : [];
  const districtPlaces = selDistrict ? places.filter(p => p.district === selDistrict.id) : [];
  const catPlaces = selPlaceCat ? districtPlaces.filter(p => p.cat === selPlaceCat.id) : [];

  // Styles
  const card = { background: T.card, borderRadius: T.r, boxShadow: T.sh, border: `1px solid ${T.borderL}`, transition: "all 0.25s ease" };
  const back = { background: "none", border: "none", color: T.primary, fontSize: 14, fontWeight: 500, cursor: "pointer", padding: "12px 0 8px", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 4 };
  const pill = (a) => ({ padding: "10px 20px", borderRadius: 24, border: "none", fontWeight: 600, fontSize: 13, cursor: "pointer", fontFamily: "inherit", background: a ? T.primary : T.primaryLight, color: a ? "#fff" : T.primary, transition: "all 0.2s" });
  const inp = { width: "100%", padding: "14px 16px", background: T.card, border: `1px solid ${T.border}`, borderRadius: T.rs, color: T.text, fontSize: 14, fontFamily: "inherit", outline: "none", boxSizing: "border-box" };
  const sel = { ...inp, appearance: "none", WebkitAppearance: "none", backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath d='M6 8L1 3h10z' fill='%23999'/%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 14px center" };
  const label = { fontSize: 12, fontWeight: 600, color: T.mid, marginBottom: 6, display: "block" };

  return (
    <div style={{ fontFamily: "'Roboto', sans-serif", minHeight: "100vh", background: T.bg, color: T.text, maxWidth: 480, margin: "0 auto" }}>
      <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700;900&display=swap" rel="stylesheet" />

      {/* HEADER */}
      <header style={{ padding: "16px 20px", background: T.card, borderBottom: `1px solid ${T.borderL}`, display: "flex", alignItems: "center", justifyContent: "space-between", opacity: mounted ? 1 : 0, transition: "opacity 0.4s" }}>
        <div onClick={goHome} style={{ cursor: "pointer" }}>
          <h1 style={{ fontSize: 22, fontWeight: 900, margin: 0 }}><span style={{ color: T.primary }}>СВОИ</span> в LA</h1>
          <p style={{ margin: "1px 0 0", fontSize: 11, color: T.light }}>для русскоязычных в Лос-Анджелесе</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {user ? (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 12, color: T.mid, fontWeight: 500 }}>{user.name}</span>
              <div style={{ width: 36, height: 36, borderRadius: 12, background: T.primaryLight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>{user.avatar}</div>
            </div>
          ) : (
            <button onClick={handleGoogleLogin} style={{ ...pill(false), padding: "8px 14px", fontSize: 12, display: "flex", alignItems: "center", gap: 6 }}>
              <svg width="14" height="14" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              Войти
            </button>
          )}
        </div>
      </header>

      <main style={{ padding: "16px 16px 40px" }}>

        {/* ══ HOME ══ */}
        {screen === "home" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
            {SECTIONS.map((s, i) => (
              <button key={s.id} onClick={() => { if (s.soon) return; setScreen(s.id === "chat-sec" ? "chat" : s.id); }}
                style={{ ...card, padding: "20px 10px", cursor: s.soon ? "default" : "pointer", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", fontFamily: "inherit", color: T.text, position: "relative", opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(12px)", transition: `all 0.4s cubic-bezier(0.16,1,0.3,1) ${i * 0.05}s` }}
                onMouseEnter={(e) => { if (!s.soon) e.currentTarget.style.boxShadow = T.shH; }}
                onMouseLeave={(e) => { e.currentTarget.style.boxShadow = T.sh; }}>
                {s.soon && <div style={{ position: "absolute", top: 6, right: 6, fontSize: 8, fontWeight: 700, color: T.light, background: T.bg, padding: "2px 6px", borderRadius: 4, textTransform: "uppercase" }}>скоро</div>}
                <div style={{ fontSize: 28, marginBottom: 8, filter: s.soon ? "grayscale(0.6) opacity(0.4)" : "none" }}>{s.icon}</div>
                <div style={{ fontWeight: 700, fontSize: 13, opacity: s.soon ? 0.4 : 1 }}>{s.title}</div>
                <div style={{ fontSize: 11, color: T.mid, marginTop: 3, opacity: s.soon ? 0.3 : 0.7 }}>{s.desc}</div>
              </button>
            ))}
          </div>
        )}

        {/* ══ USCIS ══ */}
        {screen === "uscis" && (
          <div>
            <button onClick={goHome} style={back}>← Главная</button>
            <h2 style={{ fontSize: 20, fontWeight: 700, margin: "4px 0 4px" }}>Справочник USCIS</h2>
            <p style={{ fontSize: 13, color: T.mid, margin: "0 0 14px" }}>Все формы с пояснениями на русском</p>
            <div style={{ position: "relative", marginBottom: 14 }}>
              <div style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: T.light, fontSize: 15, pointerEvents: "none" }}>🔎</div>
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Поиск формы..." style={{ ...inp, paddingLeft: 42, borderColor: search ? T.primary : T.border }} />
              {search && <button onClick={() => setSearch("")} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: T.bg, border: "none", borderRadius: "50%", width: 24, height: 24, color: T.mid, fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>}
            </div>
            {search.trim().length >= 2 ? (
              <div>{searchRes.length > 0 ? searchRes.map((d, i) => (
                <div key={i} style={{ ...card, padding: "14px 16px", marginBottom: 8, cursor: "pointer" }} onClick={() => { setScreen("chat"); setInput(`Расскажи про ${d.form}`); }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 6, color: T.primary, background: T.primaryLight }}>{d.form}</span>
                    <span style={{ fontSize: 11, color: T.mid }}>{d.catIcon} {d.catTitle}</span>
                  </div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{d.name}</div>
                  <div style={{ fontSize: 12, color: T.mid, marginTop: 3 }}>{d.desc}</div>
                </div>
              )) : <p style={{ fontSize: 13, color: T.mid }}>Ничего не найдено</p>}</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {USCIS_CATS.map(c => (
                  <button key={c.id} onClick={() => { setSelUscis(c); setScreen("uscis-cat"); }}
                    style={{ ...card, display: "flex", alignItems: "center", gap: 14, padding: "16px", cursor: "pointer", fontFamily: "inherit", color: T.text, textAlign: "left" }}
                    onMouseEnter={(e) => { e.currentTarget.style.boxShadow = T.shH; }}
                    onMouseLeave={(e) => { e.currentTarget.style.boxShadow = T.sh; }}>
                    <div style={{ width: 48, height: 48, borderRadius: T.rs, background: T.primaryLight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0 }}>{c.icon}</div>
                    <div style={{ flex: 1 }}><div style={{ fontWeight: 700, fontSize: 15 }}>{c.title}</div><div style={{ fontSize: 12, color: T.mid, marginTop: 2 }}>{c.subtitle}</div></div>
                    <div style={{ color: T.light, fontSize: 16 }}>›</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ══ USCIS CATEGORY ══ */}
        {screen === "uscis-cat" && selUscis && (
          <div>
            <button onClick={() => setScreen("uscis")} style={back}>← Справочник</button>
            <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "4px 0 20px" }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: T.primaryLight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>{selUscis.icon}</div>
              <div><h2 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>{selUscis.title}</h2><p style={{ fontSize: 13, color: T.mid, margin: 0 }}>{selUscis.subtitle}</p></div>
            </div>
            {selUscis.docs.map((d, i) => (
              <div key={i} style={{ ...card, padding: "16px", marginBottom: 10, cursor: "pointer" }} onMouseEnter={(e) => { e.currentTarget.style.boxShadow = T.shH; }} onMouseLeave={(e) => { e.currentTarget.style.boxShadow = T.sh; }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ fontSize: 11, fontWeight: 700, padding: "4px 12px", borderRadius: 6, color: T.primary, background: T.primaryLight }}>{d.form}</span><span style={{ fontSize: 11, color: T.light }}>uscis.gov →</span></div>
                <div style={{ fontWeight: 600, fontSize: 14, marginTop: 10 }}>{d.name}</div>
                <div style={{ fontSize: 12, color: T.mid, marginTop: 4 }}>{d.desc}</div>
              </div>
            ))}
            <button onClick={() => { setScreen("chat"); setInput(`Расскажи про ${selUscis.title}`); }} style={{ ...pill(true), width: "100%", padding: "14px" }}>💬 Спросить AI</button>
          </div>
        )}

        {/* ══ PLACES → DISTRICTS ══ */}
        {screen === "places" && (
          <div>
            <button onClick={goHome} style={back}>← Главная</button>
            <h2 style={{ fontSize: 20, fontWeight: 700, margin: "4px 0 4px" }}>Места от своих</h2>
            <p style={{ fontSize: 13, color: T.mid, margin: "0 0 16px" }}>Выбери район Лос-Анджелеса</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {DISTRICTS.map((d, i) => {
                const count = places.filter(p => p.district === d.id).length;
                return (
                  <button key={d.id} onClick={() => { setSelDistrict(d); setScreen("district"); }}
                    style={{ ...card, display: "flex", alignItems: "center", gap: 14, padding: "16px", cursor: "pointer", fontFamily: "inherit", color: T.text, textAlign: "left", opacity: mounted ? 1 : 0, transform: mounted ? "translateX(0)" : "translateX(-12px)", transition: `all 0.4s cubic-bezier(0.16,1,0.3,1) ${i * 0.04}s` }}
                    onMouseEnter={(e) => { e.currentTarget.style.boxShadow = T.shH; }}
                    onMouseLeave={(e) => { e.currentTarget.style.boxShadow = T.sh; }}>
                    <div style={{ width: 48, height: 48, borderRadius: T.rs, background: T.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0 }}>{d.emoji}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 15 }}>{d.name}</div>
                      <div style={{ fontSize: 12, color: T.mid, marginTop: 2 }}>{d.desc}</div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: T.primary }}>{count}</span>
                      <span style={{ fontSize: 10, color: T.light }}>мест</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ══ DISTRICT → CATEGORIES ══ */}
        {screen === "district" && selDistrict && (
          <div>
            <button onClick={() => { setScreen("places"); setSelDistrict(null); }} style={back}>← Районы</button>
            <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "4px 0 18px" }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: T.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26 }}>{selDistrict.emoji}</div>
              <div><h2 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>{selDistrict.name}</h2><p style={{ fontSize: 13, color: T.mid, margin: 0 }}>{districtPlaces.length} мест от комьюнити</p></div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {PLACE_CATS.map(c => {
                const cnt = districtPlaces.filter(p => p.cat === c.id).length;
                if (cnt === 0) return null;
                return (
                  <button key={c.id} onClick={() => { setSelPlaceCat(c); setScreen("places-cat"); }}
                    style={{ ...card, padding: "18px 14px", display: "flex", alignItems: "center", gap: 12, cursor: "pointer", fontFamily: "inherit", color: T.text, textAlign: "left" }}
                    onMouseEnter={(e) => { e.currentTarget.style.boxShadow = T.shH; }}
                    onMouseLeave={(e) => { e.currentTarget.style.boxShadow = T.sh; }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: `${c.color}12`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>{c.icon}</div>
                    <div><div style={{ fontWeight: 700, fontSize: 14 }}>{c.title}</div><div style={{ fontSize: 12, color: T.mid, marginTop: 2 }}>{cnt} {cnt === 1 ? "место" : cnt < 5 ? "места" : "мест"}</div></div>
                  </button>
                );
              })}
            </div>
            {/* Add place */}
            <button onClick={() => { if (!user) { handleGoogleLogin(); } setShowAddForm(true); }}
              style={{ ...card, width: "100%", marginTop: 14, padding: "16px", border: `2px dashed ${T.primary}40`, color: T.primary, fontWeight: 600, fontSize: 14, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, boxShadow: "none" }}>
              ＋ Добавить место в {selDistrict.name}
            </button>
          </div>
        )}

        {/* ══ ADD PLACE FORM ══ */}
        {showAddForm && selDistrict && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 100, display: "flex", alignItems: "flex-end", justifyContent: "center" }} onClick={() => setShowAddForm(false)}>
            <div style={{ ...card, width: "100%", maxWidth: 480, borderRadius: "24px 24px 0 0", padding: "24px 20px 32px", maxHeight: "85vh", overflowY: "auto" }} onClick={(e) => e.stopPropagation()}>
              {/* Handle */}
              <div style={{ width: 40, height: 4, borderRadius: 2, background: T.border, margin: "0 auto 20px" }} />

              {!user ? (
                <div style={{ textAlign: "center", padding: "20px 0" }}>
                  <div style={{ fontSize: 48, marginBottom: 16 }}>🔐</div>
                  <h3 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 8px" }}>Войдите чтобы добавлять места</h3>
                  <p style={{ fontSize: 13, color: T.mid, margin: "0 0 20px" }}>Нужен Google-аккаунт для публикации</p>
                  <button onClick={handleGoogleLogin}
                    style={{ ...pill(true), padding: "14px 28px", fontSize: 15, display: "inline-flex", alignItems: "center", gap: 10 }}>
                    <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#fff" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#fff" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#fff" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#fff" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                    Войти через Google
                  </button>
                </div>
              ) : (<>
                <h3 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 4px" }}>Новое место</h3>
                <p style={{ fontSize: 13, color: T.mid, margin: "0 0 20px" }}>в районе {selDistrict.name}</p>

                <label style={label}>Название *</label>
                <input value={newPlace.name} onChange={(e) => setNewPlace({ ...newPlace, name: e.target.value })} placeholder="Например: Кафе Пушкин" style={{ ...inp, marginBottom: 14 }} />

                <label style={label}>Категория *</label>
                <select value={newPlace.cat} onChange={(e) => setNewPlace({ ...newPlace, cat: e.target.value })} style={{ ...sel, marginBottom: 14, color: newPlace.cat ? T.text : T.light }}>
                  <option value="">Выберите категорию</option>
                  {PLACE_CATS.map(c => <option key={c.id} value={c.id}>{c.icon} {c.title}</option>)}
                </select>

                <label style={label}>Адрес</label>
                <input value={newPlace.address} onChange={(e) => setNewPlace({ ...newPlace, address: e.target.value })} placeholder="1234 Street Name, LA, CA" style={{ ...inp, marginBottom: 14 }} />

                <label style={label}>Секретик / совет *</label>
                <textarea value={newPlace.tip} onChange={(e) => setNewPlace({ ...newPlace, tip: e.target.value })} placeholder="Что стоит знать? Лайфхак, совет, рекомендация..."
                  style={{ ...inp, minHeight: 80, resize: "vertical", marginBottom: 20 }} />

                <div style={{ display: "flex", gap: 10 }}>
                  <button onClick={() => setShowAddForm(false)} style={{ ...pill(false), flex: 1, padding: "14px" }}>Отмена</button>
                  <button onClick={handleAddPlace} disabled={!newPlace.name || !newPlace.cat || !newPlace.tip}
                    style={{ ...pill(true), flex: 2, padding: "14px", opacity: (!newPlace.name || !newPlace.cat || !newPlace.tip) ? 0.5 : 1 }}>
                    Опубликовать
                  </button>
                </div>
              </>)}
            </div>
          </div>
        )}

        {/* ══ PLACES IN CATEGORY ══ */}
        {screen === "places-cat" && selPlaceCat && selDistrict && (
          <div>
            <button onClick={() => { setScreen("district"); setSelPlaceCat(null); setExpanded(null); setMapPicker(null); }} style={back}>← {selDistrict.name}</button>
            <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "4px 0 18px" }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: `${selPlaceCat.color}12`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>{selPlaceCat.icon}</div>
              <div><h2 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>{selPlaceCat.title}</h2><p style={{ fontSize: 13, color: T.mid, margin: 0 }}>{selDistrict.name} · {catPlaces.length} {catPlaces.length === 1 ? "место" : catPlaces.length < 5 ? "места" : "мест"}</p></div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {catPlaces.map((p, i) => {
                const isExp = expanded === p.id;
                const isMap = mapPicker === p.id;
                const isLk = liked[p.id];
                return (
                <div key={p.id} style={{ ...card, overflow: "hidden", animation: `fadeIn 0.3s ease ${i * 0.06}s both`, borderColor: isExp ? T.primary + "40" : T.borderL }}>
                  <div onClick={() => { setExpanded(isExp ? null : p.id); setMapPicker(null); }}
                    style={{ padding: "16px", cursor: "pointer", transition: "background 0.15s" }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = T.bg; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = T.card; }}>
                    <div style={{ display: "flex", gap: 14 }}>
                      <div style={{ width: 50, height: 50, borderRadius: 14, background: `${selPlaceCat.color}10`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, flexShrink: 0 }}>{p.img}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", justifyContent: "space-between" }}><div style={{ fontWeight: 700, fontSize: 16 }}>{p.name}</div>{p.rating > 0 && <div style={{ fontSize: 13, color: T.primary, fontWeight: 700 }}>★ {p.rating}</div>}</div>
                        <div style={{ fontSize: 12, color: T.mid, marginTop: 3 }}>📍 {p.address || selDistrict.name}</div>
                      </div>
                    </div>
                    <div style={{ marginTop: 12, padding: "12px 14px", background: T.bg, borderRadius: 10, borderLeft: `3px solid ${selPlaceCat.color}` }}>
                      <div style={{ fontSize: 13, lineHeight: 1.5, color: T.mid }}>💡 {p.tip}</div>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10 }}>
                      <div style={{ fontSize: 11, color: T.light }}>от {p.addedBy}</div>
                      <div style={{ fontSize: 11, color: isExp ? T.primary : T.light, transition: "all 0.3s", transform: isExp ? "rotate(180deg)" : "" }}>▼</div>
                    </div>
                  </div>

                  {isExp && (
                    <div style={{ borderTop: `1px solid ${T.borderL}`, animation: "fadeIn 0.2s ease both" }}>
                      {/* Photos */}
                      {p.photos?.length > 0 && (
                        <div style={{ padding: "14px 16px 0" }}>
                          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>📸 Фото</div>
                          <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 8 }}>
                            {p.photos.map((ph, pi) => (
                              <div key={pi} style={{ minWidth: 150, height: 90, borderRadius: T.rs, background: T.bg, border: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "center", padding: "8px 12px", flexShrink: 0, textAlign: "center" }}>
                                <span style={{ fontSize: 12, color: T.mid }}>{ph}</span>
                              </div>
                            ))}
                            <div style={{ minWidth: 68, height: 90, borderRadius: T.rs, border: `2px dashed ${T.border}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flexShrink: 0, cursor: "pointer" }}>
                              <span style={{ fontSize: 16, color: T.light }}>＋</span>
                              <span style={{ fontSize: 10, color: T.light }}>Фото</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div style={{ padding: "14px 16px 16px", display: "flex", gap: 8 }}>
                        <button onClick={(e) => { e.stopPropagation(); toggleLike(p.id); }}
                          style={{ flex: 1, padding: "11px 0", borderRadius: 24, border: `1.5px solid ${isLk ? "#E74C3C" : T.border}`, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 4, fontSize: 13, fontWeight: 600, background: isLk ? "#FFF0F0" : T.card, color: isLk ? "#E74C3C" : T.mid }}>
                          {isLk ? "❤️" : "🤍"} {(p.likes || 0) + (isLk ? 1 : 0)}
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); if (navigator.share) navigator.share({ title: p.name, text: p.tip }); }}
                          style={{ flex: 1, padding: "11px 0", borderRadius: 24, border: `1.5px solid ${T.border}`, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 4, fontSize: 13, fontWeight: 600, background: T.card, color: T.mid }}>
                          📤 Поделиться
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); setMapPicker(isMap ? null : p.id); }}
                          style={{ flex: 1, padding: "11px 0", borderRadius: 24, border: `1.5px solid ${isMap ? T.primary : T.border}`, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 4, fontSize: 13, fontWeight: 600, background: isMap ? T.primaryLight : T.card, color: isMap ? T.primary : T.mid }}>
                          🗺️ Карта
                        </button>
                      </div>

                      {isMap && (
                        <div style={{ padding: "0 16px 16px", animation: "fadeIn 0.2s ease both" }}>
                          <div style={{ background: T.bg, borderRadius: T.r, border: `1px solid ${T.border}`, overflow: "hidden" }}>
                            <div style={{ padding: "8px 14px", fontSize: 12, color: T.mid, fontWeight: 500, borderBottom: `1px solid ${T.borderL}` }}>Открыть в:</div>
                            {[{ type: "google", icon: "🌐", name: "Google Maps", sub: "Браузер или приложение", bg: "#E8F0FE" }, { type: "apple", icon: "🍎", name: "Apple Maps", sub: "Для iPhone и Mac", bg: "#F0F0F0" }].map(m => (
                              <button key={m.type} onClick={(e) => { e.stopPropagation(); openMap(p, m.type); }}
                                style={{ width: "100%", padding: "12px 14px", background: T.card, border: "none", borderBottom: m.type === "google" ? `1px solid ${T.borderL}` : "none", display: "flex", alignItems: "center", gap: 12, cursor: "pointer", fontFamily: "inherit", color: T.text, fontSize: 14, textAlign: "left" }}
                                onMouseEnter={(e) => { e.currentTarget.style.background = T.primaryLight; }}
                                onMouseLeave={(e) => { e.currentTarget.style.background = T.card; }}>
                                <div style={{ width: 34, height: 34, borderRadius: 10, background: m.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>{m.icon}</div>
                                <div><div style={{ fontWeight: 600, fontSize: 13 }}>{m.name}</div><div style={{ fontSize: 11, color: T.light }}>{m.sub}</div></div>
                                <span style={{ marginLeft: "auto", color: T.light }}>→</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                );
              })}
            </div>
            <button onClick={() => { if (!user) handleGoogleLogin(); setShowAddForm(true); }}
              style={{ ...card, width: "100%", marginTop: 14, padding: "16px", border: `2px dashed ${T.primary}40`, color: T.primary, fontWeight: 600, fontSize: 14, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, boxShadow: "none" }}>
              ＋ Добавить место
            </button>
          </div>
        )}

        {/* ══ CHAT ══ */}
        {screen === "chat" && (
          <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 120px)" }}>
            <button onClick={goHome} style={back}>← Главная</button>
            <div style={{ flex: 1, overflowY: "auto", paddingBottom: 12 }}>
              {chat.map((m, i) => (
                <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start", marginBottom: 10, animation: "fadeIn 0.3s ease" }}>
                  <div style={{ maxWidth: "85%", padding: "12px 16px", borderRadius: m.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px", background: m.role === "user" ? T.primary : T.card, color: m.role === "user" ? "#fff" : T.text, fontSize: 14, lineHeight: 1.55, boxShadow: m.role === "user" ? "0 2px 10px rgba(244,123,32,0.25)" : T.sh, border: m.role === "user" ? "none" : `1px solid ${T.borderL}` }}>{m.text}</div>
                </div>
              ))}
              {typing && <div style={{ display: "flex", marginBottom: 10 }}><div style={{ ...card, padding: "14px 20px", display: "flex", gap: 5 }}>{[0,1,2].map(j => <div key={j} style={{ width: 7, height: 7, borderRadius: "50%", background: T.primary, opacity: 0.4, animation: `pulse 1.2s ease ${j*0.2}s infinite` }} />)}</div></div>}
              <div ref={chatEnd} />
            </div>
            {chat.length <= 1 && (
              <div style={{ marginBottom: 12 }}>
                <p style={{ fontSize: 12, color: T.mid, margin: "0 0 8px" }}>Популярные вопросы:</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>{CHAT_HINTS.map((s, i) => <button key={i} onClick={() => handleSend(s)} style={pill(false)}>{s}</button>)}</div>
              </div>
            )}
            <div style={{ display: "flex", gap: 8, padding: "12px 0", borderTop: `1px solid ${T.borderL}` }}>
              <input ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSend()} placeholder="Задайте вопрос..." style={{ ...inp, flex: 1, width: "auto" }} />
              <button onClick={() => handleSend()} disabled={!input.trim()} style={{ width: 48, height: 48, borderRadius: 14, border: "none", background: input.trim() ? T.primary : T.bg, color: input.trim() ? "#fff" : T.light, fontSize: 20, cursor: input.trim() ? "pointer" : "default", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: input.trim() ? "0 4px 14px rgba(244,123,32,0.3)" : "none" }}>↑</button>
            </div>
          </div>
        )}
      </main>

      <style>{`
        @keyframes pulse { 0%,100% { opacity:.3; transform:scale(1) } 50% { opacity:1; transform:scale(1.2) } }
        @keyframes fadeIn { from { opacity:0; transform:translateY(6px) } to { opacity:1; transform:translateY(0) } }
        input::placeholder, textarea::placeholder { color:#BBB }
        * { box-sizing:border-box; -webkit-tap-highlight-color:transparent }
        ::-webkit-scrollbar { width:3px; height:3px }
        ::-webkit-scrollbar-thumb { background:#D5D5D5; border-radius:3px }
        button:active { transform:scale(0.97) }
        select { cursor: pointer }
      `}</style>
    </div>
  );
}
