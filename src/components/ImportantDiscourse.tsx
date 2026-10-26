import { useId } from "react";
import excerpts from "../discourse-data.json";
import { discourseSelection } from "../discourse";

export function ImportantDiscourse({
  page,
  params,
}: {
  page: string;
  params: URLSearchParams;
}) {
  const headingId = useId();
  const selection = discourseSelection(page, params);
  const passage =
    selection &&
    excerpts.find((q) => q.id === selection.entryId)?.passages[
      selection.passageIndex
    ];
  if (!passage) return null;
  return (
    <section className="important-discourse" aria-labelledby={headingId}>
      <h3 id={headingId} data-no-narration>
        总书记重要论述
      </h3>
      <figure>
        <blockquote>
          {passage.paragraphs.map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </blockquote>
        <figcaption data-no-narration>
          <cite>{passage.source}</cite>
        </figcaption>
      </figure>
    </section>
  );
}
