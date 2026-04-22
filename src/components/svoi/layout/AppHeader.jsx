export default function AppHeader({
  T,
  mt,
  user,
  pl,
  onGoHome,
  onLogin,
  onLogout,
}) {
  return (
    <header style={{ padding:"16px 20px", background:T.card, borderBottom:`1px solid ${T.borderL}`, display:"flex", alignItems:"center", justifyContent:"space-between", opacity:mt?1:0, transition:"opacity 0.4s" }}>
      <div onClick={onGoHome} style={{ cursor:"pointer" }}>
        <h1 style={{ fontSize:22, fontWeight:900, margin:0 }}><span style={{ color:T.primary }}>LA</span></h1>
        <p style={{ margin:"1px 0 0", fontSize:11, color:T.light }}>guide</p>
      </div>
      {user ? (
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <span style={{ fontSize:12, color:T.mid }}>{user.name}</span>
          <div style={{ width:32, height:32, borderRadius:10, background:T.primaryLight, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16 }}>👤</div>
          <button onClick={onLogout} style={{ background:"none", border:"none", color:T.light, fontSize:11, cursor:"pointer" }}>Выйти</button>
        </div>
      ) : (
        <button onClick={onLogin} style={{ ...pl(false), padding:"8px 14px", fontSize:12, display:"flex", alignItems:"center", gap:6 }}>
          <svg width="14" height="14" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
          Войти
        </button>
      )}
    </header>
  );
}


