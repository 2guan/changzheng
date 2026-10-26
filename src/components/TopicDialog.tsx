import { lazy, Suspense } from "react";
import { Dialog } from "./UI";
import type { atlasDetail } from "../details";
const Prologue = lazy(() =>
  import("./Editorial").then((m) => ({ default: m.Prologue })),
);
const Stories = lazy(() =>
  import("./Editorial").then((m) => ({ default: m.Stories })),
);
const Meaning = lazy(() =>
  import("./Editorial").then((m) => ({ default: m.Meaning })),
);
const Poetry = lazy(() =>
  import("./Editorial").then((m) => ({ default: m.Poetry })),
);
const Armies = lazy(() =>
  import("./Journey").then((m) => ({ default: m.Armies })),
);
const Learning = lazy(() =>
  import("./Learning").then((m) => ({ default: m.Learning })),
);
const Quiz = lazy(() =>
  import("./Learning").then((m) => ({ default: m.Quiz })),
);

export default function TopicDialog({
  detail,
  onClose,
}: {
  detail: NonNullable<ReturnType<typeof atlasDetail>>;
  onClose: () => void;
}) {
  const { page, params, title } = detail;
  // The quiz already owns the same native dialog shell.
  if (page === "learn" && params.get("focus") === "quiz")
    return (
      <Suspense
        fallback={
          <Dialog narratable title={title} onClose={onClose}>
            <p role="status">正在展开内容…</p>
          </Dialog>
        }
      >
        <Quiz onClose={onClose} />
      </Suspense>
    );
  return (
    <Dialog narratable title={title} onClose={onClose}>
      <Suspense fallback={<p role="status">正在展开内容…</p>}>
        {page === "prologue" ? (
          <Prologue params={params} />
        ) : page === "stories" ? (
          <Stories params={params} />
        ) : page === "meaning" ? (
          <Meaning params={params} />
        ) : page === "poetry" ? (
          <Poetry params={params} />
        ) : page === "armies" ? (
          <Armies params={params} />
        ) : (
          <Learning params={params} />
        )}
      </Suspense>
    </Dialog>
  );
}
