// Extracted from SvoiApp.jsx for modularity

export const T = { primary: "#F47B20", primaryLight: "#FFF3E8", bg: "#F2F2F7", card: "#FFFFFF", text: "#1A1A1A", mid: "#6B6B6B", light: "#999", border: "#E5E5E5", borderL: "#F0F0F0", sh: "0 2px 12px rgba(0,0,0,0.06)", shH: "0 4px 20px rgba(0,0,0,0.1)", r: 16, rs: 12 };

export const DISTRICTS = [
  { id:"weho", name:"West Hollywood", emoji:"🌴", desc:"Restaurants, nightlife", lat:34.0900, lng:-118.3617 },
  { id:"hollywood", name:"Hollywood", emoji:"⭐", desc:"Bars, hiking, concerts", lat:34.0928, lng:-118.3287 },
  { id:"glendale", name:"Glendale", emoji:"🏔️", desc:"Family spots, food", lat:34.1425, lng:-118.2551 },
  { id:"dtla", name:"Downtown LA", emoji:"🏙️", desc:"Coffee, books, lofts", lat:34.0407, lng:-118.2468 },
  { id:"valley", name:"Studio City / Valley", emoji:"🎬", desc:"Speakeasy bars", lat:34.1486, lng:-118.3965 },
  { id:"silverlake", name:"Silver Lake / Los Feliz", emoji:"🎨", desc:"Indie, observatory", lat:34.0869, lng:-118.2702 },
  { id:"westside", name:"Santa Monica / Venice", emoji:"🏖️", desc:"Beach, canals", lat:34.0195, lng:-118.4912 },
  { id:"southbay", name:"South Bay / Beach", emoji:"🌊", desc:"Manhattan Beach, Hermosa Beach, Redondo Beach, Long Beach", lat:33.8622, lng:-118.3995 },
  { id:"pasadena", name:"Pasadena", emoji:"🌸", desc:"Nature, trails", lat:34.1478, lng:-118.1445 },
  { id:"midcity", name:"Mid-City / Melrose", emoji:"🛍️", desc:"Shopping, cafes", lat:34.0771, lng:-118.3442 },
];

export const PLACE_CATS = [
  { id:"restaurants", icon:"🍽️", title:"Рестораны", color:"#E74C3C" },
  { id:"bars", icon:"🍸", title:"Бары", color:"#8E44AD" },
  { id:"coffee", icon:"☕", title:"Кофе", color:"#F47B20" },
  { id:"hiking", icon:"🥾", title:"Хайкинг", color:"#27AE60" },
  { id:"interesting", icon:"✨", title:"Интересно", color:"#2980B9" },
  { id:"music", icon:"🎵", title:"Музыка", color:"#E91E8C" },
];

export const PLACE_CAT_IDS = new Set(PLACE_CATS.map((c) => c.id));

export const INIT_PLACES = [
  { id:1, cat:"restaurants", district:"hollywood", name:"République", address:"624 S La Brea Ave, Los Angeles, CA", tip:"Французская кухня и известная пекарня в историческом здании.", addedBy:"Admin", img:"🍽️", photos:[], likes:34, comments:[] },
  { id:2, cat:"bars", district:"weho", name:"Employees Only", address:"7953 Santa Monica Blvd, West Hollywood, CA", tip:"Коктейльный бар в стиле speakeasy с классическим меню.", addedBy:"Admin", img:"🍸", photos:[], likes:41, comments:[] },
  { id:3, cat:"coffee", district:"dtla", name:"Verve Coffee Roasters", address:"833 S Spring St, Los Angeles, CA", tip:"Спешелти-кофе и много мест для работы в центре города.", addedBy:"Admin", img:"☕", photos:[], likes:37, comments:[] },
  { id:4, cat:"hiking", district:"hollywood", name:"Runyon Canyon Park", address:"2000 N Fuller Ave, Los Angeles, CA", tip:"Популярный городской хайк с панорамными видами на LA.", addedBy:"Admin", img:"🥾", photos:[], likes:23, comments:[] },
  { id:5, cat:"interesting", district:"dtla", name:"The Last Bookstore", address:"453 S Spring St, Los Angeles, CA", tip:"Книжный с арт-инсталляциями и фотозонами в DTLA.", addedBy:"Admin", img:"✨", photos:[], likes:33, comments:[] },
  { id:6, cat:"music", district:"hollywood", name:"Hollywood Bowl", address:"2301 N Highland Ave, Los Angeles, CA", tip:"Одна из главных концертных площадок LA под открытым небом.", addedBy:"Admin", img:"🎵", photos:[], likes:61, comments:[] },
];

export const USCIS_CATS = [
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
export const CIVICS_RAW = [
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
  { q:"Name one right from the Declaration of Independence.", opts:["Life, liberty, and pursuit of happiness","Right to own land","Right to free college","Right to hold office"], c:0 },
  { q:"What does freedom of religion mean?", opts:["You can practice any religion, or not practice one","Only one religion is allowed","You must attend church weekly","Religion is controlled by states"], c:0 },
  { q:"Who does a U.S. Senator represent?", opts:["All people of the state","Only voters in one district","Only members of one party","Only people in the capital city"], c:0 },
  { q:"Why do some states have more Representatives than others?", opts:["Because they have more people","Because they are older states","Because they pay more taxes","Because they are larger in land area"], c:0 },
  { q:"If both the President and the Vice President can no longer serve, who becomes President?", opts:["The Speaker of the House","The Chief Justice","The Secretary of State","The Senate Majority Leader"], c:0 },
  { q:"Name one right only for U.S. citizens.", opts:["Vote in a federal election","Freedom of speech","Freedom of religion","Freedom of assembly"], c:0 },
  { q:"What are two rights of everyone living in the United States?", opts:["Freedom of speech and freedom of religion","Right to vote and hold office","Right to a U.S. passport and jury duty","Right to bear arms and run for President"], c:0 },
  { q:"What do we show loyalty to when we say the Pledge of Allegiance?", opts:["The United States and the flag","A political party","The President only","A state government"], c:0 },
  { q:"What is one promise you make when you become a U.S. citizen?", opts:["Give up loyalty to other countries","Never travel outside the U.S.","Vote in every election","Serve in the military"], c:0 },
  { q:"How old do citizens have to be to vote for President?", opts:["18 and older","16 and older","21 and older","25 and older"], c:0 },
  { q:"Name one war fought by the United States in the 1700s.", opts:["The Revolutionary War","The Civil War","World War I","The Vietnam War"], c:0 },
  { q:"What was one important thing Benjamin Franklin did?", opts:["He was a U.S. diplomat","He was the first President","He wrote the Constitution alone","He led the Union Army"], c:0 },
  { q:"What did the Federalist Papers support?", opts:["The passage of the U.S. Constitution","The end of slavery","The Louisiana Purchase","The Declaration of Independence"], c:0 },
  { q:"Name one writer of the Federalist Papers.", opts:["James Madison","George Washington","Abraham Lincoln","Thomas Paine"], c:0 },
  { q:"What war was fought between the North and the South?", opts:["The Civil War","The Revolutionary War","World War II","The Korean War"], c:0 },
  { q:"What did the Emancipation Proclamation do?", opts:["Freed slaves in the Confederacy","Ended World War I","Created the Constitution","Gave women the right to vote"], c:0 },
  { q:"Before he was President, Eisenhower was a general. What war was he in?", opts:["World War II","World War I","The Civil War","The War of 1812"], c:0 },
  { q:"Before he was President, what did Barack Obama do?", opts:["U.S. Senator","Supreme Court Justice","Governor of New York","Secretary of State"], c:0 },
  { q:"Name one of the two longest rivers in the United States.", opts:["Missouri River","Colorado River","Hudson River","Rio Grande"], c:0 },
  { q:"Name one American Indian tribe in the United States.", opts:["Cherokee","Viking","Inca","Saxon"], c:0 },
  { q:"Name one U.S. state that does not have an ocean coastline.", opts:["Nevada","California","Florida","New York"], c:0 },
  { q:"Name one national U.S. holiday.", opts:["Thanksgiving","Earth Day","Halloween","Valentine's Day"], c:0 },
  { q:"When is Memorial Day celebrated in the United States?", opts:["The last Monday in May","July 4","The first Monday in September","November 11"], c:0 },
  { q:"When is Labor Day celebrated in the United States?", opts:["The first Monday in September","The last Monday in May","July 4","December 25"], c:0 },
  { q:"When is Constitution Day?", opts:["September 17","July 4","June 14","November 11"], c:0 },
  { q:"What is one power of the federal government?", opts:["To print money","To issue driver licenses","To run local schools","To create city laws"], c:0 },
  { q:"What is one power of the states?", opts:["Provide schooling and education","Print money","Declare war","Create treaties"], c:0 },
  { q:"Name one Cabinet-level position.", opts:["Secretary of State","Chief Justice","Speaker of the House","Senate President"], c:0 },
  { q:"What is one responsibility that is for all people in the United States?", opts:["Obey the law","Vote in federal elections","Serve on a jury for federal court","Run for office"], c:0 },
  { q:"When is Flag Day?", opts:["June 14","July 4","September 17","November 11"], c:0 },
  { q:"What is one way Americans can participate in democracy?", opts:["Vote in elections","Ignore public issues","Skip taxes","Refuse jury service"], c:0 },
  { q:"Where can freedom of speech be used legally in daily life?", opts:["Public discussion and peaceful expression","Only at home","Only in court","Only in schools"], c:0 },
];

// Shuffle options for each question, tracking correct answer
export function shuffleTest(questions) {
  const shuffled = questions.map(q => {
    const indices = q.opts.map((_, i) => i);
    for (let i = indices.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [indices[i], indices[j]] = [indices[j], indices[i]]; }
    return { q: q.q, opts: indices.map(i => q.opts[i]), correctIdx: indices.indexOf(q.c) };
  });
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// ─── TIPS CATEGORIES ───
export const TIPS_CATS = [
  { id:"tipping", icon:"💰", title:"Чаевые", desc:"Сколько оставлять и где" },
  { id:"driving", icon:"🚗", title:"Вождение", desc:"Права, DMV, правила" },
  { id:"banking", icon:"🏦", title:"Банки и кредит", desc:"Счета, SSN, кредитная история" },
  { id:"health", icon:"🏥", title:"Медицина", desc:"Страховка, врачи, аптеки" },
  { id:"shopping", icon:"🛒", title:"Покупки", desc:"Где дешевле, возврат, налог" },
  { id:"social", icon:"🤝", title:"Общение", desc:"Культура, small talk, этикет" },
  { id:"housing", icon:"🏠", title:"Жильё", desc:"Аренда, депозит, права" },
  { id:"other", icon:"📝", title:"Разное", desc:"Всё остальное" },
];

export const INIT_TIPS = [
  { id:1, cat:"tipping", author:"Мария К.", title:"Чаевые в ресторане", text:"В ресторане стандарт — 18-20% от суммы ДО налога. 15% — минимум. Если обслуживание было отличное — 25%. В баре — $1-2 за напиток. Takeout — не обязательно, но 10% приятно.", likes:45, comments:[{id:201,author:"Дима С.",text:"В фастфуде не нужно! Только в ресторанах с обслуживанием."},{id:202,author:"Аня Б.",text:"Uber Eats / DoorDash — тоже 15-20% оставляйте, курьеры зависят от чаевых."}] },
  { id:2, cat:"tipping", author:"Алекс Р.", title:"Парикмахер, маникюр, доставка", text:"Парикмахер: 15-20%. Маникюр: 20%. Valet parking: $3-5. Доставка продуктов (Instacart): 10-15%. Movers: $20-50 на человека.", likes:32, comments:[{id:203,author:"Оля Т.",text:"Ещё забыли — отель горничным $2-5 за ночь оставляют на подушке."}] },
  { id:3, cat:"driving", author:"Макс Д.", title:"Как получить права в CA", text:"1. Записаться на DMV.ca.gov (online!). 2. Пройти written test (46 вопросов, можно на русском!). 3. Получить permit. 4. Практика. 5. Behind-the-wheel test. Real ID — возьми паспорт + 2 доказательства адреса.", likes:58, comments:[{id:204,author:"Игорь Н.",text:"Written test можно на русском — выбираешь язык при записи!"},{id:205,author:"Катя Л.",text:"За record нужно $39 за Class C."}] },
  { id:4, cat:"banking", author:"Саша К.", title:"Первый банк и кредитная история", text:"Открыть счёт можно с паспортом + ITIN (даже без SSN). Chase, Bank of America — бесплатные checking. Для кредитной истории — secured credit card (депозит $200-500). Через 6 мес будет credit score.", likes:41, comments:[] },
  { id:5, cat:"health", author:"Вера П.", title:"Как найти врача без страховки", text:"Community Health Centers — приём по sliding scale (от дохода). Medi-Cal — бесплатная страховка если доход низкий. Urgent Care — дешевле чем ER ($100-300 vs $3000+). GoodRx — скидки на лекарства до 80%.", likes:37, comments:[{id:206,author:"Рома Г.",text:"Covered California — marketplace для страховки. Открытая регистрация ноябрь-январь."}] },
  { id:6, cat:"social", author:"Лена В.", title:"Small talk — как не молчать", text:"Американцы обожают small talk. Темы: погода, weekend plans, спорт, еда. НЕ спрашивайте: сколько зарабатываете, возраст, за кого голосовали, почему нет детей. 'How are you?' — всегда отвечайте 'Good, thanks! And you?'", likes:53, comments:[{id:207,author:"Паша Ж.",text:"Ещё важно — всегда улыбайтесь! Серьёзное лицо = грубость тут."}] },
];

// ─── EVENTS ───
export const EVENT_CATS = [
  { id:"concerts", icon:"🎵", title:"Концерты", color:"#E91E8C" },
  { id:"holidays", icon:"🎄", title:"Праздники", color:"#E74C3C" },
  { id:"sports", icon:"⚽", title:"Спорт", color:"#27AE60" },
  { id:"community", icon:"🤝", title:"Комьюнити", color:"#F47B20" },
  { id:"markets", icon:"🛍️", title:"Маркеты / Распродажи", color:"#8E44AD" },
  { id:"wellness", icon:"🧘", title:"Йога / Здоровье", color:"#2980B9" },
];

export const INIT_EVENTS = [
  { id:1, cat:"community", title:"Встреча русскоязычных в Griffith Park", date:"2026-04-06T10:00", location:"Griffith Park, пикник-зона #5", desc:"Собираемся, общаемся, делимся опытом. Приносите еду на шейринг!", author:"Мария К.", likes:23, comments:[{id:101,author:"Дима С.",text:"Буду в это воскресенье!"}] },
  { id:2, cat:"wellness", title:"Йога у океана — бесплатно", date:"2026-04-05T08:00", location:"Santa Monica Beach, у пирса", desc:"Бесплатная йога на пляже. Коврик свой. Уровень любой.", author:"Аня Б.", likes:31, comments:[] },
  { id:3, cat:"markets", title:"Flea Market на Rose Bowl", date:"2026-04-12T07:00", location:"Rose Bowl, Pasadena", desc:"Огромная барахолка! Винтаж, одежда, мебель, еда. Вход $12 до 8am, $5 после 9am.", author:"Оля Т.", likes:18, comments:[] },
  { id:4, cat:"concerts", title:"Русский рок в The Satellite", date:"2026-04-15T20:00", location:"The Satellite, Silver Lake", desc:"Живые выступления русскоязычных групп. Вход $10. Бар работает.", author:"Паша Ж.", likes:27, comments:[] },
  { id:5, cat:"holidays", title:"Масленица в West Hollywood", date:"2026-03-08T12:00", location:"Plummer Park, West Hollywood", desc:"Блины, чай, игры, конкурсы! Приходите всей семьёй.", author:"Дима С.", likes:45, comments:[] },
  { id:6, cat:"markets", title:"Гаражная распродажа", date:"2026-04-05T09:00", location:"Studio City", desc:"Диван IKEA ($150), стол ($80), монитор 27\" ($120). Всё в отличном состоянии.", author:"Алекс Р.", likes:8, comments:[] },
];

export const INIT_HOUSING = [
  {
    id: 1,
    title: "The Parkline",
    address: "1457 N Main St, Los Angeles, CA",
    district: "Downtown LA",
    type: "Apartments for rent",
    minPrice: 1850,
    options: ["$1,850+ Studio", "$2,289+ 1 bd"],
    beds: 1,
    baths: 1,
    updatedLabel: "Updated yesterday",
    tags: ["pool", "gym", "parking"],
    photo: "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: 2,
    title: "La Plaza Village",
    address: "555 N Spring St, Los Angeles, CA",
    district: "Downtown LA",
    type: "Apartments for rent",
    minPrice: 1842,
    options: ["$1,842+ Studio", "$2,387+ 1 bd", "$3,296+ 2 bds"],
    beds: 2,
    baths: 2,
    updatedLabel: "",
    tags: ["pet-friendly", "gym", "washer-dryer"],
    photo: "https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: 3,
    title: "Sentral Koreatown",
    address: "680 S Berendo St, Los Angeles, CA",
    district: "Koreatown",
    type: "Lofts for rent",
    minPrice: 2395,
    options: ["$2,395+ 1 bd", "$3,120+ 2 bds"],
    beds: 2,
    baths: 2,
    updatedLabel: "Updated 2 days ago",
    tags: ["rooftop", "pet-friendly", "parking"],
    photo: "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: 4,
    title: "Venice Breeze Homes",
    address: "1101 Abbot Kinney Blvd, Venice, CA",
    district: "Venice",
    type: "Townhomes for rent",
    minPrice: 3290,
    options: ["$3,290+ 2 bds", "$4,150+ 3 bds"],
    beds: 3,
    baths: 2,
    updatedLabel: "",
    tags: ["backyard", "pet-friendly", "garage"],
    photo: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: 5,
    title: "Miracle Mile Flats",
    address: "6110 Wilshire Blvd, Los Angeles, CA",
    district: "Mid-City",
    type: "Studios for rent",
    minPrice: 1695,
    options: ["$1,695+ Studio", "$2,120+ 1 bd"],
    beds: 1,
    baths: 1,
    updatedLabel: "Updated today",
    tags: ["studio", "laundry", "parking"],
    photo: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
  },
];

export const SECTIONS = [
  { id:"uscis", icon:"📋", title:"USCIS", desc:"Документы" },
  { id:"places", icon:"📍", title:"Места", desc:"От своих" },
  { id:"tips", icon:"💡", title:"Советы", desc:"Лайфхаки" },
  { id:"events", icon:"🎉", title:"События", desc:"Мероприятия" },
  { id:"jobs", icon:"💼", title:"Работа", desc:"Вакансии", soon:true },
  { id:"housing", icon:"🏠", title:"Жильё", desc:"Аренда" },
  { id:"chat-sec", icon:"💬", title:"AI Чат", desc:"Помощник" },
];

export const RICH_PREFIX = "__LA_RICH_V1__";
export const CARD_TEXT_MAX = 500;

export function limitCardText(text = "") {
  const normalized = String(text || "");
  return normalized.length > CARD_TEXT_MAX ? `${normalized.slice(0, CARD_TEXT_MAX)}…` : normalized;
}

export const twoLineClampStyle = {
  overflow: "hidden",
  display: "-webkit-box",
  WebkitLineClamp: 2,
  WebkitBoxOrient: "vertical",
};

export function encodeRichText(text, photos = [], extra = {}) {
  const payload = { text, photos: photos || [], ...extra };
  if (!payload.photos.length && !payload.website) return text;
  return `${RICH_PREFIX}${JSON.stringify(payload)}`;
}

export function decodeRichText(raw) {
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

export function getUscisPdfUrl(doc) {
  const rawUrl = String(doc?.url || "").trim();
  if (!rawUrl) return "";
  if (/\.pdf(\?|#|$)/i.test(rawUrl)) return rawUrl;
  if (!/uscis\.gov/i.test(rawUrl)) return "";

  const rawForm = String(doc?.form || "").trim().toLowerCase();
  const baseForm = rawForm.split(/[\/\s]/)[0];
  if (!/^[a-z]{1,3}-\d+[a-z]?$/i.test(baseForm)) return "";
  return `https://www.uscis.gov/sites/default/files/document/forms/${baseForm}.pdf`;
}

export function HeartIcon({ active = false, size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        d="M12 20.5c-.3 0-.6-.1-.8-.3C8.4 17.8 3 13.2 3 8.6 3 5.9 5.1 4 7.6 4c1.7 0 3.3.8 4.4 2.1C13.1 4.8 14.7 4 16.4 4 18.9 4 21 5.9 21 8.6c0 4.6-5.4 9.2-8.2 11.6-.2.2-.5.3-.8.3z"
        fill={active ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ViewIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        d="M2.5 12s3.6-6 9.5-6 9.5 6 9.5 6-3.6 6-9.5 6-9.5-6-9.5-6z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

export function HomeIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        d="M3.5 10.5 12 3.8l8.5 6.7"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5.5 9.8v9.2h13V9.8"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9.5 19v-4.5h5V19"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function CalendarIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <rect x="3.5" y="5" width="17" height="15.5" rx="3" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M7.5 3.5v3M16.5 3.5v3M3.5 9h17" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="8" cy="13" r="1" fill="currentColor" />
      <circle cx="12" cy="13" r="1" fill="currentColor" />
      <circle cx="16" cy="13" r="1" fill="currentColor" />
      <circle cx="8" cy="16.5" r="1" fill="currentColor" />
      <circle cx="12" cy="16.5" r="1" fill="currentColor" />
      <circle cx="16" cy="16.5" r="1" fill="currentColor" />
    </svg>
  );
}

export function StarIcon({ active = false, size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        d="m12 3.8 2.57 5.2 5.73.83-4.15 4.05.98 5.72L12 16.9l-5.13 2.7.98-5.72-4.15-4.05 5.73-.83L12 3.8z"
        fill={active ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ShareIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        d="M12 15V4"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8 8l4-4 4 4"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4 13.5V18a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function decodeHousingPhotos(raw) {
  if (Array.isArray(raw)) return raw.filter(Boolean);
  if (typeof raw !== "string" || !raw.trim()) return [];
  const trimmed = raw.trim();
  if (trimmed.startsWith("[")) {
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) return parsed.filter((x) => typeof x === "string" && x);
    } catch {}
  }
  return [trimmed];
}

export function encodeHousingPhotos(urls = []) {
  const clean = (urls || []).filter((x) => typeof x === "string" && x);
  if (!clean.length) return "";
  if (clean.length === 1) return clean[0];
  return JSON.stringify(clean);
}

export function formatPlaceAddressLabel(address = "") {
  const raw = String(address || "").trim();
  if (!raw) return "";
  const noState = raw.replace(/,\s*CA(?:\s+\d{5}(?:-\d{4})?)?$/i, "").trim();
  return noState.split(",")[0].trim();
}

