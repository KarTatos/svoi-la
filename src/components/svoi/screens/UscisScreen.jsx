function formatNewsDate(iso) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString("ru-RU", { day: "numeric", month: "short", year: "numeric" });
  } catch {
    return "";
  }
}

function UscisNewsBlock({ news, T, showHeader = true }) {
  if (!news || news.length === 0) {
    return (
      <div style={{ marginBottom: 16 }}>
        {showHeader && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <div style={{ fontWeight: 700, fontSize: 15, color: T.text }}>📰 Новости USCIS</div>
            <a
              href="https://www.uscis.gov/news"
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontSize: 12, color: T.primary, textDecoration: "none", fontWeight: 600 }}
            >
              Все →
            </a>
          </div>
        )}
        <div
          style={{
            display: "flex",
            gap: 10,
            overflowX: "auto",
            paddingBottom: 6,
            marginLeft: -16,
            paddingLeft: 16,
            marginRight: -16,
            paddingRight: 16,
          }}
        >
          {[1, 2, 3].map((k) => (
            <div
              key={k}
              style={{
                flexShrink: 0,
                width: 198,
                minHeight: 92,
                background: T.card,
                border: `1px solid ${T.borderL}`,
                borderRadius: 16,
                padding: "10px 12px",
                boxShadow: T.sh,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                gap: 6,
              }}
            >
              <div style={{ width: "92%", height: 12, borderRadius: 6, background: T.borderL }} />
              <div style={{ width: "74%", height: 12, borderRadius: 6, background: T.borderL }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{ marginBottom: 16 }}>
      {showHeader && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: T.text }}>📰 Новости USCIS</div>
          <a
            href="https://www.uscis.gov/news"
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontSize: 12, color: T.primary, textDecoration: "none", fontWeight: 600 }}
          >
            Все →
          </a>
        </div>
      )}
      <div
        style={{
          display: "flex",
          gap: 10,
          overflowX: "auto",
          scrollSnapType: "x mandatory",
          WebkitOverflowScrolling: "touch",
          paddingBottom: 6,
          marginLeft: -16,
          paddingLeft: 16,
          marginRight: -16,
          paddingRight: 16,
        }}
      >
        {news.map((item) => (
          <a
            key={item.id}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              flexShrink: 0,
              width: 198,
              scrollSnapAlign: "start",
              background: T.card,
              border: `1px solid ${T.borderL}`,
              borderRadius: 16,
              padding: "10px 12px",
              textDecoration: "none",
              color: T.text,
              boxShadow: T.sh,
              minHeight: 92,
            }}
          >
            <div
              style={{
                fontSize: 13,
                fontWeight: 700,
                lineHeight: 1.35,
                color: T.text,
                whiteSpace: "normal",
                wordBreak: "break-word",
              }}
            >
              {item.title_ru}
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

export default function UscisScreen({
  T,
  cd,
  bk,
  pl,
  iS,
  srch,
  setSrch,
  searchResults,
  uscisCategories,
  onOpenCategory,
  onGoHome,
  news,
}) {
  return (
    <div>
      <button onClick={onGoHome} style={bk}>← Главная</button>
      <h2 style={{ fontSize: 20, fontWeight: 700, margin: "4px 0 14px" }}>📋 Справочник USCIS</h2>
      <div style={{ ...cd, marginBottom: 12, padding: "10px 12px", border: `1px solid #FDE2C7`, background: "#FFF8F1" }}>
        <div
          style={{
            fontSize: 12,
            color: T.mid,
            lineHeight: 1.45,
            textAlign: "justify",
            textJustify: "inter-word",
            hyphens: "auto",
            WebkitHyphens: "auto",
            display: "-webkit-box",
            WebkitLineClamp: 4,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          Важно: информация в этом разделе ознакомительная. Всегда проверяйте актуальные требования на официальном сайте USCIS и при необходимости консультируйтесь с иммиграционным адвокатом.
        </div>
      </div>

      <details style={{ ...cd, marginBottom: 12, overflow: "hidden" }}>
        <summary
          style={{
            listStyle: "none",
            cursor: "pointer",
            padding: "11px 12px",
            fontSize: 14,
            fontWeight: 700,
            color: T.text,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            userSelect: "none",
          }}
        >
          <span>📰 Новости USCIS</span>
          <span style={{ fontSize: 14, color: T.mid, lineHeight: 1 }}>▾</span>
        </summary>
        <div style={{ padding: "0 12px 8px" }}>
          <UscisNewsBlock news={news} T={T} showHeader={false} />
        </div>
      </details>

      <div style={{ position: "relative", marginBottom: 14 }}>
        <div style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: T.light, pointerEvents: "none" }}>🔎</div>
        <input value={srch} onChange={(e) => setSrch(e.target.value)} placeholder="Поиск формы..." style={{ ...iS, paddingLeft: 42, borderColor: srch ? T.primary : T.border }} />
      </div>

      {srch.trim().length >= 2 ? (
        <div>
          {searchResults.map((d) => (
            <div key={`${d.cI}-${d.form || d.name}`} style={{ ...cd, padding: "14px 16px", marginBottom: 8 }}>
              <div style={{ display: "flex", gap: 8, marginBottom: 6, alignItems: "center", flexWrap: "wrap" }}>
                {d.url ? (
                  <a href={d.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 6, color: T.primary, background: T.primaryLight, textDecoration: "none" }}>
                    {d.form} ↗
                  </a>
                ) : (
                  <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 6, color: T.primary, background: T.primaryLight }}>{d.form}</span>
                )}
                <span style={{ fontSize: 11, color: T.mid }}>{d.cI} {d.cT}</span>
              </div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{d.name}</div>
              <div style={{ fontSize: 12, color: T.mid, marginTop: 3 }}>{d.desc}</div>
            </div>
          ))}
          {searchResults.length === 0 && <p style={{ fontSize: 13, color: T.mid }}>Не найдено</p>}
        </div>
      ) : (
        <>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {uscisCategories.map((c) => (
              <button
                key={c.id}
                onClick={() => onOpenCategory(c)}
                style={{ ...cd, display: "flex", alignItems: "center", gap: 14, padding: "16px", cursor: "pointer", fontFamily: "inherit", color: T.text, textAlign: "left" }}
                onMouseEnter={(e) => { e.currentTarget.style.boxShadow = T.shH; }}
                onMouseLeave={(e) => { e.currentTarget.style.boxShadow = T.sh; }}
              >
                <div style={{ width: 48, height: 48, borderRadius: T.rs, background: T.primaryLight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0 }}>{c.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{c.title}</div>
                  <div style={{ fontSize: 12, color: T.mid, marginTop: 2 }}>{c.subtitle}</div>
                </div>
                <div style={{ color: T.light }}>›</div>
              </button>
            ))}
          </div>

          <div style={{ ...cd, marginTop: 14, padding: "18px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <span style={{ fontSize: 20 }}>🔍</span>
              <span style={{ fontWeight: 700, fontSize: 15 }}>Проверить статус кейса</span>
            </div>
            <p style={{ fontSize: 13, color: T.mid, margin: "0 0 12px" }}>Введите receipt number</p>
            <div style={{ display: "flex", gap: 8 }}>
              <input placeholder="EAC-XX-XXX-XXXXX" style={{ ...iS, flex: 1, width: "auto" }} />
              <a href="https://egov.uscis.gov/casestatussearchwidget" target="_blank" rel="noopener noreferrer" style={{ ...pl(true), textDecoration: "none", display: "flex", alignItems: "center" }}>
                Проверить
              </a>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
