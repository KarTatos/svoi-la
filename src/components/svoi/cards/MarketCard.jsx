import { HeartIcon } from "../config";
import Image from "next/image";

export default function MarketCard({ item, isLiked, T, cd, pl, onClick, onToggleLike }) {
  const photo = item.photos?.[0];

  return (
    <div
      onClick={onClick}
      style={{ ...cd, overflow: "hidden", cursor: "pointer", padding: 0, display: "flex", flexDirection: "column" }}
    >
      {/* Square photo */}
      <div style={{ position: "relative", width: "100%", paddingTop: "100%", background: T.bg, flexShrink: 0 }}>
        {photo ? (
          <Image src={photo} alt={item.title} fill sizes="(max-width: 480px) 50vw, 240px" unoptimized style={{ objectFit: "cover" }} />
        ) : (
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36 }}>
            🏷️
          </div>
        )}

        {/* Heart overlay */}
        <button
          onClick={(e) => { e.stopPropagation(); onToggleLike(); }}
          style={{
            position: "absolute", top: 7, right: 7,
            background: "rgba(255,255,255,0.88)", border: "none", borderRadius: "50%",
            width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", boxShadow: "0 1px 4px rgba(0,0,0,0.15)", padding: 0,
          }}
        >
          <HeartIcon active={!!isLiked} size={15} />
        </button>

        {/* Photo count badge */}
        {item.photos?.length > 1 && (
          <div style={{
            position: "absolute", bottom: 6, right: 7,
            background: "rgba(0,0,0,0.55)", borderRadius: 8,
            padding: "2px 6px", fontSize: 11, color: "#fff",
          }}>
            +{item.photos.length - 1}
          </div>
        )}
      </div>

      {/* Info */}
      <div style={{ padding: "9px 10px 11px" }}>
        <div style={{
          fontSize: 13, fontWeight: 500, color: T.text, lineHeight: 1.35,
          overflow: "hidden", display: "-webkit-box",
          WebkitLineClamp: 2, WebkitBoxOrient: "vertical", marginBottom: 4,
        }}>
          {item.title}
        </div>
        {item.price
          ? <div style={{ fontSize: 15, fontWeight: 700, color: T.primary }}>{item.price}</div>
          : <div style={{ fontSize: 13, color: T.light }}>Цена не указана</div>
        }
      </div>
    </div>
  );
}
