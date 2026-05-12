-- Тестовые данные: 10 вакансий + 10 услуг
-- Выполни в Supabase SQL Editor

INSERT INTO public.jobs (type, title, description, district, schedule, price, price_type, telegram, photos) VALUES

-- ─── ВАКАНСИИ ────────────────────────────────────────────────────────────────
('vacancy', 'Водитель грузовика / Truck Driver',
 'Требуется опытный водитель CDL класс A. Маршруты по LA и окрестностям. Официальное трудоустройство, медицинская страховка.',
 'glendale', 'fulltime', '33.25', 'hourly', '@latrucking', '{}'),

('vacancy', 'Официант / Waiter',
 'Ресторан в Санта-Монике ищет официанта. Опыт приветствуется. Гибкий график, хорошие чаевые. Английский средний уровень.',
 'westside', 'parttime', '18.00', 'hourly', '@santamonicajobs', '{}'),

('vacancy', 'Строитель / Construction Worker',
 'Строительная компания набирает рабочих. Работа с бетоном, отделка, общестрой. Транспорт от метро. Оплата еженедельно.',
 'valley', 'fulltime', '25.00', 'hourly', '@laconstruct', '{}'),

('vacancy', 'Кассир / Cashier',
 'Супермаркет в Koreatown приглашает кассира. Русскоязычный коллектив. Обучение с нуля. Подходит для начинающих.',
 'koreatown', 'parttime', '16.50', 'hourly', '@koreajobs', '{}'),

('vacancy', 'Программист React Native',
 'Стартап ищет мобильного разработчика. Удалённая работа. Стек: React Native, Supabase, TypeScript. Гибкий график.',
 'downtown', 'remote', '6500', 'monthly', '@techla', '{}'),

('vacancy', 'Уборщик / Cleaner',
 'Клининговая компания принимает на работу. Уборка офисов и жилых помещений. Машина не нужна — развозим сами.',
 'westside', 'fulltime', '20.00', 'hourly', '@laclean', '{}'),

('vacancy', 'Помощник повара / Kitchen Helper',
 'Кафе в Downtown LA ищет помощника повара. Без опыта, всему научим. Питание включено. График 5/2.',
 'downtown', 'fulltime', '17.00', 'hourly', '@downtownfood', '{}'),

('vacancy', 'Продавец / Sales Associate',
 'Магазин одежды в Beverly Hills. Требуется продавец-консультант. Английский upper-intermediate. Бонусы с продаж.',
 'beverly', 'fulltime', '19.00', 'hourly', '@bhjobs', '{}'),

('vacancy', 'Курьер / Delivery Driver',
 'Доставка еды и посылок по LA. Своя машина обязательна. Гибкий график, работай когда удобно. Оплата за каждую доставку.',
 'downtown', 'contract', '22.00', 'hourly', '@ladelivery', '{}'),

('vacancy', 'Воспитатель / Nanny',
 'Семья в West Hollywood ищет няню для двух детей 3 и 6 лет. Русский язык плюс. Пн-Пт 8:00-17:00. Оформление официальное.',
 'westside', 'fulltime', '25.00', 'hourly', '@whnanny', '{}'),

-- ─── УСЛУГИ ──────────────────────────────────────────────────────────────────
('service', 'Ремонт техники Apple',
 'Профессиональный ремонт iPhone, MacBook, iPad. Замена экранов, батарей, разъёмов. Гарантия на все работы 90 дней. Выезд на дом.',
 'downtown', null, '80', 'fixed', '@applefix_la',
 ARRAY['https://images.unsplash.com/photo-1588702547923-7093a6c3ba33?w=800&q=80']),

('service', 'Перевод документов',
 'Нотариально заверенный перевод с русского на английский и обратно. Иммиграционные документы, дипломы, свидетельства. Срочно от 24 часов.',
 'koreatown', null, '45', 'fixed', '@translate_la',
 ARRAY['https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&q=80']),

('service', 'Репетитор по математике',
 'Подготовка к SAT, ACT, школьные программы 5-12 класс. Онлайн и оффлайн. 10 лет опыта. Первый урок бесплатно.',
 'westside', null, '60', 'hourly', '@mathtutor_la',
 ARRAY['https://images.unsplash.com/photo-1509228468518-180dd4864904?w=800&q=80']),

('service', 'Фотограф / Photographer',
 'Профессиональная фотосъёмка: портреты, семейные фото, бизнес-портреты, мероприятия. Редактура включена. Съёмка по всему LA.',
 'echo-park', null, '150', 'hourly', '@photo_la',
 ARRAY['https://images.unsplash.com/photo-1554048612-b6a482bc67e5?w=800&q=80']),

('service', 'Сантехник / Plumber',
 'Устраняю засоры, меняю трубы, кран, унитаз, бойлер. Работаю без выходных. Выезд в течение 2 часов по Большому LA.',
 'valley', null, '95', 'hourly', '@plumber_la',
 ARRAY['https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=800&q=80']),

('service', 'Бухгалтер / Tax Accountant',
 'Налоговые декларации для физлиц и малого бизнеса. Опыт работы с иммигрантами, ITIN, самозанятыми. Консультация бесплатно.',
 'glendale', null, '200', 'fixed', '@taxla',
 ARRAY['https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&q=80']),

('service', 'Грузчики / Moving Help',
 'Помощь с переездом по LA. Упаковка, погрузка, расстановка мебели. Команда 2-3 человека. Своя газель. Быстро и аккуратно.',
 'downtown', null, '120', 'hourly', '@movers_la',
 ARRAY['https://images.unsplash.com/photo-1600518464441-9154a4dea21b?w=800&q=80']),

('service', 'Адвокат по иммиграции',
 'Консультации по грин-карте, рабочим визам, натурализации. Помощь с документами USCIS. Первая консультация $50.',
 'koreatown', null, '250', 'hourly', '@immigration_la',
 ARRAY['https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&q=80']),

('service', 'Массаж на дому',
 'Профессиональный расслабляющий и лечебный массаж с выездом на дом. Сертифицированный массажист. Принимаю также в студии.',
 'beverly', null, '100', 'hourly', '@massage_la',
 ARRAY['https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?w=800&q=80']),

('service', 'Репетитор по английскому',
 'Английский для взрослых и детей. Подготовка к экзаменам, разговорный, деловой. Онлайн и оффлайн. Гибкий график.',
 'westside', null, '50', 'hourly', '@english_la',
 ARRAY['https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&q=80']);
