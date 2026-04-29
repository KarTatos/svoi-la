const INTER = '"Inter", system-ui, sans-serif';
const MONO  = '"JetBrains Mono", ui-monospace, monospace';
const SH    = '0 1px 0 rgba(255,255,255,0.7) inset, 0 24px 40px -20px rgba(14,14,14,0.18), 0 2px 8px -2px rgba(14,14,14,0.08)';

function normalizeWeatherText(rawText = "") {
  const text = String(rawText || "").toLowerCase();
  if (!text) return "погода";
  if (text.includes("thunder") || text.includes("storm")) return "гроза";
  if (text.includes("snow") || text.includes("sleet") || text.includes("blizzard")) return "снег";
  if (text.includes("rain") || text.includes("shower") || text.includes("drizzle")) return "дождь";
  if (text.includes("fog") || text.includes("mist") || text.includes("haze") || text.includes("smoke")) return "туман";
  if (text.includes("cloudy") || text.includes("overcast")) return "облачно";
  if (text.includes("partly")) return "переменная облачность";
  if (text.includes("clear") || text.includes("sunny")) return "ясно · идеально для прогулки";
  if (text.includes("wind")) return "ветрено";
  return "погода";
}

function formatWeatherTemp(raw = "") {
  const value = String(raw || "").trim();
  const match = value.match(/(-?\d+(?:\.\d+)?)\s*°?\s*([CF])?/i);
  if (!match) return "--°";
  const n = Number(match[1]);
  if (!Number.isFinite(n)) return "--°";
  return `${Math.round(n)}°`;
}

export default function WeatherCard({ T, cd, profileLocation, profileWeather }) {
  const weatherText = normalizeWeatherText(String(profileWeather?.text || ""));
  const weatherTemp = formatWeatherTemp(profileWeather?.temp || "");

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
      <div style={{ zIndex: 1 }}>
        <div style={{
          fontSize: 10, fontWeight: 700, letterSpacing: "0.08em",
          color: "rgba(255,255,255,0.8)", marginBottom: 5,
          fontFamily: MONO,
          textTransform: "uppercase",
        }}>
          Сегодня в LA
        </div>
        <div style={{
          fontSize: 14, fontWeight: 600, color: "#fff",
          lineHeight: 1.3, maxWidth: 195, letterSpacing: "-0.2px",
          fontFamily: INTER,
        }}>
          {weatherText}
        </div>
      </div>
      <div style={{
        fontSize: 42, fontWeight: 700, color: "#fff",
        lineHeight: 1, letterSpacing: "-2px", zIndex: 1, flexShrink: 0,
        fontFamily: INTER,
      }}>
        {weatherTemp}
      </div>
    </div>
  );
}
