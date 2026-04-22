import { useEffect, useRef, useState } from "react";

export function usePhotoViewer() {
  const [photoViewer, setPhotoViewer] = useState(null);
  const [photoZoom, setPhotoZoom] = useState(1);
  const [photoOffset, setPhotoOffset] = useState({ x: 0, y: 0 });

  const photoSwipeRef = useRef({ startX: 0, startY: 0, active: false });
  const photoPinchRef = useRef({
    baseDistance: 0,
    baseZoom: 1,
    startCenterX: 0,
    startCenterY: 0,
    baseOffsetX: 0,
    baseOffsetY: 0,
  });
  const photoPanRef = useRef({
    active: false,
    startX: 0,
    startY: 0,
    baseOffsetX: 0,
    baseOffsetY: 0,
  });

  const getTouchDistance = (touches) => {
    if (!touches || touches.length < 2) return 0;
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.hypot(dx, dy);
  };

  const getTouchCenter = (touches) => {
    if (!touches || touches.length < 2) return { x: 0, y: 0 };
    return {
      x: (touches[0].clientX + touches[1].clientX) / 2,
      y: (touches[0].clientY + touches[1].clientY) / 2,
    };
  };

  const openPhotoViewer = (photos, startIndex = 0) => {
    const normalized = (Array.isArray(photos) ? photos : [])
      .filter((ph) => typeof ph === "string")
      .filter((ph) => /^(https?:\/\/|blob:|data:image\/)/i.test(ph));
    if (!normalized.length) return;
    const safeIndex = Math.max(0, Math.min(startIndex, normalized.length - 1));
    setPhotoViewer({ photos: normalized, index: safeIndex });
    setPhotoZoom(1);
    setPhotoOffset({ x: 0, y: 0 });
  };

  const closePhotoViewer = () => {
    setPhotoViewer(null);
    setPhotoZoom(1);
    setPhotoOffset({ x: 0, y: 0 });
  };

  const goPrevPhoto = () => {
    setPhotoViewer((prev) => {
      if (!prev || prev.photos.length < 2) return prev;
      const nextIndex = (prev.index - 1 + prev.photos.length) % prev.photos.length;
      return { ...prev, index: nextIndex };
    });
    setPhotoZoom(1);
    setPhotoOffset({ x: 0, y: 0 });
  };

  const goNextPhoto = () => {
    setPhotoViewer((prev) => {
      if (!prev || prev.photos.length < 2) return prev;
      const nextIndex = (prev.index + 1) % prev.photos.length;
      return { ...prev, index: nextIndex };
    });
    setPhotoZoom(1);
    setPhotoOffset({ x: 0, y: 0 });
  };

  const onPhotoTouchStart = (e) => {
    if (!photoViewer) return;

    if (e.touches.length >= 2) {
      const center = getTouchCenter(e.touches);
      photoPinchRef.current.baseDistance = getTouchDistance(e.touches);
      photoPinchRef.current.baseZoom = photoZoom;
      photoPinchRef.current.startCenterX = center.x;
      photoPinchRef.current.startCenterY = center.y;
      photoPinchRef.current.baseOffsetX = photoOffset.x;
      photoPinchRef.current.baseOffsetY = photoOffset.y;
      photoSwipeRef.current.active = false;
      photoPanRef.current.active = false;
      return;
    }

    if (e.touches.length === 1) {
      if (photoZoom > 1.02) {
        photoPanRef.current = {
          active: true,
          startX: e.touches[0].clientX,
          startY: e.touches[0].clientY,
          baseOffsetX: photoOffset.x,
          baseOffsetY: photoOffset.y,
        };
        photoSwipeRef.current.active = false;
      } else {
        photoSwipeRef.current = {
          startX: e.touches[0].clientX,
          startY: e.touches[0].clientY,
          active: true,
        };
        photoPanRef.current.active = false;
      }
    }
  };

  const onPhotoTouchMove = (e) => {
    if (!photoViewer) return;

    if (e.touches.length >= 2) {
      e.preventDefault();
      const baseDistance = photoPinchRef.current.baseDistance || getTouchDistance(e.touches);
      const distance = getTouchDistance(e.touches);
      if (!baseDistance || !distance) return;

      const center = getTouchCenter(e.touches);
      const dx = center.x - photoPinchRef.current.startCenterX;
      const dy = center.y - photoPinchRef.current.startCenterY;
      const nextZoom = Math.max(1, Math.min(4, (photoPinchRef.current.baseZoom || 1) * (distance / baseDistance)));

      setPhotoZoom(nextZoom);
      setPhotoOffset({
        x: photoPinchRef.current.baseOffsetX + dx,
        y: photoPinchRef.current.baseOffsetY + dy,
      });
      return;
    }

    if (e.touches.length === 1 && photoPanRef.current.active) {
      e.preventDefault();
      const dx = e.touches[0].clientX - photoPanRef.current.startX;
      const dy = e.touches[0].clientY - photoPanRef.current.startY;
      setPhotoOffset({
        x: photoPanRef.current.baseOffsetX + dx,
        y: photoPanRef.current.baseOffsetY + dy,
      });
    }
  };

  const onPhotoTouchEnd = (e) => {
    if (!photoViewer) return;
    if (e.touches.length >= 2) return;

    if (photoPanRef.current.active) {
      if (e.touches.length === 0) photoPanRef.current.active = false;
      return;
    }

    if (!photoSwipeRef.current.active) return;
    if (photoZoom > 1.02) {
      photoSwipeRef.current.active = false;
      return;
    }
    const changed = e.changedTouches?.[0];
    if (!changed) {
      photoSwipeRef.current.active = false;
      return;
    }
    const dx = changed.clientX - photoSwipeRef.current.startX;
    const dy = changed.clientY - photoSwipeRef.current.startY;
    photoSwipeRef.current.active = false;
    if (Math.abs(dx) < 45 || Math.abs(dx) < Math.abs(dy)) return;
    if (dx < 0) goNextPhoto();
    else goPrevPhoto();
  };

  useEffect(() => {
    if (!photoViewer) return;
    const prevOverflow = document.body.style.overflow;
    const prevTouchAction = document.body.style.touchAction;
    document.body.style.overflow = "hidden";
    document.body.style.touchAction = "none";
    return () => {
      document.body.style.overflow = prevOverflow;
      document.body.style.touchAction = prevTouchAction;
    };
  }, [photoViewer]);

  useEffect(() => {
    if (photoZoom <= 1.02) {
      setPhotoOffset({ x: 0, y: 0 });
      photoPanRef.current.active = false;
    }
  }, [photoZoom]);

  return {
    photoViewer,
    photoZoom,
    photoOffset,
    openPhotoViewer,
    closePhotoViewer,
    goPrevPhoto,
    goNextPhoto,
    onPhotoTouchStart,
    onPhotoTouchMove,
    onPhotoTouchEnd,
  };
}

