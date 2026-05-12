import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchPlaces } from "../lib/places";
import { supabase } from "../lib/supabase";

function getInitials(name, email) {
  const cleanName = String(name || "").trim();
  if (cleanName) {
    const parts = cleanName.split(/\s+/).filter(Boolean);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return `${parts[0][0] || ""}${parts[1][0] || ""}`.toUpperCase();
  }
  const cleanEmail = String(email || "").trim();
  return cleanEmail ? cleanEmail[0].toUpperCase() : "U";
}

async function fetchProfileStats(userId) {
  if (!userId) return { myLikesCount: 0, myTipsCount: 0 };

  const likesReq = supabase
    .from("likes")
    .select("id", { head: true, count: "exact" })
    .eq("user_id", userId);

  const tipsReq = supabase
    .from("tips")
    .select("id", { head: true, count: "exact" })
    .eq("user_id", userId);

  const [likesRes, tipsRes] = await Promise.allSettled([likesReq, tipsReq]);

  let myLikesCount = 0;
  let myTipsCount = 0;

  if (likesRes.status === "fulfilled" && !likesRes.value.error) {
    myLikesCount = Number(likesRes.value.count || 0);
  }

  if (tipsRes.status === "fulfilled" && !tipsRes.value.error) {
    myTipsCount = Number(tipsRes.value.count || 0);
  }

  return { myLikesCount, myTipsCount };
}

export function useProfileData(user) {
  const userId = user?.id || null;

  const placesQuery = useQuery({
    queryKey: ["places"],
    queryFn: fetchPlaces,
    enabled: !!userId,
  });

  const statsQuery = useQuery({
    queryKey: ["profile-stats", userId],
    queryFn: () => fetchProfileStats(userId),
    enabled: !!userId,
  });

  const myPlacesCount = useMemo(() => {
    if (!userId || !Array.isArray(placesQuery.data)) return 0;
    return placesQuery.data.filter((p) => p?.userId === userId).length;
  }, [placesQuery.data, userId]);

  const normalizedUser = useMemo(() => {
    if (!user) return null;
    return {
      id: user.id,
      email: user.email || "",
      name: user.name || "",
      avatarUrl: user.avatarUrl || "",
      providers: Array.isArray(user.providers) ? user.providers : [],
      initials: getInitials(user.name, user.email),
    };
  }, [user]);

  return {
    user: normalizedUser,
    initials: normalizedUser?.initials || "U",
    myPlacesCount,
    myTipsCount: Number(statsQuery.data?.myTipsCount || 0),
    myLikesCount: Number(statsQuery.data?.myLikesCount || 0),
    loading: placesQuery.isLoading || statsQuery.isLoading,
    error: placesQuery.error?.message || statsQuery.error?.message || "",
  };
}
