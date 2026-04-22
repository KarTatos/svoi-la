export const metadata = {
  title: "Условия использования | LA Guide",
  description: "Краткие условия использования приложения LA Guide",
};

export default function TermsPage() {
  return (
    <main style={{ maxWidth: 760, margin: "0 auto", padding: "28px 20px 42px", fontFamily: "'Roboto', sans-serif", color: "#1F2940", lineHeight: 1.6 }}>
      <h1 style={{ fontSize: 32, margin: "0 0 8px", fontWeight: 900 }}>Условия использования</h1>
      <p style={{ margin: "0 0 18px", color: "#6B7280", fontSize: 14 }}>Последнее обновление: 21 апреля 2026</p>

      <p style={{ margin: "0 0 14px" }}>
        Используя <strong>LA Guide</strong>, вы соглашаетесь с настоящими условиями.
      </p>

      <h2 style={{ fontSize: 22, margin: "18px 0 8px", fontWeight: 800 }}>Общие положения</h2>
      <ul style={{ margin: "0 0 12px", paddingLeft: 22 }}>
        <li>Пользователь использует приложение на свой риск.</li>
        <li>Сервис предоставляется «как есть», без гарантий бесперебойной работы.</li>
        <li>Мы можем обновлять функционал и правила сервиса.</li>
      </ul>

      <h2 style={{ fontSize: 22, margin: "18px 0 8px", fontWeight: 800 }}>Контент и точность данных</h2>
      <ul style={{ margin: "0 0 12px", paddingLeft: 22 }}>
        <li>Информация о местах, советах и событиях может быть неполной или устаревшей.</li>
        <li>Администрация не гарантирует абсолютную точность всех данных.</li>
        <li>Перед важными решениями проверяйте информацию из официальных источников.</li>
      </ul>

      <h2 style={{ fontSize: 22, margin: "18px 0 8px", fontWeight: 800 }}>Ответственность</h2>
      <ul style={{ margin: "0 0 12px", paddingLeft: 22 }}>
        <li>Пользователь несет ответственность за размещаемый им контент.</li>
        <li>Запрещены незаконные, оскорбительные и вводящие в заблуждение публикации.</li>
        <li>Мы вправе ограничить доступ при нарушении правил сервиса.</li>
      </ul>

      <h2 style={{ fontSize: 22, margin: "18px 0 8px", fontWeight: 800 }}>Контакты</h2>
      <p style={{ margin: 0 }}>
        По вопросам использования сервиса:{" "}
        <a href="mailto:kushnir4work@gmail.com" style={{ color: "#F47B20", textDecoration: "none", fontWeight: 700 }}>
          kushnir4work@gmail.com
        </a>
      </p>
    </main>
  );
}

