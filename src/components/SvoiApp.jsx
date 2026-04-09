'use client';
import { useState, useEffect, useRef } from "react";
import { signInWithGoogle, signOut, getUser, getPlaces as fetchPlaces, addPlace as dbAddPlace, updatePlace as dbUpdatePlace, deletePlace as dbDeletePlace, getTips as fetchTips, addTip as dbAddTip, deleteTip as dbDeleteTip, getEvents as fetchEvents, addEvent as dbAddEvent, updateEvent as dbUpdateEvent, deleteEvent as dbDeleteEvent, getAllComments, addComment as dbAddComment, updateComment as dbUpdateComment, deleteComment as dbDeleteComment, toggleLike as dbToggleLike, getUserLikes, uploadPhoto } from "../lib/supabase";

const T = { primary: "#F47B20", primaryLight: "#FFF3E8", bg: "#F2F2F7", card: "#FFFFFF", text: "#1A1A1A", mid: "#6B6B6B", light: "#999", border: "#E5E5E5", borderL: "#F0F0F0", sh: "0 2px 12px rgba(0,0,0,0.06)", shH: "0 4px 20px rgba(0,0,0,0.1)", r: 16, rs: 12 };

const DISTRICTS = [
  { id:"weho", name:"West Hollywood", emoji:"🌴", desc:"Restaurants, nightlife", lat:34.0900, lng:-118.3617 },
  { id:"hollywood", name:"Hollywood", emoji:"в­ђ", desc:"Р‘Р°СЂС‹, С…Р°Р№РєРёРЅРі, РєРѕРЅС†РµСЂС‚С‹", lat:34.0928, lng:-118.3287 },
  { id:"glendale", name:"Glendale", emoji:"рџЏ”пёЏ", desc:"РђСЂРјСЏРЅСЃРєР°СЏ РєСѓС…РЅСЏ, СЃРµРјСЊРё", lat:34.1425, lng:-118.2551 },
  { id:"dtla", name:"Downtown LA", emoji:"рџЏ™пёЏ", desc:"РљРѕС„Рµ, РєРЅРёР¶РЅС‹Рµ, Р»РѕС„С‚С‹", lat:34.0407, lng:-118.2468 },
  { id:"valley", name:"Studio City / Valley", emoji:"рџЋ¬", desc:"Speakeasy Р±Р°СЂС‹", lat:34.1486, lng:-118.3965 },
  { id:"silverlake", name:"Silver Lake / Los Feliz", emoji:"рџЋЁ", desc:"РРЅРґРё, РѕР±СЃРµСЂРІР°С‚РѕСЂРёСЏ", lat:34.0869, lng:-118.2702 },
  { id:"westside", name:"Santa Monica / Venice", emoji:"рџЏ–пёЏ", desc:"РџР»СЏР¶, РєР°РЅР°Р»С‹", lat:34.0195, lng:-118.4912 },
  { id:"pasadena", name:"Pasadena", emoji:"рџЊё", desc:"Р’РѕРґРѕРїР°РґС‹, РїСЂРёСЂРѕРґР°", lat:34.1478, lng:-118.1445 },
  { id:"midcity", name:"Mid-City / Melrose", emoji:"🛍️", desc:"Shopping, cafes", lat:34.0771, lng:-118.3442 },
];

const PLACE_CATS = [
  { id:"restaurants", icon:"рџЌЅпёЏ", title:"Р РµСЃС‚РѕСЂР°РЅС‹", color:"#E74C3C" },
  { id:"bars", icon:"рџЌё", title:"Р‘Р°СЂС‹", color:"#8E44AD" },
  { id:"coffee", icon:"в•", title:"РљРѕС„Рµ", color:"#F47B20" },
  { id:"hiking", icon:"рџҐѕ", title:"РҐР°Р№РєРёРЅРі", color:"#27AE60" },
  { id:"interesting", icon:"вњЁ", title:"РРЅС‚РµСЂРµСЃРЅРѕ", color:"#2980B9" },
  { id:"music", icon:"рџЋµ", title:"РњСѓР·С‹РєР°", color:"#E91E8C" },
];

const INIT_PLACES = [
  { id:1, cat:"restaurants", district:"weho", name:"РўСЂРѕР№РєР°", address:"8826 Sunset Blvd, West Hollywood, CA", tip:"РџРµР»СЊРјРµРЅРё. Р§РµС‚РІРµСЂРі вЂ” Р¶РёРІР°СЏ РјСѓР·С‹РєР°.", rating:4.8, addedBy:"РњР°СЂРёСЏ Рљ.", img:"рџҐџ", photos:["рџЌЅпёЏ РЈСЋС‚РЅС‹Р№ Р·Р°Р»"], likes:34, comments:[{id:301,author:"Р”РёРјР° РЎ.",text:"Р›СѓС‡С€РёРµ РїРµР»СЊРјРµРЅРё РІ WeHo!"}] },
  { id:2, cat:"restaurants", district:"hollywood", name:"Sochi Restaurant", address:"5765 Melrose Ave, Hollywood, CA", tip:"РҐРёРЅРєР°Р»Рё 10/10, С…Р°С‡Р°РїСѓСЂРё РѕРіРѕРЅСЊ.", rating:4.7, addedBy:"Р”РёРјР° РЎ.", img:"рџ«“", photos:["вЂпёЏ РўРµСЂСЂР°СЃР°"], likes:28, comments:[] },
  { id:3, cat:"restaurants", district:"glendale", name:"Ararat", address:"1000 S Glendale Ave, Glendale, CA", tip:"РђСЂРјСЏРЅСЃРєР°СЏ РєСѓС…РЅСЏ, РѕРіСЂРѕРјРЅС‹Рµ РїРѕСЂС†РёРё.", rating:4.6, addedBy:"РђСЂС‚СѓСЂ Рњ.", img:"рџЌ–", photos:[], likes:19, comments:[] },
  { id:4, cat:"bars", district:"valley", name:"The Other Door", address:"10437 Burbank Blvd, North Hollywood, CA", tip:"Speakeasy, РїР°СЂРѕР»СЊ РєР°Р¶РґСѓСЋ РЅРµРґРµР»СЋ.", rating:4.9, addedBy:"РђР»РµРєСЃ Р .", img:"рџҐѓ", photos:["рџҐѓ Old Fashioned"], likes:52, comments:[{id:302,author:"Р›РµРЅР° Р’.",text:"РџР°СЂРѕР»СЊ СЃРїСЂР°С€РёРІР°Р№С‚Рµ РІ РёРЅСЃС‚Рµ!"}] },
  { id:5, cat:"bars", district:"hollywood", name:"Davey Wayne's", address:"1611 N El Centro Ave, Hollywood, CA", tip:"Р’С…РѕРґ С‡РµСЂРµР· С…РѕР»РѕРґРёР»СЊРЅРёРє!", rating:4.7, addedBy:"Р›РµРЅР° Р’.", img:"рџЄ©", photos:[], likes:41, comments:[] },
  { id:6, cat:"coffee", district:"dtla", name:"Verve Coffee", address:"833 S Spring St, Los Angeles, CA", tip:"Pour-over. Р›РѕС„С‚ РёРґРµР°Р»СЊРЅС‹Р№.", rating:4.8, addedBy:"РЎР°С€Р° Рљ.", img:"в•", photos:[], likes:37, comments:[] },
  { id:7, cat:"hiking", district:"hollywood", name:"Runyon Canyon", address:"2000 N Fuller Ave, Los Angeles, CA", tip:"РџСЂР°РІР°СЏ С‚СЂРѕРїР° вЂ” РІРёРґС‹ Р»СѓС‡С€Рµ.", rating:4.4, addedBy:"РњР°РєСЃ Р”.", img:"в›°пёЏ", photos:[], likes:23, comments:[] },
  { id:8, cat:"hiking", district:"pasadena", name:"Eaton Canyon Falls", address:"1750 N Altadena Dr, Pasadena, CA", tip:"Р’РѕРґРѕРїР°Рґ 12Рј! Р›С‘РіРєРёР№ РјР°СЂС€СЂСѓС‚.", rating:4.9, addedBy:"РРіРѕСЂСЊ Рќ.", img:"рџ’§", photos:[], likes:48, comments:[] },
  { id:9, cat:"hiking", district:"silverlake", name:"Griffith Observatory", address:"2800 E Observatory Rd, Los Angeles, CA", tip:"РќР° Р·Р°РєР°С‚Рµ РѕР±СЏР·Р°С‚РµР»СЊРЅРѕ.", rating:4.8, addedBy:"РљР°С‚СЏ Р›.", img:"рџЊ…", photos:[], likes:55, comments:[{id:303,author:"РњР°РєСЃ Р”.",text:"РџР°СЂРєРѕРІРєР° Р±РµСЃРїР»Р°С‚РЅР°СЏ РїРѕСЃР»Рµ 6!"}] },
  { id:10, cat:"interesting", district:"dtla", name:"The Last Bookstore", address:"453 S Spring St, Los Angeles, CA", tip:"РўРѕРЅРЅРµР»СЊ РёР· РєРЅРёРі.", rating:4.7, addedBy:"Р’РµСЂР° Рџ.", img:"рџ“љ", photos:[], likes:33, comments:[] },
  { id:11, cat:"music", district:"hollywood", name:"Hollywood Bowl", address:"2301 N Highland Ave, Los Angeles, CA", tip:"РЎРІРѕС‘ РІРёРЅРѕ РјРѕР¶РЅРѕ!", rating:4.9, addedBy:"РќР°С‚Р°С€Р° Р¤.", img:"рџЋ¶", photos:[], likes:61, comments:[] },
];
const WEHO_STREETS = [
  "Sunset Blvd",
  "Santa Monica Blvd",
  "Melrose Ave",
  "La Cienega Blvd",
  "Fairfax Ave",
  "Beverly Blvd",
];

const WEHO_PREVIEW_PLACES = PLACE_CATS.flatMap((cat, catIndex) =>
  Array.from({ length: 15 }, (_, i) => {
    const num = 1000 + catIndex * 100 + i * 3;
    const street = WEHO_STREETS[i % WEHO_STREETS.length];
    return {
      id: 20000 + catIndex * 100 + i,
      cat: cat.id,
      district: "weho",
      name: `${cat.title} ${i + 1}`,
      address: `${num} ${street}, West Hollywood, CA`,
      tip: `Популярное место в категории "${cat.title}".`,
      rating: 0,
      addedBy: "Demo",
      img: cat.icon,
      photos: [],
      likes: 0,
      comments: [],
    };
  })
);
const USCIS_CATS = [
  { id:"greencard", icon:"рџЄЄ", title:"Р“СЂРёРЅ-РєР°СЂС‚Р°", subtitle:"РџРѕР»СѓС‡РµРЅРёРµ, РїСЂРѕРґР»РµРЅРёРµ, СѓСЃР»РѕРІРёСЏ", docs:[
    { form:"I-485", name:"Adjustment of Status", url:"https://www.uscis.gov/i-485", desc:"Р—Р°СЏРІР»РµРЅРёРµ РЅР° РіСЂРёРЅ-РєР°СЂС‚Сѓ РёР· РЎРЁРђ", detail:"РџРѕС€Р»РёРЅР°: $1,440 (РІРєР». Р±РёРѕРјРµС‚СЂРёСЋ). РћР±СЂР°Р±РѕС‚РєР°: 8-14 РјРµСЃ. РњРѕР¶РЅРѕ РїРѕРґР°РІР°С‚СЊ РѕРґРЅРѕРІСЂРµРјРµРЅРЅРѕ СЃ I-130 (concurrent filing). РџРѕСЃР»Рµ РїРѕРґР°С‡Рё вЂ” Р·Р°РїСЂРѕСЃ EAD Рё Advance Parole." },
    { form:"I-130", name:"РџРµС‚РёС†РёСЏ РґР»СЏ СЂРѕРґСЃС‚РІРµРЅРЅРёРєР°", url:"https://www.uscis.gov/i-130", desc:"РЎРїРѕРЅСЃРёСЂРѕРІР°РЅРёРµ С‡РµСЂРµР· СЃРµРјСЊСЋ", detail:"РџРѕС€Р»РёРЅР°: $535. Immediate Relatives (СЃСѓРїСЂСѓРі, СЂРѕРґРёС‚РµР»Рё, РґРµС‚Рё РґРѕ 21) вЂ” РЅРµС‚ РѕС‡РµСЂРµРґРё. Preference categories вЂ” РѕС‚ 2 РґРѕ 20+ Р»РµС‚ РІ Р·Р°РІРёСЃРёРјРѕСЃС‚Рё РѕС‚ РєР°С‚РµРіРѕСЂРёРё." },
    { form:"I-140", name:"РџРµС‚РёС†РёСЏ РѕС‚ СЂР°Р±РѕС‚РѕРґР°С‚РµР»СЏ", url:"https://www.uscis.gov/i-140", desc:"Employment-based РіСЂРёРЅ-РєР°СЂС‚Р°", detail:"РџРѕС€Р»РёРЅР°: $700. РљР°С‚РµРіРѕСЂРёРё: EB-1 (РІС‹РґР°СЋС‰РёРµСЃСЏ), EB-2 (РїСЂРѕРґРІРёРЅСѓС‚С‹Рµ СЃС‚РµРїРµРЅРё/NIW), EB-3 (РєРІР°Р»РёС„РёС†РёСЂРѕРІР°РЅРЅС‹Рµ). Premium processing: $2,805 (15 РґРЅРµР№)." },
    { form:"I-751", name:"РЎРЅСЏС‚РёРµ СѓСЃР»РѕРІРёР№ СЃ РіСЂРёРЅ-РєР°СЂС‚С‹", url:"https://www.uscis.gov/i-751", desc:"Р”Р»СЏ conditional residents (С‡РµСЂРµР· Р±СЂР°Рє)", detail:"РџРѕРґР°С‚СЊ Р·Р° 90 РґРЅРµР№ РґРѕ РёСЃС‚РµС‡РµРЅРёСЏ 2-Р»РµС‚РЅРµР№ РєР°СЂС‚С‹. РџРѕС€Р»РёРЅР°: $750. РЎРѕРІРјРµСЃС‚РЅР°СЏ РїРµС‚РёС†РёСЏ СЃ СЃСѓРїСЂСѓРіРѕРј. Waiver РІРѕР·РјРѕР¶РµРЅ РµСЃР»Рё СЂР°Р·РІРѕРґ, abuse, РёР»Рё extreme hardship." },
    { form:"I-90", name:"Р—Р°РјРµРЅР°/РїСЂРѕРґР»РµРЅРёРµ РіСЂРёРЅ-РєР°СЂС‚С‹", url:"https://www.uscis.gov/i-90", desc:"Р•СЃР»Рё РїРѕС‚РµСЂСЏР»Рё РёР»Рё СЃСЂРѕРє РёСЃС‚С‘Рє", detail:"РџРѕРґР°РІР°С‚СЊ Р·Р° 6 РјРµСЃ РґРѕ РёСЃС‚РµС‡РµРЅРёСЏ. РџРѕС€Р»РёРЅР°: $540. Receipt notice = РґРѕРєР°Р·Р°С‚РµР»СЊСЃС‚РІРѕ СЃС‚Р°С‚СѓСЃР° РЅР° 12-24 РјРµСЃ." },
    { form:"I-864", name:"Affidavit of Support", url:"https://www.uscis.gov/i-864", desc:"Р¤РёРЅР°РЅСЃРѕРІРѕРµ РїРѕСЂСѓС‡РёС‚РµР»СЊСЃС‚РІРѕ СЃРїРѕРЅСЃРѕСЂР°", detail:"РЎРїРѕРЅСЃРѕСЂ РґРѕРєР°Р·С‹РІР°РµС‚ РґРѕС…РѕРґ в‰Ґ125% Federal Poverty Line. РћР±СЏР·Р°С‚РµР»СЊРЅР° РґР»СЏ СЃРµРјРµР№РЅС‹С… РїРµС‚РёС†РёР№. Р”РѕС…РѕРґ РјРѕР¶РЅРѕ РґРѕРїРѕР»РЅРёС‚СЊ co-sponsor РёР»Рё Р°РєС‚РёРІР°РјРё." },
    { form:"I-693", name:"РњРµРґРёС†РёРЅСЃРєРѕРµ РѕР±СЃР»РµРґРѕРІР°РЅРёРµ", url:"https://www.uscis.gov/i-693", desc:"Report of Medical Examination", detail:"РћР±СЏР·Р°С‚РµР»СЊРЅР° РґР»СЏ I-485. РўРѕР»СЊРєРѕ Сѓ civil surgeon (СЃРїРёСЃРѕРє РЅР° uscis.gov). РџСЂРёРІРёРІРєРё РѕР±СЏР·Р°С‚РµР»СЊРЅС‹. Р”РµР№СЃС‚РІСѓРµС‚ 2 РіРѕРґР°. РЎС‚РѕРёРјРѕСЃС‚СЊ: $200-500 (РїР»Р°С‚РёС‚ Р·Р°СЏРІРёС‚РµР»СЊ)." },
    { form:"I-526", name:"РРЅРІРµСЃС‚РѕСЂСЃРєР°СЏ РїРµС‚РёС†РёСЏ (EB-5)", url:"https://www.uscis.gov/i-526", desc:"Immigrant Investor Program", detail:"РРЅРІРµСЃС‚РёС†РёСЏ $800,000 (TEA) РёР»Рё $1,050,000. РЎРѕР·РґР°РЅРёРµ 10 СЂР°Р±РѕС‡РёС… РјРµСЃС‚. РџРѕС€Р»РёРЅР°: $3,675. РЎРЅР°С‡Р°Р»Р° conditional РіСЂРёРЅ-РєР°СЂС‚Р° РЅР° 2 РіРѕРґР°, РїРѕС‚РѕРј I-829." },
    { form:"I-829", name:"РЎРЅСЏС‚РёРµ СѓСЃР»РѕРІРёР№ (EB-5)", url:"https://www.uscis.gov/i-829", desc:"Р”Р»СЏ РёРЅРІРµСЃС‚РѕСЂРѕРІ РїРѕСЃР»Рµ 2 Р»РµС‚", detail:"Р”РѕРєР°Р·Р°С‚СЊ С‡С‚Рѕ РёРЅРІРµСЃС‚РёС†РёСЏ СЃРѕС…СЂР°РЅРµРЅР° Рё 10 СЂР°Р±РѕС‡РёС… РјРµСЃС‚ СЃРѕР·РґР°РЅРѕ. РџРѕС€Р»РёРЅР°: $3,750. РџРѕРґР°С‚СЊ Р·Р° 90 РґРЅРµР№ РґРѕ РёСЃС‚РµС‡РµРЅРёСЏ conditional РєР°СЂС‚С‹." },
  ]},
  { id:"visa", icon:"вњ€пёЏ", title:"Р’РёР·С‹", subtitle:"Р Р°Р±РѕС‡РёРµ, СЃС‚СѓРґРµРЅС‡РµСЃРєРёРµ, РіРѕСЃС‚РµРІС‹Рµ", docs:[
    { form:"I-129", name:"H-1B СЂР°Р±РѕС‡Р°СЏ РІРёР·Р°", url:"https://www.uscis.gov/i-129", desc:"Р”Р»СЏ СЃРїРµС†РёР°Р»РёСЃС‚РѕРІ СЃ РѕР±СЂР°Р·РѕРІР°РЅРёРµРј", detail:"РўСЂРµР±СѓРµС‚ Bachelor's degree. Р›РѕС‚РµСЂРµСЏ РІ РјР°СЂС‚Рµ, СЃС‚Р°СЂС‚ 1 РѕРєС‚СЏР±СЂСЏ. РџРѕС€Р»РёРЅР°: $780 + РґРѕРї. СЃР±РѕСЂС‹. РњР°РєСЃРёРјСѓРј 6 Р»РµС‚, РјРѕР¶РЅРѕ РїСЂРѕРґР»РёС‚СЊ СЃ I-140." },
    { form:"I-129F", name:"Р’РёР·Р° Р¶РµРЅРёС…Р°/РЅРµРІРµСЃС‚С‹ (K-1)", url:"https://www.uscis.gov/i-129f", desc:"FiancГ©(e) Visa", detail:"Р”Р»СЏ РЅРµРІРµСЃС‚С‹/Р¶РµРЅРёС…Р° РіСЂР°Р¶РґР°РЅРёРЅР° РЎРЁРђ. РџРѕС€Р»РёРЅР°: $535. РџРѕСЃР»Рµ РІСЉРµР·РґР° вЂ” 90 РґРЅРµР№ РЅР° СЃРІР°РґСЊР±Сѓ, РїРѕС‚РѕРј I-485. РћР±СЂР°Р±РѕС‚РєР°: 6-12 РјРµСЃ. + РєРѕРЅСЃСѓР»СЊСЃС‚РІРѕ." },
    { form:"I-20", name:"F-1 СЃС‚СѓРґРµРЅС‡РµСЃРєР°СЏ РІРёР·Р°", url:"https://studyinthestates.dhs.gov", desc:"Р¤РѕСЂРјР° РѕС‚ СѓС‡РµР±РЅРѕРіРѕ Р·Р°РІРµРґРµРЅРёСЏ", detail:"Р Р°Р±РѕС‚Р° РЅР° РєР°РјРїСѓСЃРµ РґРѕ 20 С‡/РЅРµРґ. РџРѕСЃР»Рµ РіРѕРґР° вЂ” CPT/OPT (12 РјРµСЃ СЂР°Р±РѕС‚С‹, STEM вЂ” 36 РјРµСЃ). SEVIS fee: $350." },
    { form:"DS-160", name:"РќРµРёРјРјРёРіСЂР°С†РёРѕРЅРЅР°СЏ РІРёР·Р°", url:"https://ceac.state.gov/genniv/", desc:"РћРЅР»Р°Р№РЅ Р·Р°СЏРІР»РµРЅРёРµ РґР»СЏ Р»СЋР±РѕР№ РІРёР·С‹", detail:"Р”Р»СЏ B1/B2 (С‚СѓСЂРёСЃС‚), H-1B, L-1, O-1 Рё РґСЂ. Р¤РѕС‚Рѕ 5x5 СЃРј. РџРѕСЃР»Рµ вЂ” Р·Р°РїРёСЃСЊ РЅР° РёРЅС‚РµСЂРІСЊСЋ РІ РїРѕСЃРѕР»СЊСЃС‚РІРµ. РџРѕС€Р»РёРЅР°: $185 (B), $205 (H/L/O)." },
    { form:"I-539", name:"РџСЂРѕРґР»РµРЅРёРµ/СЃРјРµРЅР° СЃС‚Р°С‚СѓСЃР°", url:"https://www.uscis.gov/i-539", desc:"Extend or Change Status", detail:"Р”Р»СЏ РїСЂРѕРґР»РµРЅРёСЏ B1/B2, СЃРјРµРЅС‹ СЃ B РЅР° F-1, Рё С‚.Рґ. РџРѕС€Р»РёРЅР°: $370. РџРѕРґР°РІР°С‚СЊ Р”Рћ РёСЃС‚РµС‡РµРЅРёСЏ СЃС‚Р°С‚СѓСЃР°. РћР±СЂР°Р±РѕС‚РєР°: 5-12 РјРµСЃ." },
    { form:"I-129S", name:"L-1 РІРёР·Р° (РІРЅСѓС‚СЂРё РєРѕРјРїР°РЅРёРё)", url:"https://www.uscis.gov/i-129s", desc:"Intracompany Transferee", detail:"Р”Р»СЏ РјРµРЅРµРґР¶РµСЂРѕРІ/СЃРїРµС†РёР°Р»РёСЃС‚РѕРІ РїРµСЂРµРІРѕРґРёРјС‹С… РёР· РёРЅРѕСЃС‚СЂР°РЅРЅРѕРіРѕ РѕС„РёСЃР°. L-1A (РјРµРЅРµРґР¶РµСЂС‹): РґРѕ 7 Р»РµС‚. L-1B (СЃРїРµС†РёР°Р»РёСЃС‚С‹): РґРѕ 5 Р»РµС‚." },
    { form:"I-140/O-1", name:"O-1 РІРёР·Р° РґР»СЏ С‚Р°Р»Р°РЅС‚РѕРІ", url:"https://www.uscis.gov/working-in-the-united-states/temporary-workers/o-1-visa", desc:"Extraordinary Ability", detail:"Р”Р»СЏ Р»СЋРґРµР№ СЃ РІС‹РґР°СЋС‰РёРјРёСЃСЏ РґРѕСЃС‚РёР¶РµРЅРёСЏРјРё РІ РЅР°СѓРєРµ, РёСЃРєСѓСЃСЃС‚РІРµ, РѕР±СЂР°Р·РѕРІР°РЅРёРё, Р±РёР·РЅРµСЃРµ, СЃРїРѕСЂС‚Рµ. РќРµС‚ Р»РёРјРёС‚Р°, РЅРµС‚ Р»РѕС‚РµСЂРµРё. Premium: 15 РґРЅРµР№." },
  ]},
  { id:"citizenship", icon:"рџ‡єрџ‡ё", title:"Р“СЂР°Р¶РґР°РЅСЃС‚РІРѕ", subtitle:"РќР°С‚СѓСЂР°Р»РёР·Р°С†РёСЏ Рё С‚РµСЃС‚", docs:[
    { form:"N-400", name:"Р—Р°СЏРІР»РµРЅРёРµ РЅР° РЅР°С‚СѓСЂР°Р»РёР·Р°С†РёСЋ", url:"https://www.uscis.gov/n-400", desc:"РћСЃРЅРѕРІРЅР°СЏ С„РѕСЂРјР° РґР»СЏ РіСЂР°Р¶РґР°РЅСЃС‚РІР°", detail:"Р“СЂРёРЅ-РєР°СЂС‚Р° 5 Р»РµС‚ (3 С‡РµСЂРµР· Р±СЂР°Рє). РџСЂРёСЃСѓС‚СЃС‚РІРёРµ РІ РЎРЁРђ 50%+ РІСЂРµРјРµРЅРё. РџРѕС€Р»РёРЅР°: $760. РўРµСЃС‚: 10 РІРѕРїСЂРѕСЃРѕРІ, РЅСѓР¶РЅРѕ 6 РїСЂР°РІРёР»СЊРЅС‹С…. РРЅС‚РµСЂРІСЊСЋ РЅР° Р°РЅРіР»РёР№СЃРєРѕРј." },
    { form:"N-600", name:"РЎРµСЂС‚РёС„РёРєР°С‚ Рѕ РіСЂР°Р¶РґР°РЅСЃС‚РІРµ", url:"https://www.uscis.gov/n-600", desc:"Р•СЃР»Рё СѓР¶Рµ СЏРІР»СЏРµС‚РµСЃСЊ РіСЂР°Р¶РґР°РЅРёРЅРѕРј", detail:"Р”Р»СЏ РїРѕР»СѓС‡РµРЅРёСЏ РґРѕРєСѓРјРµРЅС‚Р° РµСЃР»Рё РІС‹ Р°РІС‚РѕРјР°С‚РёС‡РµСЃРєРё СЃС‚Р°Р»Рё РіСЂР°Р¶РґР°РЅРёРЅРѕРј (С‡РµСЂРµР· СЂРѕРґРёС‚РµР»РµР№). РџРѕС€Р»РёРЅР°: $1,170." },
    { form:"N-565", name:"Р—Р°РјРµРЅР° РґРѕРєСѓРјРµРЅС‚Р° Рѕ РЅР°С‚СѓСЂР°Р»РёР·Р°С†РёРё", url:"https://www.uscis.gov/n-565", desc:"Р—Р°РјРµРЅР°/РёСЃРїСЂР°РІР»РµРЅРёРµ СЃРµСЂС‚РёС„РёРєР°С‚Р°", detail:"Р•СЃР»Рё РїРѕС‚РµСЂСЏР»Рё, РёСЃРїРѕСЂС‚РёР»Рё РёР»Рё РЅСѓР¶РЅРѕ РёСЃРїСЂР°РІРёС‚СЊ РґР°РЅРЅС‹Рµ РІ Certificate of Citizenship РёР»Рё Naturalization. РџРѕС€Р»РёРЅР°: $555." },
    { form:"РўРµСЃС‚", name:"Civics Test вЂ” 100 Questions", desc:"Practice test right here!", detail:"On the interview you get 10 out of 100 questions. You must answer 6 correctly to pass.", isTest:true },
  ]},
  { id:"asylum", icon:"рџ›ЎпёЏ", title:"РЈР±РµР¶РёС‰Рµ", subtitle:"Asylum, TPS, VAWA, U-visa", docs:[
    { form:"I-589", name:"Р—Р°СЏРІР»РµРЅРёРµ РЅР° СѓР±РµР¶РёС‰Рµ", url:"https://www.uscis.gov/i-589", desc:"РџРѕРґР°С‚СЊ РІ С‚РµС‡РµРЅРёРµ 1 РіРѕРґР° РїРѕСЃР»Рµ РІСЉРµР·РґР°", detail:"Р‘Р•РЎРџР›РђРўРќРћ. РџСЂРµСЃР»РµРґРѕРІР°РЅРёРµ РїРѕ СЂР°СЃРµ, СЂРµР»РёРіРёРё, РЅР°С†РёРѕРЅР°Р»СЊРЅРѕСЃС‚Рё, РїРѕР»РёС‚. РІР·РіР»СЏРґР°Рј, СЃРѕС†. РіСЂСѓРїРїРµ. Affirmative вЂ” С‡РµСЂРµР· USCIS, Defensive вЂ” С‡РµСЂРµР· СЃСѓРґ." },
    { form:"I-821", name:"TPS", url:"https://www.uscis.gov/i-821", desc:"Temporary Protected Status", detail:"Р”Р»СЏ РіСЂР°Р¶РґР°РЅ СЃС‚СЂР°РЅ СЃ РІРѕР№РЅРѕР№/Р±РµРґСЃС‚РІРёСЏРјРё. Р”Р°С‘С‚ РїСЂР°РІРѕ СЂР°Р±РѕС‚Р°С‚СЊ. РџРµСЂРµСЂРµРіРёСЃС‚СЂР°С†РёСЏ РєР°Р¶РґС‹Рµ 6-18 РјРµСЃ. РЎРїРёСЃРѕРє СЃС‚СЂР°РЅ РЅР° uscis.gov." },
    { form:"I-360", name:"VAWA вЂ” СЃР°РјРѕРїРµС‚РёС†РёСЏ", url:"https://www.uscis.gov/i-360", desc:"Violence Against Women Act", detail:"Р”Р»СЏ Р¶РµСЂС‚РІ РґРѕРјР°С€РЅРµРіРѕ РЅР°СЃРёР»РёСЏ РѕС‚ СЃСѓРїСЂСѓРіР°-РіСЂР°Р¶РґР°РЅРёРЅР°/СЂРµР·РёРґРµРЅС‚Р°. Р‘Р•РЎРџР›РђРўРќРћ. РЎР°РјРѕРїРµС‚РёС†РёСЏ вЂ” РЅРµ РЅСѓР¶РЅРѕ СЃРѕРіР»Р°СЃРёРµ Р°Р±СЊСЋР·РµСЂР°. РљРѕРЅС„РёРґРµРЅС†РёР°Р»СЊРЅРѕ." },
    { form:"I-918", name:"U-РІРёР·Р° (Р¶РµСЂС‚РІС‹ РїСЂРµСЃС‚СѓРїР»РµРЅРёР№)", url:"https://www.uscis.gov/i-918", desc:"Р”Р»СЏ Р¶РµСЂС‚РІ С‚СЏР¶РєРёС… РїСЂРµСЃС‚СѓРїР»РµРЅРёР№", detail:"Р‘Р•РЎРџР›РђРўРќРћ. РќСѓР¶РЅР° СЃРµСЂС‚РёС„РёРєР°С†РёСЏ РѕС‚ РїРѕР»РёС†РёРё (С„РѕСЂРјР° I-918B). Р”Рѕ 10,000 РІРёР· РІ РіРѕРґ. Р”Р°С‘С‚ РїСЂР°РІРѕ РЅР° СЂР°Р±РѕС‚Сѓ Рё С‡РµСЂРµР· 3 РіРѕРґР° вЂ” РіСЂРёРЅ-РєР°СЂС‚Сѓ." },
    { form:"I-914", name:"T-РІРёР·Р° (Р¶РµСЂС‚РІС‹ С‚СЂР°С„С„РёРєРёРЅРіР°)", url:"https://www.uscis.gov/i-914", desc:"Trafficking Victims Protection", detail:"Р‘Р•РЎРџР›РђРўРќРћ. Р”Р»СЏ Р¶РµСЂС‚РІ С‚РѕСЂРіРѕРІР»Рё Р»СЋРґСЊРјРё. Р”Рѕ 5,000 РІРёР· РІ РіРѕРґ. РџСЂР°РІРѕ РЅР° СЂР°Р±РѕС‚Сѓ, С‡РµСЂРµР· 3 РіРѕРґР° вЂ” РіСЂРёРЅ-РєР°СЂС‚Р°." },
  ]},
  { id:"travel", icon:"рџЊЌ", title:"РџСѓС‚РµС€РµСЃС‚РІРёСЏ", subtitle:"Р’С‹РµР·Рґ, РІРѕР·РІСЂР°С‰РµРЅРёРµ, РґРѕРєСѓРјРµРЅС‚С‹", docs:[
    { form:"I-131", name:"Travel Document / Advance Parole", url:"https://www.uscis.gov/i-131", desc:"Р Р°Р·СЂРµС€РµРЅРёРµ РЅР° РІС‹РµР·Рґ Рё РІРѕР·РІСЂР°С‚", detail:"РќРµРѕР±С…РѕРґРёРј РµСЃР»Рё pending I-485. Р‘РµР· AP РІС‹РµР·Рґ = РѕС‚РєР°Р· РѕС‚ Р·Р°СЏРІР»РµРЅРёСЏ. $0 РµСЃР»Рё СЃ I-485. Combo card (EAD/AP) Р°РІС‚РѕРјР°С‚РёС‡РµСЃРєРё." },
    { form:"I-131A", name:"Travel Document (carrier)", url:"https://www.uscis.gov/i-131a", desc:"Р”Р»СЏ СЂРµР·РёРґРµРЅС‚РѕРІ Р·Р° СЂСѓР±РµР¶РѕРј", detail:"Р•СЃР»Рё РіСЂРёРЅ-РєР°СЂС‚Р° СѓС‚РµСЂСЏРЅР° Р·Р° РіСЂР°РЅРёС†РµР№ РёР»Рё РЅСѓР¶РµРЅ boarding foil. РџРѕРґР°С‘С‚СЃСЏ РІ РїРѕСЃРѕР»СЊСЃС‚РІРµ. РџРѕС€Р»РёРЅР°: $575." },
    { form:"I-94", name:"Р—Р°РїРёСЃСЊ Рѕ РїСЂРёР±С‹С‚РёРё/РѕС‚СЉРµР·РґРµ", url:"https://i94.cbp.dhs.gov/", desc:"Arrival/Departure Record", detail:"Р­Р»РµРєС‚СЂРѕРЅРЅР°СЏ С„РѕСЂРјР°. РџСЂРѕРІРµСЂСЊС‚Рµ РЅР° i94.cbp.dhs.gov. РџРѕРєР°Р·С‹РІР°РµС‚ РІР°С€ СЃС‚Р°С‚СѓСЃ Рё РґР°С‚Сѓ, РґРѕ РєРѕС‚РѕСЂРѕР№ РјРѕР¶РЅРѕ РЅР°С…РѕРґРёС‚СЊСЃСЏ РІ РЎРЁРђ. Р’РђР–РќРћ РґР»СЏ РїРѕРґСЃС‡С‘С‚Р° РґРЅРµР№." },
    { form:"AR-11", name:"РЎРјРµРЅР° Р°РґСЂРµСЃР°", url:"https://www.uscis.gov/ar-11", desc:"РЈРІРµРґРѕРјР»РµРЅРёРµ Рѕ РїРµСЂРµРµР·РґРµ", detail:"РћР‘РЇР—РђРўР•Р›Р¬РќРћ СѓРІРµРґРѕРјРёС‚СЊ USCIS РІ С‚РµС‡РµРЅРёРµ 10 РґРЅРµР№ РїРѕСЃР»Рµ РїРµСЂРµРµР·РґР°. Р‘Р•РЎРџР›РђРўРќРћ. РћРЅР»Р°Р№РЅ РЅР° uscis.gov. РЁС‚СЂР°С„ Р·Р° РЅРµСѓРІРµРґРѕРјР»РµРЅРёРµ." },
  ]},
  { id:"work", icon:"рџ’ј", title:"Р Р°Р±РѕС‚Р°", subtitle:"Р Р°Р·СЂРµС€РµРЅРёСЏ, SSN, РїСЂРѕРІРµСЂРєРё", docs:[
    { form:"I-765", name:"Р Р°Р·СЂРµС€РµРЅРёРµ РЅР° СЂР°Р±РѕС‚Сѓ (EAD)", url:"https://www.uscis.gov/i-765", desc:"Employment Authorization Document", detail:"Р”Р»СЏ С‚РµС… Р±РµР· СЂР°Р±РѕС‡РµР№ РІРёР·С‹: pending I-485, asylum, TPS, OPT. $0 РµСЃР»Рё СЃ I-485, РёРЅР°С‡Рµ $410. Р”РµР№СЃС‚РІСѓРµС‚ 1-2 РіРѕРґР°." },
    { form:"SS-5", name:"Р—Р°СЏРІР»РµРЅРёРµ РЅР° SSN", url:"https://www.ssa.gov/forms/ss-5.pdf", desc:"Social Security Number", detail:"Р‘Р•РЎРџР›РђРўРќРћ. Р’ РѕС„РёСЃРµ SSA. РќСѓР¶РµРЅ РїР°СЃРїРѕСЂС‚ + СЂР°Р·СЂРµС€РµРЅРёРµ РЅР° СЂР°Р±РѕС‚Сѓ. РљР°СЂС‚Р° С‡РµСЂРµР· 2-4 РЅРµРґРµР»Рё. РќСѓР¶РµРЅ РґР»СЏ СЂР°Р±РѕС‚С‹, РЅР°Р»РѕРіРѕРІ, РєСЂРµРґРёС‚Р°." },
    { form:"I-9", name:"РџСЂРѕРІРµСЂРєР° РїСЂР°РІР° РЅР° СЂР°Р±РѕС‚Сѓ", url:"https://www.uscis.gov/i-9", desc:"Employment Eligibility Verification", detail:"РљР°Р¶РґС‹Р№ СЂР°Р±РѕС‚РѕРґР°С‚РµР»СЊ РѕР±СЏР·Р°РЅ Р·Р°РїРѕР»РЅРёС‚СЊ. Р Р°Р±РѕС‚РЅРёРє РїСЂРµРґРѕСЃС‚Р°РІР»СЏРµС‚ РґРѕРєСѓРјРµРЅС‚С‹ (List A: РїР°СЃРїРѕСЂС‚+EAD, РёР»Рё List B+C). E-Verify вЂ” СЌР»РµРєС‚СЂРѕРЅРЅР°СЏ РїСЂРѕРІРµСЂРєР°." },
    { form:"I-140", name:"PERM / Labor Certification", url:"https://www.dol.gov/agencies/eta/foreign-labor/permanent", desc:"РўСЂСѓРґРѕРІР°СЏ СЃРµСЂС‚РёС„РёРєР°С†РёСЏ РґР»СЏ РіСЂРёРЅ-РєР°СЂС‚С‹", detail:"Р Р°Р±РѕС‚РѕРґР°С‚РµР»СЊ РґРѕРєР°Р·С‹РІР°РµС‚ С‡С‚Рѕ РЅРµС‚ Р°РјРµСЂРёРєР°РЅСЃРєРёС… РєР°РЅРґРёРґР°С‚РѕРІ. Р§РµСЂРµР· Department of Labor. Р—Р°РЅРёРјР°РµС‚ 6-18 РјРµСЃ. РћР±СЏР·Р°С‚РµР»СЊРЅРѕ РґР»СЏ EB-2/EB-3." },
    { form:"W-7", name:"ITIN вЂ” РЅР°Р»РѕРіРѕРІС‹Р№ РЅРѕРјРµСЂ", url:"https://www.irs.gov/forms-pubs/about-form-w-7", desc:"Р”Р»СЏ С‚РµС… РєС‚Рѕ РЅРµ РјРѕР¶РµС‚ РїРѕР»СѓС‡РёС‚СЊ SSN", detail:"Individual Taxpayer Identification Number. Р”Р»СЏ РїРѕРґР°С‡Рё РЅР°Р»РѕРіРѕРІ Р±РµР· SSN. Р‘Р•РЎРџР›РђРўРќРћ. РџРѕРґР°С‘С‚СЃСЏ СЃ РЅР°Р»РѕРіРѕРІРѕР№ РґРµРєР»Р°СЂР°С†РёРµР№. Р”РµР№СЃС‚РІСѓРµС‚ 3 РіРѕРґР°." },
    { form:"G-1145", name:"Р­Р»РµРєС‚СЂРѕРЅРЅРѕРµ СѓРІРµРґРѕРјР»РµРЅРёРµ", url:"https://www.uscis.gov/g-1145", desc:"e-Notification of Application", detail:"Р‘Р•РЎРџР›РђРўРќРћ. РџРѕР»СѓС‡Р°Р№С‚Рµ SMS/email РєРѕРіРґР° USCIS РїРѕР»СѓС‡РёС‚ РІР°С€Сѓ С„РѕСЂРјСѓ. РџСЂРёРєР»Р°РґС‹РІР°РµС‚СЃСЏ Рє Р»СЋР±РѕРјСѓ Р·Р°СЏРІР»РµРЅРёСЋ. РќР°СЃС‚РѕСЏС‚РµР»СЊРЅРѕ СЂРµРєРѕРјРµРЅРґСѓРµС‚СЃСЏ." },
  ]},
];

// в”Ђв”Ђв”Ђ ENGLISH Civics Test with correct answer index в”Ђв”Ђв”Ђ
const CIVICS_RAW = [
  { q:"What is the supreme law of the land?", opts:["The Constitution","The Declaration of Independence","The Bill of Rights","Federal Law"], c:0 },
  { q:"What does the Constitution do?", opts:["Sets up the government","Declares war","Sets taxes","Appoints judges"], c:0 },
  { q:"The first three words of the Constitution are 'We the People.' What do they mean?", opts:["Self-governance / power from people","Trust in God","Unity of states","Freedom for all"], c:0 },
  { q:"What is an amendment?", opts:["A change or addition to the Constitution","A new law","A presidential order","A court ruling"], c:0 },
  { q:"What do we call the first ten amendments?", opts:["The Bill of Rights","The Declaration","The Articles","The Preamble"], c:0 },
  { q:"Name one right from the First Amendment.", opts:["Freedom of speech","Right to bear arms","Right to vote","Right to an attorney"], c:0 },
  { q:"How many amendments does the Constitution have?", opts:["27","10","21","33"], c:0 },
  { q:"What did the Declaration of Independence do?", opts:["Declared independence from Britain","Freed the slaves","Created the Constitution","Founded the government"], c:0 },
  { q:"What is the economic system of the United States?", opts:["Capitalist / free market","Socialist","Communist","Planned economy"], c:0 },
  { q:"What is the 'rule of law'?", opts:["Everyone must follow the law","The president is above the law","Judges make all laws","The military governs"], c:0 },
  { q:"Name one branch of government.", opts:["Legislative","Military","Police","Banking"], c:0 },
  { q:"What stops one branch from becoming too powerful?", opts:["Checks and balances","The Constitution alone","The President","The army"], c:0 },
  { q:"Who is in charge of the executive branch?", opts:["The President","Congress","The Supreme Court","The Governor"], c:0 },
  { q:"Who makes federal laws?", opts:["Congress","The President","The Supreme Court","Governors"], c:0 },
  { q:"What are the two parts of Congress?", opts:["The Senate and the House of Representatives","President and Vice President","Courts and Congress","Democrats and Republicans"], c:0 },
  { q:"How many U.S. Senators are there?", opts:["100","50","435","535"], c:0 },
  { q:"We elect a U.S. Senator for how many years?", opts:["6","4","2","8"], c:0 },
  { q:"How many voting members in the House of Representatives?", opts:["435","100","50","535"], c:0 },
  { q:"We elect a member of the House for how many years?", opts:["2","4","6","8"], c:0 },
  { q:"We elect a President for how many years?", opts:["4","6","2","8"], c:0 },
  { q:"In what month do we vote for President?", opts:["November","January","July","March"], c:0 },
  { q:"If the President can no longer serve, who becomes President?", opts:["The Vice President","The Speaker of the House","The Secretary of State","The Chief Justice"], c:0 },
  { q:"Who is the Commander in Chief of the military?", opts:["The President","The Secretary of Defense","The top General","The Vice President"], c:0 },
  { q:"Who signs bills to become laws?", opts:["The President","The Vice President","The Speaker","The Chief Justice"], c:0 },
  { q:"Who vetoes bills?", opts:["The President","Congress","The Supreme Court","The Governor"], c:0 },
  { q:"What does the President's Cabinet do?", opts:["Advises the President","Makes laws","Judges cases","Commands the army"], c:0 },
  { q:"What does the judicial branch do?", opts:["Reviews and explains laws","Makes laws","Enforces laws","Commands military"], c:0 },
  { q:"What is the highest court in the United States?", opts:["The Supreme Court","Federal Appeals Court","District Court","State Court"], c:0 },
  { q:"How many justices are on the Supreme Court?", opts:["9","12","7","11"], c:0 },
  { q:"What are the two major political parties?", opts:["Democratic and Republican","Liberal and Conservative","Green and Libertarian","Left and Right"], c:0 },
  { q:"Name one responsibility only for U.S. citizens.", opts:["Serve on a jury","Pay taxes","Obey laws","Work"], c:0 },
  { q:"What is the last day to send in federal tax forms?", opts:["April 15","January 1","July 4","December 31"], c:0 },
  { q:"At what age must males register for Selective Service?", opts:["18","21","16","25"], c:0 },
  { q:"What is one reason colonists came to America?", opts:["Freedom of religion","Gold rush","Trade with India","Escape the plague"], c:0 },
  { q:"Who lived in America before the Europeans arrived?", opts:["Native Americans","Africans","Asians","Nobody"], c:0 },
  { q:"What group was taken and sold as slaves?", opts:["Africans","Europeans","Asians","Native Americans"], c:0 },
  { q:"Why did the colonists fight the British?", opts:["Taxation without representation","Religion","Territory","Trade"], c:0 },
  { q:"Who wrote the Declaration of Independence?", opts:["Thomas Jefferson","George Washington","Benjamin Franklin","John Adams"], c:0 },
  { q:"When was the Declaration of Independence adopted?", opts:["July 4, 1776","July 4, 1789","January 1, 1800","September 17, 1787"], c:0 },
  { q:"What happened at the Constitutional Convention?", opts:["The Constitution was written","War was declared","Slaves were freed","President was elected"], c:0 },
  { q:"When was the Constitution written?", opts:["1787","1776","1800","1812"], c:0 },
  { q:"Who is the 'Father of Our Country'?", opts:["George Washington","Abraham Lincoln","Thomas Jefferson","John Adams"], c:0 },
  { q:"Who was the first President?", opts:["George Washington","John Adams","Thomas Jefferson","Benjamin Franklin"], c:0 },
  { q:"What territory did the U.S. buy from France in 1803?", opts:["Louisiana Territory","Alaska","Florida","California"], c:0 },
  { q:"Name one war fought by the U.S. in the 1800s.", opts:["Civil War","World War I","Revolutionary War","Vietnam War"], c:0 },
  { q:"Name one problem that led to the Civil War.", opts:["Slavery","Taxes","Territories","Immigration"], c:0 },
  { q:"What was one important thing Abraham Lincoln did?", opts:["Freed the slaves / saved the Union","Bought Louisiana","Wrote the Constitution","Was the first President"], c:0 },
  { q:"What did Susan B. Anthony do?", opts:["Fought for women's rights","Freed the slaves","Was the first female President","Wrote the Constitution"], c:0 },
  { q:"Name one war fought by the U.S. in the 1900s.", opts:["World War II","Civil War","Revolutionary War","War of 1812"], c:0 },
  { q:"Who was President during World War I?", opts:["Woodrow Wilson","Theodore Roosevelt","Franklin Roosevelt","Harry Truman"], c:0 },
  { q:"Who was President during the Great Depression and WWII?", opts:["Franklin Roosevelt","Harry Truman","Dwight Eisenhower","Herbert Hoover"], c:0 },
  { q:"Who did the U.S. fight in World War II?", opts:["Japan, Germany, and Italy","Russia, China, and Korea","Britain, France, Spain","Canada, Mexico, Cuba"], c:0 },
  { q:"What major event happened on September 11, 2001?", opts:["Terrorists attacked the United States","War in Iraq began","Hurricane Katrina","Financial crisis"], c:0 },
  { q:"What was the main concern during the Cold War?", opts:["Communism","Terrorism","Immigration","Economy"], c:0 },
  { q:"What movement tried to end racial discrimination?", opts:["Civil rights movement","Suffrage movement","Abolitionist movement","Progressive movement"], c:0 },
  { q:"What did Martin Luther King Jr. do?", opts:["Fought for civil rights","Was President","Wrote the Constitution","Commanded the army"], c:0 },
  { q:"Name one U.S. river.", opts:["Mississippi","Amazon","Nile","Danube"], c:0 },
  { q:"What ocean is on the East Coast?", opts:["Atlantic","Pacific","Indian","Arctic"], c:0 },
  { q:"What ocean is on the West Coast?", opts:["Pacific","Atlantic","Indian","Southern"], c:0 },
  { q:"Name one U.S. territory.", opts:["Puerto Rico","Cuba","Hawaii","Alaska"], c:0 },
  { q:"Name one state that borders Canada.", opts:["Montana","Texas","Florida","California"], c:0 },
  { q:"Name one state that borders Mexico.", opts:["Texas","Florida","Oregon","New York"], c:0 },
  { q:"What is the capital of the United States?", opts:["Washington, D.C.","New York City","Philadelphia","Boston"], c:0 },
  { q:"Where is the Statue of Liberty?", opts:["New York (Liberty Island)","Washington D.C.","Boston","Philadelphia"], c:0 },
  { q:"Why does the flag have 13 stripes?", opts:["They represent the 13 original colonies","13 presidents","13 wars","13 current states"], c:0 },
  { q:"Why does the flag have 50 stars?", opts:["One for each state","50 presidents","50 years","50 colonies"], c:0 },
  { q:"What is the name of the national anthem?", opts:["The Star-Spangled Banner","America the Beautiful","God Bless America","My Country 'Tis of Thee"], c:0 },
  { q:"When do we celebrate Independence Day?", opts:["July 4","March 4","December 25","January 1"], c:0 },
];

// Shuffle options for each question, tracking correct answer
function shuffleTest(questions) {
  return questions.map(q => {
    const indices = q.opts.map((_, i) => i);
    for (let i = indices.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [indices[i], indices[j]] = [indices[j], indices[i]]; }
    return { q: q.q, opts: indices.map(i => q.opts[i]), correctIdx: indices.indexOf(q.c) };
  }).sort(() => Math.random() - 0.5);
}

// в”Ђв”Ђв”Ђ TIPS CATEGORIES в”Ђв”Ђв”Ђ
const TIPS_CATS = [
  { id:"tipping", icon:"рџ’°", title:"Р§Р°РµРІС‹Рµ", desc:"РЎРєРѕР»СЊРєРѕ РѕСЃС‚Р°РІР»СЏС‚СЊ Рё РіРґРµ" },
  { id:"driving", icon:"рџљ—", title:"Р’РѕР¶РґРµРЅРёРµ", desc:"РџСЂР°РІР°, DMV, РїСЂР°РІРёР»Р°" },
  { id:"banking", icon:"рџЏ¦", title:"Р‘Р°РЅРєРё Рё РєСЂРµРґРёС‚", desc:"РЎС‡РµС‚Р°, SSN, РєСЂРµРґРёС‚РЅР°СЏ РёСЃС‚РѕСЂРёСЏ" },
  { id:"health", icon:"рџЏҐ", title:"РњРµРґРёС†РёРЅР°", desc:"РЎС‚СЂР°С…РѕРІРєР°, РІСЂР°С‡Рё, Р°РїС‚РµРєРё" },
  { id:"shopping", icon:"рџ›’", title:"РџРѕРєСѓРїРєРё", desc:"Р“РґРµ РґРµС€РµРІР»Рµ, РІРѕР·РІСЂР°С‚, РЅР°Р»РѕРі" },
  { id:"social", icon:"рџ¤ќ", title:"РћР±С‰РµРЅРёРµ", desc:"РљСѓР»СЊС‚СѓСЂР°, small talk, СЌС‚РёРєРµС‚" },
  { id:"housing", icon:"рџЏ ", title:"Р–РёР»СЊС‘", desc:"РђСЂРµРЅРґР°, РґРµРїРѕР·РёС‚, РїСЂР°РІР°" },
  { id:"other", icon:"рџ“ќ", title:"Р Р°Р·РЅРѕРµ", desc:"Р’СЃС‘ РѕСЃС‚Р°Р»СЊРЅРѕРµ" },
];

const INIT_TIPS = [
  { id:1, cat:"tipping", author:"РњР°СЂРёСЏ Рљ.", title:"Р§Р°РµРІС‹Рµ РІ СЂРµСЃС‚РѕСЂР°РЅРµ", text:"Р’ СЂРµСЃС‚РѕСЂР°РЅРµ СЃС‚Р°РЅРґР°СЂС‚ вЂ” 18-20% РѕС‚ СЃСѓРјРјС‹ Р”Рћ РЅР°Р»РѕРіР°. 15% вЂ” РјРёРЅРёРјСѓРј. Р•СЃР»Рё РѕР±СЃР»СѓР¶РёРІР°РЅРёРµ Р±С‹Р»Рѕ РѕС‚Р»РёС‡РЅРѕРµ вЂ” 25%. Р’ Р±Р°СЂРµ вЂ” $1-2 Р·Р° РЅР°РїРёС‚РѕРє. Takeout вЂ” РЅРµ РѕР±СЏР·Р°С‚РµР»СЊРЅРѕ, РЅРѕ 10% РїСЂРёСЏС‚РЅРѕ.", likes:45, comments:[{id:201,author:"Р”РёРјР° РЎ.",text:"Р’ С„Р°СЃС‚С„СѓРґРµ РЅРµ РЅСѓР¶РЅРѕ! РўРѕР»СЊРєРѕ РІ СЂРµСЃС‚РѕСЂР°РЅР°С… СЃ РѕР±СЃР»СѓР¶РёРІР°РЅРёРµРј."},{id:202,author:"РђРЅСЏ Р‘.",text:"Uber Eats / DoorDash вЂ” С‚РѕР¶Рµ 15-20% РѕСЃС‚Р°РІР»СЏР№С‚Рµ, РєСѓСЂСЊРµСЂС‹ Р·Р°РІРёСЃСЏС‚ РѕС‚ С‡Р°РµРІС‹С…."}] },
  { id:2, cat:"tipping", author:"РђР»РµРєСЃ Р .", title:"РџР°СЂРёРєРјР°С…РµСЂ, РјР°РЅРёРєСЋСЂ, РґРѕСЃС‚Р°РІРєР°", text:"РџР°СЂРёРєРјР°С…РµСЂ: 15-20%. РњР°РЅРёРєСЋСЂ: 20%. Valet parking: $3-5. Р”РѕСЃС‚Р°РІРєР° РїСЂРѕРґСѓРєС‚РѕРІ (Instacart): 10-15%. Movers: $20-50 РЅР° С‡РµР»РѕРІРµРєР°.", likes:32, comments:[{id:203,author:"РћР»СЏ Рў.",text:"Р•С‰С‘ Р·Р°Р±С‹Р»Рё вЂ” РѕС‚РµР»СЊ РіРѕСЂРЅРёС‡РЅС‹Рј $2-5 Р·Р° РЅРѕС‡СЊ РѕСЃС‚Р°РІР»СЏСЋС‚ РЅР° РїРѕРґСѓС€РєРµ."}] },
  { id:3, cat:"driving", author:"РњР°РєСЃ Р”.", title:"РљР°Рє РїРѕР»СѓС‡РёС‚СЊ РїСЂР°РІР° РІ CA", text:"1. Р—Р°РїРёСЃР°С‚СЊСЃСЏ РЅР° DMV.ca.gov (online!). 2. РџСЂРѕР№С‚Рё written test (46 РІРѕРїСЂРѕСЃРѕРІ, РјРѕР¶РЅРѕ РЅР° СЂСѓСЃСЃРєРѕРј!). 3. РџРѕР»СѓС‡РёС‚СЊ permit. 4. РџСЂР°РєС‚РёРєР°. 5. Behind-the-wheel test. Real ID вЂ” РІРѕР·СЊРјРё РїР°СЃРїРѕСЂС‚ + 2 РґРѕРєР°Р·Р°С‚РµР»СЊСЃС‚РІР° Р°РґСЂРµСЃР°.", likes:58, comments:[{id:204,author:"РРіРѕСЂСЊ Рќ.",text:"Written test РјРѕР¶РЅРѕ РЅР° СЂСѓСЃСЃРєРѕРј вЂ” РІС‹Р±РёСЂР°РµС€СЊ СЏР·С‹Рє РїСЂРё Р·Р°РїРёСЃРё!"},{id:205,author:"РљР°С‚СЏ Р›.",text:"Р—Р° record РЅСѓР¶РЅРѕ $39 Р·Р° Class C."}] },
  { id:4, cat:"banking", author:"РЎР°С€Р° Рљ.", title:"РџРµСЂРІС‹Р№ Р±Р°РЅРє Рё РєСЂРµРґРёС‚РЅР°СЏ РёСЃС‚РѕСЂРёСЏ", text:"РћС‚РєСЂС‹С‚СЊ СЃС‡С‘С‚ РјРѕР¶РЅРѕ СЃ РїР°СЃРїРѕСЂС‚РѕРј + ITIN (РґР°Р¶Рµ Р±РµР· SSN). Chase, Bank of America вЂ” Р±РµСЃРїР»Р°С‚РЅС‹Рµ checking. Р”Р»СЏ РєСЂРµРґРёС‚РЅРѕР№ РёСЃС‚РѕСЂРёРё вЂ” secured credit card (РґРµРїРѕР·РёС‚ $200-500). Р§РµСЂРµР· 6 РјРµСЃ Р±СѓРґРµС‚ credit score.", likes:41, comments:[] },
  { id:5, cat:"health", author:"Р’РµСЂР° Рџ.", title:"РљР°Рє РЅР°Р№С‚Рё РІСЂР°С‡Р° Р±РµР· СЃС‚СЂР°С…РѕРІРєРё", text:"Community Health Centers вЂ” РїСЂРёС‘Рј РїРѕ sliding scale (РѕС‚ РґРѕС…РѕРґР°). Medi-Cal вЂ” Р±РµСЃРїР»Р°С‚РЅР°СЏ СЃС‚СЂР°С…РѕРІРєР° РµСЃР»Рё РґРѕС…РѕРґ РЅРёР·РєРёР№. Urgent Care вЂ” РґРµС€РµРІР»Рµ С‡РµРј ER ($100-300 vs $3000+). GoodRx вЂ” СЃРєРёРґРєРё РЅР° Р»РµРєР°СЂСЃС‚РІР° РґРѕ 80%.", likes:37, comments:[{id:206,author:"Р РѕРјР° Р“.",text:"Covered California вЂ” marketplace РґР»СЏ СЃС‚СЂР°С…РѕРІРєРё. РћС‚РєСЂС‹С‚Р°СЏ СЂРµРіРёСЃС‚СЂР°С†РёСЏ РЅРѕСЏР±СЂСЊ-СЏРЅРІР°СЂСЊ."}] },
  { id:6, cat:"social", author:"Р›РµРЅР° Р’.", title:"Small talk вЂ” РєР°Рє РЅРµ РјРѕР»С‡Р°С‚СЊ", text:"РђРјРµСЂРёРєР°РЅС†С‹ РѕР±РѕР¶Р°СЋС‚ small talk. РўРµРјС‹: РїРѕРіРѕРґР°, weekend plans, СЃРїРѕСЂС‚, РµРґР°. РќР• СЃРїСЂР°С€РёРІР°Р№С‚Рµ: СЃРєРѕР»СЊРєРѕ Р·Р°СЂР°Р±Р°С‚С‹РІР°РµС‚Рµ, РІРѕР·СЂР°СЃС‚, Р·Р° РєРѕРіРѕ РіРѕР»РѕСЃРѕРІР°Р»Рё, РїРѕС‡РµРјСѓ РЅРµС‚ РґРµС‚РµР№. 'How are you?' вЂ” РІСЃРµРіРґР° РѕС‚РІРµС‡Р°Р№С‚Рµ 'Good, thanks! And you?'", likes:53, comments:[{id:207,author:"РџР°С€Р° Р–.",text:"Р•С‰С‘ РІР°Р¶РЅРѕ вЂ” РІСЃРµРіРґР° СѓР»С‹Р±Р°Р№С‚РµСЃСЊ! РЎРµСЂСЊС‘Р·РЅРѕРµ Р»РёС†Рѕ = РіСЂСѓР±РѕСЃС‚СЊ С‚СѓС‚."}] },
];

// в”Ђв”Ђв”Ђ EVENTS в”Ђв”Ђв”Ђ
const EVENT_CATS = [
  { id:"concerts", icon:"рџЋµ", title:"РљРѕРЅС†РµСЂС‚С‹", color:"#E91E8C" },
  { id:"holidays", icon:"рџЋ„", title:"РџСЂР°Р·РґРЅРёРєРё", color:"#E74C3C" },
  { id:"sports", icon:"вљЅ", title:"РЎРїРѕСЂС‚", color:"#27AE60" },
  { id:"community", icon:"рџ¤ќ", title:"РљРѕРјСЊСЋРЅРёС‚Рё", color:"#F47B20" },
  { id:"markets", icon:"рџ›ЌпёЏ", title:"РњР°СЂРєРµС‚С‹ / Р Р°СЃРїСЂРѕРґР°Р¶Рё", color:"#8E44AD" },
  { id:"wellness", icon:"рџ§", title:"Р™РѕРіР° / Р—РґРѕСЂРѕРІСЊРµ", color:"#2980B9" },
];

const INIT_EVENTS = [
  { id:1, cat:"community", title:"Р’СЃС‚СЂРµС‡Р° СЂСѓСЃСЃРєРѕСЏР·С‹С‡РЅС‹С… РІ Griffith Park", date:"2026-04-06T10:00", location:"Griffith Park, РїРёРєРЅРёРє-Р·РѕРЅР° #5", desc:"РЎРѕР±РёСЂР°РµРјСЃСЏ, РѕР±С‰Р°РµРјСЃСЏ, РґРµР»РёРјСЃСЏ РѕРїС‹С‚РѕРј. РџСЂРёРЅРѕСЃРёС‚Рµ РµРґСѓ РЅР° С€РµР№СЂРёРЅРі!", author:"РњР°СЂРёСЏ Рљ.", likes:23, comments:[{id:101,author:"Р”РёРјР° РЎ.",text:"Р‘СѓРґСѓ РІ СЌС‚Рѕ РІРѕСЃРєСЂРµСЃРµРЅСЊРµ!"}] },
  { id:2, cat:"wellness", title:"Р™РѕРіР° Сѓ РѕРєРµР°РЅР° вЂ” Р±РµСЃРїР»Р°С‚РЅРѕ", date:"2026-04-05T08:00", location:"Santa Monica Beach, Сѓ РїРёСЂСЃР°", desc:"Р‘РµСЃРїР»Р°С‚РЅР°СЏ Р№РѕРіР° РЅР° РїР»СЏР¶Рµ. РљРѕРІСЂРёРє СЃРІРѕР№. РЈСЂРѕРІРµРЅСЊ Р»СЋР±РѕР№.", author:"РђРЅСЏ Р‘.", likes:31, comments:[] },
  { id:3, cat:"markets", title:"Flea Market РЅР° Rose Bowl", date:"2026-04-12T07:00", location:"Rose Bowl, Pasadena", desc:"РћРіСЂРѕРјРЅР°СЏ Р±Р°СЂР°С…РѕР»РєР°! Р’РёРЅС‚Р°Р¶, РѕРґРµР¶РґР°, РјРµР±РµР»СЊ, РµРґР°. Р’С…РѕРґ $12 РґРѕ 8am, $5 РїРѕСЃР»Рµ 9am.", author:"РћР»СЏ Рў.", likes:18, comments:[] },
  { id:4, cat:"concerts", title:"Р СѓСЃСЃРєРёР№ СЂРѕРє РІ The Satellite", date:"2026-04-15T20:00", location:"The Satellite, Silver Lake", desc:"Р–РёРІС‹Рµ РІС‹СЃС‚СѓРїР»РµРЅРёСЏ СЂСѓСЃСЃРєРѕСЏР·С‹С‡РЅС‹С… РіСЂСѓРїРї. Р’С…РѕРґ $10. Р‘Р°СЂ СЂР°Р±РѕС‚Р°РµС‚.", author:"РџР°С€Р° Р–.", likes:27, comments:[] },
  { id:5, cat:"holidays", title:"РњР°СЃР»РµРЅРёС†Р° РІ West Hollywood", date:"2026-03-08T12:00", location:"Plummer Park, West Hollywood", desc:"Р‘Р»РёРЅС‹, С‡Р°Р№, РёРіСЂС‹, РєРѕРЅРєСѓСЂСЃС‹! РџСЂРёС…РѕРґРёС‚Рµ РІСЃРµР№ СЃРµРјСЊС‘Р№.", author:"Р”РёРјР° РЎ.", likes:45, comments:[] },
  { id:6, cat:"markets", title:"Р“Р°СЂР°Р¶РЅР°СЏ СЂР°СЃРїСЂРѕРґР°Р¶Р°", date:"2026-04-05T09:00", location:"Studio City", desc:"Р”РёРІР°РЅ IKEA ($150), СЃС‚РѕР» ($80), РјРѕРЅРёС‚РѕСЂ 27\" ($120). Р’СЃС‘ РІ РѕС‚Р»РёС‡РЅРѕРј СЃРѕСЃС‚РѕСЏРЅРёРё.", author:"РђР»РµРєСЃ Р .", likes:8, comments:[] },
];

const SECTIONS = [
  { id:"uscis", icon:"рџ“‹", title:"USCIS", desc:"Р”РѕРєСѓРјРµРЅС‚С‹" },
  { id:"places", icon:"рџ“Ќ", title:"РњРµСЃС‚Р°", desc:"РћС‚ СЃРІРѕРёС…" },
  { id:"tips", icon:"рџ’Ў", title:"РЎРѕРІРµС‚С‹", desc:"Р›Р°Р№С„С…Р°РєРё" },
  { id:"events", icon:"рџЋ‰", title:"РЎРѕР±С‹С‚РёСЏ", desc:"РњРµСЂРѕРїСЂРёСЏС‚РёСЏ" },
  { id:"jobs", icon:"рџ’ј", title:"Р Р°Р±РѕС‚Р°", desc:"Р’Р°РєР°РЅСЃРёРё", soon:true },
  { id:"housing", icon:"рџЏ ", title:"Р–РёР»СЊС‘", desc:"РђСЂРµРЅРґР°", soon:true },
  { id:"chat-sec", icon:"рџ’¬", title:"AI Р§Р°С‚", desc:"РџРѕРјРѕС‰РЅРёРє" },
];

const RICH_PREFIX = "__LA_RICH_V1__";

function encodeRichText(text, photos = [], extra = {}) {
  const payload = { text, photos: photos || [], ...extra };
  if (!payload.photos.length && !payload.website) return text;
  return `${RICH_PREFIX}${JSON.stringify(payload)}`;
}

function decodeRichText(raw) {
  if (typeof raw !== "string" || !raw.startsWith(RICH_PREFIX)) {
    return { text: raw || "", photos: [], website: "" };
  }
  try {
    const parsed = JSON.parse(raw.slice(RICH_PREFIX.length));
    return {
      text: parsed?.text || "",
      photos: Array.isArray(parsed?.photos) ? parsed.photos : [],
      website: parsed?.website || "",
    };
  } catch {
    return { text: raw, photos: [], website: "" };
  }
}

export default function App() {
  const [scr, setScr] = useState(() => { try { return sessionStorage.getItem('scr') || 'home'; } catch { return 'home'; } });
  const [selU, setSelU] = useState(null);
  const [selD, setSelD] = useState(() => { try { const d = sessionStorage.getItem('selD'); return d ? JSON.parse(d) : null; } catch { return null; } });
  const [selPC, setSelPC] = useState(() => { try { const d = sessionStorage.getItem('selPC'); return d ? JSON.parse(d) : null; } catch { return null; } });
  const [selTC, setSelTC] = useState(null);
  // Save screen state on change
  useEffect(() => { try { sessionStorage.setItem('scr', scr); } catch {} }, [scr]);
  useEffect(() => { try { sessionStorage.setItem('selD', selD ? JSON.stringify(selD) : ''); } catch {} }, [selD]);
  useEffect(() => { try { sessionStorage.setItem('selPC', selPC ? JSON.stringify(selPC) : ''); } catch {} }, [selPC]);
  const [exp, setExp] = useState(null);
  const [expF, setExpF] = useState(null);
  const [expTip, setExpTip] = useState(null);
  const [liked, setLiked] = useState({});
  const [likedTips, setLikedTips] = useState({});
  const [srch, setSrch] = useState("");
  const [places, setPlaces] = useState([...INIT_PLACES, ...WEHO_PREVIEW_PLACES]);
  const [tips, setTips] = useState(INIT_TIPS);
  const [user, setUser] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [showAddTip, setShowAddTip] = useState(false);
  const [np, setNp] = useState({ name:"", cat:"", address:"", tip:"" });
  const [nPhotos, setNPhotos] = useState([]);
  const [editingPlace, setEditingPlace] = useState(null);
  const [selPlace, setSelPlace] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [newTip, setNewTip] = useState({ title:"", text:"" });
  const [newTipPhotos, setNewTipPhotos] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [showComments, setShowComments] = useState(null);
  const [editingComment, setEditingComment] = useState(null);
  const [editCommentText, setEditCommentText] = useState("");
  const [events, setEvents] = useState(INIT_EVENTS);
  const [selEC, setSelEC] = useState(null);
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [newEvent, setNewEvent] = useState({ title:"", date:"", location:"", desc:"", website:"", cat:"" });
  const [newEventPhotos, setNewEventPhotos] = useState([]);
  const [editingEvent, setEditingEvent] = useState(null);
  const [filterDate, setFilterDate] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [addrOptionsPlace, setAddrOptionsPlace] = useState([]);
  const [addrOptionsEvent, setAddrOptionsEvent] = useState([]);
  const [addrLoadingPlace, setAddrLoadingPlace] = useState(false);
  const [addrLoadingEvent, setAddrLoadingEvent] = useState(false);
  const [addrValidPlace, setAddrValidPlace] = useState(false);
  const [addrValidEvent, setAddrValidEvent] = useState(false);
  const [photoViewer, setPhotoViewer] = useState(null);
  const [chat, setChat] = useState([{ role:"assistant", text:"РџРѕРјРѕС‰РЅРёРє" }]);
  const [inp, setInp] = useState("");
  const [typing, setTyping] = useState(false);
  const [mt, setMt] = useState(false);
  const [tQ, setTQ] = useState(0);
  const [tAns, setTAns] = useState([]);
  const [tDone, setTDone] = useState(false);
  const [tShuf, setTShuf] = useState([]);
  const chatEnd = useRef(null);
  const inpRef = useRef(null);
  const fileRef = useRef(null);
  const tipFileRef = useRef(null);
  const eventFileRef = useRef(null);

  useEffect(() => setMt(true), []);
  // Save navigation state to localStorage
  useEffect(() => {
    if (mt) {
      const state = { scr, selDId: selD?.id, selPCId: selPC?.id, selUId: selU?.id, selTCId: selTC?.id, selECId: selEC?.id };
      try { localStorage.setItem('nav', JSON.stringify(state)); } catch {}
    }
  }, [scr, selD, selPC, selU, selTC, selEC, mt]);
  // Restore navigation on mount
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('nav'));
      if (saved?.scr) {
        setScr(saved.scr);
        if (saved.selDId) setSelD(DISTRICTS.find(d => d.id === saved.selDId) || null);
        if (saved.selPCId) setSelPC(PLACE_CATS.find(c => c.id === saved.selPCId) || null);
        if (saved.selUId) setSelU(USCIS_CATS.find(c => c.id === saved.selUId) || null);
        if (saved.selTCId) setSelTC(TIPS_CATS.find(c => c.id === saved.selTCId) || null);
        if (saved.selECId) setSelEC(EVENT_CATS.find(c => c.id === saved.selECId) || null);
      }
    } catch {}
  }, []);
  useEffect(() => {
    async function init() {
      // Load user
      const u = await getUser();
      if (u) {
        setUser({ id:u.id, name:u.user_metadata?.full_name||u.email||"РџРѕР»СЊР·РѕРІР°С‚РµР»СЊ", email:u.email, avatar:"рџ‘¤", avatarUrl:u.user_metadata?.avatar_url });
        const userLikes = await getUserLikes(u.id);
        setLiked(userLikes);
      }
      // Load places from DB, merge with initial
      const { data: dbPlaces } = await fetchPlaces();
      if (dbPlaces && dbPlaces.length > 0) {
        const mapped = dbPlaces.map(p => ({ id:p.id, cat:p.category, district:p.district, name:p.name, address:p.address||'', tip:p.tip, rating:p.rating||0, addedBy:p.added_by, userId:p.user_id, img:p.img||'рџ“Ќ', photos:p.photos||[], likes:p.likes_count||0, fromDB:true }));
        const names = new Set(mapped.map(p => p.name));
        setPlaces([...mapped, ...INIT_PLACES.filter(p => !names.has(p.name))]);
      }
      // Load tips from DB
      const { data: dbTips } = await fetchTips();
      if (dbTips && dbTips.length > 0) {
        const mapped = dbTips.map(t => {
          const rich = decodeRichText(t.text);
          return { id:t.id, cat:t.category, title:t.title, text:rich.text, photos:rich.photos, author:t.author, userId:t.user_id, likes:t.likes_count||0, comments:[], fromDB:true };
        });
        const titles = new Set(mapped.map(t => t.title));
        setTips([...mapped, ...INIT_TIPS.filter(t => !titles.has(t.title))]);
      }
      // Load events from DB
      const { data: dbEvents } = await fetchEvents();
      if (dbEvents && dbEvents.length > 0) {
        const mapped = dbEvents.map(e => {
          const rich = decodeRichText(e.description);
          return { id:e.id, cat:e.category, title:e.title, date:e.date, location:e.location||'', desc:rich.text, website:rich.website, photos:rich.photos, author:e.author, userId:e.user_id, likes:e.likes_count||0, comments:[], fromDB:true };
        });
        const titles = new Set(mapped.map(e => e.title));
        setEvents([...mapped, ...INIT_EVENTS.filter(e => !titles.has(e.title))]);
      }
      // Load all comments and attach to items
      for (const type of ['place','tip','event']) {
        const { data: allComments } = await getAllComments(type);
        if (allComments && allComments.length > 0) {
          const grouped = {};
          allComments.forEach(c => { if (!grouped[c.item_id]) grouped[c.item_id] = []; grouped[c.item_id].push({ id:c.id, author:c.author, text:c.text, userId:c.user_id }); });
          if (type === 'place') setPlaces(prev => prev.map(p => ({ ...p, comments: grouped[p.id] || p.comments || [] })));
          if (type === 'tip') setTips(prev => prev.map(t => ({ ...t, comments: grouped[t.id] || t.comments || [] })));
          if (type === 'event') setEvents(prev => prev.map(e => ({ ...e, comments: grouped[e.id] || e.comments || [] })));
        }
      }
    }
    init();
  }, []);
  useEffect(() => { chatEnd.current?.scrollIntoView({ behavior:"smooth" }); }, [chat, typing]);

  const goHome = () => { setScr("home"); setSelU(null); setSelD(null); setSelPC(null); setSelTC(null); setSelEC(null); setSelPlace(null); setExp(null); setExpF(null); setExpTip(null); setSrch(""); setShowAdd(false); setShowAddTip(false); setShowAddEvent(false); setTDone(false); setEditingPlace(null); setFilterDate(null); setShowDatePicker(false); };
  const openAddressInMaps = (address) => {
    const q = encodeURIComponent(address || "");
    if (!q) return;
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    if (isMobile) {
      window.location.href = `geo:0,0?q=${q}`;
      return;
    }
    window.open(`https://www.google.com/maps/search/?api=1&query=${q}`, "_blank");
  };
  const normalizeExternalUrl = (url) => {
    const v = (url || "").trim();
    if (!v) return "";
    if (/^https?:\/\//i.test(v)) return v;
    return `https://${v}`;
  };
  const handleNativeShare = async ({ title, text, url }) => {
    const safeUrl = normalizeExternalUrl(url || window.location.href);
    try {
      if (navigator.share) {
        await navigator.share({ title, text, url: safeUrl });
        return;
      }
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(safeUrl);
        alert("РЎСЃС‹Р»РєР° СЃРєРѕРїРёСЂРѕРІР°РЅР°");
      }
    } catch {}
  };
  const openAllOnMap = (placesArr) => {
    // Search for place names on Google Maps centered on the district
    const names = placesArr.map(p => p.name).join(", ");
    const d = selD;
    const q = encodeURIComponent(names);
    window.open(`https://www.google.com/maps/search/${q}/@${d.lat},${d.lng},14z`, "_blank");
  };

  const fetchAddressSuggestions = async (query) => {
    const q = (query || "").trim();
    if (q.length < 3) return [];
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=5&accept-language=en&q=${encodeURIComponent(`${q}, Los Angeles, California`)}`);
      const data = await res.json();
      if (!Array.isArray(data)) return [];
      return data.map((item) => {
        const a = item.address || {};
        const line1 = [a.house_number, a.road || a.pedestrian || a.footway || a.path].filter(Boolean).join(" ").trim();
        const city = a.city || a.town || a.village || "Los Angeles";
        const state = a.state_code || "CA";
        const short = [line1 || item.display_name.split(",")[0], city, state].filter(Boolean).join(", ");
        return { label: short, value: short };
      });
    } catch {
      return [];
    }
  };

  useEffect(() => {
    const q = (np.address || "").trim();
    if (addrValidPlace) { setAddrOptionsPlace([]); return; }
    if (q.length < 3) { setAddrOptionsPlace([]); return; }
    const t = setTimeout(async () => {
      setAddrLoadingPlace(true);
      const opts = await fetchAddressSuggestions(q);
      setAddrOptionsPlace(opts);
      setAddrLoadingPlace(false);
    }, 280);
    return () => clearTimeout(t);
  }, [np.address, addrValidPlace]);

  useEffect(() => {
    const q = (newEvent.location || "").trim();
    if (addrValidEvent) { setAddrOptionsEvent([]); return; }
    if (q.length < 3) { setAddrOptionsEvent([]); return; }
    const t = setTimeout(async () => {
      setAddrLoadingEvent(true);
      const opts = await fetchAddressSuggestions(q);
      setAddrOptionsEvent(opts);
      setAddrLoadingEvent(false);
    }, 280);
    return () => clearTimeout(t);
  }, [newEvent.location, addrValidEvent]);

  const handleSend = async (t) => {
    const msg = t || inp.trim(); if (!msg) return;
    setChat(p => [...p, { role:"user", text:msg }]); setInp(""); setTyping(true);
    try {
      const res = await fetch("/api/chat", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ message:msg, history:chat.slice(-10) }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error);
      setChat(p => [...p, { role:"assistant", text:data.text||"РќРµС‚ РѕС‚РІРµС‚Р°." }]);
    } catch(e) { setChat(p => [...p, { role:"assistant", text:"РћС€РёР±РєР°. РџРѕРїСЂРѕР±СѓР№С‚Рµ РµС‰С‘ СЂР°Р·." }]); }
    finally { setTyping(false); }
  };
  const handleLogin = async () => {
    const { error } = await signInWithGoogle();
    if (error) console.error("Login error:", error);
  };
  const handleLogout = async () => { await signOut(); setUser(null); setLiked({}); };
  const handleAddPlace = async () => {
    if (!np.name || !np.cat || !np.tip || !user) return;
    if (!np.address.trim() || !addrValidPlace) {
      alert("Р’С‹Р±РµСЂРёС‚Рµ СЂРµР°Р»СЊРЅС‹Р№ Р°РґСЂРµСЃ РёР· РїРѕРґСЃРєР°Р·РѕРє.");
      return;
    }
    setUploading(true);
    try {
      // Upload photos to Supabase Storage
      const uploadedUrls = [];
      for (const p of nPhotos) {
        if (p.file) {
          const url = await uploadPhoto(p.file);
          if (url) uploadedUrls.push(url);
          else console.warn('Photo upload failed for:', p.name);
        } else if (p.preview && p.preview.startsWith('http')) {
          uploadedUrls.push(p.preview);
        }
      }
      if (editingPlace) {
        const allPhotos = uploadedUrls;
        const updates = { name:np.name, category:np.cat, address:np.address, tip:np.tip, img:PLACE_CATS.find(c=>c.id===np.cat)?.icon||editingPlace.img, photos:allPhotos };
        if (editingPlace.fromDB) await dbUpdatePlace(editingPlace.id, updates);
        setPlaces(prev => prev.map(p => p.id === editingPlace.id ? { ...p, name:np.name, cat:np.cat, address:np.address, tip:np.tip, img:updates.img, photos:allPhotos } : p));
        setEditingPlace(null);
      } else {
        const dbData = { name:np.name, category:np.cat, district:selD.id, address:np.address||'', tip:np.tip, rating:0, added_by:user.name, user_id:user.id, img:PLACE_CATS.find(c=>c.id===np.cat)?.icon||"рџ“Ќ", photos:uploadedUrls };
        const { data } = await dbAddPlace(dbData);
        const newId = data?.[0]?.id || Date.now();
        setPlaces(prev => [{ id:newId, cat:np.cat, district:selD.id, name:np.name, address:np.address, tip:np.tip, rating:0, addedBy:user.name, userId:user.id, img:dbData.img, photos:uploadedUrls, likes:0, comments:[], fromDB:true }, ...prev]);
      }
      setNp({ name:"", cat:"", address:"", tip:"" }); setNPhotos([]); setShowAdd(false);
    } catch(err) {
      console.error('Add place error:', err);
      alert('РћС€РёР±РєР° РїСЂРё СЃРѕС…СЂР°РЅРµРЅРёРё. РџРѕРїСЂРѕР±СѓР№С‚Рµ РµС‰С‘ СЂР°Р·.');
    } finally { setUploading(false); }
  };
  const handleDeletePlace = async (placeId) => {
    if (window.confirm("РЈРґР°Р»РёС‚СЊ СЌС‚Рѕ РјРµСЃС‚Рѕ?")) {
      await dbDeletePlace(placeId);
      setPlaces(prev => prev.filter(p => p.id !== placeId));
      setExp(null);
      if (selPlace?.id === placeId) {
        setSelPlace(null);
        setScr("places-cat");
      }
    }
  };
  const startEditPlace = (p) => {
    setEditingPlace(p);
    setNp({ name:p.name, cat:p.cat, address:p.address||"", tip:p.tip });
    setNPhotos((p.photos || []).filter(ph => typeof ph === "string" && ph.startsWith("http")).map((ph) => ({ name:"existing", preview:ph })));
    setAddrValidPlace(!!(p.address || "").trim());
    setAddrOptionsPlace([]);
    setShowAdd(true);
  };
  const openAddForm = () => {
    if (!user) { handleLogin(); return; }
    setEditingPlace(null);
    setNp({ name:"", cat:selPC?.id||"", address:"", tip:"" });
    setNPhotos([]);
    setAddrValidPlace(false);
    setAddrOptionsPlace([]);
    setShowAdd(true);
  };
  const handlePhotos = (e) => {
    const files = Array.from(e.target.files).slice(0, 5);
    const newFiles = files.map(f => ({ file: f, name: f.name, preview: URL.createObjectURL(f) }));
    setNPhotos(prev => [...prev, ...newFiles].slice(0, 5));
  };
  const handleTipPhotos = (e) => {
    const files = Array.from(e.target.files).slice(0, 3);
    const newFiles = files.map(f => ({ file: f, name: f.name, preview: URL.createObjectURL(f) }));
    setNewTipPhotos(prev => [...prev, ...newFiles].slice(0, 3));
  };
  const handleEventPhotos = (e) => {
    const files = Array.from(e.target.files).slice(0, 3);
    const newFiles = files.map(f => ({ file: f, name: f.name, preview: URL.createObjectURL(f) }));
    setNewEventPhotos(prev => [...prev, ...newFiles].slice(0, 3));
  };
  const startEditEvent = (ev) => {
    setEditingEvent(ev);
    setNewEvent({
      title: ev.title || "",
      date: ev.date ? new Date(ev.date).toISOString().slice(0,16) : "",
      location: ev.location || "",
      desc: ev.desc || "",
      website: ev.website || "",
      cat: ev.cat || "",
    });
    setNewEventPhotos((ev.photos || []).filter(ph => typeof ph === "string" && ph.startsWith("http")).map((ph) => ({ name:"existing", preview:ph })));
    setAddrValidEvent(!!(ev.location || "").trim());
    setAddrOptionsEvent([]);
    setShowAddEvent(true);
  };
  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm("РЈРґР°Р»РёС‚СЊ СЃРѕР±С‹С‚РёРµ?")) return;
    await dbDeleteEvent(eventId);
    setEvents(prev => prev.filter(e => e.id !== eventId));
    setShowAddEvent(false);
    setEditingEvent(null);
    setExp(null);
  };
  const handleAddTip = async () => {
    if (!newTip.title || !newTip.text || !user || !selTC) return;
    const uploaded = [];
    for (const p of newTipPhotos) {
      const url = await uploadPhoto(p.file);
      if (url) uploaded.push(url);
    }
    const dbData = { category:selTC.id, title:newTip.title, text:encodeRichText(newTip.text, uploaded), author:user.name, user_id:user.id };
    const { data } = await dbAddTip(dbData);
    const newId = data?.[0]?.id || Date.now();
    setTips(prev => [{ id:newId, cat:selTC.id, author:user.name, userId:user.id, title:newTip.title, text:newTip.text, photos:uploaded, likes:0, comments:[], fromDB:true }, ...prev]);
    setNewTip({ title:"", text:"" }); setNewTipPhotos([]); setShowAddTip(false);
  };
  const handleAddComment = async (tipId) => {
    if (!newComment.trim() || !user) return;
    const { data } = await dbAddComment({ item_id:tipId, item_type:"tip", author:user.name, user_id:user.id, text:newComment.trim() });
    const cId = data?.[0]?.id || Date.now();
    setTips(prev => prev.map(t => t.id === tipId ? { ...t, comments: [...(t.comments||[]), { id:cId, author:user.name, text:newComment.trim(), userId:user.id }] } : t));
    setNewComment("");
  };
  const addPlaceComment = async (placeId) => {
    if (!newComment.trim() || !user) return;
    const { data } = await dbAddComment({ item_id:placeId, item_type:"place", author:user.name, user_id:user.id, text:newComment.trim() });
    const cId = data?.[0]?.id || Date.now();
    setPlaces(prev => prev.map(p => p.id === placeId ? { ...p, comments: [...(p.comments||[]), { id:cId, author:user.name, text:newComment.trim(), userId:user.id }] } : p));
    setNewComment("");
  };
  const addEventComment = async (eventId) => {
    if (!newComment.trim() || !user) return;
    const { data } = await dbAddComment({ item_id:eventId, item_type:"event", author:user.name, user_id:user.id, text:newComment.trim() });
    const cId = data?.[0]?.id || Date.now();
    setEvents(prev => prev.map(e => e.id === eventId ? { ...e, comments: [...(e.comments||[]), { id:cId, author:user.name, text:newComment.trim(), userId:user.id }] } : e));
    setNewComment("");
  };
  const deleteCommentFn = async (itemId, commentId, type) => {
    await dbDeleteComment(commentId);
    const updater = (items) => items.map(item => item.id === itemId ? { ...item, comments: (item.comments||[]).filter(c => c.id !== commentId) } : item);
    if (type === "place") setPlaces(updater);
    else if (type === "tip") setTips(updater);
    else if (type === "event") setEvents(updater);
  };
  const saveEditComment = async (itemId, commentId, type) => {
    if (!editCommentText.trim()) return;
    await dbUpdateComment(commentId, editCommentText.trim());
    const updater = (items) => items.map(item => item.id === itemId ? { ...item, comments: (item.comments||[]).map(c => c.id === commentId ? { ...c, text: editCommentText.trim() } : c) } : item);
    if (type === "place") setPlaces(updater);
    else if (type === "tip") setTips(updater);
    else if (type === "event") setEvents(updater);
    setEditingComment(null); setEditCommentText("");
  };
  const handleAddEvent = async () => {
    if (!newEvent.title || !newEvent.date || !newEvent.desc || !newEvent.cat || !user) return;
    if (!newEvent.location.trim() || !addrValidEvent) {
      alert("Р’С‹Р±РµСЂРёС‚Рµ РјРµСЃС‚Рѕ РёР· РїРѕРґСЃРєР°Р·РѕРє Р°РґСЂРµСЃР°.");
      return;
    }
    const uploaded = [];
    for (const p of newEventPhotos) {
      if (p.file) {
        const url = await uploadPhoto(p.file);
        if (url) uploaded.push(url);
      } else if (p.preview && p.preview.startsWith("http")) {
        uploaded.push(p.preview);
      }
    }
    const website = normalizeExternalUrl(newEvent.website || "");
    const dbData = { category:newEvent.cat, title:newEvent.title, date:newEvent.date, location:newEvent.location||'', description:encodeRichText(newEvent.desc, uploaded, { website }), author:user.name, user_id:user.id };
    if (editingEvent) {
      await dbUpdateEvent(editingEvent.id, dbData);
      setEvents(prev => prev.map(ev => ev.id === editingEvent.id ? { ...ev, cat:newEvent.cat, title:newEvent.title, date:newEvent.date, location:newEvent.location, desc:newEvent.desc, website, photos:uploaded } : ev));
    } else {
      const { data } = await dbAddEvent(dbData);
      const newId = data?.[0]?.id || Date.now();
      setEvents(prev => [{ id:newId, cat:newEvent.cat, title:newEvent.title, date:newEvent.date, location:newEvent.location, desc:newEvent.desc, website, photos:uploaded, author:user.name, userId:user.id, likes:0, comments:[], fromDB:true }, ...prev]);
    }
    setNewEvent({ title:"", date:"", location:"", desc:"", website:"", cat:"" }); setNewEventPhotos([]); setEditingEvent(null); setAddrValidEvent(false); setAddrOptionsEvent([]); setShowAddEvent(false);
  };
  const handleToggleLike = async (itemId, itemType) => {
    if (!user) { handleLogin(); return; }
    const key = `${itemType}-${itemId}`;
    const wasLiked = liked[key];
    setLiked(prev => ({ ...prev, [key]: !wasLiked }));
    // Update local count
    const countUpdater = (items) => items.map(item => item.id === itemId ? { ...item, likes: (item.likes||0) + (wasLiked ? -1 : 1) } : item);
    if (itemType === "place") setPlaces(countUpdater);
    else if (itemType === "tip") setTips(countUpdater);
    else if (itemType === "event") setEvents(countUpdater);
    // Persist to DB
    await dbToggleLike(itemId, itemType, user.id);
  };

  const startTest = () => { setTShuf(shuffleTest(CIVICS_RAW)); setTQ(0); setTAns([]); setTDone(false); setScr("test"); };
  const ansTest = (i) => { setTAns(p => [...p, { correct: i === tShuf[tQ].correctIdx }]); if (tQ+1 >= tShuf.length) setTDone(true); else setTQ(tQ+1); };

  const sRes = srch.trim().length>=2 ? USCIS_CATS.flatMap(c=>c.docs.filter(d=>{const q=srch.toLowerCase();return d.form.toLowerCase().includes(q)||d.name.toLowerCase().includes(q);}).map(d=>({...d,cT:c.title,cI:c.icon}))) : [];
  const dPlaces = selD ? places.filter(p=>p.district===selD.id) : [];
  const cPlaces = selPC ? dPlaces.filter(p=>p.cat===selPC.id) : [];
  const placeItem = selPlace ? (places.find(p => p.id === selPlace.id) || selPlace) : null;
  const catTips = selTC ? tips.filter(t=>t.cat===selTC.id) : [];
  const catEvents = selEC ? events.filter(e=>{
    if (e.cat !== selEC.id) return false;
    if (filterDate) {
      const evDate = new Date(e.date).toDateString();
      const fDate = new Date(filterDate).toDateString();
      return evDate === fDate;
    }
    return true;
  }).sort((a,b) => new Date(a.date) - new Date(b.date)) : [];

  const fmtDate = (d) => {
    try {
      const dt = new Date(d);
      return dt.toLocaleDateString("ru-RU", { weekday:"short", day:"numeric", month:"long", year:"numeric" }) + ", " + dt.toLocaleTimeString("ru-RU", { hour:"2-digit", minute:"2-digit" });
    } catch { return d; }
  };

  // в”Ђв”Ђв”Ђ Reusable Comments Block в”Ђв”Ђв”Ђ
  const renderComments = (item, type, addFn) => {
    const comments = item.comments || [];
    const isOpen = showComments === `${type}-${item.id}`;
    return (
      <div style={{ padding:"0 16px 16px" }}>
        <button onClick={e=>{e.stopPropagation(); setShowComments(isOpen ? null : `${type}-${item.id}`); setNewComment(""); setEditingComment(null);}}
          style={{ background:"none", border:"none", cursor:"pointer", fontFamily:"inherit", fontSize:13, fontWeight:600, color:T.mid, padding:"4px 0", display:"flex", alignItems:"center", gap:6 }}>
          рџ’¬ РљРѕРјРјРµРЅС‚Р°СЂРёРё ({comments.length}) <span style={{ fontSize:10, color:T.light, transition:"0.3s", transform:isOpen?"rotate(180deg)":"" }}>в–ј</span>
        </button>
        {isOpen && (<div style={{ marginTop:8 }}>
          {comments.map((c) => (
            <div key={c.id||Math.random()} style={{ padding:"10px 12px", background:T.bg, borderRadius:10, marginBottom:6, fontSize:13 }}>
              {editingComment === c.id ? (
                <div style={{ display:"flex", gap:6 }}>
                  <input value={editCommentText} onChange={e=>setEditCommentText(e.target.value)} style={{ ...iS, flex:1, padding:"8px 12px", fontSize:13 }} />
                  <button onClick={()=>saveEditComment(item.id, c.id, type)} style={{ ...pl(true), padding:"8px 14px", fontSize:12 }}>вњ“</button>
                  <button onClick={()=>{setEditingComment(null);setEditCommentText("")}} style={{ ...pl(false), padding:"8px 14px", fontSize:12 }}>вњ•</button>
                </div>
              ) : (<div>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <span style={{ fontWeight:600, color:T.text }}>{c.author}</span>
                  {user && (user.id === c.userId || user.name === c.author) && (
                    <div style={{ display:"flex", gap:4 }}>
                      <button onClick={()=>{setEditingComment(c.id);setEditCommentText(c.text)}} style={{ background:"none", border:"none", color:T.light, cursor:"pointer", fontSize:11, padding:2 }}>вњЏпёЏ</button>
                      <button onClick={()=>deleteCommentFn(item.id, c.id, type)} style={{ background:"none", border:"none", color:"#E74C3C", cursor:"pointer", fontSize:11, padding:2 }}>рџ—‘</button>
                    </div>
                  )}
                </div>
                <div style={{ color:T.mid, marginTop:4 }}>{c.text}</div>
              </div>)}
            </div>
          ))}
          {user ? (
            <div style={{ display:"flex", gap:8, marginTop:6 }}>
              <input value={newComment} onChange={e=>setNewComment(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addFn(item.id)} placeholder="РќР°РїРёСЃР°С‚СЊ РєРѕРјРјРµРЅС‚Р°СЂРёР№..." style={{ ...iS, flex:1, padding:"10px 14px" }} />
              <button onClick={()=>addFn(item.id)} disabled={!newComment.trim()} style={{ ...pl(!!newComment.trim()), padding:"10px 16px", opacity:newComment.trim()?1:0.5 }}>в†’</button>
            </div>
          ) : (<button onClick={handleLogin} style={{ ...pl(false), width:"100%", fontSize:12, marginTop:4 }}>Р’РѕР№РґРёС‚Рµ С‡С‚РѕР±С‹ РєРѕРјРјРµРЅС‚РёСЂРѕРІР°С‚СЊ</button>)}
        </div>)}
      </div>
    );
  };

  // Prevent iOS pinch zoom
  useEffect(() => {
    const prevent = (e) => { if (e.touches && e.touches.length > 1) e.preventDefault(); };
    const preventGesture = (e) => e.preventDefault();
    document.addEventListener('touchmove', prevent, { passive: false });
    document.addEventListener('gesturestart', preventGesture);
    document.addEventListener('gesturechange', preventGesture);
    return () => {
      document.removeEventListener('touchmove', prevent);
      document.removeEventListener('gesturestart', preventGesture);
      document.removeEventListener('gesturechange', preventGesture);
    };
  }, []);

  const cd = { background:T.card, borderRadius:T.r, boxShadow:T.sh, border:`1px solid ${T.borderL}`, transition:"all 0.25s ease" };
  const bk = { background:"none", border:"none", color:T.primary, fontSize:14, fontWeight:500, cursor:"pointer", padding:"12px 0 8px", fontFamily:"inherit", display:"flex", alignItems:"center", gap:4 };
  const pl = (a) => ({ padding:"10px 20px", borderRadius:24, border:"none", fontWeight:600, fontSize:13, cursor:"pointer", fontFamily:"inherit", background:a?T.primary:T.primaryLight, color:a?"#fff":T.primary });
  const iS = { width:"100%", padding:"14px 16px", background:T.card, border:`1px solid ${T.border}`, borderRadius:T.rs, color:T.text, fontSize:16, fontFamily:"inherit", outline:"none", boxSizing:"border-box" };

  return (
    <div style={{ fontFamily:"'Roboto', sans-serif", minHeight:"100vh", background:T.bg, color:T.text, maxWidth:480, margin:"0 auto", touchAction:"manipulation" }}>
      <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700;900&display=swap" rel="stylesheet" />

      <header style={{ padding:"16px 20px", background:T.card, borderBottom:`1px solid ${T.borderL}`, display:"flex", alignItems:"center", justifyContent:"space-between", opacity:mt?1:0, transition:"opacity 0.4s" }}>
        <div onClick={goHome} style={{ cursor:"pointer" }}>
          <h1 style={{ fontSize:22, fontWeight:900, margin:0 }}><span style={{ color:T.primary }}>РњР«</span> РІ LA</h1>
          <p style={{ margin:"1px 0 0", fontSize:11, color:T.light }}>РїСѓС‚РµРІРѕРґРёС‚РµР»СЊ</p>
        </div>
        {user ? (
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <span style={{ fontSize:12, color:T.mid }}>{user.name}</span>
            <div style={{ width:32, height:32, borderRadius:10, background:T.primaryLight, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16 }}>рџ‘¤</div>
            <button onClick={handleLogout} style={{ background:"none", border:"none", color:T.light, fontSize:11, cursor:"pointer" }}>Р’С‹Р№С‚Рё</button>
          </div>
        ) : (
          <button onClick={handleLogin} style={{ ...pl(false), padding:"8px 14px", fontSize:12, display:"flex", alignItems:"center", gap:6 }}>
            <svg width="14" height="14" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            Р’РѕР№С‚Рё
          </button>
        )}
      </header>

      <main style={{ padding:"16px 16px 40px" }}>

        {scr==="home" && (<div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10 }}>
          {SECTIONS.map((s,i) => (
            <button key={s.id} onClick={() => { if (s.soon) return; if (s.id==="chat-sec") { if (!user) {handleLogin();return;} setScr("chat"); } else setScr(s.id); }}
              style={{ ...cd, padding:"20px 10px", cursor:s.soon?"default":"pointer", display:"flex", flexDirection:"column", alignItems:"center", textAlign:"center", fontFamily:"inherit", color:T.text, position:"relative", opacity:mt?1:0, transform:mt?"translateY(0)":"translateY(12px)", transition:`all 0.4s ease ${i*0.05}s` }}
              onMouseEnter={e=>{if(!s.soon)e.currentTarget.style.boxShadow=T.shH}} onMouseLeave={e=>{e.currentTarget.style.boxShadow=T.sh}}>
              {s.soon && <div style={{ position:"absolute", top:6, right:6, fontSize:8, fontWeight:700, color:T.light, background:T.bg, padding:"2px 6px", borderRadius:4, textTransform:"uppercase" }}>СЃРєРѕСЂРѕ</div>}
              <div style={{ fontSize:28, marginBottom:8, filter:s.soon?"grayscale(0.6) opacity(0.4)":"none" }}>{s.icon}</div>
              <div style={{ fontWeight:700, fontSize:13, opacity:s.soon?0.4:1 }}>{s.title}</div>
              <div style={{ fontSize:11, color:T.mid, marginTop:3, opacity:s.soon?0.3:0.7 }}>{s.desc}</div>
            </button>
          ))}
        </div>)}

        {/* USCIS */}
        {scr==="uscis" && (<div>
          <button onClick={goHome} style={bk}>в†ђ Р“Р»Р°РІРЅР°СЏ</button>
          <h2 style={{ fontSize:20, fontWeight:700, margin:"4px 0 14px" }}>рџ“‹ РЎРїСЂР°РІРѕС‡РЅРёРє USCIS</h2>
          <div style={{ position:"relative", marginBottom:14 }}>
            <div style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)", color:T.light, pointerEvents:"none" }}>рџ”Ћ</div>
            <input value={srch} onChange={e=>setSrch(e.target.value)} placeholder="РџРѕРёСЃРє С„РѕСЂРјС‹..." style={{ ...iS, paddingLeft:42, borderColor:srch?T.primary:T.border }} />
          </div>
          {srch.trim().length>=2 ? (<div>{sRes.map((d,i) => (<div key={i} style={{ ...cd, padding:"14px 16px", marginBottom:8 }}>
            <div style={{ display:"flex", gap:8, marginBottom:6 }}>{d.url ? <a href={d.url} target="_blank" rel="noopener noreferrer" style={{ fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:6, color:T.primary, background:T.primaryLight, textDecoration:"none" }}>{d.form} в†—</a> : <span style={{ fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:6, color:T.primary, background:T.primaryLight }}>{d.form}</span>}<span style={{ fontSize:11, color:T.mid }}>{d.cI} {d.cT}</span></div>
            <div style={{ fontWeight:600, fontSize:14 }}>{d.name}</div><div style={{ fontSize:12, color:T.mid, marginTop:3 }}>{d.desc}</div>
          </div>))}{sRes.length===0 && <p style={{ fontSize:13, color:T.mid }}>РќРµ РЅР°Р№РґРµРЅРѕ</p>}</div>) : (<><div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {USCIS_CATS.map(c => (<button key={c.id} onClick={() => { setSelU(c); setScr("uscis-cat"); setExpF(null); }}
              style={{ ...cd, display:"flex", alignItems:"center", gap:14, padding:"16px", cursor:"pointer", fontFamily:"inherit", color:T.text, textAlign:"left" }}
              onMouseEnter={e=>{e.currentTarget.style.boxShadow=T.shH}} onMouseLeave={e=>{e.currentTarget.style.boxShadow=T.sh}}>
              <div style={{ width:48, height:48, borderRadius:T.rs, background:T.primaryLight, display:"flex", alignItems:"center", justifyContent:"center", fontSize:24, flexShrink:0 }}>{c.icon}</div>
              <div style={{ flex:1 }}><div style={{ fontWeight:700, fontSize:15 }}>{c.title}</div><div style={{ fontSize:12, color:T.mid, marginTop:2 }}>{c.subtitle}</div></div>
              <div style={{ color:T.light }}>вЂє</div>
            </button>))}
          </div>
          {/* Case status checker */}
          <div style={{ ...cd, marginTop:14, padding:"18px" }}>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:8 }}><span style={{ fontSize:20 }}>рџ”Ќ</span><span style={{ fontWeight:700, fontSize:15 }}>РџСЂРѕРІРµСЂРёС‚СЊ СЃС‚Р°С‚СѓСЃ РєРµР№СЃР°</span></div>
            <p style={{ fontSize:13, color:T.mid, margin:"0 0 12px" }}>Р’РІРµРґРёС‚Рµ receipt number</p>
            <div style={{ display:"flex", gap:8 }}>
              <input placeholder="EAC-XX-XXX-XXXXX" style={{ ...iS, flex:1, width:"auto" }} />
              <a href="https://egov.uscis.gov/casestatussearchwidget" target="_blank" rel="noopener noreferrer" style={{ ...pl(true), textDecoration:"none", display:"flex", alignItems:"center" }}>РџСЂРѕРІРµСЂРёС‚СЊ</a>
            </div>
          </div>
          </>)}
        </div>)}

        {/* USCIS CAT */}
        {scr==="uscis-cat" && selU && (<div>
          <button onClick={() => setScr("uscis")} style={bk}>в†ђ РЎРїСЂР°РІРѕС‡РЅРёРє</button>
          <div style={{ display:"flex", alignItems:"center", gap:12, margin:"4px 0 20px" }}>
            <div style={{ width:48, height:48, borderRadius:14, background:T.primaryLight, display:"flex", alignItems:"center", justifyContent:"center", fontSize:28 }}>{selU.icon}</div>
            <div><h2 style={{ fontSize:22, fontWeight:700, margin:0 }}>{selU.title}</h2></div>
          </div>
          {selU.docs.map((d, i) => { const isE = expF===i; return (<div key={i} style={{ ...cd, marginBottom:10, overflow:"hidden", borderColor:isE?T.primary+"40":T.borderL }}>
            <div onClick={() => setExpF(isE?null:i)} style={{ padding:"16px", cursor:"pointer" }} onMouseEnter={e=>{e.currentTarget.style.background=T.bg}} onMouseLeave={e=>{e.currentTarget.style.background=T.card}}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                {d.url ? <a href={d.url} target="_blank" rel="noopener noreferrer" onClick={e=>e.stopPropagation()} style={{ fontSize:12, fontWeight:700, padding:"4px 12px", borderRadius:6, color:T.primary, background:T.primaryLight, textDecoration:"none" }}>{d.form} в†—</a> : <span style={{ fontSize:12, fontWeight:700, padding:"4px 12px", borderRadius:6, color:T.primary, background:T.primaryLight }}>{d.form}</span>}
                <span style={{ fontSize:11, color:isE?T.primary:T.light, transform:isE?"rotate(180deg)":"", transition:"0.3s" }}>в–ј</span>
              </div>
              <div style={{ fontWeight:600, fontSize:14, marginTop:10 }}>{d.name}</div>
              <div style={{ fontSize:12, color:T.mid, marginTop:4 }}>{d.desc}</div>
            </div>
            {isE && (<div style={{ padding:"0 16px 16px", borderTop:`1px solid ${T.borderL}` }}>
              <div style={{ padding:14, background:T.bg, borderRadius:10, marginTop:12, fontSize:13, lineHeight:1.65, color:T.mid }}>{d.detail}</div>
              {d.url && <a href={d.url} target="_blank" rel="noopener noreferrer" style={{ display:"inline-block", marginTop:12, ...pl(true), textDecoration:"none", fontSize:12 }}>uscis.gov в†—</a>}
              {d.isTest && <button onClick={startTest} style={{ ...pl(true), marginTop:12, width:"100%" }}>рџ‡єрџ‡ё Start Civics Test</button>}
            </div>)}
          </div>); })}
        </div>)}

        {/* CIVICS TEST вЂ” English, shuffled answers */}
        {scr==="test" && (<div>
          <button onClick={goHome} style={bk}>в†ђ Exit</button>
          {!tDone ? (<div>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:16 }}><h2 style={{ fontSize:18, fontWeight:700, margin:0 }}>рџ‡єрџ‡ё Civics Test</h2><span style={{ fontSize:13, color:T.mid, fontWeight:600 }}>{tQ+1}/{tShuf.length}</span></div>
            <div style={{ width:"100%", height:4, background:T.borderL, borderRadius:2, marginBottom:20 }}><div style={{ width:`${((tQ+1)/tShuf.length)*100}%`, height:4, background:T.primary, borderRadius:2, transition:"width 0.3s" }} /></div>
            <div style={{ ...cd, padding:20 }}>
              <p style={{ fontSize:16, fontWeight:600, lineHeight:1.5, margin:"0 0 20px" }}>{tShuf[tQ]?.q}</p>
              <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                {tShuf[tQ]?.opts.map((opt,oi) => (
                  <button key={oi} onClick={() => ansTest(oi)} style={{ ...cd, padding:"14px 16px", cursor:"pointer", fontFamily:"inherit", color:T.text, textAlign:"left", fontSize:14, fontWeight:500, boxShadow:"none", border:`1.5px solid ${T.border}` }}
                    onMouseEnter={e=>{e.currentTarget.style.borderColor=T.primary;e.currentTarget.style.background=T.primaryLight}} onMouseLeave={e=>{e.currentTarget.style.borderColor=T.border;e.currentTarget.style.background=T.card}}>
                    {opt}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ marginTop:12, fontSize:12, color:T.mid, textAlign:"center" }}>вњ… {tAns.filter(a=>a.correct).length} В· вќЊ {tAns.filter(a=>!a.correct).length}</div>
          </div>) : (<div style={{ textAlign:"center" }}>
            <div style={{ fontSize:60, marginBottom:16 }}>{tAns.filter(a=>a.correct).length >= Math.floor(tShuf.length*0.6) ? "рџЋ‰" : "рџ“љ"}</div>
            <h2 style={{ fontSize:22, fontWeight:700, margin:"0 0 8px" }}>Test Complete!</h2>
            <div style={{ ...cd, padding:24, margin:"16px 0" }}>
              <div style={{ fontSize:48, fontWeight:900, color:tAns.filter(a=>a.correct).length>=Math.floor(tShuf.length*0.6)?"#27AE60":T.primary }}>{tAns.filter(a=>a.correct).length} / {tShuf.length}</div>
              <p style={{ fontSize:14, color:T.mid, marginTop:8 }}>correct answers</p>
            </div>
            <div style={{ display:"flex", gap:10 }}><button onClick={startTest} style={{ ...pl(true), flex:1, padding:14 }}>рџ”„ Retry</button><button onClick={goHome} style={{ ...pl(false), flex:1, padding:14 }}>в†ђ Home</button></div>
          </div>)}
        </div>)}

        {/* PLACES в†’ DISTRICTS */}
        {scr==="places" && (<div>
          <button onClick={goHome} style={bk}>в†ђ Р“Р»Р°РІРЅР°СЏ</button>
          <h2 style={{ fontSize:20, fontWeight:700, margin:"4px 0 16px" }}>рџ“Ќ Р’С‹Р±РµСЂРё СЂР°Р№РѕРЅ</h2>
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {DISTRICTS.map((d, i) => { const cnt = places.filter(p=>p.district===d.id).length; return (
              <button key={d.id} onClick={() => { setSelD(d); setScr("district"); }}
                style={{ ...cd, display:"flex", alignItems:"center", gap:14, padding:"16px", cursor:"pointer", fontFamily:"inherit", color:T.text, textAlign:"left", opacity:mt?1:0, transition:`all 0.4s ease ${i*0.04}s` }}
                onMouseEnter={e=>{e.currentTarget.style.boxShadow=T.shH}} onMouseLeave={e=>{e.currentTarget.style.boxShadow=T.sh}}>
                <div style={{ width:48, height:48, borderRadius:T.rs, background:T.bg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:24, flexShrink:0 }}>{d.emoji}</div>
                <div style={{ flex:1 }}><div style={{ fontWeight:700, fontSize:15 }}>{d.name}</div><div style={{ fontSize:12, color:T.mid, marginTop:2 }}>{d.desc}</div></div>
                <div style={{ textAlign:"right" }}><span style={{ fontSize:13, fontWeight:700, color:T.primary }}>{cnt}</span><br/><span style={{ fontSize:10, color:T.light }}>РјРµСЃС‚</span></div>
              </button>
            ); })}
          </div>
        </div>)}

        {/* DISTRICT в†’ CATEGORIES */}
        {scr==="district" && selD && (<div>
          <button onClick={() => { setScr("places"); setSelD(null); }} style={bk}>в†ђ Р Р°Р№РѕРЅС‹</button>
          <div style={{ display:"flex", alignItems:"center", gap:12, margin:"4px 0 18px" }}>
            <div style={{ width:48, height:48, borderRadius:14, background:T.bg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:26 }}>{selD.emoji}</div>
            <div><h2 style={{ fontSize:20, fontWeight:700, margin:0 }}>{selD.name}</h2><p style={{ fontSize:13, color:T.mid, margin:0 }}>{dPlaces.length} РјРµСЃС‚</p></div>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
            {PLACE_CATS.map(c => { const cnt = dPlaces.filter(p=>p.cat===c.id).length; if (!cnt) return null; return (
              <button key={c.id} onClick={() => { setSelPC(c); setScr("places-cat"); }}
                style={{ ...cd, padding:"18px 14px", display:"flex", alignItems:"center", gap:12, cursor:"pointer", fontFamily:"inherit", color:T.text, textAlign:"left" }}
                onMouseEnter={e=>{e.currentTarget.style.boxShadow=T.shH}} onMouseLeave={e=>{e.currentTarget.style.boxShadow=T.sh}}>
                <div style={{ width:40, height:40, borderRadius:10, background:`${c.color}12`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, flexShrink:0 }}>{c.icon}</div>
                <div><div style={{ fontWeight:700, fontSize:14 }}>{c.title}</div><div style={{ fontSize:12, color:T.mid, marginTop:2 }}>{cnt} РјРµСЃС‚</div></div>
              </button>
            ); })}
          </div>
          <button onClick={() => { openAddForm(); }} style={{ ...cd, width:"100%", marginTop:14, padding:16, border:`2px dashed ${T.primary}40`, color:T.primary, fontWeight:600, fontSize:14, cursor:"pointer", fontFamily:"inherit", display:"flex", alignItems:"center", justifyContent:"center", gap:6, boxShadow:"none" }}>пј‹ Р”РѕР±Р°РІРёС‚СЊ РјРµСЃС‚Рѕ</button>
        </div>)}

        {/* ADD PLACE MODAL */}
        {showAdd && selD && (<div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.4)", zIndex:100, display:"flex", alignItems:"flex-end", justifyContent:"center" }} onClick={()=>setShowAdd(false)}>
          <div style={{ ...cd, width:"100%", maxWidth:480, borderRadius:"24px 24px 0 0", padding:"24px 20px 32px", maxHeight:"90vh", overflowY:"auto" }} onClick={e=>e.stopPropagation()}>
            <div style={{ width:40, height:4, borderRadius:2, background:T.border, margin:"0 auto 20px" }} />
            {!user ? (<div style={{ textAlign:"center", padding:"20px 0" }}><div style={{ fontSize:48, marginBottom:16 }}>рџ”ђ</div><button onClick={handleLogin} style={{ ...pl(true), padding:"14px 28px" }}>Р’РѕР№С‚Рё С‡РµСЂРµР· Google</button></div>) : (<>
              <h3 style={{ fontSize:18, fontWeight:700, margin:"0 0 20px" }}>{editingPlace ? "вњЏпёЏ Р РµРґР°РєС‚РёСЂРѕРІР°С‚СЊ РјРµСЃС‚Рѕ" : "РќРѕРІРѕРµ РјРµСЃС‚Рѕ"} В· {selD.name}</h3>
              <label style={{ fontSize:12, fontWeight:600, color:T.mid, marginBottom:6, display:"block" }}>РќР°Р·РІР°РЅРёРµ *</label>
              <input value={np.name} onChange={e=>setNp({...np,name:e.target.value})} placeholder="РќР°Р·РІР°РЅРёРµ" style={{ ...iS, marginBottom:14 }} />
              <label style={{ fontSize:12, fontWeight:600, color:T.mid, marginBottom:6, display:"block" }}>РљР°С‚РµРіРѕСЂРёСЏ *</label>
              <select value={np.cat} onChange={e=>setNp({...np,cat:e.target.value})} style={{ ...iS, marginBottom:14, appearance:"none", color:np.cat?T.text:T.light }}>
                <option value="">Р’С‹Р±РµСЂРёС‚Рµ</option>{PLACE_CATS.map(c=><option key={c.id} value={c.id}>{c.icon} {c.title}</option>)}
              </select>
              <label style={{ fontSize:12, fontWeight:600, color:T.mid, marginBottom:6, display:"block" }}>РђРґСЂРµСЃ</label>
              <input value={np.address} onChange={e=>{setNp({...np,address:e.target.value}); setAddrValidPlace(false);}} placeholder="РђРґСЂРµСЃ" style={{ ...iS, marginBottom:6, borderColor:np.address && !addrValidPlace ? "#f5b7b1" : T.border }} />
              {addrLoadingPlace && <div style={{ fontSize:12, color:T.mid, marginBottom:8 }}>РС‰РµРј Р°РґСЂРµСЃ...</div>}
              {!addrLoadingPlace && addrOptionsPlace.length > 0 && !addrValidPlace && (
                <div style={{ marginBottom:10, border:`1px solid ${T.border}`, borderRadius:10, overflow:"hidden", maxHeight:160, overflowY:"auto", background:T.card }}>
                  {addrOptionsPlace.map((opt, i) => (
                    <button key={`${opt.value}-${i}`} onClick={() => { setNp(prev => ({ ...prev, address: opt.value })); setAddrValidPlace(true); setAddrOptionsPlace([]); }} style={{ width:"100%", textAlign:"left", padding:"10px 12px", border:"none", borderBottom:i < addrOptionsPlace.length-1 ? `1px solid ${T.borderL}` : "none", background:T.card, cursor:"pointer", fontFamily:"inherit", fontSize:12, color:T.mid }}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
              {np.address && !addrValidPlace && <div style={{ fontSize:12, color:"#E74C3C", marginBottom:10 }}>Р’С‹Р±РµСЂРёС‚Рµ Р°РґСЂРµСЃ РёР· РїРѕРґСЃРєР°Р·РѕРє.</div>}
              <label style={{ fontSize:12, fontWeight:600, color:T.mid, marginBottom:6, display:"block" }}>РљРѕРјРјРµРЅС‚Р°СЂРёР№ *</label>
              <textarea value={np.tip} onChange={e=>setNp({...np,tip:e.target.value})} placeholder="Р’Р°С€ РѕС‚Р·С‹РІ, СЃРѕРІРµС‚, СЂРµРєРѕРјРµРЅРґР°С†РёСЏ..." style={{ ...iS, minHeight:80, resize:"vertical", marginBottom:14 }} />
              <input ref={fileRef} type="file" accept="image/*" multiple onChange={handlePhotos} style={{ display:"none" }} />
              <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:20 }}>
                {nPhotos.map((p,i) => (<div key={i} style={{ position:"relative", width:60, height:60, borderRadius:8, overflow:"hidden", border:`1px solid ${T.border}`, flexShrink:0 }}>{p.preview ? <img src={p.preview} alt="" style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }} /> : <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:"100%", background:T.bg, fontSize:10, color:T.mid, padding:4 }}>рџ“·</div>}<button onClick={()=>setNPhotos(pr=>pr.filter((_,j)=>j!==i))} style={{ position:"absolute", top:2, right:2, background:"rgba(0,0,0,0.5)", border:"none", color:"#fff", cursor:"pointer", borderRadius:"50%", width:18, height:18, fontSize:10, display:"flex", alignItems:"center", justifyContent:"center", padding:0 }}>вњ•</button></div>))}
                {nPhotos.length<5 && <button onClick={()=>fileRef.current?.click()} style={{ padding:"6px 14px", background:T.bg, border:`1.5px dashed ${T.border}`, borderRadius:8, color:T.primary, fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>пј‹ Р¤РѕС‚Рѕ</button>}
              </div>
              <div style={{ display:"flex", gap:10 }}><button onClick={()=>{setShowAdd(false);setNPhotos([])}} style={{ ...pl(false), flex:1, padding:14 }}>РћС‚РјРµРЅР°</button><button onClick={handleAddPlace} disabled={!np.name||!np.cat||!np.tip||uploading} style={{ ...pl(true), flex:2, padding:14, opacity:(!np.name||!np.cat||!np.tip||uploading)?0.5:1 }}>{uploading ? 'вЏі Р—Р°РіСЂСѓР·РєР°...' : editingPlace ? 'РЎРѕС…СЂР°РЅРёС‚СЊ' : 'РћРїСѓР±Р»РёРєРѕРІР°С‚СЊ'}</button></div>
            </>)}
          </div>
        </div>)}

        {/* PLACES IN CATEGORY */}
        {scr==="places-cat" && selPC && selD && (<div>
          <button onClick={() => { setScr("district"); setSelPC(null); setSelPlace(null); }} style={bk}>← {selD.name}</button>
          <div style={{ display:"flex", alignItems:"center", gap:12, margin:"4px 0 12px" }}>
            <div style={{ width:44, height:44, borderRadius:12, background:`${selPC.color}12`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:24 }}>{selPC.icon}</div>
            <div><h2 style={{ fontSize:20, fontWeight:700, margin:0 }}>{selPC.title}</h2><p style={{ fontSize:13, color:T.mid, margin:0 }}>{selD.name} · {cPlaces.length} мест</p></div>
          </div>
          {cPlaces.length > 0 && (
            <button onClick={() => openAllOnMap(cPlaces)} style={{ ...pl(true), width:"100%", padding:"12px 0", display:"flex", alignItems:"center", justifyContent:"center", gap:8, fontSize:13, marginBottom:16 }}>🗺️ Показать все на карте</button>
          )}
          {cPlaces.map((p) => (
            <div key={p.id} style={{ ...cd, overflow:"hidden", marginBottom:12, borderColor:T.borderL }}>
              <div onClick={() => { setSelPlace(p); setScr("place-item"); }} style={{ padding:16, cursor:"pointer" }} onMouseEnter={e=>{e.currentTarget.style.background=T.bg}} onMouseLeave={e=>{e.currentTarget.style.background=T.card}}>
                <div style={{ display:"flex", gap:14 }}>
                  <div style={{ width:50, height:50, borderRadius:14, background:`${selPC.color}10`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:26, flexShrink:0 }}>{p.img}</div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:700, fontSize:16 }}>{p.name}</div>
                    <button onClick={(e)=>{e.stopPropagation(); openAddressInMaps(p.address || selD.name);}} style={{ marginTop:3, padding:0, border:"none", background:"none", color:T.mid, fontSize:12, cursor:"pointer", fontFamily:"inherit", textAlign:"left" }}>📍 {p.address||selD.name}</button>
                  </div>
                </div>
                <div style={{ marginTop:12, padding:12, background:T.bg, borderRadius:10, borderLeft:`3px solid ${selPC.color}` }}><div style={{ fontSize:13, color:T.mid }}>💡 {p.tip}</div></div>
                <div style={{ display:"flex", justifyContent:"space-between", marginTop:10 }}><div style={{ fontSize:11, color:T.light }}>от {p.addedBy}</div><span style={{ fontSize:11, color:T.light }}>→</span></div>
              </div>
            </div>
          ))}
          <button onClick={() => { openAddForm(); }} style={{ ...cd, width:"100%", marginTop:4, padding:16, border:`2px dashed ${T.primary}40`, color:T.primary, fontWeight:600, fontSize:14, cursor:"pointer", fontFamily:"inherit", display:"flex", alignItems:"center", justifyContent:"center", gap:6, boxShadow:"none" }}>＋ Добавить</button>
        </div>)}

        {/* PLACE ITEM */}
        {scr==="place-item" && placeItem && selPC && selD && (<div>
          <button onClick={() => { setScr("places-cat"); setSelPlace(null); }} style={bk}>← {selPC.title}</button>
          <div style={{ ...cd, overflow:"hidden", borderColor:T.primary+"40" }}>
            <div style={{ padding:16 }}>
              <div style={{ display:"flex", gap:14 }}>
                <div style={{ width:50, height:50, borderRadius:14, background:`${selPC.color}10`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:26, flexShrink:0 }}>{placeItem.img}</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:700, fontSize:18 }}>{placeItem.name}</div>
                  <button onClick={() => openAddressInMaps(placeItem.address || selD.name)} style={{ marginTop:3, padding:0, border:"none", background:"none", color:T.mid, fontSize:13, cursor:"pointer", fontFamily:"inherit", textAlign:"left" }}>📍 {placeItem.address || selD.name}</button>
                </div>
              </div>
              <div style={{ marginTop:12, padding:12, background:T.bg, borderRadius:10, borderLeft:`3px solid ${selPC.color}` }}><div style={{ fontSize:13, color:T.mid }}>💡 {placeItem.tip}</div></div>
              <div style={{ fontSize:11, color:T.light, marginTop:10 }}>от {placeItem.addedBy}</div>
            </div>
            {placeItem.photos?.length>0 && <div style={{ padding:"0 16px 0" }}><div style={{ display:"flex", gap:8, overflowX:"auto", paddingBottom:8, scrollSnapType:"x mandatory" }}>{placeItem.photos.map((ph,pi)=><div key={pi} style={{ minWidth:92, width:92, height:92, borderRadius:12, background:T.bg, border:`1px solid ${T.border}`, overflow:"hidden", flexShrink:0, scrollSnapAlign:"start" }}>{typeof ph === 'string' && (ph.startsWith('http') || ph.startsWith('blob:')) ? <img src={ph} alt="" style={{ width:"100%", height:"100%", objectFit:"cover", display:"block", cursor:"zoom-in" }} onClick={()=>setPhotoViewer(ph)} onError={e=>{e.target.style.display='none'}} /> : <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:"100%", padding:8 }}><span style={{ fontSize:12, color:T.mid }}>{String(ph)}</span></div>}</div>)}</div>{placeItem.photos.length > 1 && <div style={{ fontSize:11, color:T.light, marginTop:2, paddingBottom:8 }}>Листайте фото →</div>}</div>}
            <div style={{ padding:"14px 16px 12px", display:"flex", gap:14, alignItems:"center", borderTop:`1px solid ${T.borderL}` }}>
              <button onClick={()=>handleToggleLike(placeItem.id,"place")} style={{ background:"none", border:"none", cursor:"pointer", fontFamily:"inherit", display:"flex", alignItems:"center", gap:5, fontSize:18, color:liked[`place-${placeItem.id}`]?"#E74C3C":T.mid, padding:0 }} title="Нравится">{liked[`place-${placeItem.id}`] ? "♥" : "♡"} <span style={{ fontSize:14 }}>{placeItem.likes||0}</span></button>
              <button onClick={()=>setShowComments(`place-${placeItem.id}`)} style={{ background:"none", border:"none", cursor:"pointer", fontFamily:"inherit", display:"flex", alignItems:"center", gap:5, fontSize:18, color:T.mid, padding:0 }} title="Комментарии">◌ <span style={{ fontSize:14 }}>{(placeItem.comments||[]).length}</span></button>
              <button onClick={()=>handleNativeShare({title:placeItem.name,text:placeItem.tip,url:window.location.href})} style={{ marginLeft:"auto", background:"none", border:"none", cursor:"pointer", fontFamily:"inherit", fontSize:18, color:T.mid, padding:0 }} title="Поделиться">➤</button>
            </div>
            {renderComments(placeItem, "place", addPlaceComment)}
            {user && (user.id === placeItem.userId || user.name === placeItem.addedBy) && (
              <div style={{ padding:"0 16px 16px", display:"flex", gap:8 }}>
                <button onClick={()=>startEditPlace(placeItem)} style={{ flex:1, padding:"10px 0", borderRadius:24, border:`1.5px solid ${T.border}`, cursor:"pointer", fontFamily:"inherit", display:"flex", alignItems:"center", justifyContent:"center", gap:4, fontSize:12, fontWeight:600, background:T.card, color:T.mid }}>✏️ Редактировать</button>
                <button onClick={()=>handleDeletePlace(placeItem.id)} style={{ flex:1, padding:"10px 0", borderRadius:24, border:"1.5px solid #fecaca", cursor:"pointer", fontFamily:"inherit", display:"flex", alignItems:"center", justifyContent:"center", gap:4, fontSize:12, fontWeight:600, background:"#FFF5F5", color:"#E74C3C" }}>🗑 Удалить</button>
              </div>
            )}
          </div>
        </div>)}

        {/* TIPS */}
        {scr==="tips" && !selTC && (<div>
          <button onClick={goHome} style={bk}>в†ђ Р“Р»Р°РІРЅР°СЏ</button>
          <h2 style={{ fontSize:20, fontWeight:700, margin:"4px 0 4px" }}>рџ’Ў РЎРѕРІРµС‚С‹ РїРѕ Р¶РёР·РЅРё РІ LA</h2>
          <p style={{ fontSize:13, color:T.mid, margin:"0 0 16px" }}>РћРїС‹С‚ РѕС‚ СЃРІРѕРёС… вЂ” Р»Р°Р№С„С…Р°РєРё, С‡Р°РµРІС‹Рµ, Р±Р°РЅРєРё, РІСЂР°С‡Рё</p>
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {TIPS_CATS.map((c, i) => { const cnt = tips.filter(t=>t.cat===c.id).length; return (
              <button key={c.id} onClick={() => { setSelTC(c); }}
                style={{ ...cd, display:"flex", alignItems:"center", gap:14, padding:"16px", cursor:"pointer", fontFamily:"inherit", color:T.text, textAlign:"left" }}
                onMouseEnter={e=>{e.currentTarget.style.boxShadow=T.shH}} onMouseLeave={e=>{e.currentTarget.style.boxShadow=T.sh}}>
                <div style={{ width:48, height:48, borderRadius:T.rs, background:T.primaryLight, display:"flex", alignItems:"center", justifyContent:"center", fontSize:24, flexShrink:0 }}>{c.icon}</div>
                <div style={{ flex:1 }}><div style={{ fontWeight:700, fontSize:15 }}>{c.title}</div><div style={{ fontSize:12, color:T.mid, marginTop:2 }}>{c.desc}</div></div>
                {cnt > 0 && <span style={{ fontSize:13, fontWeight:700, color:T.primary }}>{cnt}</span>}
              </button>
            ); })}
          </div>
        </div>)}

        {/* TIPS CATEGORY */}
        {scr==="tips" && selTC && (<div>
          <button onClick={() => setSelTC(null)} style={bk}>в†ђ Р’СЃРµ СЃРѕРІРµС‚С‹</button>
          <div style={{ display:"flex", alignItems:"center", gap:12, margin:"4px 0 18px" }}>
            <div style={{ width:48, height:48, borderRadius:14, background:T.primaryLight, display:"flex", alignItems:"center", justifyContent:"center", fontSize:26 }}>{selTC.icon}</div>
            <div><h2 style={{ fontSize:20, fontWeight:700, margin:0 }}>{selTC.title}</h2><p style={{ fontSize:13, color:T.mid, margin:0 }}>{selTC.desc}</p></div>
          </div>
          {catTips.map((tip, i) => { const isE = expTip===tip.id; const isL = liked[`tip-${tip.id}`]; return (
            <div key={tip.id} style={{ ...cd, marginBottom:12, overflow:"hidden", borderColor:isE?T.primary+"40":T.borderL }}>
              <div onClick={() => setExpTip(isE?null:tip.id)} style={{ padding:16, cursor:"pointer" }} onMouseEnter={e=>{e.currentTarget.style.background=T.bg}} onMouseLeave={e=>{e.currentTarget.style.background=T.card}}>
                <div style={{ fontWeight:700, fontSize:16, marginBottom:6 }}>{tip.title}</div>
                <div style={{ fontSize:13, lineHeight:1.6, color:T.mid, whiteSpace:"pre-wrap" }}>{isE ? tip.text : tip.text.substring(0, 120) + (tip.text.length > 120 ? "..." : "")}</div>
                {isE && tip.photos?.length > 0 && (
                  <div style={{ display:"flex", gap:8, overflowX:"auto", marginTop:10, paddingBottom:4, scrollSnapType:"x mandatory" }}>
                    {tip.photos.map((ph, pi) => (
                      <img key={pi} src={ph} alt="" style={{ width:86, height:86, objectFit:"cover", borderRadius:10, border:`1px solid ${T.border}`, cursor:"zoom-in", flexShrink:0, scrollSnapAlign:"start" }} onClick={(e)=>{e.stopPropagation(); setPhotoViewer(ph);}} />
                    ))}
                  </div>
                )}
                {isE && tip.photos?.length > 1 && <div style={{ fontSize:11, color:T.light, marginTop:2 }}>Р›РёСЃС‚Р°Р№С‚Рµ С„РѕС‚Рѕ в†’</div>}
                <div style={{ display:"flex", justifyContent:"space-between", marginTop:10 }}>
                  <span style={{ fontSize:11, color:T.light }}>РѕС‚ {tip.author}</span>
                  <div style={{ display:"flex", gap:10, fontSize:12, color:T.mid }}>
                    <span>вќ¤пёЏ {tip.likes||0}</span>
                    <span>рџ’¬ {tip.comments.length}</span>
                    <span style={{ color:isE?T.primary:T.light, transform:isE?"rotate(180deg)":"", transition:"0.3s" }}>в–ј</span>
                  </div>
                </div>
              </div>
              {isE && (<div style={{ borderTop:`1px solid ${T.borderL}` }}>
                <div style={{ padding:"16px 16px 0", display:"none" }}>
                  <button onClick={(e) => { e.stopPropagation(); handleToggleLike(tip.id,"tip"); }} style={{ ...pl(isL), marginBottom:8, fontSize:12 }}>{isL ? "вќ¤пёЏ РџРѕРЅСЂР°РІРёР»РѕСЃСЊ" : "рџ¤Ќ РќСЂР°РІРёС‚СЃСЏ"}</button>
                </div>
                <div style={{ padding:"14px 16px 10px", display:"flex", gap:14, alignItems:"center" }}>
                  <button onClick={(e) => { e.stopPropagation(); handleToggleLike(tip.id,"tip"); }} style={{ background:"none", border:"none", cursor:"pointer", fontFamily:"inherit", display:"flex", alignItems:"center", gap:5, fontSize:18, color:isL?"#E74C3C":T.mid, padding:0 }} title="РќСЂР°РІРёС‚СЃСЏ">{isL ? "в™Ґ" : "в™Ў"} <span style={{ fontSize:14 }}>{tip.likes||0}</span></button>
                  <button onClick={(e)=>{e.stopPropagation(); setShowComments(`tip-${tip.id}`);}} style={{ background:"none", border:"none", cursor:"pointer", fontFamily:"inherit", display:"flex", alignItems:"center", gap:5, fontSize:18, color:T.mid, padding:0 }} title="РљРѕРјРјРµРЅС‚Р°СЂРёРё">в—Њ <span style={{ fontSize:14 }}>{(tip.comments||[]).length}</span></button>
                  <button onClick={(e)=>{e.stopPropagation(); handleNativeShare({ title:tip.title, text:tip.text, url:window.location.href });}} style={{ marginLeft:"auto", background:"none", border:"none", cursor:"pointer", fontFamily:"inherit", fontSize:18, color:T.mid, padding:0 }} title="РџРѕРґРµР»РёС‚СЊСЃСЏ">вћ¤</button>
                </div>
                {renderComments(tip, "tip", handleAddComment)}
              </div>)}
            </div>
          ); })}
          <button onClick={() => { if (!user) {handleLogin();return;} setNewTipPhotos([]); setShowAddTip(true); }} style={{ ...cd, width:"100%", marginTop:4, padding:16, border:`2px dashed ${T.primary}40`, color:T.primary, fontWeight:600, fontSize:14, cursor:"pointer", fontFamily:"inherit", display:"flex", alignItems:"center", justifyContent:"center", gap:6, boxShadow:"none" }}>пј‹ РџРѕРґРµР»РёС‚СЊСЃСЏ РѕРїС‹С‚РѕРј</button>
        </div>)}

        {/* ADD TIP MODAL */}
        {showAddTip && selTC && (<div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.4)", zIndex:100, display:"flex", alignItems:"flex-end", justifyContent:"center" }} onClick={()=>{setShowAddTip(false); setNewTipPhotos([]);}}>
          <div style={{ ...cd, width:"100%", maxWidth:480, borderRadius:"24px 24px 0 0", padding:"24px 20px 32px", maxHeight:"90vh", overflowY:"auto" }} onClick={e=>e.stopPropagation()}>
            <div style={{ width:40, height:4, borderRadius:2, background:T.border, margin:"0 auto 20px" }} />
            <h3 style={{ fontSize:18, fontWeight:700, margin:"0 0 20px" }}>{selTC.icon} РќРѕРІС‹Р№ СЃРѕРІРµС‚ В· {selTC.title}</h3>
            <label style={{ fontSize:12, fontWeight:600, color:T.mid, marginBottom:6, display:"block" }}>Р—Р°РіРѕР»РѕРІРѕРє *</label>
            <input value={newTip.title} onChange={e=>setNewTip({...newTip,title:e.target.value})} placeholder="Рћ С‡С‘Рј СЃРѕРІРµС‚?" style={{ ...iS, marginBottom:14 }} />
            <label style={{ fontSize:12, fontWeight:600, color:T.mid, marginBottom:6, display:"block" }}>РўРµРєСЃС‚ *</label>
            <textarea value={newTip.text} onChange={e=>setNewTip({...newTip,text:e.target.value})} placeholder="РџРѕРґРµР»РёС‚РµСЃСЊ РѕРїС‹С‚РѕРј..." style={{ ...iS, minHeight:120, resize:"vertical", marginBottom:20 }} />
            <input ref={tipFileRef} type="file" accept="image/*" multiple onChange={handleTipPhotos} style={{ display:"none" }} />
            <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:20 }}>
              {newTipPhotos.map((p,i) => (
                <div key={i} style={{ position:"relative", width:60, height:60, borderRadius:8, overflow:"hidden", border:`1px solid ${T.border}`, flexShrink:0 }}>
                  <img src={p.preview} alt="" style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }} />
                  <button onClick={()=>setNewTipPhotos(pr=>pr.filter((_,j)=>j!==i))} style={{ position:"absolute", top:2, right:2, background:"rgba(0,0,0,0.5)", border:"none", color:"#fff", cursor:"pointer", borderRadius:"50%", width:18, height:18, fontSize:10, display:"flex", alignItems:"center", justifyContent:"center", padding:0 }}>вњ•</button>
                </div>
              ))}
              {newTipPhotos.length < 3 && <button onClick={()=>tipFileRef.current?.click()} style={{ padding:"6px 14px", background:T.bg, border:`1.5px dashed ${T.border}`, borderRadius:8, color:T.primary, fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>пј‹ Р¤РѕС‚Рѕ (РґРѕ 3)</button>}
            </div>
            <div style={{ display:"flex", gap:10 }}><button onClick={()=>{setShowAddTip(false); setNewTipPhotos([]);}} style={{ ...pl(false), flex:1, padding:14 }}>РћС‚РјРµРЅР°</button><button onClick={handleAddTip} disabled={!newTip.title||!newTip.text} style={{ ...pl(true), flex:2, padding:14, opacity:(!newTip.title||!newTip.text)?0.5:1 }}>РћРїСѓР±Р»РёРєРѕРІР°С‚СЊ</button></div>
          </div>
        </div>)}

        {/* EVENTS */}
        {scr==="events" && !selEC && (<div>
          <button onClick={goHome} style={bk}>в†ђ Р“Р»Р°РІРЅР°СЏ</button>
          <h2 style={{ fontSize:20, fontWeight:700, margin:"4px 0 4px" }}>рџЋ‰ РЎРѕР±С‹С‚РёСЏ Рё РјРµСЂРѕРїСЂРёСЏС‚РёСЏ</h2>
          <p style={{ fontSize:13, color:T.mid, margin:"0 0 16px" }}>РљРѕРЅС†РµСЂС‚С‹, РїСЂР°Р·РґРЅРёРєРё, РІСЃС‚СЂРµС‡Рё РєРѕРјСЊСЋРЅРёС‚Рё</p>
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
          <button onClick={() => { setSelEC(null); setFilterDate(null); }} style={bk}>в†ђ Р’СЃРµ СЃРѕР±С‹С‚РёСЏ</button>
          <div style={{ display:"flex", alignItems:"center", gap:12, margin:"4px 0 12px" }}>
            <div style={{ width:48, height:48, borderRadius:14, background:`${selEC.color}12`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:26 }}>{selEC.icon}</div>
            <div><h2 style={{ fontSize:20, fontWeight:700, margin:0 }}>{selEC.title}</h2></div>
          </div>
          {/* Date filter bar */}
          <div style={{ marginBottom:16 }}>
            <div style={{ display:"flex", gap:6, alignItems:"stretch" }}>
              <div style={{ display:"flex", gap:6, overflowX:"auto", flex:1, paddingBottom:4, scrollSnapType:"x mandatory" }}>
                <button onClick={() => setFilterDate(null)}
                  style={{ padding:"8px 14px", borderRadius:12, border:`1.5px solid ${!filterDate?T.primary:T.border}`, background:!filterDate?T.primary:T.card, color:!filterDate?"#fff":T.mid, fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"inherit", flexShrink:0 }}>
                  Р’СЃРµ
                </button>
                {Array.from({length:7}, (_,i) => {
                  const d = new Date(); d.setDate(d.getDate()+i);
                  const dayNames = ["Р’СЃ","РџРЅ","Р’С‚","РЎСЂ","Р§С‚","РџС‚","РЎР±"];
                  const isActive = filterDate && new Date(filterDate).toDateString() === d.toDateString();
                  const isToday = i === 0;
                  return (
                    <button key={i} onClick={() => setFilterDate(isActive ? null : d.toISOString())}
                      style={{ padding:"6px 10px", borderRadius:12, border:`1.5px solid ${isActive?T.primary:T.border}`, background:isActive?T.primary:T.card, color:isActive?"#fff":T.text, fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"inherit", flexShrink:0, minWidth:46, textAlign:"center", display:"flex", flexDirection:"column", alignItems:"center", gap:2 }}>
                      <span style={{ fontSize:10, color:isActive?"#fff":T.light, fontWeight:400 }}>{isToday?"РЎРµРіРѕРґРЅСЏ":dayNames[d.getDay()]}</span>
                      <span style={{ fontSize:15, fontWeight:700 }}>{d.getDate()}</span>
                    </button>
                  );
                })}
              </div>
              {/* Calendar picker вЂ” always visible */}
              <div style={{ position:"relative", flexShrink:0 }}>
                <button onClick={() => setShowDatePicker(!showDatePicker)}
                  style={{ padding:"6px 12px", borderRadius:12, border:`1.5px solid ${showDatePicker?T.primary:T.border}`, background:showDatePicker?T.primaryLight:T.card, color:T.mid, fontSize:16, cursor:"pointer", fontFamily:"inherit", width:46, height:"100%", display:"flex", alignItems:"center", justifyContent:"center" }}>
                  рџ“…
                </button>
                {showDatePicker && (
                  <div style={{ position:"absolute", top:"100%", right:0, marginTop:4, zIndex:50 }}>
                    <input type="date" autoFocus onChange={e=>{setFilterDate(e.target.value+"T00:00"); setShowDatePicker(false);}}
                      style={{ ...iS, width:200, padding:"12px", boxShadow:T.shH, fontSize:16 }} />
                  </div>
                )}
              </div>
            </div>
            {filterDate && (
              <div style={{ fontSize:12, color:T.mid, marginTop:6, display:"flex", alignItems:"center", gap:6 }}>
                рџ“… {fmtDate(filterDate).split(",").slice(0,2).join(",")}
                <button onClick={() => setFilterDate(null)} style={{ background:"none", border:"none", color:T.primary, cursor:"pointer", fontSize:12, fontFamily:"inherit", fontWeight:600, padding:0 }}>вњ• СЃР±СЂРѕСЃРёС‚СЊ</button>
              </div>
            )}
          </div>
          {catEvents.map((ev, i) => { const isEvExp = exp === `ev-${ev.id}`; const eventWebsite = normalizeExternalUrl(ev.website); return (<div key={ev.id} style={{ ...cd, marginBottom:12, overflow:"hidden", borderColor:isEvExp?T.primary+"40":T.borderL }}>
            <div onClick={() => setExp(isEvExp?null:`ev-${ev.id}`)} style={{ padding:18, cursor:"pointer" }} onMouseEnter={e=>{e.currentTarget.style.background=T.bg}} onMouseLeave={e=>{e.currentTarget.style.background=T.card}}>
              <div style={{ fontWeight:700, fontSize:16, marginBottom:8 }}>{ev.title}</div>
              <div style={{ display:"flex", flexDirection:"column", gap:4, marginBottom:10 }}>
                <div style={{ fontSize:13, color:T.mid }}>рџ“… {fmtDate(ev.date)}</div>
                {ev.location && <button onClick={(e)=>{e.stopPropagation(); openAddressInMaps(ev.location);}} style={{ padding:0, border:"none", background:"none", fontSize:13, color:T.mid, cursor:"pointer", fontFamily:"inherit", textAlign:"left" }}>📍 {ev.location}</button>}
              </div>
              {isEvExp && eventWebsite && (
                <a href={eventWebsite} target="_blank" rel="noreferrer" onClick={(e)=>e.stopPropagation()} style={{ display:"inline-block", fontSize:13, color:T.primary, textDecoration:"none", marginBottom:10 }}>
                  РЎР°Р№С‚ РјРµСЂРѕРїСЂРёСЏС‚РёСЏ
                </a>
              )}
              <div style={{ fontSize:13, lineHeight:1.6, color:T.mid, marginBottom:10 }}>{ev.desc}</div>
              {isEvExp && ev.photos?.length > 0 && (
                <div style={{ display:"flex", gap:8, overflowX:"auto", marginBottom:10, paddingBottom:4, scrollSnapType:"x mandatory" }}>
                  {ev.photos.map((ph, pi) => (
                    <img key={pi} src={ph} alt="" style={{ width:86, height:86, objectFit:"cover", borderRadius:10, border:`1px solid ${T.border}`, cursor:"zoom-in", flexShrink:0, scrollSnapAlign:"start" }} onClick={(e)=>{e.stopPropagation(); setPhotoViewer(ph);}} />
                  ))}
                </div>
              )}
              {isEvExp && ev.photos?.length > 1 && <div style={{ fontSize:11, color:T.light, marginTop:-6, marginBottom:8 }}>Р›РёСЃС‚Р°Р№С‚Рµ С„РѕС‚Рѕ в†’</div>}
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <span style={{ fontSize:11, color:T.light }}>РѕС‚ {ev.author}</span>
                <div style={{ display:"flex", gap:10, fontSize:12, color:T.mid }}>
                  <span>вќ¤пёЏ {ev.likes}</span>
                  <span>рџ’¬ {(ev.comments||[]).length}</span>
                  <span style={{ fontSize:10, color:isEvExp?T.primary:T.light, transform:isEvExp?"rotate(180deg)":"", transition:"0.3s" }}>в–ј</span>
                </div>
              </div>
            </div>
            {isEvExp && (<div style={{ borderTop:`1px solid ${T.borderL}` }}>
              <div style={{ padding:"14px 16px 10px", display:"flex", gap:14, alignItems:"center" }}>
                <button onClick={(e)=>{e.stopPropagation(); handleToggleLike(ev.id,"event");}} style={{ background:"none", border:"none", cursor:"pointer", fontFamily:"inherit", display:"flex", alignItems:"center", gap:5, fontSize:18, color:liked[`event-${ev.id}`]?"#E74C3C":T.mid, padding:0 }} title="РќСЂР°РІРёС‚СЃСЏ">{liked[`event-${ev.id}`] ? "в™Ґ" : "в™Ў"} <span style={{ fontSize:14 }}>{ev.likes||0}</span></button>
                <button onClick={(e)=>{e.stopPropagation(); setShowComments(`event-${ev.id}`);}} style={{ background:"none", border:"none", cursor:"pointer", fontFamily:"inherit", display:"flex", alignItems:"center", gap:5, fontSize:18, color:T.mid, padding:0 }} title="РљРѕРјРјРµРЅС‚Р°СЂРёРё">в—Њ <span style={{ fontSize:14 }}>{(ev.comments||[]).length}</span></button>
                <button onClick={(e)=>{e.stopPropagation(); handleNativeShare({ title:ev.title, text:ev.desc, url:window.location.href });}} style={{ marginLeft:"auto", background:"none", border:"none", cursor:"pointer", fontFamily:"inherit", fontSize:18, color:T.mid, padding:0 }} title="РџРѕРґРµР»РёС‚СЊСЃСЏ">вћ¤</button>
              </div>
              {renderComments(ev, "event", addEventComment)}
              {user && (user.id === ev.userId || user.name === ev.author) && (
                <div style={{ padding:"0 16px 16px" }}>
                  <button onClick={(e)=>{e.stopPropagation(); startEditEvent(ev);}} style={{ width:"100%", padding:"10px 0", borderRadius:24, border:`1.5px solid ${T.primary}55`, cursor:"pointer", fontFamily:"inherit", fontSize:12, fontWeight:600, background:T.primaryLight, color:T.primary }}>Р РµРґР°РєС‚РёСЂРѕРІР°С‚СЊ СЃРѕР±С‹С‚РёРµ</button>
                </div>
              )}
            </div>)}
          </div>); })}
          {catEvents.length===0 && <p style={{ fontSize:13, color:T.mid, textAlign:"center", padding:20 }}>РџРѕРєР° РЅРµС‚ СЃРѕР±С‹С‚РёР№ РІ СЌС‚РѕР№ РєР°С‚РµРіРѕСЂРёРё</p>}
          <button onClick={() => { if (!user) {handleLogin();return;} setEditingEvent(null); setNewEvent({ title:"", date:"", location:"", desc:"", website:"", cat:selEC?.id||"" }); setNewEventPhotos([]); setAddrValidEvent(false); setAddrOptionsEvent([]); setShowAddEvent(true); }} style={{ ...cd, width:"100%", marginTop:4, padding:16, border:`2px dashed ${T.primary}40`, color:T.primary, fontWeight:600, fontSize:14, cursor:"pointer", fontFamily:"inherit", display:"flex", alignItems:"center", justifyContent:"center", gap:6, boxShadow:"none" }}>пј‹ Р”РѕР±Р°РІРёС‚СЊ СЃРѕР±С‹С‚РёРµ</button>
        </div>)}

        {/* ADD EVENT MODAL */}
        {showAddEvent && (<div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.4)", zIndex:100, display:"flex", alignItems:"flex-end", justifyContent:"center" }} onClick={()=>{setShowAddEvent(false); setNewEventPhotos([]); setAddrOptionsEvent([]); setAddrValidEvent(false); setEditingEvent(null);}}>
          <div style={{ ...cd, width:"100%", maxWidth:480, borderRadius:"24px 24px 0 0", padding:"24px 20px 32px", maxHeight:"90vh", overflowY:"auto" }} onClick={e=>e.stopPropagation()}>
            <div style={{ width:40, height:4, borderRadius:2, background:T.border, margin:"0 auto 20px" }} />
            {!user ? (<div style={{ textAlign:"center", padding:"20px 0" }}><div style={{ fontSize:48, marginBottom:16 }}>рџ”ђ</div><button onClick={handleLogin} style={{ ...pl(true), padding:"14px 28px" }}>Р’РѕР№С‚Рё С‡РµСЂРµР· Google</button></div>) : (<>
              <h3 style={{ fontSize:18, fontWeight:700, margin:"0 0 20px" }}>{editingEvent ? "вњЏпёЏ Р РµРґР°РєС‚РёСЂРѕРІР°С‚СЊ СЃРѕР±С‹С‚РёРµ" : "рџЋ‰ РќРѕРІРѕРµ СЃРѕР±С‹С‚РёРµ"}</h3>
              <label style={{ fontSize:12, fontWeight:600, color:T.mid, marginBottom:6, display:"block" }}>РќР°Р·РІР°РЅРёРµ *</label>
              <input value={newEvent.title} onChange={e=>setNewEvent({...newEvent,title:e.target.value})} placeholder="Р§С‚Рѕ Р·Р° РјРµСЂРѕРїСЂРёСЏС‚РёРµ?" style={{ ...iS, marginBottom:14 }} />
              <label style={{ fontSize:12, fontWeight:600, color:T.mid, marginBottom:6, display:"block" }}>РљР°С‚РµРіРѕСЂРёСЏ *</label>
              <select value={newEvent.cat} onChange={e=>setNewEvent({...newEvent,cat:e.target.value})} style={{ ...iS, marginBottom:14, appearance:"none", color:newEvent.cat?T.text:T.light }}>
                <option value="">Р’С‹Р±РµСЂРёС‚Рµ</option>{EVENT_CATS.map(c=><option key={c.id} value={c.id}>{c.icon} {c.title}</option>)}
              </select>
              <label style={{ fontSize:12, fontWeight:600, color:T.mid, marginBottom:6, display:"block" }}>Р”Р°С‚Р° Рё РІСЂРµРјСЏ *</label>
              <input type="datetime-local" value={newEvent.date} onChange={e=>setNewEvent({...newEvent,date:e.target.value})} style={{ ...iS, marginBottom:14 }} />
              <label style={{ fontSize:12, fontWeight:600, color:T.mid, marginBottom:6, display:"block" }}>РњРµСЃС‚Рѕ</label>
              <input value={newEvent.location} onChange={e=>{setNewEvent({...newEvent,location:e.target.value}); setAddrValidEvent(false);}} placeholder="РђРґСЂРµСЃ РёР»Рё РЅР°Р·РІР°РЅРёРµ РјРµСЃС‚Р°" style={{ ...iS, marginBottom:6, borderColor:newEvent.location && !addrValidEvent ? "#f5b7b1" : T.border }} />
              {addrLoadingEvent && <div style={{ fontSize:12, color:T.mid, marginBottom:8 }}>РС‰РµРј РјРµСЃС‚Рѕ...</div>}
              {!addrLoadingEvent && addrOptionsEvent.length > 0 && !addrValidEvent && (
                <div style={{ marginBottom:10, border:`1px solid ${T.border}`, borderRadius:10, overflow:"hidden", maxHeight:160, overflowY:"auto", background:T.card }}>
                  {addrOptionsEvent.map((opt, i) => (
                    <button key={`${opt.value}-${i}`} onClick={() => { setNewEvent(prev => ({ ...prev, location: opt.value })); setAddrValidEvent(true); setAddrOptionsEvent([]); }} style={{ width:"100%", textAlign:"left", padding:"10px 12px", border:"none", borderBottom:i < addrOptionsEvent.length-1 ? `1px solid ${T.borderL}` : "none", background:T.card, cursor:"pointer", fontFamily:"inherit", fontSize:12, color:T.mid }}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
              {newEvent.location && !addrValidEvent && <div style={{ fontSize:12, color:"#E74C3C", marginBottom:10 }}>Р’С‹Р±РµСЂРёС‚Рµ СЂРµР°Р»СЊРЅРѕРµ РјРµСЃС‚Рѕ РёР· РїРѕРґСЃРєР°Р·РѕРє.</div>}
              <label style={{ fontSize:12, fontWeight:600, color:T.mid, marginBottom:6, display:"block" }}>РћРїРёСЃР°РЅРёРµ *</label>
              <textarea value={newEvent.desc} onChange={e=>setNewEvent({...newEvent,desc:e.target.value})} placeholder="РџРѕРґСЂРѕР±РЅРѕСЃС‚Рё..." style={{ ...iS, minHeight:80, resize:"vertical", marginBottom:14 }} />
              <label style={{ fontSize:12, fontWeight:600, color:T.mid, marginBottom:6, display:"block" }}>РЎР°Р№С‚ (РЅРµРѕР±СЏР·Р°С‚РµР»СЊРЅРѕ)</label>
              <input value={newEvent.website || ""} onChange={e=>setNewEvent({...newEvent,website:e.target.value})} placeholder="https://..." style={{ ...iS, marginBottom:20 }} />
              <input ref={eventFileRef} type="file" accept="image/*" multiple onChange={handleEventPhotos} style={{ display:"none" }} />
              <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:20 }}>
                {newEventPhotos.map((p,i) => (
                  <div key={i} style={{ position:"relative", width:60, height:60, borderRadius:8, overflow:"hidden", border:`1px solid ${T.border}`, flexShrink:0 }}>
                    <img src={p.preview} alt="" style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }} />
                    <button onClick={()=>setNewEventPhotos(pr=>pr.filter((_,j)=>j!==i))} style={{ position:"absolute", top:2, right:2, background:"rgba(0,0,0,0.5)", border:"none", color:"#fff", cursor:"pointer", borderRadius:"50%", width:18, height:18, fontSize:10, display:"flex", alignItems:"center", justifyContent:"center", padding:0 }}>вњ•</button>
                  </div>
                ))}
                {newEventPhotos.length < 3 && <button onClick={()=>eventFileRef.current?.click()} style={{ padding:"6px 14px", background:T.bg, border:`1.5px dashed ${T.border}`, borderRadius:8, color:T.primary, fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>пј‹ Р¤РѕС‚Рѕ (РґРѕ 3)</button>}
              </div>
              <div style={{ display:"flex", gap:10 }}>
                <button onClick={()=>{setShowAddEvent(false); setNewEventPhotos([]); setAddrOptionsEvent([]); setAddrValidEvent(false); setEditingEvent(null);}} style={{ ...pl(false), flex:1, padding:14 }}>РћС‚РјРµРЅР°</button>
                {editingEvent && <button onClick={()=>handleDeleteEvent(editingEvent.id)} style={{ ...pl(false), flex:1, padding:14, border:"1.5px solid #fecaca", color:"#E74C3C", background:"#FFF5F5" }}>РЈРґР°Р»РёС‚СЊ</button>}
                <button onClick={handleAddEvent} disabled={!newEvent.title||!newEvent.date||!newEvent.desc||!newEvent.cat} style={{ ...pl(true), flex:2, padding:14, opacity:(!newEvent.title||!newEvent.date||!newEvent.desc||!newEvent.cat)?0.5:1 }}>{editingEvent ? "РЎРѕС…СЂР°РЅРёС‚СЊ" : "РћРїСѓР±Р»РёРєРѕРІР°С‚СЊ"}</button>
              </div>
            </>)}
          </div>
        </div>)}

        {/* CHAT */}
        {scr==="chat" && (<div style={{ display:"flex", flexDirection:"column", height:"calc(100vh - 120px)" }}>
          <button onClick={goHome} style={bk}>в†ђ Р“Р»Р°РІРЅР°СЏ</button>
          {!user ? (<div style={{ textAlign:"center", padding:"40px 20px" }}><div style={{ fontSize:48, marginBottom:16 }}>рџ”ђ</div><h3 style={{ fontSize:18, fontWeight:700, margin:"0 0 20px" }}>Р’РѕР№РґРёС‚Рµ РґР»СЏ AI-С‡Р°С‚Р°</h3><button onClick={handleLogin} style={{ ...pl(true), padding:"14px 28px" }}>Р’РѕР№С‚Рё С‡РµСЂРµР· Google</button></div>) : (<>
            <div style={{ flex:1, overflowY:"auto", paddingBottom:12 }}>
              {chat.map((m,i) => (<div key={i} style={{ display:"flex", justifyContent:m.role==="user"?"flex-end":"flex-start", marginBottom:10 }}>
                <div style={{ maxWidth:"85%", padding:"12px 16px", borderRadius:m.role==="user"?"18px 18px 4px 18px":"18px 18px 18px 4px", background:m.role==="user"?T.primary:T.card, color:m.role==="user"?"#fff":T.text, fontSize:14, lineHeight:1.55, boxShadow:m.role==="user"?"0 2px 10px rgba(244,123,32,0.25)":T.sh, border:m.role==="user"?"none":`1px solid ${T.borderL}`, whiteSpace:"pre-wrap" }}>{m.text}</div>
              </div>))}
              {typing && <div style={{ display:"flex", marginBottom:10 }}><div style={{ ...cd, padding:"14px 20px", display:"flex", gap:5 }}>{[0,1,2].map(j=><div key={j} style={{ width:7, height:7, borderRadius:"50%", background:T.primary, opacity:0.4, animation:`pulse 1.2s ease ${j*0.2}s infinite` }} />)}</div></div>}
              <div ref={chatEnd} />
            </div>
            {chat.length<=1 && <div style={{ marginBottom:12 }}><div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>{["Р“СЂРёРЅ-РєР°СЂС‚Р° С‡РµСЂРµР· Р±СЂР°Рє?","РЎС‚РѕРёРјРѕСЃС‚СЊ N-400?","Р Р°Р±РѕС‚Р° Р±РµР· EAD?","РЎС‚Р°С‚СѓСЃ РєРµР№СЃР°?"].map((s,i)=><button key={i} onClick={()=>handleSend(s)} style={pl(false)}>{s}</button>)}</div></div>}
            <div style={{ display:"flex", gap:8, padding:"12px 0", borderTop:`1px solid ${T.borderL}` }}>
              <input ref={inpRef} value={inp} onChange={e=>setInp(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleSend()} placeholder="Р—Р°РґР°Р№С‚Рµ РІРѕРїСЂРѕСЃ..." style={{ ...iS, flex:1, width:"auto" }} />
              <button onClick={()=>handleSend()} disabled={!inp.trim()} style={{ width:48, height:48, borderRadius:14, border:"none", background:inp.trim()?T.primary:T.bg, color:inp.trim()?"#fff":T.light, fontSize:20, cursor:inp.trim()?"pointer":"default", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>в†‘</button>
            </div>
          </>)}
        </div>)}
      </main>

      {photoViewer && (
        <div onClick={() => setPhotoViewer(null)} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.72)", zIndex:300, display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}>
          <img src={photoViewer} alt="" style={{ maxWidth:"100%", maxHeight:"88vh", borderRadius:12, boxShadow:"0 10px 36px rgba(0,0,0,0.4)" }} />
        </div>
      )}

      <style>{`
        @keyframes pulse { 0%,100% { opacity:.3; transform:scale(1) } 50% { opacity:1; transform:scale(1.2) } }
        input::placeholder, textarea::placeholder { color:#BBB }
        * { box-sizing:border-box; -webkit-tap-highlight-color:transparent; -webkit-text-size-adjust:100% }
        html { touch-action:manipulation }
        ::-webkit-scrollbar { width:3px; height:3px }
        ::-webkit-scrollbar-thumb { background:#D5D5D5; border-radius:3px }
        button:active { transform:scale(0.97) }
        select { cursor:pointer }
        input, textarea, select { font-size:16px !important }
      `}</style>
    </div>
  );
}









