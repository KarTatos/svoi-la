const INTER = '"Inter", system-ui, sans-serif';
const MONO  = '"JetBrains Mono", ui-monospace, monospace';
const SH    = '0 1px 0 rgba(255,255,255,0.7) inset, 0 24px 40px -20px rgba(14,14,14,0.18), 0 2px 8px -2px rgba(14,14,14,0.08)';

// 20 шуточных советов, специфичных для LA погоды
const LA_TIPS = {
  sunny: [
    "Надень шарф — местные уже в пуховиках при +20",
    "Runyon Canyon снова забит блогерами с матчей",
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
  ],
  rain: [
    "Дождь в LA — все забыли как ездить по мокрой дороге",
    "Первый дождь за месяц. Город парализован, паника в Trader Joe's",
    "Зонтик? В LA? Серьёзно, где ты его найдёшь?",
    "Uber Surge уже x4. Рассмотри вариант с каноэ",
  ],
  hot: [
    "Выше 38° — идеальное время для пробежки в полдень",
    "В Долине сейчас как в духовке. Все едут к пляжу",
    "Все включили AC. Биллы за электричество будут грустными",
  ],
  wind: [
    "Santa Ana дует — красивые волны и нервные жители Малибу",
    "Ветер: причина пожаров, плохих причёсок и хорошего серфинга",
    "Ветрено — все авокадо с деревьев уже на тротуаре",
  ],
};

function getWeatherType(rawText = "") {
  const t = String(rawText || "").toLowerCase();
  if (!t) return "sunny";
  if (t.includes("thunder") || t.includes("storm") || t.includes("rain") || t.includes("shower") || t.includes("drizzle") || t.includes("snow") || t.includes("sleet")) return "rain";
  if (t.includes("fog") || t.includes("mist") || t.includes("cloudy") || t.includes("overcast") || t.includes("partly")) return "cloudy";
  if (t.includes("wind")) return "wind";
  if (t.includes("hot") || t.includes("heat") || t.includes("extreme")) return "hot";
  return "sunny";
}

function getWeatherLabel(type) {
  return { sunny: "ясно", cloudy: "облачно", rain: "дождь", hot: "жарко", wind: "ветрено" }[type] || "погода";
}

function getDailyTip(type) {
  const tips = LA_TIPS[type] || LA_TIPS.sunny;
  const seed = new Date().getDate();
  return tips[seed % tips.length];
}

function parseTempF(raw = "") {
  const match = String(raw || "").match(/(-?\d+(?:\.\d+)?)/);
  if (!match) return null;
  return Math.round(Number(match[1]));
}

function toCelsius(f) {
  return Math.round((f - 32) * 5 / 9);
}

export default function WeatherCard({ T, cd, profileLocation, profileWeather }) {
  const place = (profileLocation || "Los Angeles").split(",")[0].trim().toUpperCase();
  const type = getWeatherType(String(profileWeather?.text || ""));
  const label = getWeatherLabel(type);
  const tip = getDailyTip(type);
  const tempF = parseTempF(profileWeather?.temp || "");
  const tempC = tempF !== null ? toCelsius(tempF) : null;
  const tempDisplay = tempF !== null ? `${tempF}°` : "--°";
  const celsiusDisplay = tempC !== null ? `(${tempC}°C)` : "";

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

      {/* Left: location + weather + tip */}
      <div style={{ zIndex: 1, flex: 1, paddingRight: 12 }}>
        <div style={{
          fontSize: 10, fontWeight: 700, letterSpacing: "0.08em",
          color: "rgba(255,255,255,0.75)", marginBottom: 4,
          fontFamily: MONO, textTransform: "uppercase",
        }}>
          {place}
        </div>
        <div style={{
          fontSize: 15, fontWeight: 600, color: "#fff",
          letterSpacing: "-0.2px", fontFamily: INTER,
        }}>
          {label}
        </div>
        <div style={{
          fontSize: 11.5, color: "rgba(255,255,255,0.85)", marginTop: 3,
          lineHeight: 1.35, fontFamily: INTER, fontStyle: "italic",
        }}>
          {tip}
        </div>
      </div>

      {/* Right: temperature */}
      <div style={{ zIndex: 1, flexShrink: 0, textAlign: "right" }}>
        <div style={{
          fontSize: 40, fontWeight: 700, color: "#fff",
          lineHeight: 1, letterSpacing: "-2px",
          fontFamily: INTER,
        }}>
          {tempDisplay}
        </div>
        {celsiusDisplay && (
          <div style={{
            fontSize: 12, color: "rgba(255,255,255,0.75)",
            fontFamily: INTER, marginTop: 2,
          }}>
            {celsiusDisplay}
          </div>
        )}
      </div>
    </div>
  );
}
