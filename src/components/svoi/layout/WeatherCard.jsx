import { useMemo } from "react";

const INTER = '"Inter", system-ui, sans-serif';
const MONO  = '"JetBrains Mono", ui-monospace, monospace';
const SH    = '0 1px 0 rgba(255,255,255,0.7) inset, 0 24px 40px -20px rgba(14,14,14,0.18), 0 2px 8px -2px rgba(14,14,14,0.08)';

const LA_TIPS = {
  sunny: [
    "Runyon Canyon снова забит блогерами с матчами",
    "Надень шарф — местные уже в пуховиках при +20",
    "Солнце, авокадо-тост и пробки на 405 — обычный вторник",
    "Не забудь SPF 50, иначе выйдешь как Долина Смерти",
    "Отличный день делать вид, что пишешь сценарий в кафе",
    "Все едут в Малибу. Ты тоже. PCH уже стоит",
    "Сегодня можно ехать в Долину — если хочешь почувствовать Дубай",
  ],
  cloudy: [
    "Облачно в LA — жители в панике, туристы в восторге",
    "June Gloom пришёл не в июне. LA живёт по своим правилам",
    "Серое небо — наконец-то повод надеть свой дождевик",
    "Прохладно? Местные уже достали пуховики",
  ],
  rain: [
    "Дождь в LA — все забыли, как ездить по мокрой дороге",
    "Первый дождь за месяц. Город парализован, паника в Trader Joe's",
    "Зонтик? В LA? Серьёзно, где ты его найдёшь?",
    "Uber Surge уже x4. Рассмотри вариант с каноэ",
  ],
  hot: [
    "Выше 38° — идеальное время для пробежки в полдень",
    "В Долине сейчас как в духовке. Все едут к пляжу",
    "Все включили AC. Биллы за электричество будут грустными",
    "Асфальт плавится. Авокадо созревает прямо на дереве",
  ],
  wind: [
    "Santa Ana дует — красивые волны и нервные жители Малибу",
    "Ветер: причина пожаров, плохих причёсок и хорошего серфинга",
    "Ветрено — все авокадо с деревьев уже на тротуаре",
  ],
  fog: [
    "Туман в LA. Голливуд выглядит как в фильме ужасов",
    "Marine layer: пляж накрыт, Долина +10°C и солнце",
  ],
};

function getWeatherKey(rawText = "") {
  const text = String(rawText || "").toLowerCase();
  if (text.includes("thunder") || text.includes("storm")) return "rain";
  if (text.includes("snow") || text.includes("sleet")) return "rain";
  if (text.includes("rain") || text.includes("shower") || text.includes("drizzle")) return "rain";
  if (text.includes("fog") || text.includes("mist") || text.includes("haze")) return "fog";
  if (text.includes("cloud") || text.includes("overcast") || text.includes("partly")) return "cloudy";
  if (text.includes("wind")) return "wind";
  if (text.includes("clear") || text.includes("sunny")) return "sunny";
  return "sunny";
}

function normalizeWeatherText(rawText = "") {
  const text = String(rawText || "").toLowerCase();
  if (!text) return "погода";
  if (text.includes("thunder") || text.includes("storm")) return "гроза";
  if (text.includes("snow") || text.includes("sleet") || text.includes("blizzard")) return "снег";
  if (text.includes("rain") || text.includes("shower") || text.includes("drizzle")) return "дождь";
  if (text.includes("fog") || text.includes("mist") || text.includes("haze") || text.includes("smoke")) return "туман";
  if (text.includes("cloudy") || text.includes("overcast")) return "облачно";
  if (text.includes("partly")) return "переменная облачность";
  if (text.includes("clear") || text.includes("sunny")) return "ясно";
  if (text.includes("wind")) return "ветрено";
  return "погода";
}

function formatWeatherTemp(raw = "") {
  const value = String(raw || "").trim();
  const match = value.match(/(-?\d+(?:\.\d+)?)\s*°?\s*([CF])?/i);
  if (!match) return "--°";
  const n = Number(match[1]);
  if (!Number.isFinite(n)) return "--°";
  const unit = (match[2] || "F").toUpperCase();
  if (unit === "C") {
    const f = Math.round(n * 9 / 5 + 32);
    return `${f}° (${Math.round(n)}°C)`;
  }
  const c = Math.round((n - 32) * 5 / 9);
  return `${Math.round(n)}° (${c}°C)`;
}

function getDailyTip(key, rawTemp) {
  const match = String(rawTemp || "").match(/(-?\d+(?:\.\d+)?)/);
  if (match) {
    const n = Number(match[1]);
    const isF = !/c/i.test(String(rawTemp).replace(/\d/g, ""));
    const fahrenheit = isF ? n : (n * 9 / 5 + 32);
    if (fahrenheit >= 95) {
      const tips = LA_TIPS.hot;
      return tips[Math.floor(Date.now() / 86400000) % tips.length];
    }
  }
  const tips = LA_TIPS[key] || LA_TIPS.sunny;
  return tips[Math.floor(Date.now() / 86400000) % tips.length];
}

const DISTRICT_JOKES = {
  downtown: [
    "Даунтаун: парковка стоит дороже кофе, но вид как в кино.",
    "Если в Даунтауне тихо, значит просто ещё не начался час пик.",
    "В Даунтауне можно пройти 2 квартала и сменить три вайба.",
    "План на день: метро, тако, и снова метро.",
    "Даунтаун проверяет характер пробками и лифтами в небоскребах.",
  ],
  koreatown: [
    "Koreatown не спит. Он просто делает паузу на бибимбап.",
    "В K-Town чай с бобой ближе, чем твоя следующая встреча.",
    "Если потерялся в K-Town, иди на запах корейского BBQ.",
    "Koreatown: тут ужин после полуночи — это норма.",
    "В K-Town сначала поешь, потом решай все остальные вопросы.",
  ],
  hollywood: [
    "Голливуд: шанс встретить актера выше, чем найти парковку.",
    "Сегодня отличный день выглядеть так, будто ты на кастинг.",
    "В Голливуде даже кофе подается с амбициями.",
    "Тут каждый второй либо пишет сценарий, либо говорит, что пишет.",
    "Голливуд: где солнце, селфи и питч-дек идут комплектом.",
  ],
  pasadena: [
    "Пасадена — когда хочется спокойствия и красивых улиц.",
    "В Пасадене всё выглядит так, будто уже готово к открытке.",
    "Пасадена: аккуратно, можно влюбиться в район и остаться.",
    "Тут время идет медленнее, особенно за бранчем на веранде.",
    "Пасадена знает, как быть уютной и без суеты.",
  ],
  santa_monica: [
    "Санта-Моника: океан рядом, дедлайны где-то далеко.",
    "Если ветер с океана, значит день официально стал лучше.",
    "Санта-Моника: сначала пирс, потом все остальное.",
    "Тут закат — это отдельный пункт в расписании.",
    "Санта-Моника напоминает, что можно жить чуть медленнее.",
  ],
  glendale: [
    "Глендейл: кофе, холмы и ощущение, что всё под контролем.",
    "В Глендейле день начинается спокойно и красиво.",
    "Глендейл умеет быть и городским, и уютным одновременно.",
    "Тут пробки случаются, но паника — редко.",
    "Глендейл: когда хочется стабильности без скуки.",
  ],
  west_hollywood: [
    "West Hollywood: стиль включается раньше будильника.",
    "В WeHo даже прогулка выглядит как модная съёмка.",
    "West Hollywood: здесь ужин плавно превращается в вечер.",
    "WeHo знает, как сочетать блеск и расслабленность.",
    "В West Hollywood даже кофе выглядит как лайфстайл.",
  ],
  burbank: [
    "Бербанк: где студии рядом, а настроение рабочее.",
    "В Бербанке всё по делу: тихо, чётко, удобно.",
    "Burbank — район, где дедлайны дружат с комфортом.",
    "Тут можно и продуктивно поработать, и спокойно выдохнуть.",
    "Бербанк: практично, аккуратно и без лишнего шума.",
  ],
  echo_park: [
    "Echo Park: день начинается с озера, кофе и идей.",
    "В Echo Park всегда найдется дворик с хорошей атмосферой.",
    "Echo Park: немного арт, немного хаос, много характера.",
    "Тут легко свернуть не туда и найти любимое место.",
    "Echo Park живет в своем ритме — и это кайф.",
  ],
  silver_lake: [
    "Silver Lake: тут даже утро выглядит креативно.",
    "В Silver Lake планы обычно начинаются с «зайду на минуту».",
    "Silver Lake: стиль, холмы и бесконечные маленькие открытия.",
    "Здесь кофе — почти религия, а вайб — отдельный жанр.",
    "Silver Lake умеет делать обычный день особенным.",
  ],
  generic: [
    "Лос-Анджелес: один город, десять разных настроений за день.",
    "Погода в LA меняется редко, а планы — постоянно.",
    "В этом городе всегда найдется район под ваше настроение.",
    "LA: где маршрут в 15 минут легко превращается в 45.",
    "Сегодня хороший день для кофе и маленького приключения.",
  ],
};

function getDistrictKey(locationLabel = "") {
  const s = String(locationLabel || "").toLowerCase();
  if (s.includes("downtown")) return "downtown";
  if (s.includes("koreatown") || s.includes("k-town") || s.includes("k town")) return "koreatown";
  if (s.includes("hollywood")) return "hollywood";
  if (s.includes("pasadena")) return "pasadena";
  if (s.includes("santa monica")) return "santa_monica";
  if (s.includes("glendale")) return "glendale";
  if (s.includes("west hollywood") || s.includes("weho")) return "west_hollywood";
  if (s.includes("burbank")) return "burbank";
  if (s.includes("echo park")) return "echo_park";
  if (s.includes("silver lake")) return "silver_lake";
  return "generic";
}

function randomFrom(list = []) {
  if (!Array.isArray(list) || list.length === 0) return "";
  return list[Math.floor(Math.random() * list.length)];
}

export default function WeatherCard({ T, cd, profileLocation, profileWeather }) {
  const weatherText    = normalizeWeatherText(String(profileWeather?.text || ""));
  const weatherTemp    = formatWeatherTemp(profileWeather?.temp || "");
  const locationLabel  = profileLocation || "Los Angeles";
  const weatherKey     = getWeatherKey(String(profileWeather?.text || ""));
  const tip = useMemo(() => {
    const districtKey = getDistrictKey(locationLabel);
    const districtJoke = randomFrom(DISTRICT_JOKES[districtKey]);
    if (districtJoke) return districtJoke;
    const fallback = DISTRICT_JOKES.generic;
    return randomFrom(fallback) || getDailyTip(weatherKey, profileWeather?.temp || "");
  }, [locationLabel, weatherKey, profileWeather?.temp]);

  return (
    <div style={{
      borderRadius: 24,
      background: '#FF6B4A',
      padding: "10px 16px",
      marginBottom: 10,
      display: "flex",
      alignItems: "flex-start",
      justifyContent: "space-between",
      boxShadow: SH,
      overflow: "hidden",
      position: "relative",
    }}>
      {/* Decorative circle */}
      <div style={{
        position: "absolute", right: -28, top: -28,
        width: 130, height: 130, borderRadius: "50%",
        background: "rgba(255,255,255,0.1)",
        pointerEvents: "none",
      }} />
      <div style={{ zIndex: 1, minWidth: 0, width: "100%" }}>
        <div style={{
          fontSize: 10, fontWeight: 700, letterSpacing: "0.08em",
          color: "rgba(255,255,255,0.8)", marginBottom: 4,
          fontFamily: MONO,
          textTransform: "uppercase",
        }}>
          {locationLabel}
        </div>
        <div style={{
          fontSize: 14, fontWeight: 600, color: "#fff",
          lineHeight: 1.3, letterSpacing: "-0.2px",
          fontFamily: INTER,
        }}>
          {weatherText}
        </div>
        <div style={{
          fontSize: 11, color: "rgba(255,255,255,0.78)",
          marginTop: 4, lineHeight: 1.25,
          fontFamily: INTER, fontStyle: "italic",
        }}>
          {tip}
        </div>
      </div>
      <div style={{
        fontSize: 34, fontWeight: 700, color: "#fff",
        lineHeight: 1, letterSpacing: "-1.5px", zIndex: 2,
        fontFamily: INTER, textAlign: "right",
        position: "absolute", right: 16, top: 10,
      }}>
        {weatherTemp}
      </div>
    </div>
  );
}
