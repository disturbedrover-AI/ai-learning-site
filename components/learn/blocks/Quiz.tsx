import { Block, Icon } from "./Block";
import { QuizQuestions, type QuizQuestion } from "./QuizQuestions";

/**
 * <Quiz questions={[
 *   {
 *     question: "…",
 *     options: ["…", "…", "…"],
 *     answer: 2,               // the number of the right option, counting from 1
 *     explanation: "…",        // optional, shown after answering
 *   },
 * ]} />
 */
export function Quiz({ title = "Check your understanding", questions }: { title?: string; questions: QuizQuestion[] }) {
  if (!Array.isArray(questions) || questions.length < 2 || questions.length > 4) {
    throw new Error(`Quiz "${title}" needs between 2 and 4 questions.`);
  }
  questions.forEach((q, i) => {
    if (!q.question || !Array.isArray(q.options) || q.options.length < 2) {
      throw new Error(`Quiz "${title}", question ${i + 1}: needs a "question" and at least 2 "options".`);
    }
    if (!Number.isInteger(q.answer) || q.answer < 1 || q.answer > q.options.length) {
      throw new Error(
        `Quiz "${title}", question ${i + 1}: "answer" must be a number from 1 to ${q.options.length} (the right option's position).`,
      );
    }
  });

  return (
    <Block label="Quiz" icon={<Icon d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3M12 17h.01M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0z" />}>
      <p className="font-semibold text-foreground">{title}</p>
      <QuizQuestions questions={questions} />
    </Block>
  );
}
