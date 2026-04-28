import { HeartIcon, ViewIcon, ShareIcon, JOB_WORK_AUTH, JOB_SCHEDULES, JOB_ENGLISH } from "../config";

function workAuthEmoji(id) {
  return JOB_WORK_AUTH.find((w) => w.id === id)?.emoji || "";
}

function scheduleLabel(id) {
  return JOB_SCHEDULES.find((s) => s.id === id)?.label || id || "";
}

function englishLabel(id) {
  return JOB_ENGLISH.find((e) => e.id === id)?.label || "";
}

export default function JobCard({
  job,
  isExpanded,
  isLiked,
  canEdit,
  T,
  cd,
  pl,
  onToggleExpand,
  onToggleLike,
  onShare,
  onEdit,
  onDelete,
}) {
  const meta = [
    job.schedule && scheduleLabel(job.schedule),
    job.english_lvl && `🗣 ${englishLabel(job.english_lvl)}`,
  ].filter(Boolean).join("  ·  ");

  return (
    <div style={{ ...cd, marginBottom: 10, overflow: "hidden", borderColor: isExpanded ? T.primary + "40" : T.borderL }}>

      {/* — Header (always visible) — */}
      <div
        onClick={() => onToggleExpand(!isExpanded)}
        style={{ padding: 16, cursor: "pointer", background: isExpanded ? T.bg : T.card }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 3, lineHeight: 1.3 }}>{job.title}</div>
            <div style={{ fontSize: 12, color: T.mid }}>{job.district || "LA"}</div>
          </div>
          {job.work_auth && job.work_auth !== "ask" && (
            <span style={{ fontSize: 18, flexShrink: 0, lineHeight: 1 }} title={workAuthEmoji(job.work_auth)}>
              {workAuthEmoji(job.work_auth)}
            </span>
          )}
        </div>

        {job.price && (
          <div style={{ fontSize: 16, fontWeight: 700, color: T.primary, marginTop: 6 }}>
            {job.price}{job.price_type ? <span style={{ fontSize: 13, fontWeight: 500, color: T.mid }}> / {job.price_type}</span> : null}
          </div>
        )}

        {meta ? (
          <div style={{ fontSize: 12, color: T.light, marginTop: 4 }}>{meta}</div>
        ) : null}

        {/* bottom row */}
        <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", marginTop: 10 }}>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <span style={{ fontSize: 12, color: T.mid, display: "inline-flex", alignItems: "center", gap: 3 }}>
              <ViewIcon size={13} /> {job.views || 0}
            </span>
            <span style={{ fontSize: 12, color: isLiked ? "#E74C3C" : T.mid, display: "inline-flex", alignItems: "center", gap: 3 }}>
              <HeartIcon active={!!isLiked} size={13} /> {job.likes || 0}
            </span>
            <span style={{ color: isExpanded ? T.primary : T.light, transition: "0.3s", transform: isExpanded ? "rotate(180deg)" : "" }}>▼</span>
          </div>
        </div>
      </div>

      {/* — Expanded body — */}
      {isExpanded && (
        <div style={{ borderTop: `1px solid ${T.borderL}` }}>
          {job.description && (
            <div style={{ padding: "14px 16px 0", fontSize: 13, lineHeight: 1.7, color: T.mid, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
              {job.description}
            </div>
          )}

          {/* action bar */}
          <div style={{ padding: "14px 16px", display: "flex", gap: 12, alignItems: "center" }}>
            <button
              onClick={(e) => { e.stopPropagation(); onShare(); }}
              style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", color: T.mid, padding: 0, display: "inline-flex", alignItems: "center" }}
            >
              <ShareIcon size={18} />
            </button>
          </div>

          {/* contacts */}
          {(job.telegram || job.phone) && (
            <div style={{ padding: "0 16px 16px", display: "flex", gap: 8, flexWrap: "wrap" }}>
              {job.telegram && (
                <a
                  href={`tg://resolve?domain=${job.telegram.replace(/^@/, "")}`}
                  style={{ ...pl(true), padding: "10px 16px", fontSize: 13, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6 }}
                  onClick={(e) => e.stopPropagation()}
                >
                  ✈️ {job.telegram.startsWith("@") ? job.telegram : `@${job.telegram}`}
                </a>
              )}
              {job.phone && (
                <a
                  href={`tel:${job.phone}`}
                  style={{ ...pl(false), padding: "10px 14px", fontSize: 18, textDecoration: "none", display: "inline-flex", alignItems: "center" }}
                  onClick={(e) => e.stopPropagation()}
                  title={job.phone}
                >
                  📞
                </a>
              )}
            </div>
          )}

          {canEdit && (
            <div style={{ padding: "0 16px 16px" }}>
              <button onClick={(e) => { e.stopPropagation(); onEdit(); }} style={{ ...pl(false), width: "100%", padding: 10, fontSize: 12 }}>✏️ Редактировать</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
