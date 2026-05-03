import { HeartIcon, ShareIcon, StarIcon, ViewIcon, limitCardText, twoLineClampStyle } from "../config";
import Image from "next/image";

export default function TipCard({
  tip,
  isExpanded,
  isLiked,
  isFavorited,
  canEdit,
  categoryLabel,
  marginBottom = 12,
  T,
  cd,
  pl,
  onToggleExpand,
  onOpenPhoto,
  onToggleFavorite,
  onToggleLike,
  onOpenComments,
  onShare,
  onEdit,
  onDelete,
  renderComments,
  handleAddComment,
}) {
  return (
    <div style={{ ...cd, marginBottom, overflow: "hidden", borderColor: isExpanded ? T.primary + "40" : T.borderL }}>
      <div
        onClick={() => onToggleExpand(!isExpanded)}
        style={{ padding: 16, cursor: "pointer", background: isExpanded ? T.bg : T.card }}
      >
        {categoryLabel ? (
          <div style={{ fontSize: 11, color: T.light, marginBottom: 4 }}>{categoryLabel}</div>
        ) : null}
        <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>{tip.title}</div>
        <div
          style={{
            ...(!isExpanded ? twoLineClampStyle : {}),
            fontSize: 13,
            lineHeight: 1.6,
            color: T.mid,
            whiteSpace: isExpanded ? "pre-wrap" : "normal",
            overflowWrap: "anywhere",
            wordBreak: "break-word",
          }}
        >
          {limitCardText(tip.text)}
        </div>

        {isExpanded && tip.photos?.length > 0 && (
          <div
            style={{
              display: "flex",
              gap: 8,
              overflowX: "auto",
              marginTop: 10,
              paddingBottom: 4,
              scrollSnapType: "x mandatory",
            }}
          >
            {tip.photos.map((ph, pi) => (
              <Image
                key={pi}
                src={ph}
                alt=""
                width={86}
                height={86}
                unoptimized
                style={{
                  width: 86,
                  height: 86,
                  objectFit: "cover",
                  borderRadius: 10,
                  border: `1px solid ${T.border}`,
                  cursor: "zoom-in",
                  flexShrink: 0,
                  scrollSnapAlign: "start",
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenPhoto(tip.photos, pi);
                }}
              />
            ))}
          </div>
        )}
        {isExpanded && tip.photos?.length > 1 && (
          <div style={{ fontSize: 11, color: T.light, marginTop: 2 }}>Листайте фото →</div>
        )}

        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10 }}>
          <span style={{ fontSize: 11, color: T.light }}>от {tip.author}</span>
          <div style={{ display: "flex", gap: 10, fontSize: 12, color: T.mid, alignItems: "center" }}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite();
              }}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                fontFamily: "inherit",
                color: isFavorited ? "#D68910" : T.light,
                padding: 0,
                fontSize: 14,
                lineHeight: 1,
              }}
              title="Избранное"
            >
              <StarIcon active={!!isFavorited} size={14} />
            </button>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
              <ViewIcon size={14} /> {tip.views || 0}
            </span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 4, color: isLiked ? "#E74C3C" : T.mid }}>
              <HeartIcon active={!!isLiked} size={14} /> {tip.likes || 0}
            </span>
            <span>💬 {tip.comments.length}</span>
            <span
              style={{
                color: isExpanded ? T.primary : T.light,
                transform: isExpanded ? "rotate(180deg)" : "",
                transition: "0.3s",
              }}
            >
              ▼
            </span>
          </div>
        </div>
      </div>

      {isExpanded && (
        <div style={{ borderTop: `1px solid ${T.borderL}` }}>
          <div style={{ padding: "14px 16px 10px", display: "flex", gap: 14, alignItems: "center" }}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite();
              }}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                fontFamily: "inherit",
                display: "flex",
                alignItems: "center",
                gap: 5,
                fontSize: 18,
                color: isFavorited ? "#D68910" : T.mid,
                padding: 0,
              }}
              title="Избранное"
            >
              <StarIcon active={!!isFavorited} size={18} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleLike();
              }}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                fontFamily: "inherit",
                display: "flex",
                alignItems: "center",
                gap: 5,
                fontSize: 18,
                color: isLiked ? "#E74C3C" : T.mid,
                padding: 0,
              }}
              title="Нравится"
            >
              <HeartIcon active={!!isLiked} /> <span style={{ fontSize: 14 }}>{tip.likes || 0}</span>
            </button>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 14, color: T.mid }}>
              <ViewIcon size={16} /> {tip.views || 0}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenComments();
              }}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                fontFamily: "inherit",
                display: "flex",
                alignItems: "center",
                gap: 5,
                fontSize: 18,
                color: T.mid,
                padding: 0,
              }}
              title="Комментарии"
            >
              ◌ <span style={{ fontSize: 14 }}>{(tip.comments || []).length}</span>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onShare();
              }}
              style={{
                marginLeft: "auto",
                background: "none",
                border: "none",
                cursor: "pointer",
                fontFamily: "inherit",
                color: T.mid,
                padding: 0,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              title="Поделиться"
            >
              <ShareIcon size={18} />
            </button>
          </div>

          {renderComments(tip, "tip", handleAddComment)}

          {canEdit && (
            <div style={{ padding: "0 16px 16px", display: "flex", gap: 8 }}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
                style={{ ...pl(false), flex: 1, padding: 10, fontSize: 12 }}
              >
                ✏️ Редактировать
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                style={{
                  ...pl(false),
                  flex: 1,
                  padding: 10,
                  fontSize: 12,
                  border: "1.5px solid #fecaca",
                  color: "#E74C3C",
                  background: "#FFF5F5",
                }}
              >
                🗑 Удалить
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
