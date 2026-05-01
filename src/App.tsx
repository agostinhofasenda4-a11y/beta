import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Heart, X, Wallet, LogOut, Lock, Upload,
  CheckCircle2, Users, BarChart3, Shield, Eye, EyeOff,
  Ban, RefreshCw, Edit3, ArrowUpRight, ArrowDownLeft,
  Bell, AlertTriangle, Star, Package, Activity,
  UserCheck, Copy, Link, Gift, ChevronRight,
  Play, Trophy, Home, TrendingUp, Info, Headphones,
  ChevronDown, ChevronUp, Zap, Award
} from "lucide-react";
import {
  signInWithEmailAndPassword, createUserWithEmailAndPassword,
  onAuthStateChanged, signOut, User as FirebaseUser
} from "firebase/auth";
import {
  doc, getDoc, setDoc, updateDoc, collection, addDoc,
  query, where, onSnapshot, serverTimestamp, increment,
  getDocFromServer, getDocs, orderBy, limit
} from "firebase/firestore";
import { auth, db } from "./lib/firebase";
import { VIP_LEVELS, FASHION_LOOKS, PAYMENT_DETAILS, LOOK_QUESTIONS } from "./constants";
import { format } from "date-fns";

type AppState = "landing" | "auth" | "home" | "invest" | "tasks" | "finances" | "referral" | "profile" | "admin";
type AuthMode = "login" | "register";

function genRefCode(name: string): string {
  const prefix = name.replace(/\s+/g, "").slice(0, 2).toUpperCase();
  return prefix + Math.floor(1000 + Math.random() * 9000);
}

const VIP_COVERS = [
  { bg: "linear-gradient(135deg,#1a1a2e,#16213e)", accent: "#C9A84C" },
  { bg: "linear-gradient(135deg,#0d1b2a,#1b4332)", accent: "#52b788" },
  { bg: "linear-gradient(135deg,#1a0533,#3d0066)", accent: "#c77dff" },
  { bg: "linear-gradient(135deg,#1c0a00,#6f3800)", accent: "#f48c06" },
  { bg: "linear-gradient(135deg,#03045e,#0077b6)", accent: "#90e0ef" },
  { bg: "linear-gradient(135deg,#1b1b2f,#e43f5a)", accent: "#ff6b6b" },
  { bg: "linear-gradient(135deg,#0a0a0a,#C9A84C)", accent: "#C9A84C" },
];

// ─── ROOT ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [view, setView] = useState<AppState>("landing");
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refCodeFromUrl, setRefCodeFromUrl] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");
    if (ref) setRefCodeFromUrl(ref);
  }, []);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        try { await getDocFromServer(doc(db, "test", "connection")); } catch (_) {}
        const userRef = doc(db, "users", u.uid);
        onSnapshot(userRef, (snap) => {
          if (snap.exists()) {
            setUserData(snap.data());
            const data = snap.data();
            if (data.isAdmin) setView("admin");
            else setView("home");
          } else setUserData(null);
        });
      } else { setUserData(null); setView("landing"); }
      setLoading(false);
    });
    return unsub;
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-2 border-[#C9A84C]/20 border-t-[#C9A84C] rounded-full animate-spin" />
        <Logo />
      </div>
    </div>
  );

  const isAdmin = userData?.isAdmin === true || auth.currentUser?.email === "840000000@modarewards.app";

  return (
    <div className="min-h-screen bg-[#0a0a0a] selection:bg-[#C9A84C]/20">
      <AnimatePresence mode="wait">
        {view === "landing" && <Landing onAuth={() => setView("auth")} />}
        {view === "auth" && <AuthScreen onBack={() => setView("landing")} initialRef={refCodeFromUrl} />}
        {user && userData && !isAdmin && (
          <AppShell currentView={view} setView={setView} user={userData} uid={user.uid} firebaseUser={user} />
        )}
        {user && userData && isAdmin && <AdminApp onLogout={() => signOut(auth)} />}
      </AnimatePresence>
    </div>
  );
}

// ─── APP SHELL WITH BOTTOM NAV ─────────────────────────────────────────────────
function AppShell({ currentView, setView, user, uid, firebaseUser }: {
  currentView: AppState, setView: (v: AppState) => void,
  user: any, uid: string, firebaseUser: FirebaseUser
}) {
  const navItems = [
    { id: "home", label: "Início", ico: Home },
    { id: "invest", label: "Investir", ico: TrendingUp },
    { id: "tasks", label: "Tarefas", ico: Play },
    { id: "referral", label: "Equipe", ico: Users },
    { id: "profile", label: "Perfil", ico: Shield },
  ];

  return (
    <div className="min-h-screen flex flex-col pb-20">
      {/* Top bar */}
      <div className="sticky top-0 z-40 bg-[#0a0a0a]/95 backdrop-blur-sm border-b border-white/5 px-4 py-3 flex items-center justify-between">
        <Logo />
        <div className="flex items-center gap-3">
          <button onClick={() => setView("finances")}
            className="flex items-center gap-1.5 bg-[#C9A84C]/10 border border-[#C9A84C]/20 px-3 py-1.5 rounded-full text-[#C9A84C] text-xs font-bold">
            <Wallet size={12} />
            {user.balance?.toFixed(0)} MZN
          </button>
        </div>
      </div>

      {/* Page content */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          {currentView === "home" && (
            <motion.div key="home" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <HomeView user={user} setView={setView} uid={uid} />
            </motion.div>
          )}
          {currentView === "invest" && (
            <motion.div key="invest" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <InvestView user={user} setView={setView} />
            </motion.div>
          )}
          {currentView === "tasks" && (
            <motion.div key="tasks" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <TaskCenter user={firebaseUser} userData={user} setView={setView} />
            </motion.div>
          )}
          {currentView === "referral" && (
            <motion.div key="referral" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <ReferralCenter user={user} uid={uid} />
            </motion.div>
          )}
          {currentView === "profile" && (
            <motion.div key="profile" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <ProfileView user={user} uid={uid} setView={setView} />
            </motion.div>
          )}
          {currentView === "finances" && (
            <motion.div key="finances" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <FinanceCenter user={firebaseUser} userData={user} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Navigation — fixed */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#111] border-t border-white/8">
        <div className="flex">
          {navItems.map(item => {
            const active = currentView === item.id;
            return (
              <button key={item.id} onClick={() => setView(item.id as AppState)}
                className={`flex-1 flex flex-col items-center gap-1 py-3 transition-all ${active ? "text-[#C9A84C]" : "text-neutral-600 hover:text-neutral-400"}`}>
                <item.ico size={20} strokeWidth={active ? 2.5 : 1.5} />
                <span className="text-[9px] uppercase tracking-widest font-medium">{item.label}</span>
                {active && <div className="absolute top-0 w-8 h-0.5 bg-[#C9A84C] rounded-b-full" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── LANDING ──────────────────────────────────────────────────────────────────
function Landing({ onAuth }: { onAuth: () => void }) {
  const looks = FASHION_LOOKS.slice(0, 6);
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="min-h-screen flex flex-col overflow-hidden">
      {/* Hero */}
      <div className="relative flex-1 flex flex-col">
        {/* Background grid of looks */}
        <div className="absolute inset-0 grid grid-cols-3 gap-1 opacity-20 overflow-hidden">
          {looks.map((look, i) => (
            <div key={i} className="overflow-hidden">
              <img src={look.img} alt="" className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-[#0a0a0a]/80 to-[#0a0a0a]" />

        {/* Nav */}
        <nav className="relative z-10 px-6 py-5 flex justify-between items-center">
          <Logo />
          <button onClick={onAuth} className="px-5 py-2 border border-[#C9A84C]/30 text-[#C9A84C] text-xs font-bold uppercase tracking-widest hover:bg-[#C9A84C]/10 transition-all rounded-full">
            Entrar
          </button>
        </nav>

        {/* Hero content */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-12 text-center">
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#C9A84C]/10 border border-[#C9A84C]/20 rounded-full mb-8">
            <span className="w-1.5 h-1.5 bg-[#C9A84C] rounded-full animate-pulse" />
            <span className="text-[10px] uppercase tracking-[0.2em] text-[#C9A84C] font-bold">Plataforma Premium · Moçambique</span>
          </motion.div>
          <motion.h1 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-serif font-light leading-[0.95] text-white mb-5">
            Vista.<br />Avalie.<br /><span className="text-[#C9A84C] italic">Ganhe.</span>
          </motion.h1>
          <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}
            className="text-neutral-400 max-w-xs text-base font-light mb-10 leading-relaxed">
            Avalie tendências de moda e ganhe rendimento real em MZN.
          </motion.p>
          <motion.button initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}
            onClick={onAuth}
            className="px-10 py-4 bg-[#C9A84C] text-black font-bold uppercase tracking-[0.2em] hover:bg-yellow-400 transition-all text-sm rounded-full shadow-[0_0_30px_rgba(201,168,76,0.3)]">
            Começar Gratuitamente
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

// ─── AUTH ─────────────────────────────────────────────────────────────────────
function AuthScreen({ onBack, initialRef }: { onBack: () => void, initialRef: string }) {
  const [mode, setMode] = useState<AuthMode>("login");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [refCode, setRefCode] = useState(initialRef);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setError(""); setLoading(true);

    if (mode === "login" && phone.replace(/\s+/g, "") === "840000000" && password === "ADMIN@SECRET#2026") {
      try {
        const adminEmail = "840000000@modarewards.app";
        try { await signInWithEmailAndPassword(auth, adminEmail, "ADMIN@SECRET#2026"); }
        catch (e2: any) {
          if (e2.code === "auth/invalid-credential" || e2.code === "auth/user-not-found") {
            const c = await createUserWithEmailAndPassword(auth, adminEmail, "ADMIN@SECRET#2026");
            await setDoc(doc(db, "users", c.user.uid), {
              displayName: "Administrador", phoneNumber: "840000000", balance: 0,
              ownedVips: ["admin"], isAdmin: true, estagiarioUsedDays: 0, createdAt: serverTimestamp(),
            });
          } else throw e2;
        }
        return;
      } catch (err: any) { setError("Erro: " + err.message); setLoading(false); return; }
    }

    const email = `${phone.replace(/\s+/g, "")}@modarewards.app`;
    try {
      if (mode === "register") {
        if (!name) throw new Error("Insira o seu nome");
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        const myRefCode = genRefCode(name);
        let referredBy = "";
        if (refCode.trim()) {
          const q = query(collection(db, "users"), where("refCode", "==", refCode.trim().toUpperCase()));
          const snap = await getDocs(q);
          if (!snap.empty) referredBy = snap.docs[0].id;
        }
        await setDoc(doc(db, "users", cred.user.uid), {
          displayName: name, phoneNumber: phone, balance: 0,
          ownedVips: ["estagiario"], estagiarioUsedDays: 0,
          createdAt: serverTimestamp(), isBlocked: false,
          refCode: myRefCode, referredBy, totalReferrals: 0, referralEarnings: 0,
        });
        if (referredBy) {
          await updateDoc(doc(db, "users", referredBy), { totalReferrals: increment(1) });
        }
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      const msg = err.code === "auth/invalid-credential" ? "Número ou senha incorrectos."
        : err.code === "auth/email-already-in-use" ? "Este número já está registado."
        : err.message;
      setError(msg); setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="min-h-screen bg-[#0e1117] flex flex-col">
      <div className="flex items-center justify-between px-6 py-4">
        <button onClick={onBack} className="text-neutral-500 hover:text-white transition-colors text-sm flex items-center gap-2">
          ← Voltar
        </button>
        <Logo />
        <div className="w-16" />
      </div>

      <div className="flex-1 flex items-center justify-center px-5 py-6">
        <div className="w-full max-w-sm">
          {/* Toggle */}
          <div className="flex bg-[#1c2130] rounded-2xl p-1 mb-8">
            {(["login", "register"] as AuthMode[]).map(m => (
              <button key={m} onClick={() => { setMode(m); setError(""); }}
                className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${mode === m ? "bg-white text-[#0e1117]" : "text-neutral-400 hover:text-white"}`}>
                {m === "login" ? "Entrar" : "Registar"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "register" && (
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 block mb-2">Nome Completo</label>
                <input type="text" required value={name} onChange={e => setName(e.target.value)}
                  className="w-full bg-[#1c2130] rounded-2xl px-5 py-4 text-white outline-none text-sm placeholder:text-neutral-600 focus:ring-2 focus:ring-[#C9A84C]/30"
                  placeholder="Ex: João Machava" />
              </div>
            )}
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 block mb-2">Telemóvel</label>
              <div className="flex items-center bg-[#1c2130] rounded-2xl overflow-hidden focus-within:ring-2 focus-within:ring-[#C9A84C]/30">
                <span className="pl-5 pr-3 text-sm font-bold text-green-400 flex-shrink-0">+258</span>
                <div className="w-px h-5 bg-white/10" />
                <input type="tel" required value={phone} onChange={e => setPhone(e.target.value)}
                  className="flex-1 bg-transparent px-4 py-4 text-white outline-none text-sm placeholder:text-neutral-600"
                  placeholder="84 000 0000" />
              </div>
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 block mb-2">
                {mode === "register" ? "Criar Senha" : "Senha"}
              </label>
              <div className="flex items-center bg-[#1c2130] rounded-2xl overflow-hidden focus-within:ring-2 focus-within:ring-[#C9A84C]/30">
                <input type={showPwd ? "text" : "password"} required value={password} onChange={e => setPassword(e.target.value)}
                  className="flex-1 bg-transparent px-5 py-4 text-white outline-none text-sm placeholder:text-neutral-600"
                  placeholder={mode === "register" ? "Mínimo 6 caracteres" : "••••••••"} />
                <button type="button" onClick={() => setShowPwd(!showPwd)} className="pr-5 text-neutral-500 hover:text-[#C9A84C] transition-colors">
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            {mode === "register" && (
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 block mb-2">
                  Código de Convite <span className="text-neutral-600 normal-case font-normal">(opcional)</span>
                </label>
                <div className={`flex items-center bg-[#1c2130] rounded-2xl overflow-hidden focus-within:ring-2 focus-within:ring-[#C9A84C]/30 ${refCode ? "ring-2 ring-[#C9A84C]/20" : ""}`}>
                  <input type="text" value={refCode} onChange={e => setRefCode(e.target.value.toUpperCase())}
                    className="flex-1 bg-transparent px-5 py-4 text-[#C9A84C] outline-none text-sm placeholder:text-neutral-600 font-mono tracking-widest uppercase"
                    placeholder="Ex: JO1234" />
                  {refCode && <CheckCircle2 size={16} className="text-[#C9A84C] mr-4" />}
                </div>
              </div>
            )}
            {error && (
              <div className="flex items-center gap-2 text-red-400 text-xs bg-red-400/8 rounded-xl p-3.5">
                <AlertTriangle size={13} className="flex-shrink-0" /><span>{error}</span>
              </div>
            )}
            <button type="submit" disabled={loading}
              className="w-full py-4 bg-[#C9A84C] text-black font-bold text-sm uppercase tracking-[0.15em] rounded-2xl hover:bg-yellow-400 transition-all disabled:opacity-50 mt-2">
              {loading ? "Processando..." : mode === "register" ? "Criar Conta" : "Entrar"}
            </button>
          </form>
        </div>
      </div>
    </motion.div>
  );
}

// ─── HOME VIEW ─────────────────────────────────────────────────────────────────
function HomeView({ user, setView, uid }: { user: any, setView: (v: AppState) => void, uid: string }) {
  const [todayEarnings, setTodayEarnings] = useState(0);
  const [bannerIdx, setBannerIdx] = useState(0);
  const today = format(new Date(), "yyyy-MM-dd");

  const banners = [
    { bg: "from-[#1a1a2e] to-[#C9A84C]/20", title: "ModaRewards", sub: "Avalie looks e ganhe MZN diariamente" },
    { bg: "from-[#0d1b2a] to-[#52b788]/20", title: "Sistema VIP", sub: "Desbloqueie mais tarefas e ganhos" },
    { bg: "from-[#1a0533] to-[#c77dff]/20", title: "Referidos", sub: "Convide amigos e ganhe 15% de bónus" },
  ];

  useEffect(() => {
    const q = query(collection(db, "task_history"), where("userId", "==", uid), where("date", "==", today));
    return onSnapshot(q, s => setTodayEarnings(s.docs.reduce((a, d) => a + (d.data().reward || 0), 0)));
  }, [uid, today]);

  useEffect(() => {
    const t = setInterval(() => setBannerIdx(i => (i + 1) % banners.length), 4000);
    return () => clearInterval(t);
  }, []);

  const isEstagiarioOnly = user.ownedVips?.length === 1 && user.ownedVips[0] === "estagiario";

  return (
    <div className="pb-4">
      {/* Banner hero */}
      <div className="relative overflow-hidden" style={{ height: 180 }}>
        <AnimatePresence mode="wait">
          <motion.div key={bannerIdx} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className={`absolute inset-0 bg-gradient-to-br ${banners[bannerIdx].bg} flex flex-col justify-end px-5 pb-5`}>
            <p className="text-[#C9A84C] text-[10px] uppercase tracking-widest mb-1">Plataforma Premium</p>
            <h2 className="text-white text-2xl font-serif font-bold">{banners[bannerIdx].title}</h2>
            <p className="text-white/60 text-xs mt-0.5">{banners[bannerIdx].sub}</p>
          </motion.div>
        </AnimatePresence>
        {/* Dots */}
        <div className="absolute bottom-3 right-4 flex gap-1.5">
          {banners.map((_, i) => (
            <div key={i} className={`h-1 rounded-full transition-all ${i === bannerIdx ? "w-4 bg-[#C9A84C]" : "w-1 bg-white/20"}`} />
          ))}
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-4 gap-0 bg-[#111] border-b border-white/5 px-2 py-4">
        {[
          { label: "Recarregar", ico: ArrowDownLeft, action: () => setView("finances") },
          { label: "Saque", ico: ArrowUpRight, action: () => setView("finances") },
          { label: "Convidar", ico: Gift, action: () => setView("referral") },
          { label: "Suporte", ico: Headphones, action: () => {} },
        ].map(item => (
          <button key={item.label} onClick={item.action} className="flex flex-col items-center gap-2 p-2 hover:bg-white/5 rounded-xl transition-all">
            <div className="w-12 h-12 rounded-full bg-[#C9A84C]/10 border border-[#C9A84C]/20 flex items-center justify-center">
              <item.ico size={20} className="text-[#C9A84C]" />
            </div>
            <span className="text-[10px] text-neutral-400 text-center leading-tight">{item.label}</span>
          </button>
        ))}
      </div>

      {/* Balance card */}
      <div className="mx-4 mt-4 bg-[#111] border border-white/6 rounded-2xl overflow-hidden">
        <div className="grid grid-cols-2 divide-x divide-white/5">
          <div className="p-5">
            <p className="text-[9px] uppercase tracking-widest text-neutral-500 mb-2">Saldo Total</p>
            <p className="text-3xl font-serif text-[#C9A84C]">{user.balance?.toFixed(2)}</p>
            <p className="text-[9px] text-neutral-700 mt-0.5">MZN</p>
          </div>
          <div className="p-5">
            <p className="text-[9px] uppercase tracking-widest text-neutral-500 mb-2">Renda de Hoje</p>
            <p className="text-3xl font-serif text-white">{todayEarnings.toFixed(2)}</p>
            <p className="text-[9px] text-neutral-700 mt-0.5">MZN</p>
          </div>
        </div>
        <div className="border-t border-white/5 px-5 py-3 flex justify-between items-center">
          <span className="text-[9px] text-neutral-600">Nível: <span className="text-[#C9A84C]">{user.ownedVips?.filter((v: string) => v !== "estagiario").pop()?.toUpperCase() || "ESTAGIÁRIO"}</span></span>
          <button onClick={() => setView("tasks")} className="text-[9px] text-[#C9A84C] flex items-center gap-1 font-bold uppercase tracking-wider">
            Fazer Tarefas <ChevronRight size={11} />
          </button>
        </div>
      </div>

      {/* Estagiário warning */}
      {isEstagiarioOnly && user.estagiarioUsedDays >= 1 && (
        <div className="mx-4 mt-3 border border-yellow-500/20 bg-yellow-500/5 p-4 rounded-2xl flex items-start gap-3">
          <AlertTriangle size={14} className="text-yellow-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs text-yellow-500 font-medium">
              {user.estagiarioUsedDays >= 2 ? "Período gratuito terminado. Active um plano VIP." : `Dia ${user.estagiarioUsedDays}/2 de Estagiário usado.`}
            </p>
            <button onClick={() => setView("invest")} className="text-[10px] text-yellow-500/70 hover:text-yellow-500 mt-1 underline">Ver pacotes VIP →</button>
          </div>
        </div>
      )}

      {/* Products section header */}
      <div className="mx-4 mt-5">
        <div className="flex gap-2 mb-4">
          <button className="flex-1 py-2.5 bg-[#C9A84C] text-black text-[11px] font-bold uppercase tracking-widest rounded-xl">
            Produtos básicos
          </button>
          <button onClick={() => setView("invest")} className="flex-1 py-2.5 bg-[#1a1a1a] border border-white/8 text-neutral-400 text-[11px] font-medium uppercase tracking-widest rounded-xl hover:border-[#C9A84C]/30 hover:text-white transition-all">
            Financiar
          </button>
        </div>

        {/* VIP product cards — repsolvip style */}
        <div className="space-y-3">
          {VIP_LEVELS.map((v, idx) => {
            const owned = user.ownedVips?.includes(v.key);
            const cover = VIP_COVERS[idx % VIP_COVERS.length];
            const look = FASHION_LOOKS[idx * 3 % FASHION_LOOKS.length];
            return (
              <div key={v.key} className="bg-[#141414] border border-white/6 rounded-2xl overflow-hidden">
                <div className="flex items-stretch">
                  {/* Product image */}
                  <div className="w-24 flex-shrink-0 relative overflow-hidden" style={{ minHeight: 90 }}>
                    <img src={look.img} alt={v.name} className="w-full h-full object-cover opacity-80" />
                    <div className="absolute inset-0" style={{ background: cover.bg, opacity: 0.5 }} />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-2xl">{v.ico}</span>
                    </div>
                    {owned && (
                      <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-green-500 flex items-center justify-center">
                        <CheckCircle2 size={9} className="text-white" />
                      </div>
                    )}
                  </div>
                  {/* Info */}
                  <div className="flex-1 p-3">
                    <div className="flex justify-between items-start mb-1.5">
                      <div>
                        {v.cost === 0 ? (
                          <div className="text-[9px] text-neutral-600 mb-0.5">Preço: <span className="line-through text-neutral-700">MT {120}</span> <span className="text-green-400 font-bold">Grátis</span></div>
                        ) : (
                          <div className="text-[9px] text-neutral-600 mb-0.5">Preço: <span style={{ color: cover.accent }} className="font-bold">MT {v.cost.toLocaleString()}</span></div>
                        )}
                        <p className="text-white text-sm font-bold">{v.name}</p>
                      </div>
                      {v.cost === 0 && user.estagiarioUsedDays >= 2 && !owned && (
                        <span className="text-[9px] bg-red-500 text-white px-2 py-0.5 rounded font-bold">Esgotado</span>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-x-4 mt-2">
                      <div>
                        <p className="text-[9px] text-neutral-600 uppercase tracking-wider">Renda Diária</p>
                        <p className="text-white text-sm font-bold">MT {v.daily}</p>
                      </div>
                      <div>
                        <p className="text-[9px] text-neutral-600 uppercase tracking-wider">Renda Total</p>
                        <p style={{ color: cover.accent }} className="text-sm font-bold">MT {v.daily}</p>
                      </div>
                    </div>
                    {v.cost > 0 && !owned && (
                      <button onClick={() => setView("invest")}
                        style={{ background: cover.accent }}
                        className="mt-2 w-full py-1.5 text-black text-[10px] font-bold uppercase tracking-widest rounded-lg hover:opacity-90 transition-all">
                        Comprar
                      </button>
                    )}
                    {owned && v.key !== "estagiario" && (
                      <div className="mt-2 flex items-center gap-1.5">
                        <CheckCircle2 size={11} className="text-green-500" />
                        <span className="text-[10px] text-green-500 uppercase tracking-widest">Activo</span>
                      </div>
                    )}
                  </div>
                </div>
                {v.cost > 0 && (
                  <div className="border-t border-white/5 px-4 py-2 flex justify-between text-[9px] text-neutral-600">
                    <span>Ciclo: <span className="text-neutral-400">Permanente</span></span>
                    <span>Tarefas: <span className="text-neutral-400">{v.tasks}/dia</span></span>
                    <span>Por tarefa: <span style={{ color: cover.accent }}>{v.perTask} MZN</span></span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>


    </div>
  );
}

// ─── INVEST VIEW ──────────────────────────────────────────────────────────────
function InvestView({ user, setView }: { user: any, setView: (v: AppState) => void }) {
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ text: string; ok: boolean; vip?: string } | null>(null);

  const handlePurchase = async (v: typeof VIP_LEVELS[0]) => {
    if (purchasing) return;
    // Check balance
    if ((user.balance || 0) < v.cost) {
      setMsg({ text: `Saldo insuficiente. Precisa de mais ${(v.cost - user.balance).toFixed(0)} MZN. Recarregue a sua conta.`, ok: false, vip: v.key });
      return;
    }
    setPurchasing(v.key);
    try {
      const userRef = doc(db, "users", user.uid || "");
      // Get current user uid from auth
      const { currentUser } = auth;
      if (!currentUser) throw new Error("Não autenticado");
      const uRef = doc(db, "users", currentUser.uid);
      const snap = await getDoc(uRef);
      const current: string[] = snap.data()?.ownedVips || [];
      if (!current.includes(v.key)) {
        await updateDoc(uRef, {
          ownedVips: [...current, v.key],
          balance: increment(-v.cost),
        });
      }
      setMsg({ text: `${v.name} activado com sucesso! Já podes fazer as tarefas.`, ok: true, vip: v.key });
    } catch (e: any) {
      setMsg({ text: "Erro: " + e.message, ok: false });
    }
    setPurchasing(null);
  };

  return (
    <div className="p-4 space-y-4">
      <div>
        <h1 className="text-xl font-serif text-white">Investir</h1>
        <p className="text-[10px] text-neutral-600 uppercase tracking-widest mt-0.5">
          Saldo disponível: <span className="text-[#C9A84C] font-bold">{(user.balance || 0).toFixed(0)} MZN</span>
        </p>
      </div>



      {VIP_LEVELS.map((v, idx) => {
        const owned = user.ownedVips?.includes(v.key);
        const cover = VIP_COVERS[idx % VIP_COVERS.length];
        const look = FASHION_LOOKS[(idx * 5 + 2) % FASHION_LOOKS.length];
        const canAfford = (user.balance || 0) >= v.cost;
        const isLoading = purchasing === v.key;
        return (
          <motion.div key={v.key} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.06 }}
            className="bg-[#111] border border-white/6 rounded-2xl overflow-hidden">
            {/* Image header */}
            <div className="relative h-28 overflow-hidden">
              <img src={look.img} alt={v.name} className="w-full h-full object-cover opacity-40" />
              <div className="absolute inset-0" style={{ background: cover.bg, mixBlendMode: "multiply", opacity: 0.7 }} />
              <div className="absolute inset-0 flex items-end px-4 pb-3">
                <div className="flex justify-between items-end w-full">
                  <div>
                    <div className="text-[9px] uppercase tracking-widest text-white/50 mb-0.5">
                      {v.cost === 0 ? "Grátis · 2 dias" : `MT ${v.cost.toLocaleString()}`}
                    </div>
                    <div className="text-white text-lg font-serif font-bold flex items-center gap-2">
                      {v.ico} {v.name}
                    </div>
                  </div>
                  {owned ? (
                    <span className="text-[9px] border border-green-500/50 text-green-500 px-2 py-1 uppercase tracking-wider rounded">Activo</span>
                  ) : v.cost > 0 && !canAfford ? (
                    <span className="text-[9px] border border-red-500/30 text-red-400/70 px-2 py-1 uppercase tracking-wider rounded">Saldo insuf.</span>
                  ) : null}
                </div>
              </div>
            </div>
            {/* Stats */}
            <div className="grid grid-cols-3 divide-x divide-white/5 border-t border-white/5">
              {[
                { label: "MZN/dia", val: v.daily },
                { label: "Tarefas", val: v.tasks },
                { label: "MZN/tarefa", val: v.perTask % 1 === 0 ? v.perTask : v.perTask.toFixed(1) }
              ].map(item => (
                <div key={item.label} className="p-3 text-center">
                  <p style={{ color: cover.accent }} className="font-serif text-lg font-bold">{item.val}</p>
                  <p className="text-[9px] text-neutral-600 uppercase tracking-wider mt-0.5">{item.label}</p>
                </div>
              ))}
            </div>
            {!owned && v.cost > 0 && (
              <div className="border-t border-white/5 px-4 py-3 space-y-2">
                {msg && !msg.ok && msg.vip === v.key && (
                  <div className="flex items-center gap-2 bg-red-500/8 border border-red-500/20 px-3 py-2 rounded-xl">
                    <AlertTriangle size={11} className="text-red-400 flex-shrink-0" />
                    <p className="text-[10px] text-red-400 flex-1">Saldo insuficiente — faltam {(v.cost - (user.balance || 0)).toFixed(0)} MZN</p>
                    <button onClick={() => { setMsg(null); setView("finances"); }}
                      className="text-[#C9A84C] text-[9px] uppercase tracking-wider underline whitespace-nowrap flex-shrink-0">
                      Recarregar
                    </button>
                  </div>
                )}
                <button
                  onClick={() => handlePurchase(v)}
                  disabled={isLoading}
                  style={{ background: cover.accent }}
                  className="w-full py-2.5 text-black text-[10px] font-bold uppercase tracking-widest hover:opacity-90 transition-all rounded-xl disabled:opacity-60">
                  {isLoading ? "Processando..." : "Comprar"}
                </button>
              </div>
            )}
            {owned && v.key !== "estagiario" && (
              <div className="border-t border-white/5 px-4 py-3 space-y-2">
                {msg && msg.ok && msg.vip === v.key && (
                  <p className="text-[10px] text-green-400 flex items-center gap-1.5">
                    <CheckCircle2 size={11} /> Activado com sucesso!
                  </p>
                )}
                <button onClick={() => setView("tasks")}
                  className="w-full py-2.5 border border-green-500/30 text-green-400 text-[10px] font-bold uppercase tracking-widest hover:bg-green-500/8 transition-all rounded-xl flex items-center justify-center gap-2">
                  Fazer Tarefas do {v.name}
                </button>
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}

// ─── PROFILE VIEW ─────────────────────────────────────────────────────────────
function ProfileView({ user, uid, setView }: { user: any, uid: string, setView: (v: AppState) => void }) {
  const [showAbout, setShowAbout] = useState(false);

  return (
    <div className="p-4 space-y-4">

      {/* ── SOBRE NÓS MODAL ── */}
      <AnimatePresence>
        {showAbout && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/85 flex items-end justify-center"
            onClick={() => setShowAbout(false)}>
            <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }}
              className="bg-[#111] border border-white/10 w-full max-w-md rounded-t-3xl overflow-hidden"
              onClick={e => e.stopPropagation()}>
              {/* Header */}
              <div className="relative h-36 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a2e] to-[#C9A84C]/30" />
                <div className="absolute inset-0 flex flex-col justify-end px-6 pb-5">
                  <div className="flex items-center gap-3 mb-1">
                    <div className="w-8 h-8 rounded-full bg-[#C9A84C] flex items-center justify-center">
                      <span className="text-black font-bold text-sm">M</span>
                    </div>
                    <Logo />
                  </div>
                  <p className="text-white/50 text-[10px] uppercase tracking-widest">Plataforma de Avaliação de Moda · Moçambique</p>
                </div>
                <button onClick={() => setShowAbout(false)}
                  className="absolute top-4 right-4 w-7 h-7 bg-white/10 rounded-full flex items-center justify-center text-white/60 hover:text-white transition-colors">
                  <X size={14} />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-5 max-h-[60vh] overflow-y-auto">

                {/* O que somos */}
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-[#C9A84C] font-bold mb-2">O Que Somos</p>
                  <p className="text-neutral-300 text-sm leading-relaxed">
                    A <span className="text-white font-semibold">ModaRewards</span> é uma plataforma digital moçambicana que liga consumidores a marcas e empresas de moda. A nossa missão é simples: <span className="text-[#C9A84C]">a sua opinião tem valor real.</span>
                  </p>
                </div>

                {/* Como funciona */}
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-[#C9A84C] font-bold mb-3">Como Funciona</p>
                  <div className="space-y-3">
                    {[
                      { n: "1", title: "Avalie Looks", desc: "Analisa colecções, tendências e peças de roupa e dá a sua opinião autêntica." },
                      { n: "2", title: "Dados para Empresas", desc: "As suas avaliações são agregadas anonimamente e enviadas a marcas e retalhistas para ajudar a decidir os próximos lançamentos." },
                      { n: "3", title: "Ganhe em MZN", desc: "Por cada avaliação completada, recebe recompensas reais directamente na sua carteira digital." },
                      { n: "4", title: "Evolua de Nível", desc: "Quanto maior o seu nível VIP, mais tarefas disponíveis e maior o rendimento diário." },
                    ].map(item => (
                      <div key={item.n} className="flex gap-3">
                        <div className="w-6 h-6 rounded-full bg-[#C9A84C]/15 border border-[#C9A84C]/25 flex items-center justify-center text-[#C9A84C] text-[10px] font-bold flex-shrink-0 mt-0.5">{item.n}</div>
                        <div>
                          <p className="text-white text-sm font-semibold">{item.title}</p>
                          <p className="text-neutral-500 text-xs mt-0.5 leading-relaxed">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Porquê a sua opinião importa */}
                <div className="bg-[#C9A84C]/5 border border-[#C9A84C]/15 p-4 rounded-2xl">
                  <p className="text-[10px] uppercase tracking-widest text-[#C9A84C] font-bold mb-2">Porquê a Sua Opinião Importa</p>
                  <p className="text-neutral-400 text-xs leading-relaxed">
                    As empresas de moda gastam milhões a tentar perceber o que os consumidores querem. A ModaRewards resolve isso directamente — conectando marcas com pessoas reais em Moçambique para validar tendências <span className="text-white">antes do lançamento</span>. Você é o painel de consultores que decide o que chega às lojas.
                  </p>
                </div>

                {/* Regras importantes */}
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-[#C9A84C] font-bold mb-2">Regras Importantes</p>
                  <div className="space-y-1.5">
                    {[
                      "Saque mínimo: 90 MZN",
                      "Taxa de processamento: 8% por levantamento",
                      "Estagiário: 2 dias gratuitos, depois é necessário activar um plano",
                      "Tarefas repõem diariamente à meia-noite",
                      "Bónus de referido: 15% automático por cada recarga do convidado",
                    ].map(r => (
                      <div key={r} className="flex items-start gap-2">
                        <div className="w-1 h-1 rounded-full bg-[#C9A84C]/50 mt-1.5 flex-shrink-0" />
                        <p className="text-neutral-500 text-xs">{r}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Contacto */}
                <div className="border-t border-white/5 pt-4">
                  <p className="text-[10px] uppercase tracking-widest text-neutral-600 mb-2">Suporte & Contacto</p>
                  <a href="https://wa.me/258840000000" target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-3 bg-green-500/10 border border-green-500/20 p-3 rounded-xl hover:bg-green-500/15 transition-all">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="text-green-400 flex-shrink-0"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                    <div>
                      <p className="text-green-400 text-xs font-bold">WhatsApp · Suporte 24h</p>
                      <p className="text-neutral-600 text-[10px]">Fala connosco para qualquer dúvida</p>
                    </div>
                  </a>
                </div>
              </div>

              <div className="px-6 pb-6">
                <button onClick={() => setShowAbout(false)}
                  className="w-full py-3.5 bg-[#C9A84C] text-black font-bold text-sm uppercase tracking-widest rounded-2xl">
                  Fechar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Avatar + info */}
      <div className="bg-[#111] border border-white/6 rounded-2xl p-5 flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-[#C9A84C]/15 border border-[#C9A84C]/30 flex items-center justify-center text-2xl font-bold text-[#C9A84C] flex-shrink-0">
          {user.displayName?.slice(0, 2).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white text-lg font-serif font-bold truncate">{user.displayName}</p>
          <p className="text-neutral-500 text-sm font-mono">+258 {user.phoneNumber}</p>
          <p className="text-[#C9A84C] text-xs mt-1 font-mono font-bold">{user.refCode}</p>
        </div>
        {/* Sobre Nós button — top right */}
        <button onClick={() => setShowAbout(true)}
          className="flex-shrink-0 flex flex-col items-center gap-1 px-3 py-2 border border-white/10 hover:border-[#C9A84C]/30 hover:bg-[#C9A84C]/5 transition-all rounded-xl">
          <Info size={15} className="text-[#C9A84C]" />
          <span className="text-[8px] uppercase tracking-widest text-neutral-500 whitespace-nowrap">Sobre Nós</span>
        </button>
      </div>

      {/* Balance summary */}
      <div className="bg-[#111] border border-white/6 rounded-2xl divide-y divide-white/5">
        {[
          { label: "Saldo Total", val: `${user.balance?.toFixed(2)} MZN`, color: "text-[#C9A84C]" },
          { label: "Ganhos de Referidos", val: `${(user.referralEarnings || 0).toFixed(2)} MZN`, color: "text-white" },
          { label: "Total de Convidados", val: `${user.totalReferrals || 0} pessoas`, color: "text-white" },
        ].map(item => (
          <div key={item.label} className="flex justify-between items-center px-5 py-3.5">
            <span className="text-neutral-500 text-sm">{item.label}</span>
            <span className={`font-bold text-sm ${item.color}`}>{item.val}</span>
          </div>
        ))}
      </div>

      {/* VIPs activos */}
      <div>
        <p className="text-[9px] uppercase tracking-widest text-neutral-600 mb-3">Pacotes Activos</p>
        <div className="flex flex-wrap gap-2">
          {user.ownedVips?.map((vk: string) => {
            const v = VIP_LEVELS.find(l => l.key === vk);
            if (!v) return null;
            const cover = VIP_COVERS[VIP_LEVELS.indexOf(v) % VIP_COVERS.length];
            return (
              <div key={vk} className="flex items-center gap-2 px-3 py-2 rounded-xl border border-white/8 bg-[#141414]">
                <span className="text-base">{v.ico}</span>
                <span style={{ color: cover.accent }} className="text-xs font-bold">{v.name}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-2">
        <button onClick={() => setView("finances")}
          className="w-full flex items-center justify-between px-4 py-4 bg-[#111] border border-white/6 rounded-2xl hover:border-[#C9A84C]/30 transition-all">
          <span className="text-white text-sm">Depósito / Saque</span>
          <ChevronRight size={16} className="text-neutral-600" />
        </button>
        <button onClick={() => setView("referral")}
          className="w-full flex items-center justify-between px-4 py-4 bg-[#111] border border-white/6 rounded-2xl hover:border-[#C9A84C]/30 transition-all">
          <span className="text-white text-sm">Convidar Amigos</span>
          <ChevronRight size={16} className="text-neutral-600" />
        </button>
        <button onClick={() => signOut(auth)}
          className="w-full flex items-center justify-between px-4 py-4 bg-[#111] border border-red-500/20 rounded-2xl hover:bg-red-500/5 transition-all">
          <span className="text-red-400 text-sm">Terminar Sessão</span>
          <LogOut size={16} className="text-red-400/50" />
        </button>
      </div>
    </div>
  );
}

// ─── TASK CENTER ──────────────────────────────────────────────────────────────
function TaskCenter({ user, userData, setView }: { user: FirebaseUser, userData: any, setView: (v: AppState) => void }) {
  const [activeLevel, setActiveLevel] = useState<string | null>(null);
  const [activeTask, setActiveTask] = useState<any>(null);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dailyCounts, setDailyCounts] = useState<Record<string, number>>({});
  const [lastReward, setLastReward] = useState<number | null>(null);
  const [showReward, setShowReward] = useState(false);
  const [showHowTo, setShowHowTo] = useState(false);
  const today = format(new Date(), "yyyy-MM-dd");
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const q = query(collection(db, "task_history"), where("userId", "==", user.uid), where("date", "==", today));
    return onSnapshot(q, snap => {
      const counts: Record<string, number> = {};
      snap.docs.forEach(d => {
        const lk = d.data().levelKey;
        counts[lk] = (counts[lk] || 0) + 1;
      });
      setDailyCounts(counts);
    });
  }, [user.uid, today]);

  const isEstagiarioOnly = userData.ownedVips?.length === 1 && userData.ownedVips[0] === "estagiario";
  const locked = isEstagiarioOnly && userData.estagiarioUsedDays >= 2;
  const ownedLevels = VIP_LEVELS.filter(v => userData.ownedVips?.includes(v.key));

  const startTask = (levelKey: string) => {
    const level = VIP_LEVELS.find(v => v.key === levelKey)!;
    const done = dailyCounts[levelKey] || 0;
    if (done >= level.tasks) return;
    setActiveLevel(levelKey);
    setActiveTask({
      ...FASHION_LOOKS[Math.floor(Math.random() * FASHION_LOOKS.length)],
      question: LOOK_QUESTIONS[Math.floor(Math.random() * LOOK_QUESTIONS.length)]
    });
    setProgress(0);
  };

  const handleVote = (_liked: boolean) => {
    setProcessing(true);
    let p = 0;
    // Smooth linear progress — 1% every 100ms = ~10 seconds total
    intervalRef.current = setInterval(() => {
      p += 1;
      setProgress(Math.min(p, 100));
      if (p >= 100) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        finishTask();
      }
    }, 100);
  };

  const finishTask = async () => {
    if (!activeLevel) return;
    const level = VIP_LEVELS.find(v => v.key === activeLevel)!;
    try {
      await Promise.all([
        addDoc(collection(db, "task_history"), {
          userId: user.uid, date: today, levelKey: activeLevel,
          reward: level.perTask, completedAt: serverTimestamp()
        }),
        updateDoc(doc(db, "users", user.uid), {
          balance: increment(level.perTask), lastTaskDate: today,
          ...(isEstagiarioOnly ? { estagiarioUsedDays: increment(1) } : {})
        })
      ]);
      if (userData.referredBy) {
        const bonus = level.perTask * 0.15;
        await updateDoc(doc(db, "users", userData.referredBy), {
          balance: increment(bonus), referralEarnings: increment(bonus)
        });
      }
      setLastReward(level.perTask); setShowReward(true);
      setTimeout(() => setShowReward(false), 2500);
    } catch (e) { console.error(e); }
    setProcessing(false); setActiveTask(null); setActiveLevel(null);
  };

  if (locked) return (
    <div className="flex flex-col items-center justify-center py-24 text-center px-6">
      <Lock size={40} className="text-[#C9A84C]/20 mb-6" />
      <h2 className="text-2xl font-serif text-white mb-3">Período Gratuito Terminado</h2>
      <p className="text-neutral-600 text-sm mb-6">Active um plano VIP para continuar a ganhar.</p>
      <button onClick={() => setView("invest")} className="px-8 py-3 bg-[#C9A84C] text-black text-xs font-bold uppercase tracking-widest hover:bg-yellow-400 transition-all rounded-full">
        Ver Pacotes VIP
      </button>
    </div>
  );

  return (
    <div className="p-4">
      {/* Reward popup */}
      <AnimatePresence>
        {showReward && (
          <motion.div initial={{ opacity: 0, y: -20, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-[#C9A84C] text-black px-6 py-3 font-bold text-lg shadow-2xl rounded-full">
            +{lastReward?.toFixed(2)} MZN ✓
          </motion.div>
        )}
      </AnimatePresence>

      {/* Task modal */}
      <AnimatePresence>
        {activeTask && activeLevel && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/90 flex items-end justify-center" style={{ paddingBottom: "88px" }}>
            <motion.div initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }}
              className="bg-[#111] border border-white/10 w-full max-w-sm overflow-hidden rounded-t-3xl"
              style={{ marginLeft: "auto", marginRight: "auto" }}>
              <div className="relative overflow-hidden bg-[#0a0a0a]" style={{ height: "210px" }}>
                <img src={activeTask.img} alt={activeTask.name} className="w-full h-full object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                <div className="absolute bottom-3 left-4 right-4 flex justify-between items-end">
                  <p className="text-white font-serif text-lg font-bold drop-shadow-lg">{activeTask.name}</p>
                  <div className="bg-black/60 backdrop-blur-sm px-2.5 py-1 text-[10px] uppercase tracking-widest text-[#C9A84C] border border-[#C9A84C]/20 rounded-lg flex-shrink-0 ml-2">
                    {VIP_LEVELS.find(v => v.key === activeLevel)?.name}
                  </div>
                </div>
              </div>
              <div className="p-5">
                <p className="text-white text-base font-semibold mb-1">{activeTask.question}</p>
                <p className="text-neutral-600 text-xs italic mb-4">{activeTask.desc}</p>
                {processing ? (
                  <div className="space-y-3">
                    <div className="flex justify-between text-[10px] uppercase tracking-widest text-[#C9A84C]">
                      <span>A analisar tendência...</span><span>{progress}%</span>
                    </div>
                    {/* Smooth linear progress bar */}
                    <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-[#C9A84C] rounded-full transition-none"
                        style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <button onClick={() => handleVote(false)}
                      className="flex items-center justify-center gap-3 py-5 border-2 border-red-500/40 bg-red-500/8 hover:bg-red-500/18 active:scale-95 transition-all rounded-2xl">
                      <X size={26} className="text-red-400" />
                      <span className="text-sm font-bold uppercase tracking-wide text-red-400">Não Gosto</span>
                    </button>
                    <button onClick={() => handleVote(true)}
                      className="flex items-center justify-center gap-3 py-5 border-2 border-[#C9A84C]/40 bg-[#C9A84C]/8 hover:bg-[#C9A84C]/18 active:scale-95 transition-all rounded-2xl">
                      <Heart size={26} className="text-[#C9A84C]" />
                      <span className="text-sm font-bold uppercase tracking-wide text-[#C9A84C]">Gosto</span>
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-serif text-white">Tarefas do Dia</h1>
          <p className="text-neutral-600 text-xs mt-0.5">Avalie looks e ganhe MZN</p>
        </div>
        <button onClick={() => setShowHowTo(true)}
          className="flex items-center gap-1.5 px-3 py-2 border border-white/10 text-neutral-500 text-[10px] uppercase tracking-widest hover:border-[#C9A84C]/30 hover:text-[#C9A84C] transition-all rounded-xl">
          <Info size={12} /> Como Funciona
        </button>
      </div>

      {/* How it works modal */}
      <AnimatePresence>
        {showHowTo && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/85 flex items-end justify-center"
            onClick={() => setShowHowTo(false)}>
            <motion.div initial={{ y: 40 }} animate={{ y: 0 }} exit={{ y: 40 }}
              className="bg-[#111] border border-white/10 w-full max-w-md rounded-t-3xl p-6"
              onClick={e => e.stopPropagation()}>
              <div className="w-10 h-1 bg-white/10 rounded-full mx-auto mb-5" />
              <h3 className="text-white font-serif text-xl mb-5 text-center">Como Funciona</h3>
              <div className="space-y-4 text-sm text-neutral-400 leading-relaxed">
                <p>Este sistema permite que você ganhe recompensas ao <span className="text-white">avaliar tendências de moda</span>.</p>
                <p>Cada tarefa consiste em analisar um look e dar a sua opinião. As suas avaliações ajudam a identificar preferências do público e melhorar a selecção de produtos no mercado.</p>
                <p>Utilizadores iniciam como <span className="text-[#C9A84C]">Estagiários</span> e podem evoluir para pacotes superiores, desbloqueando mais tarefas e benefícios.</p>
                <p>Os ganhos são acumulados com base na participação activa e podem ser <span className="text-white">solicitados a partir de 90 MZN</span>.</p>
                <p className="text-[10px] text-neutral-600">Levantamentos estão sujeitos a uma taxa de processamento de 8%.</p>
              </div>
              <button onClick={() => setShowHowTo(false)}
                className="w-full mt-6 py-3.5 bg-[#C9A84C] text-black font-bold text-sm uppercase tracking-widest rounded-2xl">
                Entendido
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* VIP level cards */}
      <div className="space-y-4">
        {ownedLevels.map((level, idx) => {
          const done = dailyCounts[level.key] || 0;
          const remaining = level.tasks - done;
          const pct = Math.round((done / level.tasks) * 100);
          const cover = VIP_COVERS[idx % VIP_COVERS.length];
          const allDone = remaining <= 0;

          return (
            <motion.div key={level.key} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.08 }}
              className="overflow-hidden rounded-2xl border border-white/6">
              <div className="relative h-36 overflow-hidden bg-[#0a0a0a]">
                <div className="absolute inset-0 flex">
                  {[0, 1, 2].map(i => {
                    const look = FASHION_LOOKS[(idx * 3 + i) % FASHION_LOOKS.length];
                    return (
                      <div key={i} className="flex-1 overflow-hidden">
                        <img src={look.img} alt="" className="w-full h-full object-cover opacity-50" />
                      </div>
                    );
                  })}
                </div>
                <div className="absolute inset-0 bg-black/30" />
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/40">
                  <div className="h-full transition-all duration-500 ease-linear"
                    style={{ width: `${pct}%`, background: cover.accent }} />
                </div>
                <div className="absolute inset-0 flex items-end px-4 pb-3">
                  <div className="w-full flex justify-between items-end">
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-lg">{level.ico}</span>
                        <span className="text-[10px] uppercase tracking-widest text-white/70">{level.name}</span>
                      </div>
                      <div className="text-white font-bold text-sm">{done}/{level.tasks} tarefas</div>
                    </div>
                    <div className="text-right">
                      <div style={{ color: cover.accent }} className="text-2xl font-serif font-bold">
                        +{level.perTask % 1 === 0 ? level.perTask : level.perTask.toFixed(1)}
                      </div>
                      <div className="text-[9px] text-white/50 uppercase tracking-wider">MZN / tarefa</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-[#111] px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-neutral-600 uppercase tracking-wider">
                    {allDone ? "Concluído hoje" : `${remaining} restante${remaining > 1 ? "s" : ""}`}
                  </span>
                  {allDone && <CheckCircle2 size={13} className="text-green-500" />}
                </div>
                {allDone ? (
                  <span className="text-[10px] uppercase tracking-widest text-green-500/60">✓ Completo</span>
                ) : (
                  <button onClick={() => startTask(level.key)}
                    style={{ background: cover.accent, color: "#000" }}
                    className="px-5 py-2 text-[10px] font-bold uppercase tracking-widest hover:opacity-90 transition-all rounded-xl flex items-center gap-1.5">
                    <Play size={11} /> Iniciar
                  </button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Locked levels */}
      {VIP_LEVELS.filter(v => !userData.ownedVips?.includes(v.key)).length > 0 && (
        <div className="mt-4 space-y-2">
          <p className="text-[9px] uppercase tracking-widest text-neutral-600">Níveis Bloqueados</p>
          {VIP_LEVELS.filter(v => !userData.ownedVips?.includes(v.key)).map((level, idx) => (
            <div key={level.key} className="rounded-2xl border border-white/4 overflow-hidden opacity-35">
              <div className="h-16 flex items-center justify-between px-4"
                style={{ background: VIP_COVERS[(ownedLevels.length + idx) % VIP_COVERS.length].bg }}>
                <div className="flex items-center gap-3">
                  <span className="text-2xl opacity-50">{level.ico}</span>
                  <div>
                    <p className="text-white text-sm font-bold">{level.name}</p>
                    <p className="text-white/40 text-[10px]">{level.cost.toLocaleString()} MZN</p>
                  </div>
                </div>
                <Lock size={16} className="text-white/30" />
              </div>
            </div>
          ))}
          <button onClick={() => setView("invest")}
            className="w-full mt-2 py-3 border border-white/8 text-neutral-600 text-[10px] uppercase tracking-widest hover:border-[#C9A84C]/30 hover:text-[#C9A84C] transition-all rounded-2xl">
            Desbloquear mais níveis →
          </button>
        </div>
      )}

      {/* All done today */}
      {ownedLevels.every(l => (dailyCounts[l.key] || 0) >= l.tasks) && ownedLevels.length > 0 && (
        <div className="mt-6 text-center py-8 border border-green-500/10 bg-green-500/5 rounded-2xl">
          <CheckCircle2 size={32} className="text-green-500/40 mx-auto mb-3" />
          <p className="text-neutral-400 text-sm">Todas as tarefas de hoje concluídas!</p>
          <p className="text-neutral-600 text-xs mt-1">Volte amanhã ou active um novo pacote para ganhar mais.</p>
        </div>
      )}
    </div>
  );
}

// ─── REFERRAL CENTER ──────────────────────────────────────────────────────────
function ReferralCenter({ user, uid }: { user: any, uid: string }) {
  const [copied, setCopied] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [referrals, setReferrals] = useState<any[]>([]);
  const refCode = user.refCode || "—";
  const siteUrl = window.location.origin;
  const refLink = `${siteUrl}?ref=${refCode}`;

  useEffect(() => {
    const q = query(collection(db, "users"), where("referredBy", "==", uid));
    return onSnapshot(q, snap => setReferrals(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
  }, [uid]);

  const copy = async (text: string, set: (v: boolean) => void) => {
    try { await navigator.clipboard.writeText(text); } catch {}
    set(true); setTimeout(() => set(false), 2000);
  };

  return (
    <div className="p-4 space-y-4">
      <div>
        <h1 className="text-2xl font-serif text-white">Convidar Amigos</h1>
        <p className="text-neutral-600 text-xs mt-1">Ganhe 15% de bónus cada vez que o seu convidado recarrega</p>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {[["1", "Partilhe o link"], ["2", "Amigo regista-se"], ["3", "Recebe 15% auto"]].map(([n, t]) => (
          <div key={n} className="bg-[#111] border border-white/6 p-3 text-center rounded-2xl">
            <div className="w-6 h-6 bg-[#C9A84C]/15 border border-[#C9A84C]/25 rounded-full flex items-center justify-center text-[#C9A84C] text-xs font-bold mx-auto mb-2">{n}</div>
            <p className="text-[10px] text-neutral-500 leading-tight">{t}</p>
          </div>
        ))}
      </div>
      <div className="bg-[#111] border border-[#C9A84C]/15 rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-white/5">
          <p className="text-[9px] uppercase tracking-widest text-neutral-600 mb-3">Seu Código</p>
          <div className="flex items-center justify-between">
            <span className="text-[#C9A84C] font-mono font-bold tracking-[0.3em] text-2xl">{refCode}</span>
            <button onClick={() => copy(refCode, setCopied)}
              className={`flex items-center gap-1.5 px-3 py-1.5 border text-[10px] uppercase tracking-wider transition-all rounded-xl ${copied ? "border-green-500/40 text-green-500" : "border-white/10 text-neutral-500 hover:border-[#C9A84C]/30 hover:text-[#C9A84C]"}`}>
              {copied ? <><CheckCircle2 size={11} /> Copiado!</> : <><Copy size={11} /> Copiar</>}
            </button>
          </div>
        </div>
        <div className="p-5">
          <p className="text-[9px] uppercase tracking-widest text-neutral-600 mb-3">Seu Link</p>
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-black/40 border border-white/8 px-3 py-2.5 rounded-xl overflow-hidden">
              <p className="text-neutral-400 text-xs font-mono truncate">{refLink}</p>
            </div>
            <button onClick={() => copy(refLink, setCopiedLink)}
              className={`flex items-center justify-center w-10 h-10 border text-[10px] transition-all rounded-xl flex-shrink-0 ${copiedLink ? "border-green-500/40 text-green-500" : "border-white/10 text-neutral-500 hover:border-[#C9A84C]/30 hover:text-[#C9A84C]"}`}>
              {copiedLink ? <CheckCircle2 size={14} /> : <Link size={14} />}
            </button>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-[#111] border border-white/6 p-4 rounded-2xl">
          <p className="text-[9px] uppercase tracking-widest text-neutral-600 mb-2">Convidados</p>
          <p className="text-3xl font-serif text-white">{user.totalReferrals || 0}</p>
        </div>
        <div className="bg-[#111] border border-white/6 p-4 rounded-2xl">
          <p className="text-[9px] uppercase tracking-widest text-neutral-600 mb-2">Ganhos</p>
          <p className="text-3xl font-serif text-[#C9A84C]">{(user.referralEarnings || 0).toFixed(0)}</p>
          <p className="text-[9px] text-neutral-700 mt-0.5">MZN</p>
        </div>
      </div>
      {referrals.length > 0 && (
        <div>
          <p className="text-[9px] uppercase tracking-widest text-neutral-600 mb-3">Os seus Convidados</p>
          <div className="bg-[#111] border border-white/6 rounded-2xl divide-y divide-white/5">
            {referrals.map(r => (
              <div key={r.id} className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#C9A84C]/10 border border-[#C9A84C]/20 flex items-center justify-center text-[10px] font-bold text-[#C9A84C]">
                    {r.displayName?.slice(0, 1).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-white text-sm">{r.displayName?.slice(0, 3)}***</p>
                    <p className="text-[9px] text-neutral-600">{r.ownedVips?.filter((v: string) => v !== "estagiario").join(", ") || "Estagiário"}</p>
                  </div>
                </div>
                <span className="text-[9px] text-green-500 border border-green-500/20 px-2 py-0.5 rounded-lg">Activo</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── FINANCE CENTER ───────────────────────────────────────────────────────────
function FinanceCenter({ user, userData }: { user: FirebaseUser, userData: any }) {
  const [tab, setTab] = useState<"deposit" | "withdraw">("deposit");
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("mpesa");
  const [txCode, setTxCode] = useState("");
  const [proof, setProof] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [msg, setMsg] = useState({ text: "", ok: true });
  const [step, setStep] = useState(1);

  // Only show withdrawal history, no deposit history
  useEffect(() => {
    if (tab === "withdraw") {
      const q = query(collection(db, "withdrawals"), where("userId", "==", user.uid));
      return onSnapshot(q, snap =>
        setHistory(snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a: any, b: any) => b.createdAt?.seconds - a.createdAt?.seconds))
      );
    } else {
      setHistory([]);
    }
  }, [tab, user.uid]);

  const recipient = method === "mpesa" ? PAYMENT_DETAILS.mpesa : PAYMENT_DETAILS.emola;

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!txCode) { setMsg({ text: "Insira o código da transacção.", ok: false }); return; }
    setLoading(true);
    try {
      await addDoc(collection(db, "deposits"), {
        userId: user.uid, amount: parseFloat(amount), method,
        transactionCode: txCode, status: "pending", createdAt: serverTimestamp(),
        userName: userData.displayName, userPhone: userData.phoneNumber,
        ...(proof ? { proofName: proof.name } : {})
      });
      setMsg({ text: "✓ Pedido enviado! O administrador irá validar e creditar o saldo em breve.", ok: true });
      setStep(1); setAmount(""); setTxCode(""); setProof(null);
    } catch (err: any) { setMsg({ text: "Erro: " + err.message, ok: false }); }
    setLoading(false);
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(amount);
    if (val < 90) { setMsg({ text: "Mínimo de saque é 90 MZN.", ok: false }); return; }
    if (val > userData.balance) { setMsg({ text: "Saldo insuficiente.", ok: false }); return; }
    const fee = val * 0.08;
    const netAmount = val - fee;
    setLoading(true);
    try {
      await addDoc(collection(db, "withdrawals"), {
        userId: user.uid, amount: val, fee, netAmount, method, status: "pending",
        phoneNumber: userData.phoneNumber, userName: userData.displayName, createdAt: serverTimestamp()
      });
      await updateDoc(doc(db, "users", user.uid), { balance: increment(-val) });
      setMsg({ text: `Pedido enviado! Receberá ${netAmount.toFixed(2)} MZN após a taxa de 8%.`, ok: true });
      setAmount("");
    } catch (err: any) { setMsg({ text: "Erro: " + err.message, ok: false }); }
    setLoading(false);
  };

  const withdrawVal = parseFloat(amount) || 0;
  const feePreview = withdrawVal * 0.08;
  const netPreview = withdrawVal - feePreview;

  return (
    <div className="p-4 max-w-2xl">
      <h1 className="text-2xl font-serif text-white mb-5">Finanças</h1>
      <div className="flex gap-1 mb-5 bg-black/50 p-1 border border-white/5 rounded-2xl">
        {[["deposit", "Depositar"], ["withdraw", "Sacar"]].map(([id, label]) => (
          <button key={id} onClick={() => { setTab(id as any); setStep(1); setMsg({ text: "", ok: true }); }}
            className={`flex-1 py-2.5 text-[10px] uppercase tracking-widest transition-all rounded-xl ${tab === id ? "bg-[#C9A84C] text-black font-bold" : "text-neutral-600 hover:text-white"}`}>
            {label}
          </button>
        ))}
      </div>

      {tab === "withdraw" && (
        <div className="flex items-center gap-2 bg-yellow-500/5 border border-yellow-500/20 p-3 mb-4 rounded-2xl">
          <AlertTriangle size={13} className="text-yellow-500 flex-shrink-0" />
          <p className="text-[10px] text-yellow-500 uppercase tracking-widest">Saque mínimo: <strong>90 MZN</strong> · Taxa de 8% aplicada</p>
        </div>
      )}

      <div className="bg-[#111] border border-white/6 p-5 rounded-2xl">
        {tab === "deposit" && step === 1 && (
          <div className="space-y-5">
            {/* Info banner */}
            <div className="bg-[#C9A84C]/5 border border-[#C9A84C]/15 p-4 rounded-2xl">
              <p className="text-[10px] text-[#C9A84C] uppercase tracking-widest font-bold mb-1">Como funciona</p>
              <p className="text-neutral-400 text-xs leading-relaxed">Recarregue qualquer valor. O saldo é creditado na sua conta após validação. Depois use o saldo para activar os pacotes VIP na aba <span className="text-white font-medium">Investir</span>.</p>
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-widest text-neutral-500 block mb-2">Método de Pagamento</label>
              <div className="grid grid-cols-2 gap-2">
                {["mpesa", "emola"].map(m => (
                  <button key={m} onClick={() => setMethod(m)}
                    className={`py-3 text-[10px] uppercase tracking-widest font-bold border transition-all rounded-xl ${method === m ? "bg-[#C9A84C] text-black border-[#C9A84C]" : "border-white/8 text-neutral-600 hover:border-[#C9A84C]/30"}`}>
                    {m === "mpesa" ? "M-Pesa" : "E-Mola"}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-widest text-neutral-500 block mb-2">Valor a Depositar (MZN)</label>
              <input type="number" value={amount} onChange={e => setAmount(e.target.value)}
                className="w-full bg-black/50 border border-white/8 p-4 text-white focus:border-[#C9A84C] outline-none text-2xl font-serif rounded-xl"
                placeholder="Ex: 1200" min={1} />
              {amount && parseFloat(amount) > 0 && (
                <p className="text-[10px] text-[#C9A84C] mt-1.5">
                  Transferir <strong>{parseFloat(amount).toLocaleString()} MZN</strong> via {method === "mpesa" ? "M-Pesa" : "E-Mola"}
                </p>
              )}
            </div>
            <button onClick={() => setStep(2)} disabled={!amount || parseFloat(amount) <= 0}
              className="w-full py-3.5 bg-[#C9A84C] text-black font-bold uppercase tracking-widest text-xs hover:bg-yellow-400 transition-all disabled:opacity-40 rounded-xl">
              Ver Instruções de Pagamento →
            </button>
          </div>
        )}

        {tab === "deposit" && step === 2 && (
          <div className="space-y-5">
            <div className="bg-black/60 border border-[#C9A84C]/15 p-5 rounded-2xl">
              <p className="text-[9px] uppercase tracking-widest text-[#C9A84C]/50 mb-4 text-center">Instruções de Transferência</p>
              <div className="space-y-3">
                <div className="flex justify-between items-center pb-3 border-b border-white/5">
                  <span className="text-[10px] text-neutral-600 uppercase tracking-wider">Valor</span>
                  <span className="text-2xl font-serif text-[#C9A84C]">{amount} <span className="text-xs font-sans">MZN</span></span>
                </div>
                <div className="flex justify-between"><span className="text-[10px] text-neutral-600">Número</span><span className="text-white font-mono font-bold text-lg">{recipient.number}</span></div>
                <div className="flex justify-between"><span className="text-[10px] text-neutral-600">Nome</span><span className="text-white text-sm">{recipient.name}</span></div>
                <div className="flex justify-between pt-3 border-t border-white/5"><span className="text-[10px] text-neutral-600">Via</span><span className="text-[#C9A84C] text-xs font-bold uppercase">{method}</span></div>
              </div>
            </div>
            <form onSubmit={handleDeposit} className="space-y-4">
              <div>
                <label className="text-[10px] uppercase tracking-widest text-neutral-500 block mb-2">Código da Transacção <span className="text-red-400">*</span></label>
                <input type="text" required value={txCode} onChange={e => setTxCode(e.target.value)}
                  className="w-full bg-black/50 border border-white/8 p-3.5 text-white focus:border-[#C9A84C] outline-none font-mono text-sm rounded-xl"
                  placeholder="Ex: 5G82JFL92" />
                <p className="text-[9px] text-neutral-600 mt-1">Código recebido por SMS após transferir.</p>
              </div>
              <div className="border border-dashed border-white/10 p-5 text-center hover:border-[#C9A84C]/30 transition-all cursor-pointer rounded-2xl">
                <input type="file" id="proof" className="hidden" accept="image/*" onChange={e => setProof(e.target.files?.[0] || null)} />
                <label htmlFor="proof" className="cursor-pointer flex flex-col items-center gap-2">
                  <Upload size={18} className="text-neutral-600" />
                  <span className="text-[10px] text-neutral-600 uppercase tracking-wider">{proof ? proof.name : "Foto do comprovativo (opcional)"}</span>
                </label>
              </div>
              {msg.text && <p className={`text-xs ${msg.ok ? "text-[#C9A84C]" : "text-red-400"}`}>{msg.text}</p>}
              <div className="flex gap-2">
                <button type="button" onClick={() => setStep(1)} className="flex-1 py-3 border border-white/8 text-neutral-600 text-[10px] uppercase tracking-widest hover:border-[#C9A84C]/30 transition-all rounded-xl">← Alterar</button>
                <button type="submit" disabled={loading} className="flex-[2] py-3 bg-[#C9A84C] text-black font-bold text-xs uppercase tracking-widest hover:bg-yellow-400 transition-all disabled:opacity-50 rounded-xl">
                  {loading ? "Enviando..." : "Confirmar Depósito"}
                </button>
              </div>
            </form>
          </div>
        )}

        {tab === "withdraw" && (
          <form onSubmit={handleWithdraw} className="space-y-5">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-neutral-600 mb-1">Saldo disponível</p>
              <p className="text-2xl font-serif text-[#C9A84C]">{userData.balance?.toFixed(2)} MZN</p>
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-widest text-neutral-500 block mb-2">Valor a levantar (MZN)</label>
              <input type="number" required value={amount} onChange={e => setAmount(e.target.value)}
                className="w-full bg-black/50 border border-white/8 p-3.5 text-white focus:border-[#C9A84C] outline-none text-xl font-serif rounded-xl" placeholder="Mín. 90 MZN" min={90} />
            </div>
            {/* Fee preview */}
            {withdrawVal >= 90 && (
              <div className="bg-black/30 border border-white/5 p-4 rounded-xl space-y-2 text-xs">
                <div className="flex justify-between text-neutral-500">
                  <span>Valor solicitado</span><span>{withdrawVal.toFixed(2)} MZN</span>
                </div>
                <div className="flex justify-between text-red-400/70">
                  <span>Taxa (8%)</span><span>- {feePreview.toFixed(2)} MZN</span>
                </div>
                <div className="flex justify-between text-white font-bold border-t border-white/10 pt-2">
                  <span>Receberá</span><span className="text-[#C9A84C]">{netPreview.toFixed(2)} MZN</span>
                </div>
              </div>
            )}
            <div className="bg-black/30 border border-white/5 p-3.5 text-xs text-neutral-500 rounded-xl">
              Enviar para: <span className="text-white font-mono">+258 {userData.phoneNumber}</span> via <span className="text-white uppercase">{method}</span>
            </div>
            {msg.text && <p className={`text-xs ${msg.ok ? "text-[#C9A84C]" : "text-red-400"}`}>{msg.text}</p>}
            <button type="submit" disabled={loading} className="w-full py-3.5 bg-[#C9A84C] text-black font-bold text-xs uppercase tracking-widest hover:bg-yellow-400 transition-all disabled:opacity-50 rounded-xl">
              {loading ? "Processando..." : "Solicitar Saque"}
            </button>
          </form>
        )}
      </div>

      {/* Withdrawal history only */}
      {tab === "withdraw" && history.length > 0 && (
        <div className="mt-5">
          <p className="text-[9px] uppercase tracking-widest text-neutral-600 mb-3">Histórico de Saques</p>
          <div className="space-y-2">
            {history.slice(0, 8).map(item => (
              <div key={item.id} className="bg-[#111] border border-white/5 p-3.5 flex justify-between items-center rounded-2xl">
                <div>
                  <p className="text-white text-sm font-medium">
                    {item.netAmount ? item.netAmount.toFixed(2) : item.amount?.toFixed(2)} MZN
                  </p>
                  <p className="text-[9px] text-neutral-600 uppercase tracking-wider mt-0.5">
                    {item.method} · {item.createdAt ? format(item.createdAt.toDate(), "dd MMM HH:mm") : "Recente"}
                    {item.fee && <span className="text-neutral-700"> · Taxa: {item.fee.toFixed(2)} MZN</span>}
                  </p>
                </div>
                <span className={`text-[9px] px-2 py-1 uppercase tracking-wider border font-bold rounded-lg ${item.status === "approved" ? "border-green-500/30 text-green-500 bg-green-500/5" : item.status === "rejected" ? "border-red-500/30 text-red-500 bg-red-500/5" : "border-yellow-500/30 text-yellow-500 bg-yellow-500/5"}`}>
                  {item.status === "approved" ? "Aprovado" : item.status === "rejected" ? "Rejeitado" : "Pendente"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── ADMIN APP ────────────────────────────────────────────────────────────────
function AdminApp({ onLogout }: { onLogout: () => void }) {
  const [activeTab, setActiveTab] = useState("overview");
  const tabs = [
    { id: "overview", label: "Visão Geral", ico: BarChart3 },
    { id: "deposits", label: "Depósitos", ico: ArrowDownLeft },
    { id: "withdrawals", label: "Saques", ico: ArrowUpRight },
    { id: "users", label: "Utilizadores", ico: Users },
  ];

  const [deposits, setDeposits] = useState<any[]>([]);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [stats, setStats] = useState({ users: 0, totalDeposits: 0, totalWithdrawals: 0 });
  const [editUser, setEditUser] = useState<any>(null);
  const [editBalance, setEditBalance] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [expandedUser, setExpandedUser] = useState<string | null>(null);

  useEffect(() => {
    const u1 = onSnapshot(collection(db, "deposits"), snap => {
      setDeposits(snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a: any, b: any) => b.createdAt?.seconds - a.createdAt?.seconds));
      setStats(s => ({ ...s, totalDeposits: snap.size }));
    });
    const u2 = onSnapshot(collection(db, "withdrawals"), snap => {
      setWithdrawals(snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a: any, b: any) => b.createdAt?.seconds - a.createdAt?.seconds));
      setStats(s => ({ ...s, totalWithdrawals: snap.size }));
    });
    const u3 = onSnapshot(collection(db, "users"), snap => {
      setAllUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setStats(s => ({ ...s, users: snap.size }));
    });
    return () => { u1(); u2(); u3(); };
  }, []);

  const approveDeposit = async (dep: any) => {
    await updateDoc(doc(db, "deposits", dep.id), { status: "approved" });
    // Credit the deposited amount to user's balance
    await updateDoc(doc(db, "users", dep.userId), {
      balance: increment(dep.amount)
    });
    // Pay 15% referral bonus to whoever referred this user on deposit approval
    try {
      const userSnap = await getDoc(doc(db, "users", dep.userId));
      const userData = userSnap.data();
      if (userData?.referredBy) {
        const bonus = Math.round(dep.amount * 0.15 * 100) / 100;
        await updateDoc(doc(db, "users", userData.referredBy), {
          balance: increment(bonus),
          referralEarnings: increment(bonus)
        });
      }
    } catch (_) {}
  };

  const rejectDeposit = (id: string) => updateDoc(doc(db, "deposits", id), { status: "rejected" });
  const approveWithdrawal = (id: string) => updateDoc(doc(db, "withdrawals", id), { status: "approved" });
  const rejectWithdrawal = (id: string) => updateDoc(doc(db, "withdrawals", id), { status: "rejected" });
  const toggleBlock = (u: any) => updateDoc(doc(db, "users", u.id), { isBlocked: !u.isBlocked });

  const saveBalance = async () => {
    if (!editUser || isNaN(parseFloat(editBalance))) return;
    await updateDoc(doc(db, "users", editUser.id), { balance: parseFloat(editBalance) });
    setEditUser(null);
  };

  const resetPassword = async (u: any) => {
    if (!newPassword || newPassword.length < 6) return;
    // Update password in Firestore record (admin can see it)
    await updateDoc(doc(db, "users", u.id), { lastResetPassword: newPassword, passwordResetAt: serverTimestamp() });
    // Actually reset via Firebase Auth requires Admin SDK — store request for manual reset
    await addDoc(collection(db, "password_resets"), {
      userId: u.id, phoneNumber: u.phoneNumber, newPassword, requestedAt: serverTimestamp(), status: "pending"
    });
    setNewPassword("");
    alert(`Pedido de reset enviado para ${u.displayName}. Use o Firebase Console para alterar a senha do email ${u.phoneNumber}@modarewards.app`);
  };

  const pendingDeps = deposits.filter(d => d.status === "pending");
  const pendingWith = withdrawals.filter(w => w.status === "pending");

  const StatusBadge = ({ status }: { status: string }) => (
    <span className={`text-[9px] px-2 py-1 uppercase tracking-wider border font-bold rounded-lg ${status === "approved" ? "border-green-500/30 text-green-500 bg-green-500/5" : status === "rejected" ? "border-red-500/30 text-red-500 bg-red-500/5" : "border-yellow-500/30 text-yellow-500 bg-yellow-500/5"}`}>
      {status === "approved" ? "Aprovado" : status === "rejected" ? "Rejeitado" : "Pendente"}
    </span>
  );

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Edit balance modal */}
      {editUser && (
        <div className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-6">
          <div className="bg-[#111] border border-white/10 p-6 w-full max-w-sm rounded-3xl">
            <h3 className="text-white font-serif text-lg mb-1">Editar Saldo</h3>
            <p className="text-neutral-500 text-sm mb-4">{editUser.displayName}</p>
            <input type="number" value={editBalance} onChange={e => setEditBalance(e.target.value)}
              className="w-full bg-black/50 border border-white/10 p-3.5 text-white outline-none focus:border-[#C9A84C] text-xl font-serif mb-4 rounded-xl" />
            <div className="flex gap-2">
              <button onClick={() => setEditUser(null)} className="flex-1 py-2.5 border border-white/10 text-neutral-500 text-xs uppercase tracking-wider rounded-xl">Cancelar</button>
              <button onClick={saveBalance} className="flex-1 py-2.5 bg-[#C9A84C] text-black text-xs font-bold uppercase tracking-wider rounded-xl">Guardar</button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <aside className="w-full md:w-56 bg-[#0c0c0c] border-b md:border-b-0 md:border-r border-white/5 flex md:flex-col">
        <div className="p-5 border-b border-white/5 hidden md:flex flex-col gap-2">
          <Logo />
          <div className="inline-flex items-center gap-1.5 bg-red-500/10 border border-red-500/20 px-2 py-1 w-fit rounded-lg">
            <Shield size={9} className="text-red-400" />
            <span className="text-[9px] uppercase tracking-widest text-red-400 font-bold">Administrador</span>
          </div>
        </div>
        <div className="flex md:flex-col flex-1 p-2 gap-0.5 overflow-x-auto">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-2.5 px-3 py-2.5 text-[10px] uppercase tracking-widest whitespace-nowrap transition-all rounded-xl ${activeTab === t.id ? "bg-[#C9A84C] text-black font-bold" : "text-neutral-500 hover:text-white hover:bg-white/3"}`}>
              <t.ico size={13} /><span className="hidden md:inline">{t.label}</span>
              {t.id === "deposits" && pendingDeps.length > 0 && <span className="ml-auto bg-yellow-500 text-black text-[8px] font-bold px-1.5 py-0.5 rounded-full hidden md:inline">{pendingDeps.length}</span>}
              {t.id === "withdrawals" && pendingWith.length > 0 && <span className="ml-auto bg-yellow-500 text-black text-[8px] font-bold px-1.5 py-0.5 rounded-full hidden md:inline">{pendingWith.length}</span>}
            </button>
          ))}
        </div>
        <div className="p-3 border-t border-white/5 hidden md:block">
          <button onClick={onLogout} className="flex items-center gap-2.5 px-3 py-2 text-[10px] text-neutral-600 hover:text-red-400 uppercase tracking-widest w-full transition-all rounded-xl">
            <LogOut size={13} /> Sair
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-5 md:p-8">
        {activeTab === "overview" && (
          <div className="space-y-6 max-w-5xl">
            <h1 className="text-2xl font-serif text-white">Painel Administrativo</h1>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {[
                { label: "Utilizadores", val: Math.max(0, stats.users - 1), color: "text-white" },
                { label: "Total Depósitos", val: stats.totalDeposits, color: "text-white" },
                { label: "Total Saques", val: stats.totalWithdrawals, color: "text-white" },
                { label: "Dep. Pendentes", val: pendingDeps.length, color: pendingDeps.length > 0 ? "text-yellow-500" : "text-white" },
                { label: "Saques Pend.", val: pendingWith.length, color: pendingWith.length > 0 ? "text-yellow-500" : "text-white" },
              ].map(s => (
                <div key={s.label} className="bg-[#111] border border-white/6 p-4 rounded-2xl">
                  <p className="text-[9px] uppercase tracking-widest text-neutral-600 mb-2">{s.label}</p>
                  <p className={`text-3xl font-serif ${s.color}`}>{s.val}</p>
                </div>
              ))}
            </div>
            {pendingDeps.length > 0 && (
              <div className="bg-yellow-500/5 border border-yellow-500/20 p-4 rounded-2xl">
                <p className="text-yellow-500 text-xs font-bold uppercase tracking-widest mb-3 flex items-center gap-2"><Bell size={11} /> {pendingDeps.length} depósito(s) aguardam aprovação</p>
                {pendingDeps.slice(0, 3).map(d => (
                  <div key={d.id} className="flex items-center justify-between py-2.5 border-t border-yellow-500/10">
                    <div>
                      <span className="text-white text-xs font-medium">{d.userName}</span>
                      <span className="text-neutral-500 text-xs"> — {d.amount} MZN ({d.vipLevelKey})</span>
                      {d.transactionCode && <p className="text-[10px] text-neutral-600 font-mono mt-0.5">Cód: {d.transactionCode}</p>}
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => rejectDeposit(d.id)} className="text-[9px] border border-red-500/30 text-red-500 px-2 py-1 hover:bg-red-500/10 transition-all rounded-lg">Rejeitar</button>
                      <button onClick={() => approveDeposit(d)} className="text-[9px] bg-green-500/20 border border-green-500/30 text-green-500 px-3 py-1 font-bold rounded-lg">✓ Aprovar</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "deposits" && (
          <div className="space-y-4 max-w-3xl">
            <h2 className="text-xl font-serif text-white">Gestão de Depósitos</h2>
            {deposits.map(d => (
              <div key={d.id} className={`bg-[#111] border p-5 rounded-2xl ${d.status === "pending" ? "border-yellow-500/20" : d.status === "approved" ? "border-green-500/10" : "border-red-500/10"}`}>
                <div className="flex flex-wrap justify-between gap-3 mb-3">
                  <div><p className="text-white font-medium">{d.userName}</p><p className="text-neutral-500 text-xs font-mono">{d.userPhone}</p></div>
                  <div className="text-right"><p className="text-[#C9A84C] font-serif text-xl">{d.amount} MZN</p><p className="text-[9px] text-neutral-600 uppercase">{d.vipLevelKey} · {d.method}</p></div>
                </div>
                {d.transactionCode && (
                  <div className="bg-black/40 border border-white/5 p-3 mb-3 rounded-xl">
                    <p className="text-[9px] text-neutral-600 uppercase mb-1">Código Transacção</p>
                    <p className="text-white font-mono font-bold">{d.transactionCode}</p>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <StatusBadge status={d.status} />
                  {d.status === "pending" && (
                    <div className="flex gap-2">
                      <button onClick={() => rejectDeposit(d.id)} className="px-3 py-1.5 border border-red-500/30 text-red-500 text-[10px] uppercase tracking-wider hover:bg-red-500/10 transition-all rounded-xl">Rejeitar</button>
                      <button onClick={() => approveDeposit(d)} className="px-4 py-1.5 bg-green-500/20 border border-green-500/30 text-green-500 text-[10px] font-bold uppercase tracking-wider hover:bg-green-500/30 transition-all rounded-xl">✓ Aprovar</button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {deposits.length === 0 && <p className="text-neutral-600 text-sm text-center py-12">Nenhum depósito ainda.</p>}
          </div>
        )}

        {activeTab === "withdrawals" && (
          <div className="space-y-4 max-w-3xl">
            <h2 className="text-xl font-serif text-white">Gestão de Saques</h2>
            {withdrawals.map(w => (
              <div key={w.id} className={`bg-[#111] border p-5 rounded-2xl ${w.status === "pending" ? "border-yellow-500/20" : w.status === "approved" ? "border-green-500/10" : "border-red-500/10"}`}>
                <div className="flex flex-wrap justify-between gap-3 mb-2">
                  <div><p className="text-white font-medium">{w.userName}</p><p className="text-neutral-500 text-xs font-mono">{w.phoneNumber}</p></div>
                  <div className="text-right">
                    <p className="text-[#C9A84C] font-serif text-xl">{w.netAmount ? w.netAmount.toFixed(2) : w.amount?.toFixed(2)} MZN</p>
                    {w.fee && <p className="text-[9px] text-neutral-600">Taxa: {w.fee.toFixed(2)} MZN</p>}
                  </div>
                </div>
                <p className="text-[10px] text-neutral-600 mb-3">Enviar via <span className="text-white uppercase">{w.method}</span> para: <span className="text-white font-mono">{w.phoneNumber}</span></p>
                <div className="flex items-center justify-between">
                  <StatusBadge status={w.status} />
                  {w.status === "pending" && (
                    <div className="flex gap-2">
                      <button onClick={() => rejectWithdrawal(w.id)} className="px-3 py-1.5 border border-red-500/30 text-red-500 text-[10px] uppercase tracking-wider hover:bg-red-500/10 transition-all rounded-xl">Rejeitar</button>
                      <button onClick={() => approveWithdrawal(w.id)} className="px-4 py-1.5 bg-green-500/20 border border-green-500/30 text-green-500 text-[10px] font-bold uppercase tracking-wider hover:bg-green-500/30 transition-all rounded-xl">✓ Pago</button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {withdrawals.length === 0 && <p className="text-neutral-600 text-sm text-center py-12">Nenhum saque ainda.</p>}
          </div>
        )}

        {activeTab === "users" && (
          <div className="space-y-3 max-w-3xl">
            <h2 className="text-xl font-serif text-white">Gestão de Utilizadores</h2>
            {allUsers.filter(u => !u.isAdmin).map(u => (
              <div key={u.id} className={`bg-[#111] border rounded-2xl overflow-hidden ${u.isBlocked ? "border-red-500/20" : "border-white/5"}`}>
                {/* Main row */}
                <div className="flex items-center justify-between px-4 py-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 bg-[#C9A84C]/10 border border-[#C9A84C]/20 rounded-full flex items-center justify-center text-xs font-bold text-[#C9A84C] flex-shrink-0">
                      {u.displayName?.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-white font-medium text-sm truncate">{u.displayName}</p>
                        {u.isBlocked && <span className="text-[8px] bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded uppercase flex-shrink-0">Bloqueado</span>}
                      </div>
                      <p className="text-neutral-500 text-xs font-mono">+258 {u.phoneNumber}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="text-right">
                      <div className="flex items-center gap-1">
                        <p className="text-[#C9A84C] font-serif text-base">{u.balance?.toFixed(0)}</p>
                        <span className="text-[9px] text-neutral-600">MZN</span>
                        <button onClick={() => { setEditUser(u); setEditBalance(u.balance?.toString() || "0"); }} className="text-neutral-600 hover:text-[#C9A84C] ml-0.5 transition-colors"><Edit3 size={12} /></button>
                      </div>
                    </div>
                    <button onClick={() => setExpandedUser(expandedUser === u.id ? null : u.id)} className="text-neutral-600 hover:text-white transition-colors p-1">
                      {expandedUser === u.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                  </div>
                </div>

                {/* Expanded details */}
                <AnimatePresence>
                  {expandedUser === u.id && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                      className="border-t border-white/5 bg-black/20 overflow-hidden">
                      <div className="px-4 py-4 space-y-3">
                        {/* Info */}
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div><p className="text-neutral-600 mb-0.5">Código Ref.</p><p className="text-white font-mono">{u.refCode}</p></div>
                          <div><p className="text-neutral-600 mb-0.5">Convidados</p><p className="text-white">{u.totalReferrals || 0}</p></div>
                          <div><p className="text-neutral-600 mb-0.5">Pacotes VIP</p><p className="text-[#C9A84C]">{u.ownedVips?.filter((v: string) => v !== "estagiario").join(", ") || "—"}</p></div>
                          <div><p className="text-neutral-600 mb-0.5">Estado</p><p className={u.isBlocked ? "text-red-400" : "text-green-400"}>{u.isBlocked ? "Bloqueado" : "Activo"}</p></div>
                        </div>

                        {/* Password reset */}
                        <div className="bg-black/30 p-3 rounded-xl">
                          <p className="text-[9px] uppercase tracking-widest text-neutral-600 mb-2">Redefinir Senha</p>
                          <div className="flex gap-2">
                            <input type="text" value={newPassword} onChange={e => setNewPassword(e.target.value)}
                              placeholder="Nova senha (mín. 6 caracteres)"
                              className="flex-1 bg-black/50 border border-white/8 px-3 py-2 text-white text-xs outline-none focus:border-[#C9A84C]/50 rounded-lg" />
                            <button onClick={() => resetPassword(u)}
                              className="px-3 py-2 bg-[#C9A84C]/20 border border-[#C9A84C]/30 text-[#C9A84C] text-[10px] font-bold uppercase tracking-wider hover:bg-[#C9A84C]/30 transition-all rounded-lg">
                              Redefinir
                            </button>
                          </div>
                          <p className="text-[9px] text-neutral-700 mt-1.5">Email Firebase: {u.phoneNumber}@modarewards.app</p>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                          <button onClick={() => toggleBlock(u)}
                            className={`flex items-center gap-1.5 px-3 py-2 border text-[10px] uppercase tracking-wider transition-all rounded-xl ${u.isBlocked ? "border-green-500/30 text-green-500 hover:bg-green-500/10" : "border-red-500/30 text-red-500 hover:bg-red-500/10"}`}>
                            {u.isBlocked ? <><UserCheck size={11} /> Desbloquear</> : <><Ban size={11} /> Bloquear</>}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
            {allUsers.filter(u => !u.isAdmin).length === 0 && (
              <p className="text-neutral-600 text-sm text-center py-12">Nenhum utilizador ainda.</p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

function Logo({ className }: { className?: string }) {
  return (
    <div className={`text-xl font-serif font-bold tracking-tight ${className || ""}`}>
      <span className="text-[#C9A84C]">MODA</span> <span className="text-white font-light">Rewards</span>
    </div>
  );
}
