import { useCallback } from "react";

export function useChatTextRenderer({
  events,
  tips,
  eventCategories,
  tipCategories,
  setSelHousing,
  setScr,
  openPlaceItem,
  setSelEC,
  setExp,
  setSelTC,
  setExpTip,
  trackCardView,
  openExternalUrl,
}) {
  const openChatAppLink = useCallback((url) => {
    const raw = String(url || "").trim();
    if (!raw) return;
    if (!raw.startsWith("app://")) {
      openExternalUrl(raw);
      return;
    }
    const withoutScheme = raw.slice("app://".length);
    const [type, idRaw] = withoutScheme.split("/");
    const id = String(idRaw || "").trim();
    if (!id) return;

    if (type === "housing") {
      setSelHousing({ id });
      setScr("housing-item");
      return;
    }
    if (type === "place") {
      openPlaceItem(id);
      return;
    }
    if (type === "event") {
      const ev = events.find((e) => String(e.id) === id);
      if (!ev) return;
      const eventCat = eventCategories.find((c) => c.id === ev.cat) || null;
      if (eventCat) setSelEC(eventCat);
      setScr("events");
      setExp(`ev-${ev.id}`);
      trackCardView("event", ev);
      return;
    }
    if (type === "tip") {
      const tip = tips.find((t) => String(t.id) === id);
      if (!tip) return;
      const tipCat = tipCategories.find((c) => c.id === tip.cat) || null;
      if (tipCat) setSelTC(tipCat);
      setScr("tips");
      setExpTip(tip.id);
      trackCardView("tip", tip);
      return;
    }
  }, [eventCategories, events, openExternalUrl, openPlaceItem, setExp, setExpTip, setScr, setSelEC, setSelHousing, setSelTC, tips, tipCategories, trackCardView]);

  const renderChatText = useCallback((text, isUser) => {
    const safe = String(text || "");
    const linkColor = isUser ? "#fff" : "#1E5AA5";
    const rowStyle = { display:"block", marginBottom:4 };
    const getAppLinkLabel = (href, rawLabel) => {
      if (rawLabel && rawLabel !== href) return rawLabel;
      const withoutScheme = String(href || "").replace(/^app:\/\//i, "");
      const [type] = withoutScheme.split("/");
      if (type === "place") return "Открыть карточку места";
      if (type === "tip") return "Открыть карточку совета";
      if (type === "event") return "Открыть карточку события";
      if (type === "housing") return "Открыть карточку жилья";
      return "Открыть карточку";
    };
    const parseLine = (line, lineIndex) => {
      const rx = /\[([^\]]+)\]\((app:\/\/[^)\s]+|https?:\/\/[^)\s]+)\)|(app:\/\/[^\s]+|https?:\/\/[^\s]+)/gi;
      const out = [];
      let last = 0;
      let m;
      while ((m = rx.exec(line)) !== null) {
        if (m.index > last) out.push(<span key={`t-${lineIndex}-${last}`}>{line.slice(last, m.index)}</span>);
        const rawLabel = m[1] || m[3];
        const href = m[2] || m[3];
        const isApp = href.startsWith("app://");
        const label = isApp ? getAppLinkLabel(href, rawLabel) : rawLabel;
        out.push(
          <button
            key={`l-${lineIndex}-${m.index}`}
            onClick={() => isApp ? openChatAppLink(href) : openExternalUrl(href)}
            style={{ background:"none", border:"none", padding:0, margin:0, color:linkColor, textDecoration:"underline", cursor:"pointer", fontFamily:"inherit", fontSize:"inherit", lineHeight:"inherit" }}
          >
            {label}
          </button>,
        );
        last = rx.lastIndex;
      }
      if (last < line.length) out.push(<span key={`t-${lineIndex}-end`}>{line.slice(last)}</span>);
      if (!out.length) return <span key={`empty-${lineIndex}`}>{line}</span>;
      return out;
    };
    return (
      <span style={{ display:"block" }}>
        {safe.split("\n").map((line, i) => (
          <span key={`line-${i}`} style={rowStyle}>
            {line.length ? parseLine(line, i) : <span>&nbsp;</span>}
          </span>
        ))}
      </span>
    );
  }, [openChatAppLink, openExternalUrl]);

  return { renderChatText };
}

