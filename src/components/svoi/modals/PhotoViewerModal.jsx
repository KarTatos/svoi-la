import Image from "next/image";

export default function PhotoViewerModal({
  photoViewer,
  photoZoom,
  onClose,
  onPrev,
  onNext,
  onTouchStart,
  onTouchMove,
  onTouchEnd,
}) {
  if (!photoViewer) return null;
  const currentPhoto = photoViewer.photos?.[photoViewer.index];
  if (!currentPhoto) return null;

  return (
    <div onClick={onClose} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.82)", zIndex:300, display:"flex", alignItems:"center", justifyContent:"center", padding:16, touchAction:"none" }}>
      <button
        onClick={(e)=>{e.stopPropagation(); onClose();}}
        style={{ position:"absolute", top:"max(14px, env(safe-area-inset-top))", right:14, width:40, height:40, borderRadius:"50%", border:"1px solid rgba(255,255,255,0.45)", background:"rgba(0,0,0,0.45)", color:"#fff", fontSize:16, fontWeight:700, cursor:"pointer", zIndex:5 }}
      >
        X
      </button>
      {photoViewer.photos.length > 1 && (
        <>
          <button onClick={(e)=>{e.stopPropagation(); onPrev();}} style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", width:42, height:42, borderRadius:"50%", border:"1px solid rgba(255,255,255,0.35)", background:"rgba(0,0,0,0.35)", color:"#fff", fontSize:22, cursor:"pointer", zIndex:4 }}>‹</button>
          <button onClick={(e)=>{e.stopPropagation(); onNext();}} style={{ position:"absolute", right:10, top:"50%", transform:"translateY(-50%)", width:42, height:42, borderRadius:"50%", border:"1px solid rgba(255,255,255,0.35)", background:"rgba(0,0,0,0.35)", color:"#fff", fontSize:22, cursor:"pointer", zIndex:4 }}>›</button>
        </>
      )}
      <div
        onClick={(e)=>e.stopPropagation()}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        style={{ width:"100%", height:"100%", display:"flex", alignItems:"center", justifyContent:"center", overflow:"hidden", touchAction:"none" }}
      >
        <Image
          src={currentPhoto}
          alt=""
          width={1200}
          height={900}
          sizes="100vw"
          draggable={false}
          style={{ maxWidth:"100%", maxHeight:"88vh", borderRadius:12, boxShadow:"0 10px 36px rgba(0,0,0,0.4)", width:"auto", height:"auto", transform:`scale(${photoZoom})`, transformOrigin:"center center", transition:photoZoom === 1 ? "transform 0.2s ease" : "none", userSelect:"none", WebkitUserSelect:"none" }}
        />
      </div>
      {photoViewer.photos.length > 1 && (
        <div style={{ position:"absolute", bottom:14, left:"50%", transform:"translateX(-50%)", color:"#fff", fontSize:12, background:"rgba(0,0,0,0.35)", border:"1px solid rgba(255,255,255,0.25)", padding:"5px 10px", borderRadius:999 }}>
          {photoViewer.index + 1} / {photoViewer.photos.length}
        </div>
      )}
    </div>
  );
}

