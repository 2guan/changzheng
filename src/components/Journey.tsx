import { RichText, content } from "./ReadingContent";
import { StationDecision, Experiences } from "./Experiences";
import { ElevationTrail } from "./TerrainExplore";
import { useState, useEffect, lazy, Suspense } from "react";
import { RouteMap } from "./RouteMap";
import {
  ArrowLeft,
  ArrowRight,
  MapPin,
  Mountains,
  Path,
  CalendarBlank,
  MagnifyingGlassPlus,
  MagnifyingGlassMinus,
  ArrowsOutSimple,
  BookOpen,
  Play,
  Check,
  Wind,
  BowlFood,
} from "@phosphor-icons/react";
import { armies, milestones, phases, project, routePath } from "../data";
import { go, useProgress } from "../state";
import { SaveButton, Reveal, ReadMark } from "./UI";
import { Reader } from "./Reader";
const StoryFilm = lazy(() => import("./StoryFilm"));
export function Journey({ params }: { params: URLSearchParams }) {
  const num = Number(params.get("station"));
  const active = num >= 1 && num <= 22 ? Math.floor(num) : 1;
  const [army, setArmy] = useState("first");
  const [filter, setFilter] = useState(-1);
  const [film, setFilm] = useState(false);
  const { progress, setProgress } = useProgress();
  const m = milestones[active - 1];
  const read = params.get("read") === "1";
  const select = (id: number) => {
    setArmy("first");
    go("journey", { mode: "archive", station: id });
    setProgress((p) => ({ ...p, lastStation: id }));
  };
  useEffect(() => {
    const list = document.querySelector<HTMLElement>(".station-list");
    const item = list?.querySelector<HTMLElement>(".active");
    if (list && item) {
      const top = item.offsetTop - list.offsetTop;
      if (
        top < list.scrollTop ||
        top + item.offsetHeight > list.scrollTop + list.clientHeight
      )
        list.scrollTo({ top: Math.max(0, top - 80), behavior: "instant" });
    }
  }, [active, filter]);
  return (
    <main className="journey-page">
      <a
        className="archive-experience-link"
        href={`#/journey?station=${active}`}
      >
        <Play />
        走进全景漫游 <span>二十二站，沿着画卷慢慢走</span>
        <ArrowRight />
      </a>
      <div className="journey-hud" aria-live="polite">
        <div>
          <CalendarBlank />
          <span>
            历史时刻<strong>{m.date}</strong>
          </span>
        </div>
        <div>
          <Path />
          <span>
            累计行程 · 示意
            <strong>
              {m.distance.toLocaleString()} <small>华里</small>
            </strong>
          </span>
        </div>
        <div>
          <Mountains />
          <span>
            当前海拔 · 约
            <strong>
              {m.elevation.toLocaleString()} <small>米</small>
            </strong>
          </span>
        </div>
        <div>
          <Wind />
          <span>
            环境<strong>{m.weather}</strong>
          </span>
        </div>
        <div>
          <BowlFood />
          <span>
            沿途补给<strong>{m.food}</strong>
          </span>
        </div>
      </div>
      <ElevationTrail active={active} onSelect={select} />
      <div className="journey-workspace">
        <div className="journey-main">
          <RouteMap
            active={active}
            onSelect={select}
            army={army}
            setArmy={setArmy}
          />
          {army !== "first" && (
            <div className="army-map-note">
              <h3>{armies.find((a) => a.id === army)?.name}</h3>
              <p>{armies.find((a) => a.id === army)?.description}</p>
              <a href={`#/armies?army=${army}`}>
                了解这支队伍 <ArrowRight />
              </a>
            </div>
          )}
          <div className={`station-feature environment-${m.phase}`}>
            <div className="station-feature-top">
              <span className="chapter-label">{phases[m.phase]}</span>
              <SaveButton id={active} />
            </div>
            <div className="station-feature-body">
              <span className="station-large-number">
                {String(active).padStart(2, "0")}
              </span>
              <div>
                <div className="location">
                  <MapPin size={15} />
                  {m.place}
                </div>
                <h2>{m.title}</h2>
                <p>{m.summary}</p>
              </div>
            </div>
            <div className="station-actions">
              <a className="button" href={`#/journey?station=${active}`}>
                <ArrowsOutSimple />
                进入本站全景
                <ArrowRight />
              </a>
              <button
                className="button"
                onClick={() => go("journey", { station: active, read: 1 })}
              >
                <BookOpen />
                走进这一站
                <ArrowRight />
              </button>
              {active === 11 && (
                <button
                  className="text-button"
                  onClick={() => setFilm((v) => !v)}
                >
                  <Play />
                  {film ? "收起战役复盘" : "播放战役复盘"}
                </button>
              )}
              <div className="station-step">
                <button
                  className="icon-button"
                  disabled={active === 1}
                  onClick={() => select(active - 1)}
                  aria-label="上一站"
                >
                  <ArrowLeft />
                </button>
                <span>{active} / 22</span>
                <button
                  className="icon-button"
                  disabled={active === 22}
                  onClick={() => select(active + 1)}
                  aria-label="下一站"
                >
                  <ArrowRight />
                </button>
              </div>
            </div>
          </div>
        </div>
        <aside className="journey-sidebar">
          <div className="sidebar-title">
            <h2>征途目录</h2>
            <span>{progress.visited.length} / 22 已读</span>
          </div>
          <label className="sr-only" htmlFor="phase-filter">
            按历史阶段筛选
          </label>
          <select
            id="phase-filter"
            value={filter}
            onChange={(e) => setFilter(Number(e.target.value))}
          >
            <option value={-1}>全部阶段</option>
            {phases.map((p, i) => (
              <option value={i} key={p}>
                {p}
              </option>
            ))}
          </select>
          <div className="station-list">
            {milestones
              .filter((s) => filter < 0 || s.phase === filter)
              .map((s) => (
                <button
                  key={s.id}
                  onClick={() => select(s.id)}
                  className={s.id === active ? "active" : ""}
                  aria-current={s.id === active ? "step" : undefined}
                >
                  <span>
                    {progress.visited.includes(s.id) ? (
                      <Check size={16} />
                    ) : (
                      String(s.id).padStart(2, "0")
                    )}
                  </span>
                  <div>
                    <strong>{s.title}</strong>
                    <small>{s.date}</small>
                  </div>
                  <ArrowRight size={15} />
                </button>
              ))}
          </div>
          <p className="fineprint">
            点选站点探索；阅读后“完成这一站”留下足迹。
          </p>
        </aside>
      </div>
      <div className="journey-enrichment">
        <StationDecision key={active} id={active} />
        {[1, 5, 15, 18, 20].includes(active) && (
          <Experiences
            key={`experience-${active}`}
            initial={
              ({ 1: 0, 5: 4, 15: 1, 18: 2, 20: 3 } as Record<number, number>)[
                active
              ]
            }
            embedded
          />
        )}
      </div>
      {film && (
        <section className="section film-section">
          <h2>在转向之中，读懂主动。</h2>
          <Suspense fallback={<p>正在准备战役动画…</p>}>
            <StoryFilm />
          </Suspense>
        </section>
      )}
      <Reveal className="journey-bottom">
        <p>不必一次走完。每一次停留，都是一次靠近。</p>
        <a className="text-button" href="#/learn">
          查看我的行囊 <ArrowRight />
        </a>
      </Reveal>
      {read && (
        <Reader
          id={active}
          onClose={() => go("journey", { station: active })}
          onNext={(id) => go("journey", { station: id, read: 1 })}
        />
      )}
    </main>
  );
}
export function Armies({ params }: { params: URLSearchParams }) {
  const army = params.get("army") || "first";
  const a = armies.find((a) => a.id === army) || armies[0];
  const setArmy = (id: string) => go("armies", { army: id });
  return (
    <article className="topic-content army-detail">
      {" "}
      <div className="army-layout">
        <RouteMap army={army} setArmy={setArmy} />
        <article className="army-dossier" style={{ borderColor: a.color }}>
          <p className="chapter-label" data-no-narration>
            {a.time}
          </p>
          <h2 data-no-narration>{a.name}</h2>
          <p>{a.description}</p>
          <dl>
            <div>
              <dt>出发地</dt>
              <dd>{a.from}</dd>
            </div>
            <div>
              <dt>会师 / 抵达地</dt>
              <dd>{a.to}</dd>
            </div>
            <div>
              <dt>行程概述</dt>
              <dd>{a.distance}</dd>
            </div>
            <div>
              <dt>主要领导人</dt>
              <dd>{a.leaders}</dd>
            </div>
          </dl>
          <p className="fineprint">
            路线简化展示主要方向；各路行程统计存在口径差异。
          </p>
        </article>
      </div>
      <section className="section army-full-table">
        <span className="chapter-label">四路全景 · 完整对照</span>
        <h2>时间、行程，与各自的贡献。</h2>
        <RichText text={content.armies} />
        <p className="fineprint">
          省份采用历史行政区划；兵力和里程随统计时点与口径不同而变化。
        </p>
      </section>
      <section className="section">
        <h2>同一段历史，不同的时间刻度。</h2>
        <div className="army-timeline">
          {armies.map((ar, i) => (
            <div key={ar.id}>
              <strong>{ar.name}</strong>
              <div className="time-track">
                <span
                  style={{
                    marginLeft: `${[0, 55, 22, 5][i]}%`,
                    width: `${[52, 45, 78, 43][i]}%`,
                    background: ar.color,
                  }}
                >
                  {ar.time}
                </span>
              </div>
            </div>
          ))}
        </div>
        <p className="editorial-note">
          1935年10月，中央红军到达陕北；1936年10月，三大主力会师。两个时刻，都值得准确记住。
        </p>
      </section>
    </article>
  );
}
