import { useState } from "react";
import { HeartIcon, ShareIcon, ViewIcon } from "../config";

export default function MarketDetailModal({
  item,
  isLiked,
  canEdit,
  T,
  cd,
  pl,
  onClose,
  onToggleLike,
  onShare,
  onEdit,
  onDelete,
}) {
  const [photoIdx, setPhotoIdx] = useState(0);
  const photos = item.photos?.length ? item.photos : [];

  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 300, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "flex-end" }}
      onClick={onClose}
    >
      <div
        style={{ width: "100%", maxWidth: 480, margin: "0 auto", background: T.card, borderRadius: "22px 22px 0 0", maxHeight: "93vh", overflowY: "auto", overscrollBehavior: "contain" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Photo gallery */}
        <div style={{ position: "relative", width: "100%", paddingTop: "75%", background: T.bg, borderRadius: "22px 22px 0 0", overflow: "hidden" }}>
          {photos.length > 0 ? (
            <img
              src={photos[photoIdx]}
              alt={item.title}
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 56 }}>
              🏷️
            </div>
          )}

          {/* Close button */}
          <button
            onClick={onClose}
            style={{ position: "absolute", top: 14, left: 14, background: "rgba(0,0,0,0.45)", border: "none", borderRadius: "50%", width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#fff", fontSize: 18, lineHeight: 1 }}
          >
            ‹
          </button>

          {/* Heart overlay */}
          <button
            onClick={onToggleLike}
            style={{ position: "absolute", top: 14, right: 14, background: "rgba(255,255,255,0.88)", border: "none", borderRadius: "50%", width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
          >
            <HeartIcon active={!!isLiked} size={18} />
          </button>
        </div>

        {/* Thumbnail strip */}
        {photos.length > 1 && (
          <div style={{ display: "flex", gap: 6, padding: "10px 14px 0", overflowX: "auto" }}>
            {photos.map((p, i) => (
              <div
                key={i}
                onClick={() => setPhotoIdx(i)}
                style={{
                  width: 52, height: 52, flexShrink: 0, borderRadius: 8, overflow: "hidden",
                  border: `2px solid ${i === photoIdx ? T.primary : "transparent"}`,
                  cursor: "pointer",
                }}
              >
                <img src={p} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
            ))}
          </div>
        )}

        {/* Content */}
        <div style={{ padding: "16px 16px 12px" }}>
          {item.price && (
            <div style={{ fontSize: 26, fontWeight: 800, color: T.primary, marginBottom: 4 }}>{item.price}</div>
          )}
          <div style={{ fontSize: 17, fontWeight: 700, lineHeight: 1.3, marginBottom: 10 }}>{item.title}</div>

          {/* Stats row */}
          <div style={{ display: "flex", gap: 14, alignItems: "center", marginBottom: 14 }}>
            <span style={{ fontSize: 12, color: T.mid, display: "inline-flex", alignItems: "center", gap: 4 }}>
              <ViewIcon size={13} /> {item.views || 0}
            </span>
            <span style={{ fontSize: 12, color: isLiked ? "#E74C3C" : T.mid, display: "inline-flex", alignItems: "center", gap: 4 }}>
              <HeartIcon active={!!isLiked} size={13} /> {item.likes || 0}
            </span>
            <button
              onClick={onShare}
              style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", color: T.mid, padding: 0, display: "inline-flex", alignItems: "center" }}
            >
              <ShareIcon size={18} />
            </button>
          </div>

          {item.description && (
            <div style={{ fontSize: 14, lineHeight: 1.65, color: T.mid, whiteSpace: "pre-wrap", wordBreak: "break-word", marginBottom: 16 }}>
              {item.description}
            </div>
          )}
        </div>

        {/* Contacts */}
        {(item.telegram || item.phone) && (
          <div style={{ padding: "0 16px 16px", display: "flex", gap: 8, flexWrap: "wrap" }}>
            {item.telegram && (
              <a
                href={`tg://resolve?domain=${item.telegram.replace(/^@/, "")}`}
                style={{ ...pl(true), padding: "11px 18px", fontSize: 14, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6, flex: 1, justifyContent: "center" }}
              >
                ✈️ {item.telegram.startsWith("@") ? item.telegram : `@${item.telegram}`}
              </a>
            )}
            {item.phone && (
              <a
                href={`tel:${item.phone}`}
                style={{ ...pl(false), padding: "11px 14px", fontSize: 18, textDecoration: "none", display: "inline-flex", alignItems: "center", justifyContent: "center" }}
                title={item.phone}
              >
                📞
              </a>
            )}
          </div>
        )}

        {/* Edit controls */}
        {canEdit && (
          <div style={{ padding: "0 16px calc(env(safe-area-inset-bottom) + 20px)" }}>
            <button
              onClick={onEdit}
              style={{ ...pl(false), width: "100%", padding: 12, fontSize: 13 }}
            >
              ✏️ Редактировать
            </button>
          </div>
        )}

        {!canEdit && (
          <div style={{ height: "calc(env(safe-area-inset-bottom) + 20px)" }} />
        )}
      </div>
    </div>
  );
}
