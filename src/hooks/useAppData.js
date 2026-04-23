import { useCallback, useEffect, useState } from "react";
import { getPlaces as fetchPlaces, getTips as fetchTips, getEvents as fetchEvents, getHousing as fetchHousing, getAllComments } from "../lib/supabase";
import { PLACE_CAT_IDS, INIT_HOUSING, decodeRichText, decodeHousingPhotos } from "../components/svoi/config";

const normalizeAddressText = (value = "") => {
  const raw = String(value || "").trim();
  if (!raw) return "";
  return raw
    .replace(/<[^>]*>/g, " ")
    .replace(/,\s*CA(?:\s+\d{5}(?:-\d{4})?)?$/gi, "")
    .replace(/\s+/g, " ")
    .replace(/\s+,/g, ",")
    .trim();
};

export function useAppData(user) {
  const [places, setPlaces] = useState([]);
  const [tips, setTips] = useState([]);
  const [events, setEvents] = useState([]);
  const [housing, setHousing] = useState([]);
  const [loading, setLoading] = useState(false);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const [
        { data: dbPlaces, error: placesError },
        { data: dbTips, error: tipsError },
        { data: dbEvents, error: eventsError },
        { data: dbHousing, error: housingError },
        { data: placeComments },
        { data: tipComments },
        { data: eventComments },
      ] = await Promise.all([
        fetchPlaces(),
        fetchTips(),
        fetchEvents(),
        fetchHousing(),
        getAllComments("place"),
        getAllComments("tip"),
        getAllComments("event"),
      ]);

      const groupComments = (rows) => {
        const grouped = {};
        (rows || []).forEach((c) => {
          if (!grouped[c.item_id]) grouped[c.item_id] = [];
          grouped[c.item_id].push({ id: c.id, author: c.author, text: c.text, userId: c.user_id });
        });
        return grouped;
      };

      const placeCommentsByItem = groupComments(placeComments);
      const tipCommentsByItem = groupComments(tipComments);
      const eventCommentsByItem = groupComments(eventComments);

      const mappedPlaces = (dbPlaces || [])
        .map((p) => ({
          id: p.id,
          cat: p.category,
          district: p.district,
          name: p.name,
          address: p.address || "",
          tip: p.tip,
          addedBy: p.added_by,
          userId: p.user_id,
          img: p.img || "📍",
          photos: p.photos || [],
          likes: p.likes_count || 0,
          views: 0,
          comments: placeCommentsByItem[p.id] || [],
          lat: Number.isFinite(Number(p.lat)) ? Number(p.lat) : null,
          lng: Number.isFinite(Number(p.lng)) ? Number(p.lng) : null,
          fromDB: true,
        }))
        .filter((p) => PLACE_CAT_IDS.has(p.cat));

      const mappedTips = (dbTips || []).map((t) => {
        const rich = decodeRichText(t.text);
        return {
          id: t.id,
          cat: t.category,
          title: t.title,
          text: rich.text,
          photos: rich.photos,
          author: t.author,
          userId: t.user_id,
          likes: t.likes_count || 0,
          views: 0,
          comments: tipCommentsByItem[t.id] || [],
          fromDB: true,
        };
      });

      const mappedEvents = (dbEvents || []).map((e) => {
        const rich = decodeRichText(e.description);
        return {
          id: e.id,
          cat: e.category,
          title: e.title,
          date: e.date,
          location: e.location || "",
          desc: rich.text,
          website: rich.website,
          photos: rich.photos,
          author: e.author,
          userId: e.user_id,
          likes: e.likes_count || 0,
          views: 0,
          comments: eventCommentsByItem[e.id] || [],
          fromDB: true,
        };
      });

      const mappedHousing = (dbHousing || []).map((h) => {
        const photos = decodeHousingPhotos(h.photo);
        const tagList = Array.isArray(h.tags) ? h.tags : [];
        const tgTag = tagList.find((t) => String(t).startsWith("contact_tg:"));
        const msgTag = tagList.find((t) => String(t).startsWith("contact_msg:"));
        const commentTag = tagList.find((t) => String(t).startsWith("comment:"));
        let commentText = "";
        if (commentTag) {
          const raw = String(commentTag).replace("comment:", "");
          try { commentText = decodeURIComponent(raw); } catch { commentText = raw; }
        }
        return {
          id: h.id,
          title: h.title || "",
          address: normalizeAddressText(h.address || ""),
          district: h.district || "",
          type: h.type || "studio",
          minPrice: Number(h.min_price ?? h.minPrice ?? 0),
          options: Array.isArray(h.price_options) ? h.price_options : (Array.isArray(h.options) ? h.options : []),
          beds: Number(h.beds ?? 0),
          baths: Number(h.baths ?? 0),
          updatedLabel: h.updated_label || h.updatedLabel || "",
          tags: tagList.filter((t) => !String(t).startsWith("contact_tg:") && !String(t).startsWith("contact_msg:") && !String(t).startsWith("comment:")),
          comment: commentText,
          telegram: tgTag ? String(tgTag).replace("contact_tg:", "").trim() : "",
          messageContact: msgTag ? String(msgTag).replace("contact_msg:", "").trim() : "",
          photos,
          photo: photos[0] || "",
          userId: h.user_id,
          likes: h.likes_count || 0,
          views: 0,
          fromDB: true,
        };
      });

      if (!placesError) setPlaces(mappedPlaces);
      if (!tipsError) setTips(mappedTips);
      if (!eventsError) setEvents(mappedEvents);
      if (!housingError) setHousing(mappedHousing);
      else setHousing(INIT_HOUSING);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload, user?.id]);

  return { places, tips, events, housing, setPlaces, setTips, setEvents, setHousing, reload, loading };
}
