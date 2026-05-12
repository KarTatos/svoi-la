import * as ImageManipulator from "expo-image-manipulator";

const DEFAULT_MAX_SIDE = 1600;
const DEFAULT_COMPRESS = 0.82;

function getExtFromMime(mime) {
  const type = String(mime || "").toLowerCase();
  if (type.includes("png")) return "png";
  if (type.includes("webp")) return "webp";
  return "jpg";
}

function getAssetExt(asset) {
  const name = String(asset?.fileName || asset?.name || "").toLowerCase();
  const fromName = name.includes(".") ? name.split(".").pop() : "";
  if (fromName) return fromName;
  return getExtFromMime(asset?.mimeType);
}

export async function prepareImageForUpload(asset, options = {}) {
  const srcUri = String(asset?.uri || "");
  if (!srcUri) throw new Error("Фото без uri");

  const maxSide = Number(options.maxSide || DEFAULT_MAX_SIDE);
  const compress = Number(options.compress || DEFAULT_COMPRESS);

  const width = Number(asset?.width || 0);
  const height = Number(asset?.height || 0);
  const biggest = Math.max(width, height);
  let actions = [];

  if (Number.isFinite(biggest) && biggest > maxSide && biggest > 0) {
    if (width >= height) {
      actions = [{ resize: { width: maxSide } }];
    } else {
      actions = [{ resize: { height: maxSide } }];
    }
  }

  const ext = getAssetExt(asset);
  const format =
    ext === "png"
      ? ImageManipulator.SaveFormat.PNG
      : ext === "webp"
        ? ImageManipulator.SaveFormat.WEBP
        : ImageManipulator.SaveFormat.JPEG;

  const result = await ImageManipulator.manipulateAsync(srcUri, actions, {
    compress,
    format,
  });

  const mimeType =
    format === ImageManipulator.SaveFormat.PNG
      ? "image/png"
      : format === ImageManipulator.SaveFormat.WEBP
        ? "image/webp"
        : "image/jpeg";

  const fileExt = getExtFromMime(mimeType);
  const originalName = String(asset?.fileName || asset?.name || "").trim();
  const fileName = originalName && originalName.includes(".")
    ? originalName.replace(/\.[^.]+$/, `.${fileExt}`)
    : `img_${Date.now()}.${fileExt}`;

  return {
    uri: result.uri,
    width: result.width,
    height: result.height,
    mimeType,
    fileName,
  };
}

export async function uploadPreparedImage(asset, uploader, options = {}) {
  const prepared = await prepareImageForUpload(asset, options);
  return uploader(prepared);
}
