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

export default function WeatherCard({ T, cd, profileLocation, profileWeather }) {
  const weatherText    = normalizeWeatherText(String(profileWeather?.text || ""));
  const weatherTemp    = formatWeatherTemp(profileWeather?.temp || "");
  const weatherKey     = getWeatherKey(String(profileWeather?.text || ""));
  const tip            = getDailyTip(weatherKey, profileWeather?.temp || "");
  const locationLabel  = profileLocation || "Los Angeles";

  return (
    <div style={{
      borderRadius: 24,
      background: '#FF6B4A',
      padding: "14px 18px",
      marginBottom: 10,
      display: "flex",
      alignItems: "center",
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
      <div style={{ zIndex: 1, flex: 1, minWidth: 0 }}>
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
          marginTop: 5, lineHeight: 1.35,
          fontFamily: INTER, fontStyle: "italic",
          maxWidth: 190,
        }}>
          {tip}
        </div>
      </div>
      <div style={{
        fontSize: 34, fontWeight: 700, color: "#fff",
        lineHeight: 1, letterSpacing: "-1.5px", zIndex: 1, flexShrink: 0,
        fontFamily: INTER, marginLeft: 10, textAlign: "right",
      }}>
        {weatherTemp}
      </div>
    </div>
  );
}
