// Synced from web config for parity
export const USCIS_CATS = [
  { id:"greencard", icon:"🪪", title:"Грин-карта", subtitle:"Получение, продление, условия", docs:[
    { form:"I-485", nameEn:"Application to Register Permanent Residence", name:"Заявление на получение грин-карты", url:"https://www.uscis.gov/i-485", desc:"Adjustment of Status — из США", detail:"Пошлина: $1,440 (вкл. биометрию). Обработка: 8-14 мес. Можно подавать одновременно с I-130 (concurrent filing). После подачи — запрос EAD и Advance Parole." },
    { form:"I-130", nameEn:"Petition for Alien Relative", name:"Петиция для родственника", url:"https://www.uscis.gov/i-130", desc:"Спонсирование через семью", detail:"Пошлина: $535. Immediate Relatives (супруг, родители, дети до 21) — нет очереди. Preference categories — от 2 до 20+ лет в зависимости от категории." },
    { form:"I-140", nameEn:"Immigrant Petition for Alien Workers", name:"Петиция от работодателя", url:"https://www.uscis.gov/i-140", desc:"Employment-based грин-карта", detail:"Пошлина: $700. Категории: EB-1 (выдающиеся), EB-2 (продвинутые степени/NIW), EB-3 (квалифицированные). Premium processing: $2,805 (15 дней)." },
    { form:"I-751", nameEn:"Petition to Remove Conditions on Residence", name:"Снятие условий с грин-карты", url:"https://www.uscis.gov/i-751", desc:"Для conditional residents (через брак)", detail:"Подать за 90 дней до истечения 2-летней карты. Пошлина: $750. Совместная петиция с супругом. Waiver возможен если развод, abuse, или extreme hardship." },
    { form:"I-90", nameEn:"Application to Replace Permanent Resident Card", name:"Замена или продление грин-карты", url:"https://www.uscis.gov/i-90", desc:"Если потеряли или срок истёк", detail:"Подавать за 6 мес до истечения. Пошлина: $540. Receipt notice = доказательство статуса на 12-24 мес." },
    { form:"I-864", nameEn:"Affidavit of Support", name:"Финансовое поручительство спонсора", url:"https://www.uscis.gov/i-864", desc:"Финансовое поручительство спонсора", detail:"Спонсор доказывает доход ≥125% Federal Poverty Line. Обязательна для семейных петиций. Доход можно дополнить co-sponsor или активами." },
    { form:"I-693", nameEn:"Report of Medical Examination and Vaccination Record", name:"Медицинское обследование", url:"https://www.uscis.gov/i-693", desc:"Обязательна для I-485", detail:"Обязательна для I-485. Только у civil surgeon (список на uscis.gov). Прививки обязательны. Действует 2 года. Стоимость: $200-500 (платит заявитель)." },
    { form:"I-526", nameEn:"Immigrant Petition by Standalone Investor (EB-5)", name:"Инвесторская петиция (EB-5)", url:"https://www.uscis.gov/i-526", desc:"Immigrant Investor Program", detail:"Инвестиция $800,000 (TEA) или $1,050,000. Создание 10 рабочих мест. Пошлина: $3,675. Сначала conditional грин-карта на 2 года, потом I-829." },
    { form:"I-829", nameEn:"Petition to Remove Conditions on Immigrant Investor Status", name:"Снятие условий (EB-5)", url:"https://www.uscis.gov/i-829", desc:"Для инвесторов после 2 лет", detail:"Доказать что инвестиция сохранена и 10 рабочих мест создано. Пошлина: $3,750. Подать за 90 дней до истечения conditional карты." },
  ]},
  { id:"visa", icon:"✈️", title:"Визы", subtitle:"Рабочие, студенческие, гостевые", docs:[
    { form:"I-129", nameEn:"Petition for Nonimmigrant Worker (H-1B)", name:"H-1B рабочая виза", url:"https://www.uscis.gov/i-129", desc:"Для специалистов с образованием", detail:"Требует Bachelor's degree. Лотерея в марте, старт 1 октября. Пошлина: $780 + доп. сборы. Максимум 6 лет, можно продлить с I-140." },
    { form:"I-129F", nameEn:"Petition for Alien Fiancé(e) — K-1 Visa", name:"Виза жениха/невесты (K-1)", url:"https://www.uscis.gov/i-129f", desc:"Fiancé(e) Visa", detail:"Для невесты/жениха гражданина США. Пошлина: $535. После въезда — 90 дней на свадьбу, потом I-485. Обработка: 6-12 мес. + консульство." },
    { form:"I-20", nameEn:"Certificate of Eligibility for Nonimmigrant Student Status (F-1)", name:"F-1 студенческая виза", url:"https://studyinthestates.dhs.gov", desc:"Форма от учебного заведения", detail:"Работа на кампусе до 20 ч/нед. После года — CPT/OPT (12 мес работы, STEM — 36 мес). SEVIS fee: $350." },
    { form:"DS-160", nameEn:"Online Nonimmigrant Visa Application", name:"Неиммиграционная виза (онлайн)", url:"https://ceac.state.gov/genniv/", desc:"Онлайн заявление для любой визы", detail:"Для B1/B2 (турист), H-1B, L-1, O-1 и др. Фото 5x5 см. После — запись на интервью в посольстве. Пошлина: $185 (B), $205 (H/L/O)." },
    { form:"I-539", nameEn:"Application to Extend or Change Nonimmigrant Status", name:"Продление или смена статуса", url:"https://www.uscis.gov/i-539", desc:"Extend or Change Status", detail:"Для продления B1/B2, смены с B на F-1, и т.д. Пошлина: $370. Подавать ДО истечения статуса. Обработка: 5-12 мес." },
    { form:"I-129S", nameEn:"Nonimmigrant Petition for Intracompany Transferee (L-1)", name:"L-1 виза (внутри компании)", url:"https://www.uscis.gov/i-129s", desc:"Intracompany Transferee", detail:"Для менеджеров/специалистов переводимых из иностранного офиса. L-1A (менеджеры): до 7 лет. L-1B (специалисты): до 5 лет." },
    { form:"O-1", nameEn:"O-1 Visa for Individuals with Extraordinary Ability", name:"O-1 виза для талантов", url:"https://www.uscis.gov/working-in-the-united-states/temporary-workers/o-1-visa", desc:"Extraordinary Ability", detail:"Для людей с выдающимися достижениями в науке, искусстве, образовании, бизнесе, спорте. Нет лимита, нет лотереи. Premium: 15 дней." },
  ]},
  { id:"citizenship", icon:"🇺🇸", title:"Гражданство", subtitle:"Натурализация и тест", docs:[
    { form:"N-400", nameEn:"Application for Naturalization", name:"Заявление на натурализацию", url:"https://www.uscis.gov/n-400", desc:"Основная форма для гражданства", detail:"Грин-карта 5 лет (3 через брак). Присутствие в США 50%+ времени. Пошлина: $760. Тест: 10 вопросов, нужно 6 правильных. Интервью на английском." },
    { form:"N-600", nameEn:"Application for Certificate of Citizenship", name:"Сертификат о гражданстве", url:"https://www.uscis.gov/n-600", desc:"Если уже являетесь гражданином", detail:"Для получения документа если вы автоматически стали гражданином (через родителей). Пошлина: $1,170." },
    { form:"N-565", nameEn:"Application for Replacement Naturalization or Citizenship Document", name:"Замена документа о натурализации", url:"https://www.uscis.gov/n-565", desc:"Замена или исправление сертификата", detail:"Если потеряли, испортили или нужно исправить данные в Certificate of Citizenship или Naturalization. Пошлина: $555." },
    { form:"Тест", nameEn:"Civics Test — 100 Questions", name:"Тест на гражданство", desc:"Практикуйтесь прямо здесь!", detail:"На интервью задают 10 из 100 вопросов. Нужно ответить правильно на 6.", isTest:true },
  ]},
  { id:"asylum", icon:"🛡️", title:"Убежище", subtitle:"Asylum, TPS, VAWA, U-visa", docs:[
    { form:"I-589", nameEn:"Application for Asylum and Withholding of Removal", name:"Заявление на убежище", url:"https://www.uscis.gov/i-589", desc:"Подать в течение 1 года после въезда", detail:"БЕСПЛАТНО. Преследование по расе, религии, национальности, полит. взглядам, соц. группе. Affirmative — через USCIS, Defensive — через суд." },
    { form:"I-821", nameEn:"Application for Temporary Protected Status (TPS)", name:"Временный защищённый статус", url:"https://www.uscis.gov/i-821", desc:"Temporary Protected Status", detail:"Для граждан стран с войной/бедствиями. Даёт право работать. Перерегистрация каждые 6-18 мес. Список стран на uscis.gov." },
    { form:"I-360", nameEn:"Petition for Special Immigrant (VAWA)", name:"VAWA — самопетиция", url:"https://www.uscis.gov/i-360", desc:"Violence Against Women Act", detail:"Для жертв домашнего насилия от супруга-гражданина/резидента. БЕСПЛАТНО. Самопетиция — не нужно согласие абьюзера. Конфиденциально." },
    { form:"I-918", nameEn:"Petition for U Nonimmigrant Status (U Visa)", name:"U-виза (жертвы преступлений)", url:"https://www.uscis.gov/i-918", desc:"Для жертв тяжких преступлений", detail:"БЕСПЛАТНО. Нужна сертификация от полиции (форма I-918B). До 10,000 виз в год. Даёт право на работу и через 3 года — грин-карту." },
    { form:"I-914", nameEn:"Application for T Nonimmigrant Status (T Visa)", name:"T-виза (жертвы траффикинга)", url:"https://www.uscis.gov/i-914", desc:"Trafficking Victims Protection", detail:"БЕСПЛАТНО. Для жертв торговли людьми. До 5,000 виз в год. Право на работу, через 3 года — грин-карта." },
  ]},
  { id:"travel", icon:"🌍", title:"Путешествия", subtitle:"Выезд, возвращение, документы", docs:[
    { form:"I-131", nameEn:"Application for Travel Document / Advance Parole", name:"Разрешение на выезд и возврат", url:"https://www.uscis.gov/i-131", desc:"Advance Parole / Re-entry Permit", detail:"Необходим если pending I-485. Без AP выезд = отказ от заявления. $0 если с I-485. Combo card (EAD/AP) автоматически." },
    { form:"I-131A", nameEn:"Application for Carrier Documentation", name:"Документ для резидентов за рубежом", url:"https://www.uscis.gov/i-131a", desc:"Для резидентов за рубежом", detail:"Если грин-карта утеряна за границей или нужен boarding foil. Подаётся в посольстве. Пошлина: $575." },
    { form:"I-94", nameEn:"Arrival/Departure Record", name:"Запись о прибытии и отъезде", url:"https://i94.cbp.dhs.gov/", desc:"Проверьте свой статус онлайн", detail:"Электронная форма. Проверьте на i94.cbp.dhs.gov. Показывает ваш статус и дату, до которой можно находиться в США. ВАЖНО для подсчёта дней." },
    { form:"AR-11", nameEn:"Alien's Change of Address", name:"Уведомление о смене адреса", url:"https://www.uscis.gov/ar-11", desc:"Уведомление о переезде", detail:"ОБЯЗАТЕЛЬНО уведомить USCIS в течение 10 дней после переезда. БЕСПЛАТНО. Онлайн на uscis.gov. Штраф за неуведомление." },
  ]},
  { id:"work", icon:"💼", title:"Работа", subtitle:"Разрешения, SSN, проверки", docs:[
    { form:"I-765", nameEn:"Application for Employment Authorization (EAD)", name:"Разрешение на работу", url:"https://www.uscis.gov/i-765", desc:"Employment Authorization Document", detail:"Для тех без рабочей визы: pending I-485, asylum, TPS, OPT. $0 если с I-485, иначе $410. Действует 1-2 года." },
    { form:"SS-5", nameEn:"Application for a Social Security Card", name:"Заявление на номер социального страхования", url:"https://www.ssa.gov/forms/ss-5.pdf", desc:"Social Security Number (SSN)", detail:"БЕСПЛАТНО. В офисе SSA. Нужен паспорт + разрешение на работу. Карта через 2-4 недели. Нужен для работы, налогов, кредита." },
    { form:"I-9", nameEn:"Employment Eligibility Verification", name:"Проверка права на работу", url:"https://www.uscis.gov/i-9", desc:"Заполняет каждый работодатель", detail:"Каждый работодатель обязан заполнить. Работник предоставляет документы (List A: паспорт+EAD, или List B+C). E-Verify — электронная проверка." },
    { form:"I-140", nameEn:"PERM Labor Certification (Department of Labor)", name:"Трудовая сертификация для грин-карты", url:"https://www.dol.gov/agencies/eta/foreign-labor/permanent", desc:"Для EB-2 и EB-3 грин-карты", detail:"Работодатель доказывает что нет американских кандидатов. Через Department of Labor. Занимает 6-18 мес. Обязательно для EB-2/EB-3." },
    { form:"W-7", nameEn:"Application for IRS Individual Taxpayer Identification Number (ITIN)", name:"ITIN — налоговый номер", url:"https://www.irs.gov/forms-pubs/about-form-w-7", desc:"Для тех кто не может получить SSN", detail:"Individual Taxpayer Identification Number. Для подачи налогов без SSN. БЕСПЛАТНО. Подаётся с налоговой декларацией. Действует 3 года." },
    { form:"G-1145", nameEn:"e-Notification of Application/Petition Acceptance", name:"Электронное уведомление о приёме", url:"https://www.uscis.gov/g-1145", desc:"SMS/email при получении формы USCIS", detail:"БЕСПЛАТНО. Получайте SMS/email когда USCIS получит вашу форму. Прикладывается к любому заявлению. Настоятельно рекомендуется." },
  ]},
];

// ─── ENGLISH Civics Test with correct answer index ───

export function getUscisPdfUrl(doc) {
  const rawUrl = String(doc?.url || "").trim();
  if (!rawUrl) return "";
  if (/\.pdf(\?|#|$)/i.test(rawUrl)) return rawUrl;
  if (!/uscis\.gov|ssa\.gov|cbp\.dhs\.gov|ceac\.state\.gov/i.test(rawUrl)) return "";

  const rawForm = String(doc?.form || "").trim().toLowerCase();
  const baseForm = rawForm.split(/[\/\s]/)[0];
  if (!/^[a-z]{1,3}-\d+[a-z]?$/i.test(baseForm)) return "";
  return `https://www.uscis.gov/sites/default/files/document/forms/${baseForm}.pdf`;
}
