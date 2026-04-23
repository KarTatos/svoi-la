import { useCallback, useState } from "react";

export function useMapRouting() {
  const [selectedMapPlace, setSelectedMapPlace] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null);
  const [routeLoading, setRouteLoading] = useState(false);
  const [miniSelectedPlaceId, setMiniSelectedPlaceId] = useState(null);
  const [miniRouteInfo, setMiniRouteInfo] = useState(null);
  const [miniRouteLoading, setMiniRouteLoading] = useState(false);

  const resetMapRouting = useCallback(() => {
    setSelectedMapPlace(null);
    setRouteInfo(null);
    setRouteLoading(false);
    setMiniSelectedPlaceId(null);
    setMiniRouteInfo(null);
    setMiniRouteLoading(false);
  }, []);

  return {
    selectedMapPlace,
    setSelectedMapPlace,
    routeInfo,
    setRouteInfo,
    routeLoading,
    setRouteLoading,
    miniSelectedPlaceId,
    setMiniSelectedPlaceId,
    miniRouteInfo,
    setMiniRouteInfo,
    miniRouteLoading,
    setMiniRouteLoading,
    resetMapRouting,
  };
}

