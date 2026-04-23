import EventFormModal from "../forms/EventFormModal";
import CommentsBlock from "../components/CommentsBlock";

export default function EventsScreen({
  scr,
  selEC,
  setSelEC,
  setFilterDate,
  goHome,
  bk,
  T,
  EVENT_CATS,
  events,
  cd,
  openAddEventForm,
  setNewEvent,
  filterDate,
  CalendarIcon,
  datePickerRef,
  fmtDate,
  catEvents,
  exp,
  setExp,
  favorites,
  normalizeExternalUrl,
  pl,
  openEventMap,
  twoLineClampStyle,
  limitCardText,
  openPhotoViewer,
  liked,
  toggleFavorite,
  StarIcon,
  HeartIcon,
  handleNativeShare,
  ShareIcon,
  comments,
  addEventComment,
  canManageEvent,
  startEditEvent,
  showAddEvent,
  setShowAddEvent,
  setNewEventPhotos,
  setAddrOptionsEvent,
  setAddrValidEvent,
  setEditingEvent,
  editingEvent,
  newEvent,
  addrLoadingEvent,
  addrOptionsEvent,
  selectEventAddressSuggestion,
  CARD_TEXT_MAX,
  eventFileRef,
  handleEventPhotos,
  newEventPhotos,
  handleDeleteEvent,
  handleAddEvent,
}) {
  const {
    showComments,
    setShowComments,
    newComment,
    setNewComment,
    editingComment,
    setEditingComment,
    editCommentText,
    setEditCommentText,
    saveEditComment,
    deleteCommentFn,
    user,
    handleLogin,
    iS,
  } = comments;

  return (
    <>
      {scr==="events" && !selEC && (<div>
        <button onClick={goHome} style={bk}>← Главная</button>
        <h2 style={{ fontSize:20, fontWeight:700, margin:"4px 0 4px" }}>🎉 События и мероприятия</h2>
        <p style={{ fontSize:13, color:T.mid, margin:"0 0 16px" }}>Концерты, праздники, встречи комьюнити</p>
        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          {EVENT_CATS.map((c, i) => { const cnt = events.filter(e=>e.cat===c.id).length; return (
            <button key={c.id} onClick={() => setSelEC(c)}
              style={{ ...cd, display:"flex", alignItems:"center", gap:14, padding:"16px", cursor:"pointer", fontFamily:"inherit", color:T.text, textAlign:"left" }}
              onMouseEnter={e=>{e.currentTarget.style.boxShadow=T.shH}} onMouseLeave={e=>{e.currentTarget.style.boxShadow=T.sh}}>
              <div style={{ width:48, height:48, borderRadius:T.rs, background:`${c.color}12`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:24, flexShrink:0 }}>{c.icon}</div>
              <div style={{ flex:1 }}><div style={{ fontWeight:700, fontSize:15 }}>{c.title}</div></div>
              {cnt>0 && <span style={{ fontSize:13, fontWeight:700, color:T.primary }}>{cnt}</span>}
            </button>
          ); })}
        </div>
      </div>)}

      {scr==="events" && selEC && (<div>
        <button onClick={() => { setSelEC(null); setFilterDate(null); }} style={bk}>← Все события</button>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:12, margin:"4px 0 12px" }}>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <div style={{ width:48, height:48, borderRadius:14, background:`${selEC.color}12`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:26 }}>{selEC.icon}</div>
            <div><h2 style={{ fontSize:20, fontWeight:700, margin:0 }}>{selEC.title}</h2></div>
          </div>
          <button
            onClick={() => { openAddEventForm(); setNewEvent((prev) => ({ ...prev, cat: selEC?.id || "" })); }}
            style={{ width:38, height:38, borderRadius:12, border:`1.5px solid ${T.primary}55`, background:T.primaryLight, color:T.primary, fontSize:28, lineHeight:1, cursor:"pointer", fontFamily:"inherit", display:"flex", alignItems:"center", justifyContent:"center", padding:0, flexShrink:0 }}
            title="Добавить"
          >
            +
          </button>
        </div>
        {/* Date filter bar */}
        <div style={{ marginBottom:16 }}>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(9, minmax(0, 1fr))", gap:6, alignItems:"stretch" }}>
            <button onClick={() => setFilterDate(null)}
              style={{ padding:"6px 6px", borderRadius:12, border:`1.5px solid ${!filterDate?T.primary:T.border}`, background:!filterDate?T.primary:T.card, color:!filterDate?"#fff":T.mid, fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"inherit", minWidth:0 }}>
              Все
            </button>
            {Array.from({length:7}, (_,i) => {
              const d = new Date(); d.setDate(d.getDate()+i);
              const dayNames = ["Вс","Пн","Вт","Ср","Чт","Пт","Сб"];
              const isActive = filterDate && new Date(filterDate).toDateString() === d.toDateString();
              const isToday = i === 0;
              const isTodayAccent = isToday && !isActive;
              return (
                <button key={i} onClick={() => setFilterDate(isActive ? null : d.toISOString())}
                  style={{ padding:"5px 4px", borderRadius:12, border:`1.5px solid ${isActive?T.primary:(isTodayAccent?"#E74C3C":T.border)}`, background:isActive?T.primary:(isTodayAccent?"#FFF5F5":T.card), color:isActive?"#fff":(isTodayAccent?"#C0392B":T.text), fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"inherit", minWidth:0, textAlign:"center", display:"flex", flexDirection:"column", alignItems:"center", gap:2, justifyContent:"center" }}>
                  <span style={{ fontSize:9, color:isActive?"#fff":(isTodayAccent?"#C0392B":T.light), fontWeight:400, lineHeight:1 }}>{isToday?"Сег":dayNames[d.getDay()]}</span>
                  <span style={{ fontSize:14, fontWeight:700, lineHeight:1 }}>{d.getDate()}</span>
                </button>
              );
            })}
            {/* Calendar picker — always visible */}
            <div style={{ position:"relative", minWidth:0 }}>
              <button
                style={{ padding:"5px 4px", borderRadius:12, border:`1.5px solid ${T.border}`, background:T.card, color:T.mid, fontSize:15, cursor:"pointer", fontFamily:"inherit", width:"100%", height:"100%", minHeight:42, display:"flex", alignItems:"center", justifyContent:"center" }}>
                <CalendarIcon size={16} />
              </button>
              <input
                ref={datePickerRef}
                type="date"
                onChange={(e)=>{ if (e.target.value) setFilterDate(e.target.value+"T00:00"); }}
                style={{ position:"absolute", inset:0, opacity:0, cursor:"pointer", WebkitAppearance:"none", appearance:"none" }}
              />
            </div>
          </div>
          {filterDate && (
            <div style={{ fontSize:12, color:T.mid, marginTop:6, display:"flex", alignItems:"center", gap:6 }}>
              <CalendarIcon size={14} /> {fmtDate(filterDate).split(",").slice(0,2).join(",")}
              <button onClick={() => setFilterDate(null)} style={{ background:"none", border:"none", color:T.primary, cursor:"pointer", fontSize:12, fontFamily:"inherit", fontWeight:600, padding:0 }}>? сбросить</button>
            </div>
          )}
        </div>
        {catEvents.map((ev, i) => { const isEvExp = exp === `ev-${ev.id}`; const isF = favorites[`event-${ev.id}`]; const eventWebsite = normalizeExternalUrl(ev.website); return (<div key={ev.id} style={{ ...cd, marginBottom:12, overflow:"hidden", borderColor:isEvExp?T.primary+"40":T.borderL }}>
          <div onClick={() => { const nextOpen = !isEvExp; setExp(nextOpen ? `ev-${ev.id}` : null); }} style={{ padding:18, cursor:"pointer" }} onMouseEnter={e=>{e.currentTarget.style.background=T.bg}} onMouseLeave={e=>{e.currentTarget.style.background=T.card}}>
            <div style={{ fontWeight:700, fontSize:16, marginBottom:8 }}>{ev.title}</div>
            <div style={{ display:"flex", flexDirection:"column", gap:4, marginBottom:10 }}>
              <div style={{ fontSize:13, color:T.mid, display:"inline-flex", alignItems:"center", gap:5 }}><CalendarIcon size={13} /> {fmtDate(ev.date)}</div>
              {ev.location && <div style={{ fontSize:13, color:T.mid }}>?? {ev.location}</div>}
            </div>
            {isEvExp && ev.location && (
              <div style={{ display:"flex", gap:8, marginBottom:10 }}>
                <button onClick={(e)=>{e.stopPropagation(); openEventMap(ev.location, "google");}} style={{ ...pl(false), padding:"8px 10px", fontSize:12 }}>Google Maps</button>
                <button onClick={(e)=>{e.stopPropagation(); openEventMap(ev.location, "apple");}} style={{ ...pl(false), padding:"8px 10px", fontSize:12 }}>Apple Maps</button>
              </div>
            )}
            {isEvExp && eventWebsite && (
              <a href={eventWebsite} target="_blank" rel="noreferrer" onClick={(e)=>e.stopPropagation()} style={{ display:"inline-block", fontSize:13, color:T.primary, textDecoration:"none", marginBottom:10 }}>
                Сайт мероприятия
              </a>
            )}
            <div style={{ ...(!isEvExp ? twoLineClampStyle : {}), fontSize:13, lineHeight:1.6, color:T.mid, marginBottom:10, whiteSpace:isEvExp ? "pre-wrap" : "normal", overflowWrap:"anywhere", wordBreak:"break-word" }}>{limitCardText(ev.desc)}</div>
            {isEvExp && ev.photos?.length > 0 && (
              <div style={{ display:"flex", gap:8, overflowX:"auto", marginBottom:10, paddingBottom:4, scrollSnapType:"x mandatory" }}>
                {ev.photos.map((ph, pi) => (
                  <img key={pi} src={ph} alt="" style={{ width:86, height:86, objectFit:"cover", borderRadius:10, border:`1px solid ${T.border}`, cursor:"zoom-in", flexShrink:0, scrollSnapAlign:"start" }} onClick={(e)=>{e.stopPropagation(); openPhotoViewer(ev.photos, pi);}} />
                ))}
              </div>
            )}
            {isEvExp && ev.photos?.length > 1 && <div style={{ fontSize:11, color:T.light, marginTop:-6, marginBottom:8 }}>Листайте фото →</div>}
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <span style={{ fontSize:11, color:T.light }}>от {ev.author}</span>
              <div style={{ display:"flex", gap:10, fontSize:12, color:T.mid, alignItems:"center" }}>
                <button
                  onClick={(e)=>{e.stopPropagation(); toggleFavorite(ev.id,"event");}}
                  style={{ background:"none", border:"none", cursor:"pointer", fontFamily:"inherit", color:isF ? "#D68910" : T.light, padding:0, fontSize:14, lineHeight:1 }}
                  title="Избранное"
                >
                  <StarIcon active={!!isF} size={14} />
                </button>
                <span style={{ display:"inline-flex", alignItems:"center", gap:4, color:liked[`event-${ev.id}`]?"#E74C3C":T.mid }}><HeartIcon active={!!liked[`event-${ev.id}`]} size={14} /> {ev.likes}</span>
                <span style={{ fontSize:10, color:isEvExp?T.primary:T.light, transform:isEvExp?"rotate(180deg)":"", transition:"0.3s" }}>Ў</span>
              </div>
            </div>
          </div>
          {isEvExp && (<div style={{ borderTop:`1px solid ${T.borderL}` }}>
            <div style={{ padding:"14px 16px 10px", display:"flex", justifyContent:"flex-end", alignItems:"center" }}>
              <button onClick={(e)=>{e.stopPropagation(); handleNativeShare({ title:ev.title, text:ev.desc, url:window.location.href });}} style={{ background:"none", border:"none", cursor:"pointer", fontFamily:"inherit", color:T.mid, padding:0, display:"inline-flex", alignItems:"center", justifyContent:"center" }} title="Поделиться"><ShareIcon size={18} /></button>
            </div>
            <CommentsBlock
              item={ev}
              type="event"
              addFn={addEventComment}
              showComments={showComments}
              setShowComments={setShowComments}
              newComment={newComment}
              setNewComment={setNewComment}
              editingComment={editingComment}
              setEditingComment={setEditingComment}
              editCommentText={editCommentText}
              setEditCommentText={setEditCommentText}
              saveEditComment={saveEditComment}
              deleteCommentFn={deleteCommentFn}
              user={user}
              handleLogin={handleLogin}
              T={T}
              pl={pl}
              iS={iS}
            />
            {canManageEvent(ev) && (
              <div style={{ padding:"0 16px 16px" }}>
                <button onClick={(e)=>{e.stopPropagation(); startEditEvent(ev);}} style={{ width:"100%", padding:"10px 0", borderRadius:24, border:`1.5px solid ${T.primary}55`, cursor:"pointer", fontFamily:"inherit", fontSize:12, fontWeight:600, background:T.primaryLight, color:T.primary }}>Редактировать событие</button>
              </div>
            )}
          </div>)}
        </div>); })}
        {catEvents.length===0 && <p style={{ fontSize:13, color:T.mid, textAlign:"center", padding:20 }}>Пока нет событий в этой категории</p>}
        <button onClick={() => { openAddEventForm(); setNewEvent((prev) => ({ ...prev, cat: selEC?.id || "" })); }} style={{ ...cd, width:"100%", marginTop:4, padding:16, border:`2px dashed ${T.primary}40`, color:T.primary, fontWeight:600, fontSize:14, cursor:"pointer", fontFamily:"inherit", display:"flex", alignItems:"center", justifyContent:"center", gap:6, boxShadow:"none" }}>+ Добавить событие</button>
      </div>)}

      <EventFormModal
        showAddEvent={showAddEvent}
        setShowAddEvent={setShowAddEvent}
        setNewEventPhotos={setNewEventPhotos}
        setAddrOptionsEvent={setAddrOptionsEvent}
        setAddrValidEvent={setAddrValidEvent}
        setEditingEvent={setEditingEvent}
        cd={cd}
        T={T}
        user={user}
        handleLogin={handleLogin}
        pl={pl}
        editingEvent={editingEvent}
        newEvent={newEvent}
        setNewEvent={setNewEvent}
        iS={iS}
        EVENT_CATS={EVENT_CATS}
        addrLoadingEvent={addrLoadingEvent}
        addrOptionsEvent={addrOptionsEvent}
        onSelectEventAddressSuggestion={selectEventAddressSuggestion}
        CARD_TEXT_MAX={CARD_TEXT_MAX}
        eventFileRef={eventFileRef}
        handleEventPhotos={handleEventPhotos}
        newEventPhotos={newEventPhotos}
        canManageEvent={canManageEvent}
        handleDeleteEvent={handleDeleteEvent}
        handleAddEvent={handleAddEvent}
      />
    </>
  );
}
