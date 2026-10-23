import { useEffect } from "react";
import {
  ArrowRight,
  MapPin,
  BookOpen,
  ArrowSquareOut,
} from "@phosphor-icons/react";
import { milestones, sources } from "../data";
import { Dialog, SaveButton, ReadMark } from "./UI";
export function Reader({
  id,
  onClose,
  onNext,
}: {
  id: number;
  onClose: () => void;
  onNext: (id: number) => void;
}) {
  const m = milestones[id - 1];
  useEffect(() => {
    document.querySelector("dialog")?.scrollTo({ top: 0, behavior: "instant" });
  }, [id]);
  return (
    <Dialog title="征途手记" onClose={onClose}>
      <article className="reader">
        <div className="reader-date">
          第 {String(m.id).padStart(2, "0")} 站 · {m.date}
        </div>
        <h2>{m.title}</h2>
        <p className="reader-subtitle">{m.subtitle}</p>
        <div className="reader-meta">
          <span>
            <MapPin />
            {m.place}
          </span>
          <SaveButton id={id} />
        </div>
        <p className="reader-lead">{m.summary}</p>
        {m.body.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
        <aside className="insight">
          <BookOpen />
          <div>
            <span>带着一个问题继续走</span>
            <p>{m.insight}</p>
          </div>
        </aside>
        <details className="sources">
          <summary>史料与编写说明</summary>
          <p>
            本章为编辑后的历史概要，关键时间线参照下列资料。引导性叙述不作为逐字历史记录；地图、里程和环境数值为教学示意。
          </p>
          {sources.slice(id === 11 ? 3 : 0, id === 11 ? 4 : 3).map((s) => (
            <a href={s.url} target="_blank" rel="noreferrer" key={s.url}>
              {s.title}
              <ArrowSquareOut />
            </a>
          ))}
        </details>
        <div className="reader-actions">
          <ReadMark id={id} />
          {id < 22 && (
            <button className="text-button" onClick={() => onNext(id + 1)}>
              下一站 <ArrowRight />
            </button>
          )}
        </div>
      </article>
    </Dialog>
  );
}
