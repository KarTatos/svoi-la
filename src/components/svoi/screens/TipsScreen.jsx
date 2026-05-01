import { TIPS_CATS } from "../config";
import TipCard from "../cards/TipCard";

export default function TipsScreen({
  T,
  cd,
  pl,
  iS,
  selTC,
  setSelTC,
  tips,
  tipsQuery,
  tipsSearchInput,
  setTipsSearchInput,
  tipsSearchApplied,
  tipsSearchResults,
  expTip,
  setExpTip,
  liked,
  favorites,
  goHome,
  trackView,
  openPhotoViewer,
  toggleFavorite,
  handleToggleLike,
  setShowComments,
  handleNativeShare,
  renderComments,
  handleAddComment,
  canManageTip,
  startEditTip,
  handleDeleteTip,
  openAddTipForm,
  applyTipsSearch,
  catTips,
}) {
  if (!selTC) {
    return (
      <div>
        <div style={{ display: "grid", gridTemplateColumns: "48px 48px 48px", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 12 }}>
          <button
            onClick={goHome}
            style={{ width: 38, height: 38, borderRadius: 12, border: "none", background: "#FFFFFF", color: "#8A8680", fontSize: 22, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", padding: 0, flexShrink: 0 }}
            title="Назад"
          >
            ‹
          </button>
          <div
            style={{ width: 38, height: 38, borderRadius: 12, border: "none", background: "#F2EADF", color: "#4D4337", fontSize: 18, cursor: "default", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", padding: 0, flexShrink: 0 }}
            aria-hidden="true"
          >
            💡
          </div>
          <button
            onClick={openAddTipForm}
            style={{ width: 38, height: 38, borderRadius: 12, border: `1.5px solid ${T.primary}55`, background: T.primaryLight, color: T.primary, fontSize: 28, lineHeight: 1, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", padding: 0, flexShrink: 0 }}
            title="Добавить совет"
          >
            +
          </button>
        </div>
        <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
          <input
            value={tipsSearchInput}
            onChange={(e) => setTipsSearchInput(e.target.value)}
            placeholder="Поиск по советам"
            style={{ ...iS, flex: 1, marginBottom: 0 }}
          />
          <button onClick={applyTipsSearch} style={{ ...pl(false), minWidth: 44, padding: "0 12px", fontSize: 16 }}>🔍</button>
        </div>
        {tipsQuery ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {tipsSearchResults.length === 0 && (
              <div style={{ ...cd, padding: 16, fontSize: 13, color: T.mid }}>Ничего не найдено по запросу: “{tipsSearchApplied}”</div>
            )}
            {tipsSearchResults.map((tip) => (
              <TipCard
                key={tip.id}
                tip={tip}
                isExpanded={expTip === tip.id}
                isLiked={!!liked[`tip-${tip.id}`]}
                isFavorited={!!favorites[`tip-${tip.id}`]}
                canEdit={false}
                categoryLabel={TIPS_CATS.find((c) => c.id === tip.cat)?.title || ""}
                marginBottom={0}
                T={T}
                cd={cd}
                pl={pl}
                onToggleExpand={(open) => {
                  setExpTip(open ? tip.id : null);
                  if (open) trackView("tip", tip);
                }}
                onOpenPhoto={(photos, pi) => openPhotoViewer(photos, pi)}
                onToggleFavorite={() => toggleFavorite(tip.id, "tip")}
                onToggleLike={() => handleToggleLike(tip.id, "tip")}
                onOpenComments={() => setShowComments(`tip-${tip.id}`)}
                onShare={() =>
                  handleNativeShare({ title: tip.title, text: tip.text, url: window.location.href })
                }
                onEdit={() => {}}
                onDelete={() => {}}
                renderComments={renderComments}
                handleAddComment={handleAddComment}
              />
            ))}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {TIPS_CATS.map((c) => {
              const cnt = tips.filter((t) => t.cat === c.id).length;
              return (
                <button
                  key={c.id}
                  onClick={() => { setSelTC(c); }}
                  style={{ ...cd, display: "flex", alignItems: "center", gap: 14, padding: "16px", cursor: "pointer", fontFamily: "inherit", color: T.text, textAlign: "left" }}
                  onMouseEnter={(e) => { e.currentTarget.style.boxShadow = T.shH; }}
                  onMouseLeave={(e) => { e.currentTarget.style.boxShadow = T.sh; }}
                >
                  <div style={{ width: 48, height: 48, borderRadius: T.rs, background: T.primaryLight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0 }}>{c.icon}</div>
                  <div style={{ flex: 1 }}><div style={{ fontWeight: 700, fontSize: 15 }}>{c.title}</div><div style={{ fontSize: 12, color: T.mid, marginTop: 2 }}>{c.desc}</div></div>
                  {cnt > 0 && <span style={{ fontSize: 13, fontWeight: 700, color: T.primary }}>{cnt}</span>}
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "48px 48px 48px", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 12 }}>
        <button
          onClick={() => setSelTC(null)}
          style={{ width: 38, height: 38, borderRadius: 12, border: "none", background: "#FFFFFF", color: "#8A8680", fontSize: 22, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", padding: 0, flexShrink: 0 }}
          title="Назад"
        >
          ‹
        </button>
        <div
          style={{ width: 38, height: 38, borderRadius: 12, border: "none", background: "#F2EADF", color: "#4D4337", fontSize: 18, cursor: "default", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", padding: 0, flexShrink: 0 }}
          aria-hidden="true"
        >
          {selTC.icon}
        </div>
        <button
          onClick={openAddTipForm}
          style={{ width: 38, height: 38, borderRadius: 12, border: `1.5px solid ${T.primary}55`, background: T.primaryLight, color: T.primary, fontSize: 28, lineHeight: 1, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", padding: 0, flexShrink: 0 }}
          title="Добавить совет"
        >
          +
        </button>
      </div>
      {catTips.map((tip) => (
        <TipCard
          key={tip.id}
          tip={tip}
          isExpanded={expTip === tip.id}
          isLiked={!!liked[`tip-${tip.id}`]}
          isFavorited={!!favorites[`tip-${tip.id}`]}
          canEdit={canManageTip(tip)}
          T={T}
          cd={cd}
          pl={pl}
          onToggleExpand={(open) => {
            setExpTip(open ? tip.id : null);
            if (open) trackView("tip", tip);
          }}
          onOpenPhoto={(photos, pi) => openPhotoViewer(photos, pi)}
          onToggleFavorite={() => toggleFavorite(tip.id, "tip")}
          onToggleLike={() => handleToggleLike(tip.id, "tip")}
          onOpenComments={() => setShowComments(`tip-${tip.id}`)}
          onShare={() =>
            handleNativeShare({ title: tip.title, text: tip.text, url: window.location.href })
          }
          onEdit={() => startEditTip(tip)}
          onDelete={() => handleDeleteTip(tip.id)}
          renderComments={renderComments}
          handleAddComment={handleAddComment}
        />
      ))}
      <button onClick={openAddTipForm} style={{ ...cd, width: "100%", marginTop: 4, padding: 16, border: `2px dashed ${T.primary}40`, color: T.primary, fontWeight: 600, fontSize: 14, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, boxShadow: "none" }}>＋ Поделиться опытом</button>
    </div>
  );
}
