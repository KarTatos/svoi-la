import { useMemo } from "react";
import ImageViewing from "react-native-image-viewing";

export default function PhotoViewerModal({ visible, photos, index, onRequestClose }) {
  const images = useMemo(
    () => (Array.isArray(photos) ? photos.filter(Boolean).map((uri) => ({ uri })) : []),
    [photos]
  );

  return (
    <ImageViewing
      images={images}
      imageIndex={Math.max(0, Number(index || 0))}
      visible={visible && images.length > 0}
      onRequestClose={onRequestClose}
      swipeToCloseEnabled
      doubleTapToZoomEnabled
      presentationStyle="fullScreen"
      animationType="fade"
    />
  );
}
