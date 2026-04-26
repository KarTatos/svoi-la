export const metadata = {
  title: "Политика конфиденциальности | LA Guide",
  description: "Краткая политика конфиденциальности приложения LA Guide",
};

export default function PrivacyPage() {
  return (
    <main style={{ maxWidth: 760, margin: "0 auto", padding: "28px 20px 42px", fontFamily: "'Roboto', sans-serif", color: "#1F2940", lineHeight: 1.6 }}>
      <h1 style={{ fontSize: 32, margin: "0 0 8px", fontWeight: 900 }}>Политика конфиденциальности</h1>
      <p style={{ margin: "0 0 18px", color: "#6B7280", fontSize: 14 }}>Последнее обновление: 21 апреля 2026</p>

      <p style={{ margin: "0 0 14px" }}>
        Приложение <strong>LA Guide</strong> использует вход через Google только для авторизации пользователя.
      </p>

      <h2 style={{ fontSize: 22, margin: "18px 0 8px", fontWeight: 800 }}>Какие данные мы собираем</h2>
      <ul style={{ margin: "0 0 12px", paddingLeft: 22 }}>
        <li>Имя профиля Google</li>
        <li>Email-адрес</li>
        <li>Аватар профиля (если доступен)</li>
      </ul>

      <h2 style={{ fontSize: 22, margin: "18px 0 8px", fontWeight: 800 }}>Как мы используем данные</h2>
      <ul style={{ margin: "0 0 12px", paddingLeft: 22 }}>
        <li>Для входа в аккаунт и работы функций приложения</li>
        <li>Для отображения вашего профиля (имя и аватар)</li>
        <li>Для связи по вопросам поддержки</li>
      </ul>

      <h2 style={{ fontSize: 22, margin: "18px 0 8px", fontWeight: 800 }}>Что мы не делаем</h2>
      <ul style={{ margin: "0 0 12px", paddingLeft: 22 }}>
        <li>Не запрашиваем пароль от Google</li>
        <li>Не продаем ваши персональные данные</li>
        <li>Не передаем ваши данные третьим лицам для рекламы</li>
      </ul>

      <h2 style={{ fontSize: 22, margin: "18px 0 8px", fontWeight: 800 }}>Контакты</h2>
      <p style={{ margin: 0 }}>
        По вопросам конфиденциальности используйте раздел поддержки в приложении.
      </p>
    </main>
  );
}
