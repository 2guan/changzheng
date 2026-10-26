import { useEffect, useRef, useState } from "react";
import { Check, LockKey, X } from "@phosphor-icons/react";
import { badges } from "../achievements";
import { useProgress } from "../state";
export function BadgeGallery() {
  const { progress } = useProgress();
  return (
    <section className="badge-gallery" aria-label="我的学习勋章">
      <header>
        <div>
          <span className="chapter-label">一路走来 · 一枚纪念</span>
          <h2>我的学习勋章</h2>
        </div>
        <span>
          {progress.badges.length} / {badges.length} 枚
        </span>
      </header>
      <p>
        每一次认真阅读与思考，都值得留下印记。达成条件后，纪念章自动收入行囊。
      </p>
      <div className="badge-grid">
        {badges.map((b) => {
          const earned = progress.badges.includes(b.id),
            amount = Math.min(b.goal, b.metric(progress));
          return (
            <article
              className={`badge ${earned ? "earned" : "locked"}`}
              key={b.id}
            >
              <img
                src={`/assets/badges/${b.id}.svg`}
                alt={`${b.name}纪念章：${b.motif}`}
                width="160"
                height="180"
              />
              <small>{b.motif}</small>
              <h3>{b.name}</h3>
              <p>{b.description}</p>
              <span className="badge-status">
                {earned ? (
                  <>
                    <Check weight="bold" />
                    已获得
                  </>
                ) : (
                  <>
                    <LockKey />
                    {amount} / {b.goal}
                  </>
                )}
              </span>
              {!earned && (
                <progress
                  aria-label={`${b.name}获得进度`}
                  max={b.goal}
                  value={amount}
                />
              )}
            </article>
          );
        })}
      </div>
      <p className="badge-note">
        本站原创学习纪念章，采用红星、麦穗等时代纹样设计，不是历史实物勋章。
      </p>
    </section>
  );
}
export function BadgeToast() {
  const { progress } = useProgress();
  const previous = useRef(new Set(progress.badges));
  const [earned, setEarned] = useState<string[]>([]);
  useEffect(() => {
    const fresh = progress.badges.filter((id) => !previous.current.has(id));
    previous.current = new Set(progress.badges);
    if (fresh.length) setEarned(fresh);
  }, [progress.badges]);
  useEffect(() => {
    if (!earned.length) return;
    const timer = setTimeout(() => setEarned([]), 8000);
    return () => clearTimeout(timer);
  }, [earned]);
  if (!earned.length) return null;
  const badge = badges.find((b) => b.id === earned[0])!;
  return (
    <aside className="badge-toast" role="status">
      <img
        src={`/assets/badges/${badge.id}.svg`}
        alt=""
        width="48"
        height="54"
      />
      <div>
        <span>获得学习纪念章</span>
        <strong>
          {badge.name}
          {earned.length > 1 ? ` · 共 ${earned.length} 枚` : ""}
        </strong>
        <a
          href="#/learn?view=detail&stop=1&focus=progress"
          onClick={() => setEarned([])}
        >
          收入行囊，查看勋章
        </a>
      </div>
      <button aria-label="关闭勋章提示" onClick={() => setEarned([])}>
        <X />
      </button>
    </aside>
  );
}
