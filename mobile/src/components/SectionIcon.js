import { Circle, Path, Rect, Svg } from "react-native-svg";

function IconUscis({ size = 36 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <Rect x="10" y="7" width="20" height="26" rx="3" fill="#fff" stroke="#0E0E0E" strokeWidth="1.4"/>
      <Rect x="10" y="7" width="20" height="9" rx="3" fill="#FF8A3D"/>
      <Rect x="10" y="13" width="20" height="3" fill="#FF8A3D"/>
      <Path d="M15 22h10M15 27h7" stroke="#0E0E0E" strokeWidth="1.5" strokeLinecap="round"/>
    </Svg>
  );
}

function IconPin({ size = 36 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <Path d="M20 6C15.6 6 11 10 11 15.5c0 7.5 9 18.5 9 18.5s9-11 9-18.5C29 10 24.4 6 20 6z" fill="#FF6B4A" stroke="#0E0E0E" strokeWidth="1.4"/>
      <Circle cx="20" cy="15.5" r="4" fill="#fff" stroke="#0E0E0E" strokeWidth="1.2"/>
    </Svg>
  );
}

function IconLightbulb({ size = 36 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <Path d="M20 7a9 9 0 0 1 7 14.8V26H13v-4.2A9 9 0 0 1 20 7z" fill="#F5C242" stroke="#0E0E0E" strokeWidth="1.4"/>
      <Path d="M15.5 29h9M16.5 32.5h7" stroke="#0E0E0E" strokeWidth="1.5" strokeLinecap="round"/>
    </Svg>
  );
}

function IconCalendar({ size = 36 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <Rect x="7" y="10" width="26" height="24" rx="4" fill="#fff" stroke="#0E0E0E" strokeWidth="1.4"/>
      <Rect x="7" y="10" width="26" height="9" rx="4" fill="#3B5FFF"/>
      <Rect x="7" y="15" width="26" height="4" fill="#3B5FFF"/>
      <Path d="M14 8v5M26 8v5" stroke="#0E0E0E" strokeWidth="1.6" strokeLinecap="round"/>
      <Circle cx="20" cy="25" r="3" fill="#FF6B4A"/>
    </Svg>
  );
}

function IconBriefcase({ size = 36 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <Rect x="7" y="15" width="26" height="19" rx="4" fill="#fff" stroke="#0E0E0E" strokeWidth="1.4"/>
      <Path d="M15 15v-3a2.5 2.5 0 0 1 2.5-2.5h5A2.5 2.5 0 0 1 25 12v3" stroke="#0E0E0E" strokeWidth="1.4" strokeLinecap="round"/>
      <Path d="M7 24h26" stroke="#0E0E0E" strokeWidth="1.4"/>
      <Path d="M20 20v8" stroke="#0E0E0E" strokeWidth="1.4" strokeLinecap="round"/>
    </Svg>
  );
}

function IconHome({ size = 36 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <Path d="M7 20L20 9l13 11v14H7V20z" fill="#fff" stroke="#0E0E0E" strokeWidth="1.4" strokeLinejoin="round"/>
      <Rect x="15" y="27" width="10" height="8" rx="2.5" fill="#A8D89A" stroke="#0E0E0E" strokeWidth="1.2"/>
    </Svg>
  );
}

function IconTag({ size = 36 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <Path d="M23 8H13a2 2 0 0 0-2 2v10l11 11 13-13L23 8z" fill="#fff" stroke="#0E0E0E" strokeWidth="1.4" strokeLinejoin="round"/>
      <Circle cx="16" cy="15" r="2.5" fill="#FF8A3D" stroke="#0E0E0E" strokeWidth="1.1"/>
    </Svg>
  );
}

function IconChat({ size = 36 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <Path d="M33 12a3 3 0 0 1 3 3v11a3 3 0 0 1-3 3h-3l-7 6v-6H10a3 3 0 0 1-3-3V15a3 3 0 0 1 3-3h23z" fill="#fff" stroke="#0E0E0E" strokeWidth="1.4" strokeLinejoin="round"/>
      <Path d="M14 22h12M14 26.5h8" stroke="#8A8680" strokeWidth="1.5" strokeLinecap="round"/>
    </Svg>
  );
}

const ICONS = {
  uscis:            IconUscis,
  places:           IconPin,
  tips:             IconLightbulb,
  events:           IconCalendar,
  jobs:             IconBriefcase,
  housing:          IconHome,
  sell:             IconTag,
  "community-chat": IconChat,
};

export default function SectionIcon({ id, size = 34 }) {
  const Icon = ICONS[id];
  if (!Icon) return null;
  return <Icon size={size} />;
}
