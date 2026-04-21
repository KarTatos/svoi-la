import { useCallback, useMemo, useState } from "react";

export function useCivicsTest({ questions, shuffleFn }) {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answersByIndex, setAnswersByIndex] = useState({});
  const [shuffledQuestions, setShuffledQuestions] = useState([]);

  const start = useCallback(() => {
    setShuffledQuestions(shuffleFn(questions));
    setQuestionIndex(0);
    setAnswersByIndex({});
  }, [questions, shuffleFn]);

  const answer = useCallback(
    (optionIndex) => {
      if (!shuffledQuestions[questionIndex]) return;
      setAnswersByIndex((prev) => ({ ...prev, [questionIndex]: optionIndex }));
    },
    [questionIndex, shuffledQuestions]
  );

  const prev = useCallback(() => {
    setQuestionIndex((idx) => Math.max(0, idx - 1));
  }, []);

  const next = useCallback(() => {
    setQuestionIndex((idx) => Math.min(shuffledQuestions.length - 1, idx + 1));
  }, [shuffledQuestions.length]);

  const answeredCount = useMemo(
    () =>
      shuffledQuestions.reduce(
        (acc, _q, idx) =>
          Object.prototype.hasOwnProperty.call(answersByIndex, idx)
            ? acc + 1
            : acc,
        0
      ),
    [answersByIndex, shuffledQuestions]
  );

  const correctCount = useMemo(
    () =>
      shuffledQuestions.reduce(
        (acc, q, idx) => (answersByIndex[idx] === q.correctIdx ? acc + 1 : acc),
        0
      ),
    [answersByIndex, shuffledQuestions]
  );

  const wrongCount = useMemo(
    () =>
      shuffledQuestions.reduce(
        (acc, q, idx) =>
          Object.prototype.hasOwnProperty.call(answersByIndex, idx) &&
          answersByIndex[idx] !== q.correctIdx
            ? acc + 1
            : acc,
        0
      ),
    [answersByIndex, shuffledQuestions]
  );

  return {
    questionIndex,
    answersByIndex,
    shuffledQuestions,
    answeredCount,
    correctCount,
    wrongCount,
    start,
    answer,
    prev,
    next,
    setQuestionIndex,
  };
}

