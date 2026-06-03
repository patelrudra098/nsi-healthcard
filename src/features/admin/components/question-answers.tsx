import type { QuestionAnswer, QuestionsResponse } from "@/lib/types";

/** Filled / empty rating stars for a 1–5 answer. */
function Stars({ value }: { value: number }) {
  const filled = Math.max(0, Math.min(5, value));
  return (
    <span
      className="inline-flex select-none text-sm leading-none tracking-tight"
      role="img"
      aria-label={`${filled} out of 5`}
    >
      <span className="text-[var(--cat-amber)]" aria-hidden="true">
        {"★".repeat(filled)}
      </span>
      <span className="text-[var(--text-disabled)]" aria-hidden="true">
        {"☆".repeat(5 - filled)}
      </span>
    </span>
  );
}

interface QuestionAnswersProps {
  questions: QuestionsResponse;
  answers: QuestionAnswer[];
}

/**
 * Read-only answer transcript for an assessment, grouped by section in the same
 * order the questions API returns. Joins each numeric answer to its question
 * text and the matching example label/description for that level.
 */
export function QuestionAnswers({ questions, answers }: QuestionAnswersProps) {
  const answerMap = new Map(answers.map((a) => [a.questionKey, a.answer]));

  const groups = questions.sections
    .map((section) => ({
      sectionKey: section.sectionKey,
      label: section.label,
      items: section.questions
        .filter((q) => answerMap.has(q.questionKey))
        .map((q) => {
          const answer = answerMap.get(q.questionKey) as number;
          const example = q.examples.find((e) => e.level === answer);
          return {
            questionKey: q.questionKey,
            text: q.text,
            answer,
            label: example?.label ?? String(answer),
            description: example?.description ?? "",
          };
        }),
    }))
    .filter((group) => group.items.length > 0);

  if (groups.length === 0) {
    return (
      <p className="text-sm text-[var(--text-muted)]">
        No answers were recorded for this assessment.
      </p>
    );
  }

  return (
    <div className="space-y-7">
      {groups.map((group) => (
        <div key={group.sectionKey} className="space-y-4">
          <div className="flex items-center gap-3">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
              {group.label}
            </h3>
            <span className="h-px flex-1 bg-[var(--border)]" aria-hidden="true" />
          </div>

          <ul className="space-y-4">
            {group.items.map((item) => (
              <li
                key={item.questionKey}
                className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] px-4 py-3"
              >
                <p className="text-sm font-medium text-[var(--text-primary)]">
                  {item.text}
                </p>
                <p className="mt-1.5 flex flex-wrap items-center gap-2">
                  <Stars value={item.answer} />
                  <span className="text-sm font-semibold tabular-nums text-[var(--text-secondary)]">
                    {item.answer} — {item.label}
                  </span>
                </p>
                {item.description && (
                  <p className="mt-1 text-sm italic text-[var(--text-muted)]">
                    &ldquo;{item.description}&rdquo;
                  </p>
                )}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
