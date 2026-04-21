export default function CivicsTestScreen({
  T,
  cd,
  bk,
  pl,
  questionIndex,
  shuffledQuestions,
  answersByIndex,
  correctCount,
  wrongCount,
  answeredCount,
  onAnswer,
  onPrev,
  onNext,
  onRetry,
  onExit,
}) {
  const currentQuestion = shuffledQuestions[questionIndex];
  const selectedIdx = Object.prototype.hasOwnProperty.call(answersByIndex, questionIndex)
    ? answersByIndex[questionIndex]
    : null;
  const hasAnswer = selectedIdx !== null && selectedIdx !== undefined;
  const canGoPrev = questionIndex > 0;
  const canGoNext =
    questionIndex < shuffledQuestions.length - 1 &&
    Object.prototype.hasOwnProperty.call(answersByIndex, questionIndex);

  return (
    <div>
      <button onClick={onExit} style={bk}>← Exit</button>
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>🇺🇸 Civics Test</h2>
          <span style={{ fontSize: 13, color: T.mid, fontWeight: 600 }}>
            {questionIndex + 1}/{shuffledQuestions.length}
          </span>
        </div>
        <div style={{ width: "100%", height: 4, background: T.borderL, borderRadius: 2, marginBottom: 20 }}>
          <div
            style={{
              width: `${((questionIndex + 1) / shuffledQuestions.length) * 100}%`,
              height: 4,
              background: T.primary,
              borderRadius: 2,
              transition: "width 0.3s",
            }}
          />
        </div>
        <div style={{ ...cd, padding: 20 }}>
          <p style={{ fontSize: 16, fontWeight: 600, lineHeight: 1.5, margin: "0 0 20px" }}>
            {currentQuestion?.q}
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {currentQuestion?.opts.map((opt, optionIdx) => {
              const isCorrect = optionIdx === currentQuestion.correctIdx;
              const isSelected = optionIdx === selectedIdx;
              const showCorrect = hasAnswer && isCorrect;
              const showWrongSelected = hasAnswer && isSelected && !isCorrect;
              return (
                <button
                  key={optionIdx}
                  onClick={() => onAnswer(optionIdx)}
                  style={{
                    ...cd,
                    padding: "14px 16px",
                    cursor: "pointer",
                    fontFamily: "inherit",
                    color: showWrongSelected ? "#8A1C12" : T.text,
                    textAlign: "left",
                    fontSize: 14,
                    fontWeight: 500,
                    boxShadow: "none",
                    border: `1.5px solid ${showCorrect ? "#27AE60" : showWrongSelected ? "#E74C3C" : T.border}`,
                    background: showCorrect ? "#ECF9F1" : showWrongSelected ? "#FFF1F1" : T.card,
                  }}
                  onMouseEnter={(e) => {
                    if (!hasAnswer) {
                      e.currentTarget.style.borderColor = T.primary;
                      e.currentTarget.style.background = T.primaryLight;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!hasAnswer) {
                      e.currentTarget.style.borderColor = T.border;
                      e.currentTarget.style.background = T.card;
                    }
                  }}
                >
                  {opt}
                </button>
              );
            })}
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
            <button
              onClick={onPrev}
              disabled={!canGoPrev}
              style={{
                ...pl(false),
                flex: 1,
                padding: 12,
                opacity: canGoPrev ? 1 : 0.45,
                cursor: canGoPrev ? "pointer" : "default",
              }}
            >
              ← Prev
            </button>
            <button
              onClick={onNext}
              disabled={!canGoNext}
              style={{
                ...pl(true),
                flex: 1,
                padding: 12,
                opacity: canGoNext ? 1 : 0.45,
                cursor: canGoNext ? "pointer" : "default",
              }}
            >
              Next →
            </button>
          </div>
        </div>
        <div style={{ marginTop: 12, fontSize: 12, color: T.mid, textAlign: "center" }}>
          ✅ {correctCount} · ❌ {wrongCount} · Ответов: {answeredCount}/{shuffledQuestions.length}
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
          <button onClick={onRetry} style={{ ...pl(true), flex: 1, padding: 14 }}>🔄 Retry</button>
          <button onClick={onExit} style={{ ...pl(false), flex: 1, padding: 14 }}>← Home</button>
        </div>
      </div>
    </div>
  );
}

