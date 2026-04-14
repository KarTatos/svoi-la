'use client';
import { useState, useEffect, useRef } from "react";
import { signInWithGoogle, signOut, getUser, getPlaces as fetchPlaces, addPlace as dbAddPlace, updatePlace as dbUpdatePlace, deletePlace as dbDeletePlace, getTips as fetchTips, addTip as dbAddTip, deleteTip as dbDeleteTip, getEvents as fetchEvents, addEvent as dbAddEvent, updateEvent as dbUpdateEvent, deleteEvent as dbDeleteEvent, getAllComments, addComment as dbAddComment, updateComment as dbUpdateComment, deleteComment as dbDeleteComment, toggleLike as dbToggleLike, getUserLikes, uploadPhoto } from "../lib/supabase";

const T = { primary: "#F47B20", primaryLight: "#FFF3E8", bg: "#F2F2F7", card: "#FFFFFF", text: "#1A1A1A", mid: "#6B6B6B", light: "#999", border: "#E5E5E5", borderL: "#F0F0F0", sh: "0 2px 12px rgba(0,0,0,0.06)", shH: "0 4px 20px rgba(0,0,0,0.1)", r: 16, rs: 12 };

const DISTRICTS = [
  { id:"weho", name:"West Hollywood", emoji:"🌴", desc:"Restaurants, nightlife", lat:34.0900, lng:-118.3617 },
  { id:"hollywood", name:"Hollywood", emoji:"⭐", desc:"Bars, hiking, concerts", lat:34.0928, lng:-118.3287 },
  { id:"glendale", name:"Glendale", emoji:"🏔️", desc:"Family spots, food", lat:34.1425, lng:-118.2551 },
  { id:"dtla", name:"Downtown LA", emoji:"🏙️", desc:"Coffee, books, lofts", lat:34.0407, lng:-118.2468 },
  { id:"valley", name:"Studio City / Valley", emoji:"🎬", desc:"Speakeasy bars", lat:34.1486, lng:-118.3965 },
  { id:"silverlake", name:"Silver Lake / Los Feliz", emoji:"🎨", desc:"Indie, observatory", lat:34.0869, lng:-118.2702 },
  { id:"westside", name:"Santa Monica / Venice", emoji:"🏖️", desc:"Beach, canals", lat:34.0195, lng:-118.4912 },
  { id:"pasadena", name:"Pasadena", emoji:"🌸", desc:"Nature, trails", lat:34.1478, lng:-118.1445 },
  { id:"midcity", name:"Mid-City / Melrose", emoji:"🛍️", desc:"Shopping, cafes", lat:34.0771, lng:-118.3442 },
];

const PLACE_CATS = [
  { id:"restaurants", icon:"🍽️", title:"Рестораны", color:"#E74C3C" },
  { id:"bars", icon:"🍸", title:"Бары", color:"#8E44AD" },
  { id:"coffee", icon:"☕", title:"Кофе", color:"#F47B20" },
  { id:"hiking", icon:"🥾", title:"Хайкинг", color:"#27AE60" },
  { id:"interesting", icon:"✨", title:"Интересно", color:"#2980B9" },
  { id:"music", icon:"🎵", title:"Музыка", color:"#E91E8C" },
];

const PLACE_CAT_IDS = new Set(PLACE_CATS.map((c) => c.id));

const BASE_INIT_PLACES = [
  { id:1, cat:"restaurants", district:"weho", name:"Тройка", address:"8826 Sunset Blvd, West Hollywood, CA", tip:"Пельмени. Четверг — живая музыка.", addedBy:"Мария К.", img:"🥟", photos:["🍽️ Уютный зал"], likes:34, comments:[{id:301,author:"Дима С.",text:"Лучшие пельмени в WeHo!"}] },
  { id:2, cat:"restaurants", district:"hollywood", name:"Sochi Restaurant", address:"5765 Melrose Ave, Hollywood, CA", tip:"Хинкали 10/10, хачапури огонь.", addedBy:"Дима С.", img:"🫓", photos:["☀️ Терраса"], likes:28, comments:[] },
  { id:3, cat:"restaurants", district:"glendale", name:"Ararat", address:"1000 S Glendale Ave, Glendale, CA", tip:"Армянская кухня, огромные порции.", addedBy:"Артур М.", img:"🍖", photos:[], likes:19, comments:[] },
  { id:4, cat:"bars", district:"valley", name:"The Other Door", address:"10437 Burbank Blvd, North Hollywood, CA", tip:"Speakeasy, пароль каждую неделю.", addedBy:"Алекс Р.", img:"🥃", photos:["🥃 Old Fashioned"], likes:52, comments:[{id:302,author:"Лена В.",text:"Пароль спрашивайте в инсте!"}] },
  { id:5, cat:"bars", district:"hollywood", name:"Davey Wayne's", address:"1611 N El Centro Ave, Hollywood, CA", tip:"Вход через холодильник!", addedBy:"Лена В.", img:"🪩", photos:[], likes:41, comments:[] },
  { id:6, cat:"coffee", district:"dtla", name:"Verve Coffee", address:"833 S Spring St, Los Angeles, CA", tip:"Pour-over. Лофт идеальный.", addedBy:"Саша К.", img:"☕", photos:[], likes:37, comments:[] },
  { id:7, cat:"hiking", district:"hollywood", name:"Runyon Canyon", address:"2000 N Fuller Ave, Los Angeles, CA", tip:"Правая тропа — виды лучше.", addedBy:"Макс Д.", img:"⛰️", photos:[], likes:23, comments:[] },
  { id:8, cat:"hiking", district:"pasadena", name:"Eaton Canyon Falls", address:"1750 N Altadena Dr, Pasadena, CA", tip:"Водопад 12м! Лёгкий маршрут.", addedBy:"Игорь Н.", img:"💧", photos:[], likes:48, comments:[] },
  { id:9, cat:"hiking", district:"silverlake", name:"Griffith Observatory", address:"2800 E Observatory Rd, Los Angeles, CA", tip:"На закате обязательно.", addedBy:"Катя Л.", img:"🌅", photos:[], likes:55, comments:[{id:303,author:"Макс Д.",text:"Парковка бесплатная после 6!"}] },
  { id:10, cat:"interesting", district:"dtla", name:"The Last Bookstore", address:"453 S Spring St, Los Angeles, CA", tip:"Тоннель из книг.", addedBy:"Вера П.", img:"📚", photos:[], likes:33, comments:[] },
  { id:11, cat:"music", district:"hollywood", name:"Hollywood Bowl", address:"2301 N Highland Ave, Los Angeles, CA", tip:"Своё вино можно!", addedBy:"Наташа Ф.", img:"🎶", photos:[], likes:61, comments:[] },
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
  Array.from({ length: 15 }, (_, i) => ({
    id: 20000 + catIndex * 100 + i,
    cat: cat.id,
    district: "weho",
    name: `${cat.title} ${i + 1}`,
    address: `${1000 + catIndex * 100 + i * 3} ${WEHO_STREETS[i % WEHO_STREETS.length]}, West Hollywood, CA`,
    tip: `Популярное место в категории "${cat.title}".`,
    addedBy: "Demo",
    img: cat.icon,
    photos: [],
    likes: 0,
    comments: [],
  }))
);

const INIT_PLACES = [...BASE_INIT_PLACES, ...WEHO_PREVIEW_PLACES];

const USCIS_CATS = [
  { id:"greencard", icon:"🪪", title:"Грин-карта", subtitle:"Получение, продление, условия", docs:[
    { form:"I-485", name:"Adjustment of Status", url:"https://www.uscis.gov/i-485", desc:"Заявление на грин-карту из США", detail:"Пошлина: $1,440 (вкл. биометрию). Обработка: 8-14 мес. Можно подавать одновременно с I-130 (concurrent filing). После подачи — запрос EAD и Advance Parole." },
    { form:"I-130", name:"Петиция для родственника", url:"https://www.uscis.gov/i-130", desc:"Спонсирование через семью", detail:"Пошлина: $535. Immediate Relatives (супруг, родители, дети до 21) — нет очереди. Preference categories — от 2 до 20+ лет в зависимости от категории." },
    { form:"I-140", name:"Петиция от работодателя", url:"https://www.uscis.gov/i-140", desc:"Employment-based грин-карта", detail:"Пошлина: $700. Категории: EB-1 (выдающиеся), EB-2 (продвинутые степени/NIW), EB-3 (квалифицированные). Premium processing: $2,805 (15 дней)." },
    { form:"I-751", name:"Снятие условий с грин-карты", url:"https://www.uscis.gov/i-751", desc:"Для conditional residents (через брак)", detail:"Подать за 90 дней до истечения 2-летней карты. Пошлина: $750. Совместная петиция с супругом. Waiver возможен если развод, abuse, или extreme hardship." },
    { form:"I-90", name:"Замена/продление грин-карты", url:"https://www.uscis.gov/i-90", desc:"Если потеряли или срок истёк", detail:"Подавать за 6 мес до истечения. Пошлина: $540. Receipt notice = доказательство статуса на 12-24 мес." },
    { form:"I-864", name:"Affidavit of Support", url:"https://www.uscis.gov/i-864", desc:"Финансовое поручительство спонсора", detail:"Спонсор доказывает доход ≥125% Federal Poverty Line. Обязательна для семейных петиций. Доход можно дополнить co-sponsor или активами." },
    { form:"I-693", name:"Медицинское обследование", url:"https://www.uscis.gov/i-693", desc:"Report of Medical Examination", detail:"Обязательна для I-485. Только у civil surgeon (список на uscis.gov). Прививки обязательны. Действует 2 года. Стоимость: $200-500 (платит заявитель)." },
    { form:"I-526", name:"Инвесторская петиция (EB-5)", url:"https://www.uscis.gov/i-526", desc:"Immigrant Investor Program", detail:"Инвестиция $800,000 (TEA) или $1,050,000. Создание 10 рабочих мест. Пошлина: $3,675. Сначала conditional грин-карта на 2 года, потом I-829." },
    { form:"I-829", name:"Снятие условий (EB-5)", url:"https://www.uscis.gov/i-829", desc:"Для инвесторов после 2 лет", detail:"Доказать что инвестиция сохранена и 10 рабочих мест создано. Пошлина: $3,750. Подать за 90 дней до истечения conditional карты." },
  ]},
  { id:"visa", icon:"✈️", title:"Визы", subtitle:"Рабочие, студенческие, гостевые", docs:[
    { form:"I-129", name:"H-1B рабочая виза", url:"https://www.uscis.gov/i-129", desc:"Для специалистов с образованием", detail:"Требует Bachelor's degree. Лотерея в марте, старт 1 октября. Пошлина: $780 + доп. сборы. Максимум 6 лет, можно продлить с I-140." },
    { form:"I-129F", name:"Виза жениха/невесты (K-1)", url:"https://www.uscis.gov/i-129f", desc:"Fiancé(e) Visa", detail:"Для невесты/жениха гражданина США. Пошлина: $535. После въезда — 90 дней на свадьбу, потом I-485. Обработка: 6-12 мес. + консульство." },
    { form:"I-20", name:"F-1 студенческая виза", url:"https://studyinthestates.dhs.gov", desc:"Форма от учебного заведения", detail:"Работа на кампусе до 20 ч/нед. После года — CPT/OPT (12 мес работы, STEM — 36 мес). SEVIS fee: $350." },
    { form:"DS-160", name:"Неиммиграционная виза", url:"https://ceac.state.gov/genniv/", desc:"Онлайн заявление для любой визы", detail:"Для B1/B2 (турист), H-1B, L-1, O-1 и др. Фото 5x5 см. После — запись на интервью в посольстве. Пошлина: $185 (B), $205 (H/L/O)." },
    { form:"I-539", name:"Продление/смена статуса", url:"https://www.uscis.gov/i-539", desc:"Extend or Change Status", detail:"Для продления B1/B2, смены с B на F-1, и т.д. Пошлина: $370. Подавать ДО истечения статуса. Обработка: 5-12 мес." },
    { form:"I-129S", name:"L-1 виза (внутри компании)", url:"https://www.uscis.gov/i-129s", desc:"Intracompany Transferee", detail:"Для менеджеров/специалистов переводимых из иностранного офиса. L-1A (менеджеры): до 7 лет. L-1B (специалисты): до 5 лет." },
    { form:"I-140/O-1", name:"O-1 виза для талантов", url:"https://www.uscis.gov/working-in-the-united-states/temporary-workers/o-1-visa", desc:"Extraordinary Ability", detail:"Для людей с выдающимися достижениями в науке, искусстве, образовании, бизнесе, спорте. Нет лимита, нет лотереи. Premium: 15 дней." },
  ]},
  { id:"citizenship", icon:"🇺🇸", title:"Гражданство", subtitle:"Натурализация и тест", docs:[
    { form:"N-400", name:"Заявление на натурализацию", url:"https://www.uscis.gov/n-400", desc:"Основная форма для гражданства", detail:"Грин-карта 5 лет (3 через брак). Присутствие в США 50%+ времени. Пошлина: $760. Тест: 10 вопросов, нужно 6 правильных. Интервью на английском." },
    { form:"N-600", name:"Сертификат о гражданстве", url:"https://www.uscis.gov/n-600", desc:"Если уже являетесь гражданином", detail:"Для получения документа если вы автоматически стали гражданином (через родителей). Пошлина: $1,170." },
    { form:"N-565", name:"Замена документа о натурализации", url:"https://www.uscis.gov/n-565", desc:"Замена/исправление сертификата", detail:"Если потеряли, испортили или нужно исправить данные в Certificate of Citizenship или Naturalization. Пошлина: $555." },
    { form:"Тест", name:"Civics Test — 100 Questions", desc:"Practice test right here!", detail:"On the interview you get 10 out of 100 questions. You must answer 6 correctly to pass.", isTest:true },
  ]},
  { id:"asylum", icon:"🛡️", title:"Убежище", subtitle:"Asylum, TPS, VAWA, U-visa", docs:[
    { form:"I-589", name:"Заявление на убежище", url:"https://www.uscis.gov/i-589", desc:"Подать в течение 1 года после въезда", detail:"БЕСПЛАТНО. Преследование по расе, религии, национальности, полит. взглядам, соц. группе. Affirmative — через USCIS, Defensive — через суд." },
    { form:"I-821", name:"TPS", url:"https://www.uscis.gov/i-821", desc:"Temporary Protected Status", detail:"Для граждан стран с войной/бедствиями. Даёт право работать. Перерегистрация каждые 6-18 мес. Список стран на uscis.gov." },
    { form:"I-360", name:"VAWA — самопетиция", url:"https://www.uscis.gov/i-360", desc:"Violence Against Women Act", detail:"Для жертв домашнего насилия от супруга-гражданина/резидента. БЕСПЛАТНО. Самопетиция — не нужно согласие абьюзера. Конфиденциально." },
    { form:"I-918", name:"U-виза (жертвы преступлений)", url:"https://www.uscis.gov/i-918", desc:"Для жертв тяжких преступлений", detail:"БЕСПЛАТНО. Нужна сертификация от полиции (форма I-918B). До 10,000 виз в год. Даёт право на работу и через 3 года — грин-карту." },
    { form:"I-914", name:"T-виза (жертвы траффикинга)", url:"https://www.uscis.gov/i-914", desc:"Trafficking Victims Protection", detail:"БЕСПЛАТНО. Для жертв торговли людьми. До 5,000 виз в год. Право на работу, через 3 года — грин-карта." },
  ]},
  { id:"travel", icon:"🌍", title:"Путешествия", subtitle:"Выезд, возвращение, документы", docs:[
    { form:"I-131", name:"Travel Document / Advance Parole", url:"https://www.uscis.gov/i-131", desc:"Разрешение на выезд и возврат", detail:"Необходим если pending I-485. Без AP выезд = отказ от заявления. $0 если с I-485. Combo card (EAD/AP) автоматически." },
    { form:"I-131A", name:"Travel Document (carrier)", url:"https://www.uscis.gov/i-131a", desc:"Для резидентов за рубежом", detail:"Если грин-карта утеряна за границей или нужен boarding foil. Подаётся в посольстве. Пошлина: $575." },
    { form:"I-94", name:"Запись о прибытии/отъезде", url:"https://i94.cbp.dhs.gov/", desc:"Arrival/Departure Record", detail:"Электронная форма. Проверьте на i94.cbp.dhs.gov. Показывает ваш статус и дату, до которой можно находиться в США. ВАЖНО для подсчёта дней." },
    { form:"AR-11", name:"Смена адреса", url:"https://www.uscis.gov/ar-11", desc:"Уведомление о переезде", detail:"ОБЯЗАТЕЛЬНО уведомить USCIS в течение 10 дней после переезда. БЕСПЛАТНО. Онлайн на uscis.gov. Штраф за неуведомление." },
  ]},
  { id:"work", icon:"💼", title:"Работа", subtitle:"Разрешения, SSN, проверки", docs:[
    { form:"I-765", name:"Разрешение на работу (EAD)", url:"https://www.uscis.gov/i-765", desc:"Employment Authorization Document", detail:"Для тех без рабочей визы: pending I-485, asylum, TPS, OPT. $0 если с I-485, иначе $410. Действует 1-2 года." },
    { form:"SS-5", name:"Заявление на SSN", url:"https://www.ssa.gov/forms/ss-5.pdf", desc:"Social Security Number", detail:"БЕСПЛАТНО. В офисе SSA. Нужен паспорт + разрешение на работу. Карта через 2-4 недели. Нужен для работы, налогов, кредита." },
    { form:"I-9", name:"Проверка права на работу", url:"https://www.uscis.gov/i-9", desc:"Employment Eligibility Verification", detail:"Каждый работодатель обязан заполнить. Работник предоставляет документы (List A: паспорт+EAD, или List B+C). E-Verify — электронная проверка." },
    { form:"I-140", name:"PERM / Labor Certification", url:"https://www.dol.gov/agencies/eta/foreign-labor/permanent", desc:"Трудовая сертификация для грин-карты", detail:"Работодатель доказывает что нет американских кандидатов. Через Department of Labor. Занимает 6-18 мес. Обязательно для EB-2/EB-3." },
    { form:"W-7", name:"ITIN — налоговый номер", url:"https://www.irs.gov/forms-pubs/about-form-w-7", desc:"Для тех кто не может получить SSN", detail:"Individual Taxpayer Identification Number. Для подачи налогов без SSN. БЕСПЛАТНО. Подаётся с налоговой декларацией. Действует 3 года." },
    { form:"G-1145", name:"Электронное уведомление", url:"https://www.uscis.gov/g-1145", desc:"e-Notification of Application", detail:"БЕСПЛАТНО. Получайте SMS/email когда USCIS получит вашу форму. Прикладывается к любому заявлению. Настоятельно рекомендуется." },
  ]},
];

// ─── ENGLISH Civics Test with correct answer index ───
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

// ─── TIPS CATEGORIES ───
const TIPS_CATS = [
  { id:"tipping", icon:"💰", title:"Чаевые", desc:"Сколько оставлять и где" },
  { id:"driving", icon:"🚗", title:"Вождение", desc:"Права, DMV, правила" },
  { id:"banking", icon:"🏦", title:"Банки и кредит", desc:"Счета, SSN, кредитная история" },
  { id:"health", icon:"🏥", title:"Медицина", desc:"Страховка, врачи, аптеки" },
  { id:"shopping", icon:"🛒", title:"Покупки", desc:"Где дешевле, возврат, налог" },
  { id:"social", icon:"🤝", title:"Общение", desc:"Культура, small talk, этикет" },
  { id:"housing", icon:"🏠", title:"Жильё", desc:"Аренда, депозит, права" },
  { id:"other", icon:"📝", title:"Разное", desc:"Всё остальное" },
];

const INIT_TIPS = [
  { id:1, cat:"tipping", author:"Мария К.", title:"Чаевые в ресторане", text:"В ресторане стандарт — 18-20% от суммы ДО налога. 15% — минимум. Если обслуживание было отличное — 25%. В баре — $1-2 за напиток. Takeout — не обязательно, но 10% приятно.", likes:45, comments:[{id:201,author:"Дима С.",text:"В фастфуде не нужно! Только в ресторанах с обслуживанием."},{id:202,author:"Аня Б.",text:"Uber Eats / DoorDash — тоже 15-20% оставляйте, курьеры зависят от чаевых."}] },
  { id:2, cat:"tipping", author:"Алекс Р.", title:"Парикмахер, маникюр, доставка", text:"Парикмахер: 15-20%. Маникюр: 20%. Valet parking: $3-5. Доставка продуктов (Instacart): 10-15%. Movers: $20-50 на человека.", likes:32, comments:[{id:203,author:"Оля Т.",text:"Ещё забыли — отель горничным $2-5 за ночь оставляют на подушке."}] },
  { id:3, cat:"driving", author:"Макс Д.", title:"Как получить права в CA", text:"1. Записаться на DMV.ca.gov (online!). 2. Пройти written test (46 вопросов, можно на русском!). 3. Получить permit. 4. Практика. 5. Behind-the-wheel test. Real ID — возьми паспорт + 2 доказательства адреса.", likes:58, comments:[{id:204,author:"Игорь Н.",text:"Written test можно на русском — выбираешь язык при записи!"},{id:205,author:"Катя Л.",text:"За record нужно $39 за Class C."}] },
  { id:4, cat:"banking", author:"Саша К.", title:"Первый банк и кредитная история", text:"Открыть счёт можно с паспортом + ITIN (даже без SSN). Chase, Bank of America — бесплатные checking. Для кредитной истории — secured credit card (депозит $200-500). Через 6 мес будет credit score.", likes:41, comments:[] },
  { id:5, cat:"health", author:"Вера П.", title:"Как найти врача без страховки", text:"Community Health Centers — приём по sliding scale (от дохода). Medi-Cal — бесплатная страховка если доход низкий. Urgent Care — дешевле чем ER ($100-300 vs $3000+). GoodRx — скидки на лекарства до 80%.", likes:37, comments:[{id:206,author:"Рома Г.",text:"Covered California — marketplace для страховки. Открытая регистрация ноябрь-январь."}] },
  { id:6, cat:"social", author:"Лена В.", title:"Small talk — как не молчать", text:"Американцы обожают small talk. Темы: погода, weekend plans, спорт, еда. НЕ спрашивайте: сколько зарабатываете, возраст, за кого голосовали, почему нет детей. 'How are you?' — всегда отвечайте 'Good, thanks! And you?'", likes:53, comments:[{id:207,author:"Паша Ж.",text:"Ещё важно — всегда улыбайтесь! Серьёзное лицо = грубость тут."}] },
];

// ─── EVENTS ───
const EVENT_CATS = [
  { id:"concerts", icon:"🎵", title:"Концерты", color:"#E91E8C" },
  { id:"holidays", icon:"🎄", title:"Праздники", color:"#E74C3C" },
  { id:"sports", icon:"⚽", title:"Спорт", color:"#27AE60" },
  { id:"community", icon:"🤝", title:"Комьюнити", color:"#F47B20" },
  { id:"markets", icon:"🛍️", title:"Маркеты / Распродажи", color:"#8E44AD" },
  { id:"wellness", icon:"🧘", title:"Йога / Здоровье", color:"#2980B9" },
];

const INIT_EVENTS = [
  { id:1, cat:"community", title:"Встреча русскоязычных в Griffith Park", date:"2026-04-06T10:00", location:"Griffith Park, пикник-зона #5", desc:"Собираемся, общаемся, делимся опытом. Приносите еду на шейринг!", author:"Мария К.", likes:23, comments:[{id:101,author:"Дима С.",text:"Буду в это воскресенье!"}] },
  { id:2, cat:"wellness", title:"Йога у океана — бесплатно", date:"2026-04-05T08:00", location:"Santa Monica Beach, у пирса", desc:"Бесплатная йога на пляже. Коврик свой. Уровень любой.", author:"Аня Б.", likes:31, comments:[] },
  { id:3, cat:"markets", title:"Flea Market на Rose Bowl", date:"2026-04-12T07:00", location:"Rose Bowl, Pasadena", desc:"Огромная барахолка! Винтаж, одежда, мебель, еда. Вход $12 до 8am, $5 после 9am.", author:"Оля Т.", likes:18, comments:[] },
  { id:4, cat:"concerts", title:"Русский рок в The Satellite", date:"2026-04-15T20:00", location:"The Satellite, Silver Lake", desc:"Живые выступления русскоязычных групп. Вход $10. Бар работает.", author:"Паша Ж.", likes:27, comments:[] },
  { id:5, cat:"holidays", title:"Масленица в West Hollywood", date:"2026-03-08T12:00", location:"Plummer Park, West Hollywood", desc:"Блины, чай, игры, конкурсы! Приходите всей семьёй.", author:"Дима С.", likes:45, comments:[] },
  { id:6, cat:"markets", title:"Гаражная распродажа", date:"2026-04-05T09:00", location:"Studio City", desc:"Диван IKEA ($150), стол ($80), монитор 27\" ($120). Всё в отличном состоянии.", author:"Алекс Р.", likes:8, comments:[] },
];

const SECTIONS = [
  { id:"uscis", icon:"📋", title:"USCIS", desc:"Документы" },
  { id:"places", icon:"📍", title:"Места", desc:"От своих" },
  { id:"tips", icon:"💡", title:"Советы", desc:"Лайфхаки" },
  { id:"events", icon:"🎉", title:"События", desc:"Мероприятия" },
  { id:"jobs", icon:"💼", title:"Работа", desc:"Вакансии", soon:true },
  { id:"housing", icon:"🏠", title:"Жильё", desc:"Аренда", soon:true },
  { id:"chat-sec", icon:"💬", title:"AI Чат", desc:"Помощник" },
];

const RICH_PREFIX = "__LA_RICH_V1__";
const CARD_TEXT_MAX = 500;

function limitCardText(text = "") {
  const normalized = String(text || "");
  return normalized.length > CARD_TEXT_MAX ? `${normalized.slice(0, CARD_TEXT_MAX)}…` : normalized;
}

const twoLineClampStyle = {
  overflow: "hidden",
  display: "-webkit-box",
  WebkitLineClamp: 2,
  WebkitBoxOrient: "vertical",
};

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
  const [selPlace, setSelPlace] = useState(null);
  const [selTC, setSelTC] = useState(null);
  // Save screen state on change
  useEffect(() => { try { sessionStorage.setItem('scr', scr); } catch {} }, [scr]);
  useEffect(() => { try { sessionStorage.setItem('selD', selD ? JSON.stringify(selD) : ''); } catch {} }, [selD]);
  useEffect(() => { try { sessionStorage.setItem('selPC', selPC ? JSON.stringify(selPC) : ''); } catch {} }, [selPC]);
  const [exp, setExp] = useState(null);
  const [expF, setExpF] = useState(null);
  const [expTip, setExpTip] = useState(null);
  const [mapP, setMapP] = useState(null);
  const [showMapModal, setShowMapModal] = useState(false);
  const [mapPlaces, setMapPlaces] = useState([]);
  const [selectedMapPlace, setSelectedMapPlace] = useState(null);
  const [mapLoading, setMapLoading] = useState(false);
  const [liked, setLiked] = useState({});
  const [likedTips, setLikedTips] = useState({});
  const [srch, setSrch] = useState("");
  const [places, setPlaces] = useState(INIT_PLACES);
  const [tips, setTips] = useState(INIT_TIPS);
  const [user, setUser] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [showAddTip, setShowAddTip] = useState(false);
  const [np, setNp] = useState({ name:"", cat:"", address:"", tip:"" });
  const [nPhotos, setNPhotos] = useState([]);
  const [editingPlace, setEditingPlace] = useState(null);
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
  const [photoZoom, setPhotoZoom] = useState(1);
  const [chat, setChat] = useState([{ role:"assistant", text:"Привет! 👋 Я помощник. Спрашивай про USCIS, визы, грин-карты." }]);
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
  const mapContainerRef = useRef(null);
  const leafletMapRef = useRef(null);
  const markerLayerRef = useRef(null);
  const geocodeCacheRef = useRef({});
  const photoSwipeRef = useRef({ startX: 0, startY: 0, active: false });
  const photoPinchRef = useRef({ baseDistance: 0, baseZoom: 1 });

  useEffect(() => setMt(true), []);
  // Save navigation state to localStorage
  useEffect(() => {
    if (mt) {
      const state = { scr, selDId: selD?.id, selPCId: selPC?.id, selPlaceId: selPlace?.id, selUId: selU?.id, selTCId: selTC?.id, selECId: selEC?.id };
      try { localStorage.setItem('nav', JSON.stringify(state)); } catch {}
    }
  }, [scr, selD, selPC, selPlace, selU, selTC, selEC, mt]);
  // Restore navigation on mount
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('nav'));
      if (saved?.scr) {
        setScr(saved.scr);
        if (saved.selDId) setSelD(DISTRICTS.find(d => d.id === saved.selDId) || null);
        if (saved.selPCId) setSelPC(PLACE_CATS.find(c => c.id === saved.selPCId) || null);
        if (saved.selPlaceId) setSelPlace(INIT_PLACES.find(p => p.id === saved.selPlaceId) || null);
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
        setUser({ id:u.id, name:u.user_metadata?.full_name||u.email||"Пользователь", email:u.email, avatar:"👤", avatarUrl:u.user_metadata?.avatar_url });
        const userLikes = await getUserLikes(u.id);
        setLiked(userLikes);
      }
      // Load places from DB, merge with initial
      const { data: dbPlaces } = await fetchPlaces();
      if (dbPlaces && dbPlaces.length > 0) {
        const mapped = dbPlaces
          .map(p => ({ id:p.id, cat:p.category, district:p.district, name:p.name, address:p.address||'', tip:p.tip, addedBy:p.added_by, userId:p.user_id, img:p.img||'📍', photos:p.photos||[], likes:p.likes_count||0, fromDB:true }))
          .filter((p) => PLACE_CAT_IDS.has(p.cat));
        const names = new Set(mapped.map(p => p.name));
        setPlaces([...mapped, ...INIT_PLACES.filter(p => PLACE_CAT_IDS.has(p.cat) && !names.has(p.name))]);
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

  const goHome = () => { setScr("home"); setSelU(null); setSelD(null); setSelPC(null); setSelPlace(null); setSelTC(null); setSelEC(null); setExp(null); setExpF(null); setExpTip(null); setMapP(null); setShowMapModal(false); setMapPlaces([]); setSelectedMapPlace(null); setSrch(""); setShowAdd(false); setShowAddTip(false); setShowAddEvent(false); setTDone(false); setEditingPlace(null); setFilterDate(null); setShowDatePicker(false); };
  const openAddressInMaps = (address) => {
    const value = (address || "").trim();
    if (!value) return;
    const q = encodeURIComponent(value);
    window.open(`geo:0,0?q=${q}`, "_blank");
  };
  const openMap = (p, t) => { const q = encodeURIComponent(p.address); window.open(t==="google"?`https://www.google.com/maps/search/?api=1&query=${q}`:`https://maps.apple.com/?q=${q}`, "_blank"); setMapP(null); };
  const openEventMap = (location, t) => {
    const q = encodeURIComponent(location || "");
    window.open(t==="google"?`https://www.google.com/maps/search/?api=1&query=${q}`:`https://maps.apple.com/?q=${q}`, "_blank");
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
        alert("Ссылка скопирована");
      }
    } catch {}
  };
  const ensureLeafletCss = () => {
    if (document.getElementById("leaflet-css")) return;
    const link = document.createElement("link");
    link.id = "leaflet-css";
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(link);
  };
  const geocodePlace = async (place) => {
    const key = `${place.name || ""}|${place.address || ""}`;
    if (geocodeCacheRef.current[key]) return geocodeCacheRef.current[key];
    const query = encodeURIComponent(`${place.address || place.name}, Los Angeles County, California`);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=us&addressdetails=1&q=${query}`);
      const data = await res.json();
      if (!Array.isArray(data) || !data[0]) return null;
      const lat = Number(data[0].lat);
      const lng = Number(data[0].lon);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
      const coords = { lat, lng };
      geocodeCacheRef.current[key] = coords;
      return coords;
    } catch {
      return null;
    }
  };
  const openAllOnMap = async (placesArr) => {
    setShowMapModal(true);
    setMapLoading(true);
    setMapPlaces([]);
    setSelectedMapPlace(null);
    const limited = placesArr.slice(0, 40);
    const resolved = await Promise.all(
      limited.map(async (p) => {
        const coords = await geocodePlace(p);
        return coords ? { ...p, ...coords } : null;
      }),
    );
    const withCoords = resolved.filter(Boolean);
    setMapPlaces(withCoords);
    setSelectedMapPlace(withCoords[0] || null);
    setMapLoading(false);
  };
  const openRouteForPlace = (place, provider) => {
    if (!place) return;
    const destination = encodeURIComponent(place.address || `${place.lat},${place.lng}`);
    const url = provider === "google"
      ? `https://www.google.com/maps/dir/?api=1&destination=${destination}`
      : `https://maps.apple.com/?daddr=${destination}`;
    window.open(url, "_blank");
  };
  const openPhotoViewer = (photos, startIndex = 0) => {
    const normalized = (Array.isArray(photos) ? photos : [])
      .filter((ph) => typeof ph === "string")
      .filter((ph) => /^(https?:\/\/|blob:|data:image\/)/i.test(ph));
    if (!normalized.length) return;
    const safeIndex = Math.max(0, Math.min(startIndex, normalized.length - 1));
    setPhotoViewer({ photos: normalized, index: safeIndex });
    setPhotoZoom(1);
  };
  const closePhotoViewer = () => {
    setPhotoViewer(null);
    setPhotoZoom(1);
  };
  const goPrevPhoto = () => {
    setPhotoViewer((prev) => {
      if (!prev || prev.photos.length < 2) return prev;
      const nextIndex = (prev.index - 1 + prev.photos.length) % prev.photos.length;
      return { ...prev, index: nextIndex };
    });
    setPhotoZoom(1);
  };
  const goNextPhoto = () => {
    setPhotoViewer((prev) => {
      if (!prev || prev.photos.length < 2) return prev;
      const nextIndex = (prev.index + 1) % prev.photos.length;
      return { ...prev, index: nextIndex };
    });
    setPhotoZoom(1);
  };

  const LA_COUNTY_BBOX = { left: -119.05, right: -117.40, top: 34.95, bottom: 33.30 };
  const toShortAddress = (item) => {
    const a = item?.address || {};
    const number = a.house_number || "";
    const street = a.road || a.pedestrian || a.footway || a.path || a.neighbourhood || "";
    const city = a.city || a.town || a.village || a.hamlet || a.suburb || "Los Angeles";
    const state = a.state_code || a.state || "CA";
    const line = [number, street].filter(Boolean).join(" ").trim();
    if (line) return `${line}, ${city}, ${state}`;
    return [city, state].filter(Boolean).join(", ");
  };
  const isLosAngelesCountyResult = (item) => {
    const a = item?.address || {};
    const county = String(a.county || "").toLowerCase();
    if (county.includes("los angeles")) return true;
    const lat = Number(item?.lat);
    const lon = Number(item?.lon);
    if (Number.isFinite(lat) && Number.isFinite(lon)) {
      return lon >= LA_COUNTY_BBOX.left && lon <= LA_COUNTY_BBOX.right && lat <= LA_COUNTY_BBOX.top && lat >= LA_COUNTY_BBOX.bottom;
    }
    return false;
  };
  const placeDisplayName = (item) => {
    const named = item?.namedetails?.name || item?.name || "";
    return String(named || "").trim();
  };
  const fetchAddressSuggestions = async (query) => {
    const q = (query || "").trim();
    if (q.length < 3) return [];
    try {
      const params = new URLSearchParams({
        format: "json",
        addressdetails: "1",
        namedetails: "1",
        limit: "12",
        "accept-language": "en",
        countrycodes: "us",
        bounded: "1",
        viewbox: `${LA_COUNTY_BBOX.left},${LA_COUNTY_BBOX.top},${LA_COUNTY_BBOX.right},${LA_COUNTY_BBOX.bottom}`,
        q: `${q}, Los Angeles County, California`,
      });
      const res = await fetch(`https://nominatim.openstreetmap.org/search?${params.toString()}`);
      const data = await res.json();
      if (!Array.isArray(data)) return [];
      const qLower = q.toLowerCase();
      const hasDigits = /\d/.test(q);
      const cleaned = data
        .filter(isLosAngelesCountyResult)
        .map((item) => {
          const short = toShortAddress(item);
          const place = placeDisplayName(item);
          const placeLower = place.toLowerCase();
          const shortLower = short.toLowerCase();
          const hasStreetNumber = Boolean(item?.address?.house_number);
          const hasRoad = Boolean(item?.address?.road || item?.address?.pedestrian || item?.address?.footway || item?.address?.path);
          let score = 0;
          if (shortLower.startsWith(qLower)) score += 5;
          if (shortLower.includes(qLower)) score += 2;
          if (place && placeLower.includes(qLower)) score += 4;
          if (hasStreetNumber) score += 3;
          if (hasRoad) score += 2;
          if (!hasDigits && place && !hasStreetNumber) score += 2; // query by place name
          const label = place && !shortLower.includes(placeLower) ? `${place} — ${short}` : short;
          return { label, value: short, score };
        })
        .filter((x) => x.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 6);
      const uniq = [];
      const seen = new Set();
      for (const item of cleaned) {
        const key = `${item.value}|${item.label}`;
        if (seen.has(key)) continue;
        seen.add(key);
        uniq.push({ label: item.label, value: item.value });
      }
      return uniq;
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

  useEffect(() => {
    if (!showMapModal) {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
        markerLayerRef.current = null;
      }
      return;
    }
    if (!mapContainerRef.current || mapLoading || !mapPlaces.length) return;
    let disposed = false;
    const init = async () => {
      ensureLeafletCss();
      const L = (await import("leaflet")).default;
      if (disposed) return;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      if (!leafletMapRef.current) {
        const map = L.map(mapContainerRef.current, { zoomControl: true });
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "&copy; OpenStreetMap contributors",
        }).addTo(map);
        leafletMapRef.current = map;
        markerLayerRef.current = L.layerGroup().addTo(map);
      }

      const map = leafletMapRef.current;
      const layer = markerLayerRef.current;
      layer.clearLayers();

      mapPlaces.forEach((p) => {
        const marker = L.marker([p.lat, p.lng]).addTo(layer);
        marker.bindPopup(`<b>${p.name}</b><br/>${p.address || ""}`);
        marker.on("click", () => setSelectedMapPlace(p));
        if (selectedMapPlace?.id === p.id) marker.openPopup();
      });

      const markers = layer.getLayers();
      if (markers.length) {
        const bounds = L.featureGroup(markers).getBounds();
        map.fitBounds(bounds.pad(0.2));
      } else if (selD) {
        map.setView([selD.lat, selD.lng], 13);
      }
      setTimeout(() => map.invalidateSize(), 80);
    };
    init();
    return () => { disposed = true; };
  }, [showMapModal, mapLoading, mapPlaces, selectedMapPlace, selD]);

  useEffect(() => {
    if (!selectedMapPlace || !leafletMapRef.current) return;
    leafletMapRef.current.flyTo([selectedMapPlace.lat, selectedMapPlace.lng], 15, { duration: 0.4 });
  }, [selectedMapPlace]);

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

  const getTouchDistance = (touches) => {
    if (!touches || touches.length < 2) return 0;
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.hypot(dx, dy);
  };
  const onPhotoTouchStart = (e) => {
    if (!photoViewer) return;
    if (e.touches.length >= 2) {
      photoPinchRef.current.baseDistance = getTouchDistance(e.touches);
      photoPinchRef.current.baseZoom = photoZoom;
      photoSwipeRef.current.active = false;
      return;
    }
    if (e.touches.length === 1) {
      photoSwipeRef.current = {
        startX: e.touches[0].clientX,
        startY: e.touches[0].clientY,
        active: true,
      };
    }
  };
  const onPhotoTouchMove = (e) => {
    if (!photoViewer) return;
    if (e.touches.length >= 2) {
      e.preventDefault();
      const baseDistance = photoPinchRef.current.baseDistance || getTouchDistance(e.touches);
      const distance = getTouchDistance(e.touches);
      if (!baseDistance || !distance) return;
      const nextZoom = Math.max(1, Math.min(4, (photoPinchRef.current.baseZoom || 1) * (distance / baseDistance)));
      setPhotoZoom(nextZoom);
    }
  };
  const onPhotoTouchEnd = (e) => {
    if (!photoViewer) return;
    if (e.touches.length >= 2) return;
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

  const handleSend = async (t) => {
    const msg = t || inp.trim(); if (!msg) return;
    setChat(p => [...p, { role:"user", text:msg }]); setInp(""); setTyping(true);
    try {
      const appData = {
        places: places.slice(0, 250).map((p) => ({
          id: p.id,
          name: p.name,
          district: p.district,
          cat: p.cat,
          address: p.address,
          tip: p.tip,
          likes: p.likes || 0,
        })),
        tips: tips.slice(0, 120).map((t) => ({
          id: t.id,
          title: t.title,
          cat: t.cat,
          text: t.text,
        })),
        events: events.slice(0, 120).map((e) => ({
          id: e.id,
          title: e.title,
          cat: e.cat,
          location: e.location,
          date: e.date,
          desc: e.desc,
        })),
      };
      const res = await fetch("/api/chat", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({ message:msg, history:chat.slice(-10), appData }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error);
      setChat(p => [...p, { role:"assistant", text:data.text||"Нет ответа." }]);
    } catch(e) { setChat(p => [...p, { role:"assistant", text:"Ошибка. Попробуйте ещё раз." }]); }
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
      alert("Выберите реальный адрес из подсказок.");
      return;
    }
    setUploading(true);
    try {
      const safeTip = limitCardText(np.tip).trim();
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
        const updates = { name:np.name, category:np.cat, address:np.address, tip:safeTip, img:PLACE_CATS.find(c=>c.id===np.cat)?.icon||editingPlace.img, photos:allPhotos };
        if (editingPlace.fromDB) await dbUpdatePlace(editingPlace.id, updates);
        setPlaces(prev => prev.map(p => p.id === editingPlace.id ? { ...p, name:np.name, cat:np.cat, address:np.address, tip:safeTip, img:updates.img, photos:allPhotos } : p));
        setSelPlace((prev) => prev?.id === editingPlace.id ? { ...prev, name:np.name, cat:np.cat, address:np.address, tip:safeTip, img:updates.img, photos:allPhotos } : prev);
        setEditingPlace(null);
      } else {
        const dbData = { name:np.name, category:np.cat, district:selD.id, address:np.address||'', tip:safeTip, rating:0, added_by:user.name, user_id:user.id, img:PLACE_CATS.find(c=>c.id===np.cat)?.icon||"📍", photos:uploadedUrls };
        const { data } = await dbAddPlace(dbData);
        const newId = data?.[0]?.id || Date.now();
        setPlaces(prev => [{ id:newId, cat:np.cat, district:selD.id, name:np.name, address:np.address, tip:safeTip, addedBy:user.name, userId:user.id, img:dbData.img, photos:uploadedUrls, likes:0, comments:[], fromDB:true }, ...prev]);
      }
      setNp({ name:"", cat:"", address:"", tip:"" }); setNPhotos([]); setShowAdd(false);
    } catch(err) {
      console.error('Add place error:', err);
      alert('Ошибка при сохранении. Попробуйте ещё раз.');
    } finally { setUploading(false); }
  };
  const handleDeletePlace = async (placeId) => {
    if (window.confirm("Удалить это место?")) {
      await dbDeletePlace(placeId);
      setPlaces(prev => prev.filter(p => p.id !== placeId));
      if (selPlace?.id === placeId) {
        setSelPlace(null);
        setScr("places-cat");
      }
      setExp(null);
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
    if (!window.confirm("Удалить событие?")) return;
    await dbDeleteEvent(eventId);
    setEvents(prev => prev.filter(e => e.id !== eventId));
    setShowAddEvent(false);
    setEditingEvent(null);
    setExp(null);
  };
  const handleAddTip = async () => {
    if (!newTip.title || !newTip.text || !user || !selTC) return;
    const safeTipText = limitCardText(newTip.text).trim();
    const uploaded = [];
    for (const p of newTipPhotos) {
      const url = await uploadPhoto(p.file);
      if (url) uploaded.push(url);
    }
    const dbData = { category:selTC.id, title:newTip.title, text:encodeRichText(safeTipText, uploaded), author:user.name, user_id:user.id };
    const { data } = await dbAddTip(dbData);
    const newId = data?.[0]?.id || Date.now();
    setTips(prev => [{ id:newId, cat:selTC.id, author:user.name, userId:user.id, title:newTip.title, text:safeTipText, photos:uploaded, likes:0, comments:[], fromDB:true }, ...prev]);
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
      alert("Выберите место из подсказок адреса.");
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
    const safeEventDesc = limitCardText(newEvent.desc).trim();
    const website = normalizeExternalUrl(newEvent.website || "");
    const dbData = { category:newEvent.cat, title:newEvent.title, date:newEvent.date, location:newEvent.location||'', description:encodeRichText(safeEventDesc, uploaded, { website }), author:user.name, user_id:user.id };
    if (editingEvent) {
      await dbUpdateEvent(editingEvent.id, dbData);
      setEvents(prev => prev.map(ev => ev.id === editingEvent.id ? { ...ev, cat:newEvent.cat, title:newEvent.title, date:newEvent.date, location:newEvent.location, desc:safeEventDesc, website, photos:uploaded } : ev));
    } else {
      const { data } = await dbAddEvent(dbData);
      const newId = data?.[0]?.id || Date.now();
      setEvents(prev => [{ id:newId, cat:newEvent.cat, title:newEvent.title, date:newEvent.date, location:newEvent.location, desc:safeEventDesc, website, photos:uploaded, author:user.name, userId:user.id, likes:0, comments:[], fromDB:true }, ...prev]);
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
  const dPlaces = selD ? places.filter(p=>p.district===selD.id && PLACE_CAT_IDS.has(p.cat)) : [];
  const cPlaces = selPC ? dPlaces.filter(p=>p.cat===selPC.id) : [];
  const activePlace = selPlace ? (places.find((p) => p.id === selPlace.id) || selPlace) : null;
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

  useEffect(() => {
    if (scr === "place-item" && !activePlace) setScr("places-cat");
  }, [scr, activePlace]);

  // ─── Reusable Comments Block ───
  const renderComments = (item, type, addFn) => {
    const comments = item.comments || [];
    const isOpen = showComments === `${type}-${item.id}`;
    return (
      <div style={{ padding:"0 16px 16px" }}>
        <button onClick={e=>{e.stopPropagation(); setShowComments(isOpen ? null : `${type}-${item.id}`); setNewComment(""); setEditingComment(null);}}
          style={{ background:"none", border:"none", cursor:"pointer", fontFamily:"inherit", fontSize:13, fontWeight:600, color:T.mid, padding:"4px 0", display:"flex", alignItems:"center", gap:6 }}>
          💬 Комментарии ({comments.length}) <span style={{ fontSize:10, color:T.light, transition:"0.3s", transform:isOpen?"rotate(180deg)":"" }}>▼</span>
        </button>
        {isOpen && (<div style={{ marginTop:8 }}>
          {comments.map((c) => (
            <div key={c.id||Math.random()} style={{ padding:"10px 12px", background:T.bg, borderRadius:10, marginBottom:6, fontSize:13 }}>
              {editingComment === c.id ? (
                <div style={{ display:"flex", gap:6 }}>
                  <input value={editCommentText} onChange={e=>setEditCommentText(e.target.value)} style={{ ...iS, flex:1, padding:"8px 12px", fontSize:13 }} />
                  <button onClick={()=>saveEditComment(item.id, c.id, type)} style={{ ...pl(true), padding:"8px 14px", fontSize:12 }}>✓</button>
                  <button onClick={()=>{setEditingComment(null);setEditCommentText("")}} style={{ ...pl(false), padding:"8px 14px", fontSize:12 }}>✕</button>
                </div>
              ) : (<div>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <span style={{ fontWeight:600, color:T.text }}>{c.author}</span>
                  {user && (user.id === c.userId || user.name === c.author) && (
                    <div style={{ display:"flex", gap:4 }}>
                      <button onClick={()=>{setEditingComment(c.id);setEditCommentText(c.text)}} style={{ background:"none", border:"none", color:T.light, cursor:"pointer", fontSize:11, padding:2 }}>✏️</button>
                      <button onClick={()=>deleteCommentFn(item.id, c.id, type)} style={{ background:"none", border:"none", color:"#E74C3C", cursor:"pointer", fontSize:11, padding:2 }}>🗑</button>
                    </div>
                  )}
                </div>
                <div style={{ color:T.mid, marginTop:4 }}>{c.text}</div>
              </div>)}
            </div>
          ))}
          {user ? (
            <div style={{ display:"flex", gap:8, marginTop:6 }}>
              <input value={newComment} onChange={e=>setNewComment(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addFn(item.id)} placeholder="Написать комментарий..." style={{ ...iS, flex:1, padding:"10px 14px" }} />
              <button onClick={()=>addFn(item.id)} disabled={!newComment.trim()} style={{ ...pl(!!newComment.trim()), padding:"10px 16px", opacity:newComment.trim()?1:0.5 }}>→</button>
            </div>
          ) : (<button onClick={handleLogin} style={{ ...pl(false), width:"100%", fontSize:12, marginTop:4 }}>Войдите чтобы комментировать</button>)}
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
          <h1 style={{ fontSize:22, fontWeight:900, margin:0 }}><span style={{ color:T.primary }}>МЫ</span> в LA</h1>
          <p style={{ margin:"1px 0 0", fontSize:11, color:T.light }}>путеводитель</p>
        </div>
        {user ? (
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <span style={{ fontSize:12, color:T.mid }}>{user.name}</span>
            <div style={{ width:32, height:32, borderRadius:10, background:T.primaryLight, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16 }}>👤</div>
            <button onClick={handleLogout} style={{ background:"none", border:"none", color:T.light, fontSize:11, cursor:"pointer" }}>Выйти</button>
          </div>
        ) : (
          <button onClick={handleLogin} style={{ ...pl(false), padding:"8px 14px", fontSize:12, display:"flex", alignItems:"center", gap:6 }}>
            <svg width="14" height="14" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            Войти
          </button>
        )}
      </header>

      <main style={{ padding:"16px 16px 40px" }}>

        {scr==="home" && (<div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10 }}>
          {SECTIONS.map((s,i) => (
            <button key={s.id} onClick={() => { if (s.soon) return; if (s.id==="chat-sec") { if (!user) {handleLogin();return;} setScr("chat"); } else setScr(s.id); }}
              style={{ ...cd, padding:"20px 10px", cursor:s.soon?"default":"pointer", display:"flex", flexDirection:"column", alignItems:"center", textAlign:"center", fontFamily:"inherit", color:T.text, position:"relative", opacity:mt?1:0, transform:mt?"translateY(0)":"translateY(12px)", transition:`all 0.4s ease ${i*0.05}s` }}
              onMouseEnter={e=>{if(!s.soon)e.currentTarget.style.boxShadow=T.shH}} onMouseLeave={e=>{e.currentTarget.style.boxShadow=T.sh}}>
              {s.soon && <div style={{ position:"absolute", top:6, right:6, fontSize:8, fontWeight:700, color:T.light, background:T.bg, padding:"2px 6px", borderRadius:4, textTransform:"uppercase" }}>скоро</div>}
              <div style={{ fontSize:28, marginBottom:8, filter:s.soon?"grayscale(0.6) opacity(0.4)":"none" }}>{s.icon}</div>
              <div style={{ fontWeight:700, fontSize:13, opacity:s.soon?0.4:1 }}>{s.title}</div>
              <div style={{ fontSize:11, color:T.mid, marginTop:3, opacity:s.soon?0.3:0.7 }}>{s.desc}</div>
            </button>
          ))}
        </div>)}

        {/* USCIS */}
        {scr==="uscis" && (<div>
          <button onClick={goHome} style={bk}>← Главная</button>
          <h2 style={{ fontSize:20, fontWeight:700, margin:"4px 0 14px" }}>📋 Справочник USCIS</h2>
          <div style={{ position:"relative", marginBottom:14 }}>
            <div style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)", color:T.light, pointerEvents:"none" }}>🔎</div>
            <input value={srch} onChange={e=>setSrch(e.target.value)} placeholder="Поиск формы..." style={{ ...iS, paddingLeft:42, borderColor:srch?T.primary:T.border }} />
          </div>
          {srch.trim().length>=2 ? (<div>{sRes.map((d,i) => (<div key={i} style={{ ...cd, padding:"14px 16px", marginBottom:8 }}>
            <div style={{ display:"flex", gap:8, marginBottom:6 }}>{d.url ? <a href={d.url} target="_blank" rel="noopener noreferrer" style={{ fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:6, color:T.primary, background:T.primaryLight, textDecoration:"none" }}>{d.form} ↗</a> : <span style={{ fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:6, color:T.primary, background:T.primaryLight }}>{d.form}</span>}<span style={{ fontSize:11, color:T.mid }}>{d.cI} {d.cT}</span></div>
            <div style={{ fontWeight:600, fontSize:14 }}>{d.name}</div><div style={{ fontSize:12, color:T.mid, marginTop:3 }}>{d.desc}</div>
          </div>))}{sRes.length===0 && <p style={{ fontSize:13, color:T.mid }}>Не найдено</p>}</div>) : (<><div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {USCIS_CATS.map(c => (<button key={c.id} onClick={() => { setSelU(c); setScr("uscis-cat"); setExpF(null); }}
              style={{ ...cd, display:"flex", alignItems:"center", gap:14, padding:"16px", cursor:"pointer", fontFamily:"inherit", color:T.text, textAlign:"left" }}
              onMouseEnter={e=>{e.currentTarget.style.boxShadow=T.shH}} onMouseLeave={e=>{e.currentTarget.style.boxShadow=T.sh}}>
              <div style={{ width:48, height:48, borderRadius:T.rs, background:T.primaryLight, display:"flex", alignItems:"center", justifyContent:"center", fontSize:24, flexShrink:0 }}>{c.icon}</div>
              <div style={{ flex:1 }}><div style={{ fontWeight:700, fontSize:15 }}>{c.title}</div><div style={{ fontSize:12, color:T.mid, marginTop:2 }}>{c.subtitle}</div></div>
              <div style={{ color:T.light }}>›</div>
            </button>))}
          </div>
          {/* Case status checker */}
          <div style={{ ...cd, marginTop:14, padding:"18px" }}>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:8 }}><span style={{ fontSize:20 }}>🔍</span><span style={{ fontWeight:700, fontSize:15 }}>Проверить статус кейса</span></div>
            <p style={{ fontSize:13, color:T.mid, margin:"0 0 12px" }}>Введите receipt number</p>
            <div style={{ display:"flex", gap:8 }}>
              <input placeholder="EAC-XX-XXX-XXXXX" style={{ ...iS, flex:1, width:"auto" }} />
              <a href="https://egov.uscis.gov/casestatussearchwidget" target="_blank" rel="noopener noreferrer" style={{ ...pl(true), textDecoration:"none", display:"flex", alignItems:"center" }}>Проверить</a>
            </div>
          </div>
          </>)}
        </div>)}

        {/* USCIS CAT */}
        {scr==="uscis-cat" && selU && (<div>
          <button onClick={() => setScr("uscis")} style={bk}>← Справочник</button>
          <div style={{ display:"flex", alignItems:"center", gap:12, margin:"4px 0 20px" }}>
            <div style={{ width:48, height:48, borderRadius:14, background:T.primaryLight, display:"flex", alignItems:"center", justifyContent:"center", fontSize:28 }}>{selU.icon}</div>
            <div><h2 style={{ fontSize:22, fontWeight:700, margin:0 }}>{selU.title}</h2></div>
          </div>
          {selU.docs.map((d, i) => { const isE = expF===i; return (<div key={i} style={{ ...cd, marginBottom:10, overflow:"hidden", borderColor:isE?T.primary+"40":T.borderL }}>
            <div onClick={() => setExpF(isE?null:i)} style={{ padding:"16px", cursor:"pointer" }} onMouseEnter={e=>{e.currentTarget.style.background=T.bg}} onMouseLeave={e=>{e.currentTarget.style.background=T.card}}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                {d.url ? <a href={d.url} target="_blank" rel="noopener noreferrer" onClick={e=>e.stopPropagation()} style={{ fontSize:12, fontWeight:700, padding:"4px 12px", borderRadius:6, color:T.primary, background:T.primaryLight, textDecoration:"none" }}>{d.form} ↗</a> : <span style={{ fontSize:12, fontWeight:700, padding:"4px 12px", borderRadius:6, color:T.primary, background:T.primaryLight }}>{d.form}</span>}
                <span style={{ fontSize:11, color:isE?T.primary:T.light, transform:isE?"rotate(180deg)":"", transition:"0.3s" }}>▼</span>
              </div>
              <div style={{ fontWeight:600, fontSize:14, marginTop:10 }}>{d.name}</div>
              <div style={{ fontSize:12, color:T.mid, marginTop:4 }}>{d.desc}</div>
            </div>
            {isE && (<div style={{ padding:"0 16px 16px", borderTop:`1px solid ${T.borderL}` }}>
              <div style={{ padding:14, background:T.bg, borderRadius:10, marginTop:12, fontSize:13, lineHeight:1.65, color:T.mid }}>{d.detail}</div>
              {d.url && <a href={d.url} target="_blank" rel="noopener noreferrer" style={{ display:"inline-block", marginTop:12, ...pl(true), textDecoration:"none", fontSize:12 }}>uscis.gov ↗</a>}
              {d.isTest && <button onClick={startTest} style={{ ...pl(true), marginTop:12, width:"100%" }}>🇺🇸 Start Civics Test</button>}
            </div>)}
          </div>); })}
        </div>)}

        {/* CIVICS TEST — English, shuffled answers */}
        {scr==="test" && (<div>
          <button onClick={goHome} style={bk}>← Exit</button>
          {!tDone ? (<div>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:16 }}><h2 style={{ fontSize:18, fontWeight:700, margin:0 }}>🇺🇸 Civics Test</h2><span style={{ fontSize:13, color:T.mid, fontWeight:600 }}>{tQ+1}/{tShuf.length}</span></div>
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
            <div style={{ marginTop:12, fontSize:12, color:T.mid, textAlign:"center" }}>✅ {tAns.filter(a=>a.correct).length} · ❌ {tAns.filter(a=>!a.correct).length}</div>
          </div>) : (<div style={{ textAlign:"center" }}>
            <div style={{ fontSize:60, marginBottom:16 }}>{tAns.filter(a=>a.correct).length >= Math.floor(tShuf.length*0.6) ? "🎉" : "📚"}</div>
            <h2 style={{ fontSize:22, fontWeight:700, margin:"0 0 8px" }}>Test Complete!</h2>
            <div style={{ ...cd, padding:24, margin:"16px 0" }}>
              <div style={{ fontSize:48, fontWeight:900, color:tAns.filter(a=>a.correct).length>=Math.floor(tShuf.length*0.6)?"#27AE60":T.primary }}>{tAns.filter(a=>a.correct).length} / {tShuf.length}</div>
              <p style={{ fontSize:14, color:T.mid, marginTop:8 }}>correct answers</p>
            </div>
            <div style={{ display:"flex", gap:10 }}><button onClick={startTest} style={{ ...pl(true), flex:1, padding:14 }}>🔄 Retry</button><button onClick={goHome} style={{ ...pl(false), flex:1, padding:14 }}>← Home</button></div>
          </div>)}
        </div>)}

        {/* PLACES → DISTRICTS */}
        {scr==="places" && (<div>
          <button onClick={goHome} style={bk}>← Главная</button>
          <h2 style={{ fontSize:20, fontWeight:700, margin:"4px 0 16px" }}>📍 Выбери район</h2>
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {DISTRICTS.map((d, i) => { const cnt = places.filter(p=>p.district===d.id).length; return (
              <button key={d.id} onClick={() => { setSelD(d); setScr("district"); }}
                style={{ ...cd, display:"flex", alignItems:"center", gap:14, padding:"16px", cursor:"pointer", fontFamily:"inherit", color:T.text, textAlign:"left", opacity:mt?1:0, transition:`all 0.4s ease ${i*0.04}s` }}
                onMouseEnter={e=>{e.currentTarget.style.boxShadow=T.shH}} onMouseLeave={e=>{e.currentTarget.style.boxShadow=T.sh}}>
                <div style={{ width:48, height:48, borderRadius:T.rs, background:T.bg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:24, flexShrink:0 }}>{d.emoji}</div>
                <div style={{ flex:1 }}><div style={{ fontWeight:700, fontSize:15 }}>{d.name}</div><div style={{ fontSize:12, color:T.mid, marginTop:2 }}>{d.desc}</div></div>
                <div style={{ textAlign:"right" }}><span style={{ fontSize:13, fontWeight:700, color:T.primary }}>{cnt}</span><br/><span style={{ fontSize:10, color:T.light }}>мест</span></div>
              </button>
            ); })}
          </div>
        </div>)}

        {/* DISTRICT → CATEGORIES */}
        {scr==="district" && selD && (<div>
          <button onClick={() => { setScr("places"); setSelD(null); }} style={bk}>← Районы</button>
          <div style={{ display:"flex", alignItems:"center", gap:12, margin:"4px 0 18px" }}>
            <div style={{ width:48, height:48, borderRadius:14, background:T.bg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:26 }}>{selD.emoji}</div>
            <div><h2 style={{ fontSize:20, fontWeight:700, margin:0 }}>{selD.name}</h2><p style={{ fontSize:13, color:T.mid, margin:0 }}>{dPlaces.length} мест</p></div>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
            {PLACE_CATS.map(c => { const cnt = dPlaces.filter(p=>p.cat===c.id).length; if (!cnt) return null; return (
              <button key={c.id} onClick={() => { setSelPC(c); setScr("places-cat"); }}
                style={{ ...cd, padding:"18px 14px", display:"flex", alignItems:"center", gap:12, cursor:"pointer", fontFamily:"inherit", color:T.text, textAlign:"left" }}
                onMouseEnter={e=>{e.currentTarget.style.boxShadow=T.shH}} onMouseLeave={e=>{e.currentTarget.style.boxShadow=T.sh}}>
                <div style={{ width:40, height:40, borderRadius:10, background:`${c.color}12`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, flexShrink:0 }}>{c.icon}</div>
                <div><div style={{ fontWeight:700, fontSize:14 }}>{c.title}</div><div style={{ fontSize:12, color:T.mid, marginTop:2 }}>{cnt} мест</div></div>
              </button>
            ); })}
          </div>
          <button onClick={() => { openAddForm(); }} style={{ ...cd, width:"100%", marginTop:14, padding:16, border:`2px dashed ${T.primary}40`, color:T.primary, fontWeight:600, fontSize:14, cursor:"pointer", fontFamily:"inherit", display:"flex", alignItems:"center", justifyContent:"center", gap:6, boxShadow:"none" }}>＋ Добавить место</button>
        </div>)}

        {/* ADD PLACE MODAL */}
        {showAdd && selD && (<div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.4)", zIndex:100, display:"flex", alignItems:"flex-end", justifyContent:"center" }} onClick={()=>setShowAdd(false)}>
          <div style={{ ...cd, width:"100%", maxWidth:480, borderRadius:"24px 24px 0 0", padding:"24px 20px 32px", maxHeight:"90vh", overflowY:"auto" }} onClick={e=>e.stopPropagation()}>
            <div style={{ width:40, height:4, borderRadius:2, background:T.border, margin:"0 auto 20px" }} />
            {!user ? (<div style={{ textAlign:"center", padding:"20px 0" }}><div style={{ fontSize:48, marginBottom:16 }}>🔐</div><button onClick={handleLogin} style={{ ...pl(true), padding:"14px 28px" }}>Войти через Google</button></div>) : (<>
              <h3 style={{ fontSize:18, fontWeight:700, margin:"0 0 20px" }}>{editingPlace ? "✏️ Редактировать место" : "Новое место"} · {selD.name}</h3>
              <label style={{ fontSize:12, fontWeight:600, color:T.mid, marginBottom:6, display:"block" }}>Название *</label>
              <input value={np.name} onChange={e=>setNp({...np,name:e.target.value})} placeholder="Название" style={{ ...iS, marginBottom:14 }} />
              <label style={{ fontSize:12, fontWeight:600, color:T.mid, marginBottom:6, display:"block" }}>Категория *</label>
              <select value={np.cat} onChange={e=>setNp({...np,cat:e.target.value})} style={{ ...iS, marginBottom:14, appearance:"none", color:np.cat?T.text:T.light }}>
                <option value="">Выберите</option>{PLACE_CATS.map(c=><option key={c.id} value={c.id}>{c.icon} {c.title}</option>)}
              </select>
              <label style={{ fontSize:12, fontWeight:600, color:T.mid, marginBottom:6, display:"block" }}>Адрес</label>
              <input value={np.address} onChange={e=>{setNp({...np,address:e.target.value}); setAddrValidPlace(false);}} placeholder="Адрес" style={{ ...iS, marginBottom:6, borderColor:np.address && !addrValidPlace ? "#f5b7b1" : T.border }} />
              {addrLoadingPlace && <div style={{ fontSize:12, color:T.mid, marginBottom:8 }}>Ищем адрес...</div>}
              {!addrLoadingPlace && addrOptionsPlace.length > 0 && !addrValidPlace && (
                <div style={{ marginBottom:10, border:`1px solid ${T.border}`, borderRadius:10, overflow:"hidden", maxHeight:160, overflowY:"auto", background:T.card }}>
                  {addrOptionsPlace.map((opt, i) => (
                    <button key={`${opt.value}-${i}`} onClick={() => { setNp(prev => ({ ...prev, address: opt.value })); setAddrValidPlace(true); setAddrOptionsPlace([]); }} style={{ width:"100%", textAlign:"left", padding:"10px 12px", border:"none", borderBottom:i < addrOptionsPlace.length-1 ? `1px solid ${T.borderL}` : "none", background:T.card, cursor:"pointer", fontFamily:"inherit", fontSize:12, color:T.mid }}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
              {np.address && !addrValidPlace && <div style={{ fontSize:12, color:"#E74C3C", marginBottom:10 }}>Выберите адрес из подсказок.</div>}
              <label style={{ fontSize:12, fontWeight:600, color:T.mid, marginBottom:6, display:"block" }}>Комментарий *</label>
              <textarea value={np.tip} maxLength={CARD_TEXT_MAX} onChange={e=>setNp({...np,tip:e.target.value.slice(0, CARD_TEXT_MAX)})} placeholder="Ваш отзыв, совет, рекомендация..." style={{ ...iS, minHeight:80, resize:"vertical", marginBottom:6 }} />
              <div style={{ fontSize:11, color:T.light, marginBottom:12, textAlign:"right" }}>{np.tip.length}/{CARD_TEXT_MAX}</div>
              <input ref={fileRef} type="file" accept="image/*" multiple onChange={handlePhotos} style={{ display:"none" }} />
              <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:20 }}>
                {nPhotos.map((p,i) => (<div key={i} style={{ position:"relative", width:60, height:60, borderRadius:8, overflow:"hidden", border:`1px solid ${T.border}`, flexShrink:0 }}>{p.preview ? <img src={p.preview} alt="" style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }} /> : <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:"100%", background:T.bg, fontSize:10, color:T.mid, padding:4 }}>📷</div>}<button onClick={()=>setNPhotos(pr=>pr.filter((_,j)=>j!==i))} style={{ position:"absolute", top:2, right:2, background:"rgba(0,0,0,0.5)", border:"none", color:"#fff", cursor:"pointer", borderRadius:"50%", width:18, height:18, fontSize:10, display:"flex", alignItems:"center", justifyContent:"center", padding:0 }}>✕</button></div>))}
                {nPhotos.length<5 && <button onClick={()=>fileRef.current?.click()} style={{ padding:"6px 14px", background:T.bg, border:`1.5px dashed ${T.border}`, borderRadius:8, color:T.primary, fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>＋ Фото</button>}
              </div>
              <div style={{ display:"flex", gap:10 }}><button onClick={()=>{setShowAdd(false);setNPhotos([])}} style={{ ...pl(false), flex:1, padding:14 }}>Отмена</button><button onClick={handleAddPlace} disabled={!np.name||!np.cat||!np.tip||uploading} style={{ ...pl(true), flex:2, padding:14, opacity:(!np.name||!np.cat||!np.tip||uploading)?0.5:1 }}>{uploading ? '⏳ Загрузка...' : editingPlace ? 'Сохранить' : 'Опубликовать'}</button></div>
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
            <button key={p.id} onClick={() => { setSelPlace(p); setScr("place-item"); }} style={{ ...cd, width:"100%", overflow:"hidden", marginBottom:12, cursor:"pointer", fontFamily:"inherit", color:T.text, textAlign:"left", borderColor:T.borderL }}>
              <div style={{ padding:16 }}>
                <div style={{ display:"flex", gap:14, alignItems:"flex-start" }}>
                  <div style={{ width:50, height:50, borderRadius:14, background:`${selPC.color}10`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:26, flexShrink:0 }}>{p.img}</div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:700, fontSize:16 }}>{p.name}</div>
                    <button onClick={(e)=>{ e.stopPropagation(); openAddressInMaps(p.address || selD.name); }} style={{ background:"none", border:"none", padding:0, marginTop:3, color:T.mid, fontSize:12, cursor:"pointer", fontFamily:"inherit", textDecoration:"underline", textAlign:"left" }}>
                      📍 {p.address || selD.name}
                    </button>
                  </div>
                  <div style={{ minWidth:64, display:"flex", justifyContent:"flex-end" }}>
                    <span style={{ display:"inline-flex", alignItems:"center", gap:4, padding:"4px 8px", borderRadius:999, background:"#FFF1F1", color:"#C0392B", fontWeight:700, fontSize:12, lineHeight:1 }}>
                      {liked[`place-${p.id}`] ? "♥" : "♡"} {p.likes || 0}
                    </span>
                  </div>
                </div>
                <div style={{ marginTop:12, padding:12, background:T.bg, borderRadius:10, borderLeft:`3px solid ${selPC.color}` }}><div style={{ ...twoLineClampStyle, fontSize:13, color:T.mid }}>💡 {limitCardText(p.tip)}</div></div>
                <div style={{ marginTop:10, fontSize:11, color:T.light }}>от {p.addedBy}</div>
              </div>
            </button>
          ))}
          <button onClick={() => { openAddForm(); }} style={{ ...cd, width:"100%", marginTop:4, padding:16, border:`2px dashed ${T.primary}40`, color:T.primary, fontWeight:600, fontSize:14, cursor:"pointer", fontFamily:"inherit", display:"flex", alignItems:"center", justifyContent:"center", gap:6, boxShadow:"none" }}>＋ Добавить</button>
        </div>)}

        {/* PLACE ITEM PAGE */}
        {scr==="place-item" && activePlace && selPC && selD && (<div>
          <button onClick={() => { setScr("places-cat"); setExp(null); }} style={bk}>← {selPC.title}</button>
          <div style={{ ...cd, overflow:"hidden", borderColor:T.borderL }}>
            <div style={{ padding:16 }}>
              <div style={{ display:"flex", gap:14, marginBottom:12, alignItems:"flex-start" }}>
                <div style={{ width:56, height:56, borderRadius:14, background:`${selPC.color}10`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:28, flexShrink:0 }}>{activePlace.img}</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:700, fontSize:20, lineHeight:1.2 }}>{activePlace.name}</div>
                  <button onClick={() => openAddressInMaps(activePlace.address || selD.name)} style={{ background:"none", border:"none", padding:0, marginTop:5, color:T.mid, fontSize:13, cursor:"pointer", fontFamily:"inherit", textDecoration:"underline", textAlign:"left" }}>
                    📍 {activePlace.address || selD.name}
                  </button>
                  <div style={{ marginTop:5, fontSize:12, color:T.light }}>от {activePlace.addedBy}</div>
                </div>
                <div style={{ minWidth:64, display:"flex", justifyContent:"flex-end" }}>
                  <span style={{ display:"inline-flex", alignItems:"center", gap:4, padding:"4px 8px", borderRadius:999, background:"#FFF1F1", color:"#C0392B", fontWeight:700, fontSize:12, lineHeight:1 }}>
                    {liked[`place-${activePlace.id}`] ? "♥" : "♡"} {activePlace.likes || 0}
                  </span>
                </div>
              </div>
              <div style={{ marginBottom:12, padding:12, background:T.bg, borderRadius:10, borderLeft:`3px solid ${selPC.color}` }}><div style={{ fontSize:14, color:T.mid, lineHeight:1.6, whiteSpace:"pre-wrap", overflowWrap:"anywhere", wordBreak:"break-word" }}>💡 {limitCardText(activePlace.tip)}</div></div>

              {activePlace.photos?.length > 0 && (
                <div style={{ display:"flex", gap:8, overflowX:"auto", marginBottom:10, paddingBottom:4, scrollSnapType:"x mandatory" }}>
                  {activePlace.photos.map((ph, pi) => (
                    <img key={pi} src={ph} alt="" style={{ width:120, height:120, objectFit:"cover", borderRadius:12, border:`1px solid ${T.border}`, cursor:"zoom-in", flexShrink:0, scrollSnapAlign:"start" }} onClick={() => openPhotoViewer(activePlace.photos, pi)} />
                  ))}
                </div>
              )}
              {activePlace.photos?.length > 1 && <div style={{ fontSize:11, color:T.light, marginBottom:10 }}>Листайте фото →</div>}

              <div style={{ padding:"8px 0 10px", display:"flex", gap:14, alignItems:"center" }}>
                <button onClick={() => handleToggleLike(activePlace.id,"place")} style={{ background:"none", border:"none", cursor:"pointer", fontFamily:"inherit", display:"flex", alignItems:"center", gap:5, fontSize:18, color:liked[`place-${activePlace.id}`]?"#E74C3C":T.mid, padding:0 }} title="Нравится">{liked[`place-${activePlace.id}`] ? "♥" : "♡"} <span style={{ fontSize:14 }}>{activePlace.likes||0}</span></button>
                <button onClick={()=> setShowComments(`place-${activePlace.id}`)} style={{ background:"none", border:"none", cursor:"pointer", fontFamily:"inherit", display:"flex", alignItems:"center", gap:5, fontSize:18, color:T.mid, padding:0 }} title="Комментарии">◌ <span style={{ fontSize:14 }}>{(activePlace.comments||[]).length}</span></button>
                <button onClick={()=> handleNativeShare({title:activePlace.name,text:activePlace.tip,url:window.location.href})} style={{ marginLeft:"auto", background:"none", border:"none", cursor:"pointer", fontFamily:"inherit", fontSize:18, color:T.mid, padding:0 }} title="Поделиться">➤</button>
              </div>

              {renderComments(activePlace, "place", addPlaceComment)}

              {user && (user.id === activePlace.userId || user.name === activePlace.addedBy) && (
                <div style={{ paddingTop:4, display:"flex", gap:8 }}>
                  <button onClick={()=>startEditPlace(activePlace)} style={{ flex:1, padding:"10px 0", borderRadius:24, border:`1.5px solid ${T.border}`, cursor:"pointer", fontFamily:"inherit", display:"flex", alignItems:"center", justifyContent:"center", gap:4, fontSize:12, fontWeight:600, background:T.card, color:T.mid }}>✏️ Редактировать</button>
                  <button onClick={()=>handleDeletePlace(activePlace.id)} style={{ flex:1, padding:"10px 0", borderRadius:24, border:"1.5px solid #fecaca", cursor:"pointer", fontFamily:"inherit", display:"flex", alignItems:"center", justifyContent:"center", gap:4, fontSize:12, fontWeight:600, background:"#FFF5F5", color:"#E74C3C" }}>🗑 Удалить</button>
                </div>
              )}
            </div>
          </div>
        </div>)}

        {/* TIPS */}
        {scr==="tips" && !selTC && (<div>
          <button onClick={goHome} style={bk}>← Главная</button>
          <h2 style={{ fontSize:20, fontWeight:700, margin:"4px 0 4px" }}>💡 Советы по жизни в LA</h2>
          <p style={{ fontSize:13, color:T.mid, margin:"0 0 16px" }}>Опыт от своих — лайфхаки, чаевые, банки, врачи</p>
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
          <button onClick={() => setSelTC(null)} style={bk}>← Все советы</button>
          <div style={{ display:"flex", alignItems:"center", gap:12, margin:"4px 0 18px" }}>
            <div style={{ width:48, height:48, borderRadius:14, background:T.primaryLight, display:"flex", alignItems:"center", justifyContent:"center", fontSize:26 }}>{selTC.icon}</div>
            <div><h2 style={{ fontSize:20, fontWeight:700, margin:0 }}>{selTC.title}</h2><p style={{ fontSize:13, color:T.mid, margin:0 }}>{selTC.desc}</p></div>
          </div>
          {catTips.map((tip, i) => { const isE = expTip===tip.id; const isL = liked[`tip-${tip.id}`]; return (
            <div key={tip.id} style={{ ...cd, marginBottom:12, overflow:"hidden", borderColor:isE?T.primary+"40":T.borderL }}>
              <div onClick={() => setExpTip(isE?null:tip.id)} style={{ padding:16, cursor:"pointer" }} onMouseEnter={e=>{e.currentTarget.style.background=T.bg}} onMouseLeave={e=>{e.currentTarget.style.background=T.card}}>
                <div style={{ fontWeight:700, fontSize:16, marginBottom:6 }}>{tip.title}</div>
                <div style={{ ...(!isE ? twoLineClampStyle : {}), fontSize:13, lineHeight:1.6, color:T.mid, whiteSpace:isE ? "pre-wrap" : "normal", overflowWrap:"anywhere", wordBreak:"break-word" }}>{limitCardText(tip.text)}</div>
                {isE && tip.photos?.length > 0 && (
                  <div style={{ display:"flex", gap:8, overflowX:"auto", marginTop:10, paddingBottom:4, scrollSnapType:"x mandatory" }}>
                    {tip.photos.map((ph, pi) => (
                      <img key={pi} src={ph} alt="" style={{ width:86, height:86, objectFit:"cover", borderRadius:10, border:`1px solid ${T.border}`, cursor:"zoom-in", flexShrink:0, scrollSnapAlign:"start" }} onClick={(e)=>{e.stopPropagation(); openPhotoViewer(tip.photos, pi);}} />
                    ))}
                  </div>
                )}
                {isE && tip.photos?.length > 1 && <div style={{ fontSize:11, color:T.light, marginTop:2 }}>Листайте фото →</div>}
                <div style={{ display:"flex", justifyContent:"space-between", marginTop:10 }}>
                  <span style={{ fontSize:11, color:T.light }}>от {tip.author}</span>
                  <div style={{ display:"flex", gap:10, fontSize:12, color:T.mid }}>
                    <span>❤️ {tip.likes||0}</span>
                    <span>💬 {tip.comments.length}</span>
                    <span style={{ color:isE?T.primary:T.light, transform:isE?"rotate(180deg)":"", transition:"0.3s" }}>▼</span>
                  </div>
                </div>
              </div>
              {isE && (<div style={{ borderTop:`1px solid ${T.borderL}` }}>
                <div style={{ padding:"16px 16px 0", display:"none" }}>
                  <button onClick={(e) => { e.stopPropagation(); handleToggleLike(tip.id,"tip"); }} style={{ ...pl(isL), marginBottom:8, fontSize:12 }}>{isL ? "❤️ Понравилось" : "🤍 Нравится"}</button>
                </div>
                <div style={{ padding:"14px 16px 10px", display:"flex", gap:14, alignItems:"center" }}>
                  <button onClick={(e) => { e.stopPropagation(); handleToggleLike(tip.id,"tip"); }} style={{ background:"none", border:"none", cursor:"pointer", fontFamily:"inherit", display:"flex", alignItems:"center", gap:5, fontSize:18, color:isL?"#E74C3C":T.mid, padding:0 }} title="Нравится">{isL ? "♥" : "♡"} <span style={{ fontSize:14 }}>{tip.likes||0}</span></button>
                  <button onClick={(e)=>{e.stopPropagation(); setShowComments(`tip-${tip.id}`);}} style={{ background:"none", border:"none", cursor:"pointer", fontFamily:"inherit", display:"flex", alignItems:"center", gap:5, fontSize:18, color:T.mid, padding:0 }} title="Комментарии">◌ <span style={{ fontSize:14 }}>{(tip.comments||[]).length}</span></button>
                  <button onClick={(e)=>{e.stopPropagation(); handleNativeShare({ title:tip.title, text:tip.text, url:window.location.href });}} style={{ marginLeft:"auto", background:"none", border:"none", cursor:"pointer", fontFamily:"inherit", fontSize:18, color:T.mid, padding:0 }} title="Поделиться">➤</button>
                </div>
                {renderComments(tip, "tip", handleAddComment)}
              </div>)}
            </div>
          ); })}
          <button onClick={() => { if (!user) {handleLogin();return;} setNewTipPhotos([]); setShowAddTip(true); }} style={{ ...cd, width:"100%", marginTop:4, padding:16, border:`2px dashed ${T.primary}40`, color:T.primary, fontWeight:600, fontSize:14, cursor:"pointer", fontFamily:"inherit", display:"flex", alignItems:"center", justifyContent:"center", gap:6, boxShadow:"none" }}>＋ Поделиться опытом</button>
        </div>)}

        {/* ADD TIP MODAL */}
        {showAddTip && selTC && (<div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.4)", zIndex:100, display:"flex", alignItems:"flex-end", justifyContent:"center" }} onClick={()=>{setShowAddTip(false); setNewTipPhotos([]);}}>
          <div style={{ ...cd, width:"100%", maxWidth:480, borderRadius:"24px 24px 0 0", padding:"24px 20px 32px", maxHeight:"90vh", overflowY:"auto" }} onClick={e=>e.stopPropagation()}>
            <div style={{ width:40, height:4, borderRadius:2, background:T.border, margin:"0 auto 20px" }} />
            <h3 style={{ fontSize:18, fontWeight:700, margin:"0 0 20px" }}>{selTC.icon} Новый совет · {selTC.title}</h3>
            <label style={{ fontSize:12, fontWeight:600, color:T.mid, marginBottom:6, display:"block" }}>Заголовок *</label>
            <input value={newTip.title} onChange={e=>setNewTip({...newTip,title:e.target.value})} placeholder="О чём совет?" style={{ ...iS, marginBottom:14 }} />
            <label style={{ fontSize:12, fontWeight:600, color:T.mid, marginBottom:6, display:"block" }}>Текст *</label>
            <textarea value={newTip.text} maxLength={CARD_TEXT_MAX} onChange={e=>setNewTip({...newTip,text:e.target.value.slice(0, CARD_TEXT_MAX)})} placeholder="Поделитесь опытом..." style={{ ...iS, minHeight:120, resize:"vertical", marginBottom:6 }} />
            <div style={{ fontSize:11, color:T.light, marginBottom:14, textAlign:"right" }}>{newTip.text.length}/{CARD_TEXT_MAX}</div>
            <input ref={tipFileRef} type="file" accept="image/*" multiple onChange={handleTipPhotos} style={{ display:"none" }} />
            <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:20 }}>
              {newTipPhotos.map((p,i) => (
                <div key={i} style={{ position:"relative", width:60, height:60, borderRadius:8, overflow:"hidden", border:`1px solid ${T.border}`, flexShrink:0 }}>
                  <img src={p.preview} alt="" style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }} />
                  <button onClick={()=>setNewTipPhotos(pr=>pr.filter((_,j)=>j!==i))} style={{ position:"absolute", top:2, right:2, background:"rgba(0,0,0,0.5)", border:"none", color:"#fff", cursor:"pointer", borderRadius:"50%", width:18, height:18, fontSize:10, display:"flex", alignItems:"center", justifyContent:"center", padding:0 }}>✕</button>
                </div>
              ))}
              {newTipPhotos.length < 3 && <button onClick={()=>tipFileRef.current?.click()} style={{ padding:"6px 14px", background:T.bg, border:`1.5px dashed ${T.border}`, borderRadius:8, color:T.primary, fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>＋ Фото (до 3)</button>}
            </div>
            <div style={{ display:"flex", gap:10 }}><button onClick={()=>{setShowAddTip(false); setNewTipPhotos([]);}} style={{ ...pl(false), flex:1, padding:14 }}>Отмена</button><button onClick={handleAddTip} disabled={!newTip.title||!newTip.text} style={{ ...pl(true), flex:2, padding:14, opacity:(!newTip.title||!newTip.text)?0.5:1 }}>Опубликовать</button></div>
          </div>
        </div>)}

        {/* EVENTS */}
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
                  Все
                </button>
                {Array.from({length:7}, (_,i) => {
                  const d = new Date(); d.setDate(d.getDate()+i);
                  const dayNames = ["Вс","Пн","Вт","Ср","Чт","Пт","Сб"];
                  const isActive = filterDate && new Date(filterDate).toDateString() === d.toDateString();
                  const isToday = i === 0;
                  return (
                    <button key={i} onClick={() => setFilterDate(isActive ? null : d.toISOString())}
                      style={{ padding:"6px 10px", borderRadius:12, border:`1.5px solid ${isActive?T.primary:T.border}`, background:isActive?T.primary:T.card, color:isActive?"#fff":T.text, fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"inherit", flexShrink:0, minWidth:46, textAlign:"center", display:"flex", flexDirection:"column", alignItems:"center", gap:2 }}>
                      <span style={{ fontSize:10, color:isActive?"#fff":T.light, fontWeight:400 }}>{isToday?"Сегодня":dayNames[d.getDay()]}</span>
                      <span style={{ fontSize:15, fontWeight:700 }}>{d.getDate()}</span>
                    </button>
                  );
                })}
              </div>
              {/* Calendar picker — always visible */}
              <div style={{ position:"relative", flexShrink:0 }}>
                <button onClick={() => setShowDatePicker(!showDatePicker)}
                  style={{ padding:"6px 12px", borderRadius:12, border:`1.5px solid ${showDatePicker?T.primary:T.border}`, background:showDatePicker?T.primaryLight:T.card, color:T.mid, fontSize:16, cursor:"pointer", fontFamily:"inherit", width:46, height:"100%", display:"flex", alignItems:"center", justifyContent:"center" }}>
                  📅
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
                📅 {fmtDate(filterDate).split(",").slice(0,2).join(",")}
                <button onClick={() => setFilterDate(null)} style={{ background:"none", border:"none", color:T.primary, cursor:"pointer", fontSize:12, fontFamily:"inherit", fontWeight:600, padding:0 }}>✕ сбросить</button>
              </div>
            )}
          </div>
          {catEvents.map((ev, i) => { const isEvExp = exp === `ev-${ev.id}`; const eventWebsite = normalizeExternalUrl(ev.website); return (<div key={ev.id} style={{ ...cd, marginBottom:12, overflow:"hidden", borderColor:isEvExp?T.primary+"40":T.borderL }}>
            <div onClick={() => setExp(isEvExp?null:`ev-${ev.id}`)} style={{ padding:18, cursor:"pointer" }} onMouseEnter={e=>{e.currentTarget.style.background=T.bg}} onMouseLeave={e=>{e.currentTarget.style.background=T.card}}>
              <div style={{ fontWeight:700, fontSize:16, marginBottom:8 }}>{ev.title}</div>
              <div style={{ display:"flex", flexDirection:"column", gap:4, marginBottom:10 }}>
                <div style={{ fontSize:13, color:T.mid }}>📅 {fmtDate(ev.date)}</div>
                {ev.location && <div style={{ fontSize:13, color:T.mid }}>📍 {ev.location}</div>}
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
                <div style={{ display:"flex", gap:10, fontSize:12, color:T.mid }}>
                  <span>❤️ {ev.likes}</span>
                  <span>💬 {(ev.comments||[]).length}</span>
                  <span style={{ fontSize:10, color:isEvExp?T.primary:T.light, transform:isEvExp?"rotate(180deg)":"", transition:"0.3s" }}>▼</span>
                </div>
              </div>
            </div>
            {isEvExp && (<div style={{ borderTop:`1px solid ${T.borderL}` }}>
              <div style={{ padding:"14px 16px 10px", display:"flex", gap:14, alignItems:"center" }}>
                <button onClick={(e)=>{e.stopPropagation(); handleToggleLike(ev.id,"event");}} style={{ background:"none", border:"none", cursor:"pointer", fontFamily:"inherit", display:"flex", alignItems:"center", gap:5, fontSize:18, color:liked[`event-${ev.id}`]?"#E74C3C":T.mid, padding:0 }} title="Нравится">{liked[`event-${ev.id}`] ? "♥" : "♡"} <span style={{ fontSize:14 }}>{ev.likes||0}</span></button>
                <button onClick={(e)=>{e.stopPropagation(); setShowComments(`event-${ev.id}`);}} style={{ background:"none", border:"none", cursor:"pointer", fontFamily:"inherit", display:"flex", alignItems:"center", gap:5, fontSize:18, color:T.mid, padding:0 }} title="Комментарии">◌ <span style={{ fontSize:14 }}>{(ev.comments||[]).length}</span></button>
                <button onClick={(e)=>{e.stopPropagation(); handleNativeShare({ title:ev.title, text:ev.desc, url:window.location.href });}} style={{ marginLeft:"auto", background:"none", border:"none", cursor:"pointer", fontFamily:"inherit", fontSize:18, color:T.mid, padding:0 }} title="Поделиться">➤</button>
              </div>
              {renderComments(ev, "event", addEventComment)}
              {user && (user.id === ev.userId || user.name === ev.author) && (
                <div style={{ padding:"0 16px 16px" }}>
                  <button onClick={(e)=>{e.stopPropagation(); startEditEvent(ev);}} style={{ width:"100%", padding:"10px 0", borderRadius:24, border:`1.5px solid ${T.primary}55`, cursor:"pointer", fontFamily:"inherit", fontSize:12, fontWeight:600, background:T.primaryLight, color:T.primary }}>Редактировать событие</button>
                </div>
              )}
            </div>)}
          </div>); })}
          {catEvents.length===0 && <p style={{ fontSize:13, color:T.mid, textAlign:"center", padding:20 }}>Пока нет событий в этой категории</p>}
          <button onClick={() => { if (!user) {handleLogin();return;} setEditingEvent(null); setNewEvent({ title:"", date:"", location:"", desc:"", website:"", cat:selEC?.id||"" }); setNewEventPhotos([]); setAddrValidEvent(false); setAddrOptionsEvent([]); setShowAddEvent(true); }} style={{ ...cd, width:"100%", marginTop:4, padding:16, border:`2px dashed ${T.primary}40`, color:T.primary, fontWeight:600, fontSize:14, cursor:"pointer", fontFamily:"inherit", display:"flex", alignItems:"center", justifyContent:"center", gap:6, boxShadow:"none" }}>＋ Добавить событие</button>
        </div>)}

        {/* ADD EVENT MODAL */}
        {showAddEvent && (<div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.4)", zIndex:100, display:"flex", alignItems:"flex-end", justifyContent:"center" }} onClick={()=>{setShowAddEvent(false); setNewEventPhotos([]); setAddrOptionsEvent([]); setAddrValidEvent(false); setEditingEvent(null);}}>
          <div style={{ ...cd, width:"100%", maxWidth:480, borderRadius:"24px 24px 0 0", padding:"24px 20px 32px", maxHeight:"90vh", overflowY:"auto" }} onClick={e=>e.stopPropagation()}>
            <div style={{ width:40, height:4, borderRadius:2, background:T.border, margin:"0 auto 20px" }} />
            {!user ? (<div style={{ textAlign:"center", padding:"20px 0" }}><div style={{ fontSize:48, marginBottom:16 }}>🔐</div><button onClick={handleLogin} style={{ ...pl(true), padding:"14px 28px" }}>Войти через Google</button></div>) : (<>
              <h3 style={{ fontSize:18, fontWeight:700, margin:"0 0 20px" }}>{editingEvent ? "✏️ Редактировать событие" : "🎉 Новое событие"}</h3>
              <label style={{ fontSize:12, fontWeight:600, color:T.mid, marginBottom:6, display:"block" }}>Название *</label>
              <input value={newEvent.title} onChange={e=>setNewEvent({...newEvent,title:e.target.value})} placeholder="Что за мероприятие?" style={{ ...iS, marginBottom:14 }} />
              <label style={{ fontSize:12, fontWeight:600, color:T.mid, marginBottom:6, display:"block" }}>Категория *</label>
              <select value={newEvent.cat} onChange={e=>setNewEvent({...newEvent,cat:e.target.value})} style={{ ...iS, marginBottom:14, appearance:"none", color:newEvent.cat?T.text:T.light }}>
                <option value="">Выберите</option>{EVENT_CATS.map(c=><option key={c.id} value={c.id}>{c.icon} {c.title}</option>)}
              </select>
              <label style={{ fontSize:12, fontWeight:600, color:T.mid, marginBottom:6, display:"block" }}>Дата и время *</label>
              <input type="datetime-local" value={newEvent.date} onChange={e=>setNewEvent({...newEvent,date:e.target.value})} style={{ ...iS, marginBottom:14 }} />
              <label style={{ fontSize:12, fontWeight:600, color:T.mid, marginBottom:6, display:"block" }}>Место</label>
              <input value={newEvent.location} onChange={e=>{setNewEvent({...newEvent,location:e.target.value}); setAddrValidEvent(false);}} placeholder="Адрес или название места" style={{ ...iS, marginBottom:6, borderColor:newEvent.location && !addrValidEvent ? "#f5b7b1" : T.border }} />
              {addrLoadingEvent && <div style={{ fontSize:12, color:T.mid, marginBottom:8 }}>Ищем место...</div>}
              {!addrLoadingEvent && addrOptionsEvent.length > 0 && !addrValidEvent && (
                <div style={{ marginBottom:10, border:`1px solid ${T.border}`, borderRadius:10, overflow:"hidden", maxHeight:160, overflowY:"auto", background:T.card }}>
                  {addrOptionsEvent.map((opt, i) => (
                    <button key={`${opt.value}-${i}`} onClick={() => { setNewEvent(prev => ({ ...prev, location: opt.value })); setAddrValidEvent(true); setAddrOptionsEvent([]); }} style={{ width:"100%", textAlign:"left", padding:"10px 12px", border:"none", borderBottom:i < addrOptionsEvent.length-1 ? `1px solid ${T.borderL}` : "none", background:T.card, cursor:"pointer", fontFamily:"inherit", fontSize:12, color:T.mid }}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
              {newEvent.location && !addrValidEvent && <div style={{ fontSize:12, color:"#E74C3C", marginBottom:10 }}>Выберите реальное место из подсказок.</div>}
              <label style={{ fontSize:12, fontWeight:600, color:T.mid, marginBottom:6, display:"block" }}>Описание *</label>
              <textarea value={newEvent.desc} maxLength={CARD_TEXT_MAX} onChange={e=>setNewEvent({...newEvent,desc:e.target.value.slice(0, CARD_TEXT_MAX)})} placeholder="Подробности..." style={{ ...iS, minHeight:80, resize:"vertical", marginBottom:6 }} />
              <div style={{ fontSize:11, color:T.light, marginBottom:12, textAlign:"right" }}>{newEvent.desc.length}/{CARD_TEXT_MAX}</div>
              <label style={{ fontSize:12, fontWeight:600, color:T.mid, marginBottom:6, display:"block" }}>Сайт (необязательно)</label>
              <input value={newEvent.website || ""} onChange={e=>setNewEvent({...newEvent,website:e.target.value})} placeholder="https://..." style={{ ...iS, marginBottom:20 }} />
              <input ref={eventFileRef} type="file" accept="image/*" multiple onChange={handleEventPhotos} style={{ display:"none" }} />
              <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:20 }}>
                {newEventPhotos.map((p,i) => (
                  <div key={i} style={{ position:"relative", width:60, height:60, borderRadius:8, overflow:"hidden", border:`1px solid ${T.border}`, flexShrink:0 }}>
                    <img src={p.preview} alt="" style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }} />
                    <button onClick={()=>setNewEventPhotos(pr=>pr.filter((_,j)=>j!==i))} style={{ position:"absolute", top:2, right:2, background:"rgba(0,0,0,0.5)", border:"none", color:"#fff", cursor:"pointer", borderRadius:"50%", width:18, height:18, fontSize:10, display:"flex", alignItems:"center", justifyContent:"center", padding:0 }}>✕</button>
                  </div>
                ))}
                {newEventPhotos.length < 3 && <button onClick={()=>eventFileRef.current?.click()} style={{ padding:"6px 14px", background:T.bg, border:`1.5px dashed ${T.border}`, borderRadius:8, color:T.primary, fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>＋ Фото (до 3)</button>}
              </div>
              <div style={{ display:"flex", gap:10 }}>
                <button onClick={()=>{setShowAddEvent(false); setNewEventPhotos([]); setAddrOptionsEvent([]); setAddrValidEvent(false); setEditingEvent(null);}} style={{ ...pl(false), flex:1, padding:14 }}>Отмена</button>
                {editingEvent && <button onClick={()=>handleDeleteEvent(editingEvent.id)} style={{ ...pl(false), flex:1, padding:14, border:"1.5px solid #fecaca", color:"#E74C3C", background:"#FFF5F5" }}>Удалить</button>}
                <button onClick={handleAddEvent} disabled={!newEvent.title||!newEvent.date||!newEvent.desc||!newEvent.cat} style={{ ...pl(true), flex:2, padding:14, opacity:(!newEvent.title||!newEvent.date||!newEvent.desc||!newEvent.cat)?0.5:1 }}>{editingEvent ? "Сохранить" : "Опубликовать"}</button>
              </div>
            </>)}
          </div>
        </div>)}

        {/* CHAT */}
        {scr==="chat" && (<div style={{ display:"flex", flexDirection:"column", height:"calc(100vh - 120px)" }}>
          <button onClick={goHome} style={bk}>← Главная</button>
          {!user ? (<div style={{ textAlign:"center", padding:"40px 20px" }}><div style={{ fontSize:48, marginBottom:16 }}>🔐</div><h3 style={{ fontSize:18, fontWeight:700, margin:"0 0 20px" }}>Войдите для AI-чата</h3><button onClick={handleLogin} style={{ ...pl(true), padding:"14px 28px" }}>Войти через Google</button></div>) : (<>
            <div style={{ flex:1, overflowY:"auto", paddingBottom:12 }}>
              {chat.map((m,i) => (<div key={i} style={{ display:"flex", justifyContent:m.role==="user"?"flex-end":"flex-start", marginBottom:10 }}>
                <div style={{ maxWidth:"85%", padding:"12px 16px", borderRadius:m.role==="user"?"18px 18px 4px 18px":"18px 18px 18px 4px", background:m.role==="user"?T.primary:T.card, color:m.role==="user"?"#fff":T.text, fontSize:14, lineHeight:1.55, boxShadow:m.role==="user"?"0 2px 10px rgba(244,123,32,0.25)":T.sh, border:m.role==="user"?"none":`1px solid ${T.borderL}`, whiteSpace:"pre-wrap" }}>{m.text}</div>
              </div>))}
              {typing && <div style={{ display:"flex", marginBottom:10 }}><div style={{ ...cd, padding:"14px 20px", display:"flex", gap:5 }}>{[0,1,2].map(j=><div key={j} style={{ width:7, height:7, borderRadius:"50%", background:T.primary, opacity:0.4, animation:`pulse 1.2s ease ${j*0.2}s infinite` }} />)}</div></div>}
              <div ref={chatEnd} />
            </div>
            {chat.length<=1 && <div style={{ marginBottom:12 }}><div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>{["Грин-карта через брак?","Стоимость N-400?","Работа без EAD?","Статус кейса?"].map((s,i)=><button key={i} onClick={()=>handleSend(s)} style={pl(false)}>{s}</button>)}</div></div>}
            <div style={{ display:"flex", gap:8, padding:"12px 0", borderTop:`1px solid ${T.borderL}` }}>
              <input ref={inpRef} value={inp} onChange={e=>setInp(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleSend()} placeholder="Задайте вопрос..." style={{ ...iS, flex:1, width:"auto" }} />
              <button onClick={()=>handleSend()} disabled={!inp.trim()} style={{ width:48, height:48, borderRadius:14, border:"none", background:inp.trim()?T.primary:T.bg, color:inp.trim()?"#fff":T.light, fontSize:20, cursor:inp.trim()?"pointer":"default", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>↑</button>
            </div>
          </>)}
        </div>)}
      </main>

      {showMapModal && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.55)", zIndex:280, display:"flex", alignItems:"center", justifyContent:"center", padding:12 }} onClick={() => setShowMapModal(false)}>
          <div style={{ ...cd, width:"100%", maxWidth:980, height:"90vh", borderRadius:18, overflow:"hidden", display:"grid", gridTemplateRows:"auto 1fr auto" }} onClick={(e)=>e.stopPropagation()}>
            <div style={{ padding:"12px 14px", borderBottom:`1px solid ${T.borderL}`, display:"flex", alignItems:"center", justifyContent:"space-between", gap:10 }}>
              <div style={{ fontWeight:700, fontSize:15 }}>Карта мест · {selPC?.title || "Категория"}</div>
              <button onClick={() => setShowMapModal(false)} style={{ border:`1px solid ${T.border}`, background:T.card, borderRadius:10, padding:"6px 10px", cursor:"pointer", fontFamily:"inherit", color:T.mid }}>Закрыть</button>
            </div>

            <div style={{ position:"relative", background:"#ECEFF3" }}>
              {mapLoading && (
                <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", zIndex:2, background:"rgba(255,255,255,0.65)", color:T.mid, fontSize:14 }}>
                  Загружаем карту и точки...
                </div>
              )}
              {!mapLoading && mapPlaces.length === 0 && (
                <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", zIndex:2, color:T.mid, fontSize:14 }}>
                  Не удалось найти координаты для точек в этой категории.
                </div>
              )}
              <div ref={mapContainerRef} style={{ width:"100%", height:"100%" }} />
            </div>

            <div style={{ borderTop:`1px solid ${T.borderL}`, padding:12, background:T.card }}>
              {selectedMapPlace ? (
                <div style={{ display:"flex", flexWrap:"wrap", alignItems:"center", gap:8 }}>
                  <div style={{ flex:"1 1 280px" }}>
                    <div style={{ fontWeight:700, fontSize:14 }}>{selectedMapPlace.name}</div>
                    <div style={{ fontSize:12, color:T.mid }}>{selectedMapPlace.address || selD?.name}</div>
                  </div>
                  <button onClick={() => openRouteForPlace(selectedMapPlace, "google")} style={{ ...pl(false), padding:"10px 12px" }}>Google маршрут</button>
                  <button onClick={() => openRouteForPlace(selectedMapPlace, "apple")} style={{ ...pl(false), padding:"10px 12px" }}>Apple маршрут</button>
                </div>
              ) : (
                <div style={{ fontSize:12, color:T.mid }}>Нажмите на точку на карте, чтобы построить маршрут.</div>
              )}
            </div>
          </div>
        </div>
      )}

      {photoViewer && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.82)", zIndex:300, display:"flex", alignItems:"center", justifyContent:"center", padding:16, touchAction:"none" }}>
          <button onClick={closePhotoViewer} style={{ position:"absolute", top:14, right:14, width:36, height:36, borderRadius:"50%", border:"1px solid rgba(255,255,255,0.35)", background:"rgba(0,0,0,0.35)", color:"#fff", fontSize:18, cursor:"pointer", zIndex:2 }}>×</button>
          {photoViewer.photos.length > 1 && (
            <>
              <button onClick={goPrevPhoto} style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", width:42, height:42, borderRadius:"50%", border:"1px solid rgba(255,255,255,0.35)", background:"rgba(0,0,0,0.35)", color:"#fff", fontSize:22, cursor:"pointer", zIndex:2 }}>‹</button>
              <button onClick={goNextPhoto} style={{ position:"absolute", right:10, top:"50%", transform:"translateY(-50%)", width:42, height:42, borderRadius:"50%", border:"1px solid rgba(255,255,255,0.35)", background:"rgba(0,0,0,0.35)", color:"#fff", fontSize:22, cursor:"pointer", zIndex:2 }}>›</button>
            </>
          )}
          <div
            onTouchStart={onPhotoTouchStart}
            onTouchMove={onPhotoTouchMove}
            onTouchEnd={onPhotoTouchEnd}
            style={{ width:"100%", height:"100%", display:"flex", alignItems:"center", justifyContent:"center", overflow:"hidden", touchAction:"none" }}
          >
            <img
              src={photoViewer.photos[photoViewer.index]}
              alt=""
              draggable={false}
              style={{ maxWidth:"100%", maxHeight:"88vh", borderRadius:12, boxShadow:"0 10px 36px rgba(0,0,0,0.4)", transform:`scale(${photoZoom})`, transformOrigin:"center center", transition:photoZoom === 1 ? "transform 0.2s ease" : "none", userSelect:"none", WebkitUserSelect:"none" }}
            />
          </div>
          {photoViewer.photos.length > 1 && (
            <div style={{ position:"absolute", bottom:14, left:"50%", transform:"translateX(-50%)", color:"#fff", fontSize:12, background:"rgba(0,0,0,0.35)", border:"1px solid rgba(255,255,255,0.25)", padding:"5px 10px", borderRadius:999 }}>
              {photoViewer.index + 1} / {photoViewer.photos.length}
            </div>
          )}
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






