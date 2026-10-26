import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  MapTrifold,
  List,
  Eye,
  EyeSlash,
  ArrowsOutSimple,
  ArrowsInSimple,
  X,
  Check,
  Compass,
} from "@phosphor-icons/react";
import { milestones, phases } from "../data";
import {
  panoramas,
  PANORAMA_KEY,
  panoramaStation,
  sanitizePanoramaProgress,
  type PanoramaProgress,
} from "../panoramas";
import { go } from "../state";
import { Dialog, SaveButton } from "./UI";
import { Reader } from "./Reader";
import { NarrateButton, PageNarrateButton } from "../audio";
import { stationNarration } from "../narration";
import { focalPan } from "../landscapeFocus";

export default function Panorama({ params }: { params: URLSearchParams }) {
  const [progress, setProgress] = useState<PanoramaProgress>(() => {
    try {
      return sanitizePanoramaProgress(
        JSON.parse(localStorage.getItem(PANORAMA_KEY) || "null"),
      );
    } catch {
      return sanitizePanoramaProgress(null);
    }
  });
  const active = panoramaStation(params.get("station"), progress.lastStation);
  const m = milestones[active - 1];
  const scene = panoramas[active - 1];
  const [pan, setPan] = useState(50);
  const [size, setSize] = useState({ width: 1280, height: 800 });
  const [ratio, setRatio] = useState(2.4);
  const [focused, setFocused] = useState(false);
  const [quiet, setQuiet] = useState(false);
  const [details, setDetails] = useState(false);
  const [detail, setDetail] = useState<number | null>(null);
  const [directory, setDirectory] = useState(false);
  const [reader, setReader] = useState(params.get("read") === "1");
  const readRequested = params.get("read") === "1";
  useEffect(() => setReader(readRequested), [readRequested, active]);
  const [beat, setBeat] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const [storageError, setStorageError] = useState(false);
  const world = useRef<HTMLDivElement>(null);
  const main = useRef<HTMLElement>(null);
  const rail = useRef<HTMLDivElement>(null);
  const drag = useRef<{ id: number; start: number; pan: number } | null>(null);
  const manuallyPanned = useRef(false);
  const reduced = useReducedMotion();
  const canvasWidth = Math.max(size.width, size.height * ratio);
  const travel = canvasWidth - size.width;
  const paragraphs = [m.summary, m.body[0], m.body[1]];
  const visit = (id: number) => {
    if (id < 1 || id > 22) return;
    go("journey", { station: id });
  };
  useEffect(() => {
    const el = world.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) =>
      setSize({
        width: entry.contentRect.width,
        height: entry.contentRect.height,
      }),
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    manuallyPanned.current = false;
    setPan(50);
    setBeat(0);
    setDetail(null);
    setLoaded(false);
    setFailed(false);
    drag.current = null;
    main.current?.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [active]);
  useEffect(() => {
    if (!manuallyPanned.current) {
      setPan(
        window.matchMedia("(max-width: 768px)").matches
          ? focalPan(scene.mobileFocusX, canvasWidth, size.width) * 100
          : 50,
      );
    }
  }, [active, scene.mobileFocusX, canvasWidth, size.width]);
  useEffect(() => {
    if (!loaded || failed) return;
    setProgress((p) => ({
      ...p,
      lastStation: active,
      seen: [...new Set([...p.seen, active])],
    }));
  }, [active, loaded, failed]);
  useEffect(() => {
    try {
      localStorage.setItem(PANORAMA_KEY, JSON.stringify(progress));
      setStorageError(false);
    } catch {
      setStorageError(true);
    }
  }, [progress]);
  useEffect(() => {
    const next = panoramas[active];
    if (next) {
      const image = new Image();
      image.src = next.image;
    }
  }, [active]);
  useEffect(() => {
    const selected = rail.current?.querySelector<HTMLElement>(
      '[aria-current="step"]',
    );
    if (selected && rail.current)
      rail.current.scrollTo({
        left:
          selected.offsetLeft -
          rail.current.offsetLeft -
          rail.current.clientWidth / 2 +
          selected.clientWidth / 2,
        behavior: reduced ? "instant" : "smooth",
      });
  }, [active, reduced]);
  useEffect(() => {
    const escape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !directory && !reader) {
        if (detail !== null) setDetail(null);
        else if (quiet) setQuiet(false);
        else setFocused(false);
      }
    };
    window.addEventListener("keydown", escape);
    return () => window.removeEventListener("keydown", escape);
  }, [directory, reader, detail, quiet]);
  const showDetail = (i: number) => {
    manuallyPanned.current = true;
    setDetails(true);
    setDetail(i);
    const x = (scene.details[i].x / 100) * canvasWidth;
    setPan(
      travel
        ? Math.max(0, Math.min(100, ((x - size.width * 0.6) / travel) * 100))
        : 50,
    );
  };
  return (
    <main
      className={`panorama ${focused ? "is-focused" : ""} ${quiet ? "is-quiet" : ""}`}
      ref={main}
      tabIndex={-1}
      aria-label={`${m.title}全景漫游`}
    >
      <div
        className="panorama-world"
        ref={world}
        aria-label="可左右拖动的宽幅场景"
        onPointerDown={(e) => {
          if ((e.target as HTMLElement).closest("button") || travel < 1) return;
          manuallyPanned.current = true;
          drag.current = { id: e.pointerId, start: e.clientX, pan };
          e.currentTarget.setPointerCapture(e.pointerId);
        }}
        onPointerMove={(e) => {
          if (drag.current?.id !== e.pointerId) return;
          setPan(
            Math.max(
              0,
              Math.min(
                100,
                drag.current.pan -
                  ((e.clientX - drag.current.start) / travel) * 100,
              ),
            ),
          );
        }}
        onPointerUp={(e) => {
          drag.current = null;
          if (e.currentTarget.hasPointerCapture(e.pointerId))
            e.currentTarget.releasePointerCapture(e.pointerId);
        }}
        onPointerCancel={() => {
          drag.current = null;
        }}
      >
        <motion.div
          key={active}
          className="panorama-canvas"
          initial={reduced ? false : { opacity: 0 }}
          animate={{ opacity: loaded ? 1 : 0 }}
          transition={{ duration: reduced ? 0 : 0.7 }}
          style={{
            width: canvasWidth,
            transform: `translateX(${(-travel * pan) / 100}px)`,
          }}
        >
          <img
            src={failed ? "/assets/hero.webp" : scene.image}
            alt={`${m.place}，${m.title}宽幅艺术场景`}
            draggable={false}
            onLoad={(e) => {
              setRatio(
                e.currentTarget.naturalWidth / e.currentTarget.naturalHeight,
              );
              setLoaded(true);
            }}
            onError={() => {
              setFailed(true);
              setLoaded(true);
            }}
          />
          {details &&
            !quiet &&
            scene.details.map((d, i) => (
              <button
                className={`panorama-hotspot ${detail === i ? "selected" : ""}`}
                key={`${active}-${i}`}
                style={{ left: `${d.x}%`, top: `${d.y}%` }}
                onClick={() => showDetail(i)}
                aria-label={`观察${d.title}`}
              >
                <span>＋</span>
                <b>{d.title}</b>
              </button>
            ))}
        </motion.div>
      </div>
      <div className="panorama-vignette" aria-hidden="true" />
      {!loaded && (
        <div className="panorama-loading" role="status">
          <Compass />
          这一站的山河，正在展开
        </div>
      )}
      <header className="panorama-toolbar">
        <a href={`#/journey?stop=${active}`} aria-label="返回路线">
          <MapTrifold />
          <span>返回路线</span>
        </a>
        <div className="panorama-series">
          <b>万里征途</b>
          <span>二十二站 · 全景叙事</span>
        </div>
        <div className="panorama-tools">
          <PageNarrateButton
            id={`station-${active}`}
            text={stationNarration[active - 1]}
            enabled={!reader && !readRequested}
            label="本站讲解"
          />
          <button
            onClick={() => {
              setDirectory(true);
            }}
            aria-label="展开22站目录"
          >
            <List />
          </button>
          <button
            aria-label={quiet ? "显示叙事文字" : "隐藏文字看风景"}
            aria-pressed={quiet}
            onClick={() => setQuiet(!quiet)}
          >
            {quiet ? <Eye /> : <EyeSlash />}
          </button>
          <button
            aria-label={focused ? "退出专注模式" : "进入专注模式"}
            aria-pressed={focused}
            onClick={() => setFocused(!focused)}
          >
            {focused ? <ArrowsInSimple /> : <ArrowsOutSimple />}
          </button>
        </div>
      </header>
      {!quiet && (
        <div className="panorama-location">
          <div>
            <p>
              {m.date} <i /> {m.place}
            </p>
            <h1>{m.title}</h1>
            <span>{m.subtitle}</span>
          </div>
          <span>{String(active).padStart(2, "0")} / 22</span>
        </div>
      )}
      <div className="panorama-center-label" aria-hidden="true">
        {quiet ? m.title : scene.mood}
      </div>
      {!quiet && (
        <section className="panorama-story" aria-label="本站叙事">
          {detail === null ? (
            <>
              <div className="panorama-story-tabs" aria-label="叙事段落">
                {["初见", "行至此处", "回望"].map((name, i) => (
                  <button
                    key={name}
                    aria-pressed={beat === i}
                    onClick={() => {
                      setBeat(i);
                    }}
                  >
                    {name}
                    <span />
                  </button>
                ))}
              </div>
              <motion.p
                key={`${active}-${beat}`}
                initial={reduced ? false : { opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
              >
                {paragraphs[beat]}
              </motion.p>
              {beat === 2 && (
                <blockquote>{m.insight.replace("观察动画时，", "")}</blockquote>
              )}
              <div className="panorama-story-actions">
                <button
                  onClick={() => {
                    setReader(true);
                  }}
                >
                  <BookOpen />
                  完整史料
                </button>
                <button
                  aria-expanded={details}
                  onClick={() => setDetails(!details)}
                >
                  <Eye />
                  {details ? "收起细节" : "观察细节"}
                </button>
                <SaveButton id={active} />
              </div>
              {details && (
                <div className="panorama-detail-links">
                  {scene.details.map((d, i) => (
                    <button key={d.title} onClick={() => showDetail(i)}>
                      {String(i + 1).padStart(2, "0")} · {d.title}
                      <ArrowRight />
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="panorama-detail-story">
              <div>
                <span>画面细节 / {detail + 1}</span>
                <NarrateButton
                  id={`observation-${active}-${detail}`}
                  text={`${scene.details[detail].title}。${scene.details[detail].text}`}
                  iconOnly
                  label="细节讲解"
                />
                <button
                  aria-label="关闭画面细节"
                  onClick={() => setDetail(null)}
                >
                  <X />
                </button>
              </div>
              <h2>{scene.details[detail].title}</h2>
              <p>{scene.details[detail].text}</p>
              <button onClick={() => showDetail(detail === 0 ? 1 : 0)}>
                看看另一处细节 <ArrowRight />
              </button>
            </div>
          )}
        </section>
      )}
      <div className="panorama-camera">
        <span>左</span>
        <input
          type="range"
          aria-label="左右环顾全景"
          min="0"
          max="100"
          value={Math.round(pan)}
          onChange={(e) => {
            manuallyPanned.current = true;
            setPan(Number(e.target.value));
          }}
        />
        <span>右</span>
        <small>拖动画面 · 环顾山河</small>
      </div>
      <footer className="panorama-footer">
        <div className="panorama-navigation">
          <button
            className="panorama-prev"
            aria-label="上一站"
            disabled={active === 1}
            onClick={() => visit(active - 1)}
          >
            <ArrowLeft />
            <span>上一站</span>
          </button>
          <div>
            <span>{phases[m.phase]}</span>
            <small>
              {active === 22
                ? "终点，也是新的出发"
                : `下一站 · ${milestones[active].title}`}
            </small>
          </div>
          <button
            className="panorama-next"
            onClick={() => (active === 22 ? go("meaning") : visit(active + 1))}
          >
            {active === 22 ? "走向长征回响" : "继续前行"}
            <ArrowRight />
          </button>
        </div>
        <div className="panorama-stations" ref={rail} aria-label="22站全景进度">
          {milestones.map((s) => (
            <button
              key={s.id}
              aria-label={`全景第${s.id}站 ${s.title}`}
              aria-current={s.id === active ? "step" : undefined}
              onClick={() => visit(s.id)}
              className={progress.seen.includes(s.id) ? "seen" : ""}
            >
              <span />
              <small>{String(s.id).padStart(2, "0")}</small>
            </button>
          ))}
        </div>
        <div className="panorama-colophon">
          <span>
            {failed
              ? "当前全景未加载，显示备用画面。"
              : "宽幅艺术全景 · 非实地360°影像"}
          </span>
          <span>
            {storageError
              ? "浏览器暂时无法保存浏览记录"
              : `${progress.seen.length} / 22 站已浏览 · 自动续行`}
          </span>
        </div>
      </footer>
      {directory && (
        <Dialog
          title="二十二站，一路山河"
          onClose={() => setDirectory(false)}
          wide
        >
          <div className="panorama-directory">
            {milestones.map((s) => (
              <button
                key={s.id}
                aria-label={`进入全景 ${s.title}`}
                className={s.id === active ? "active" : ""}
                onClick={() => {
                  visit(s.id);
                  setDirectory(false);
                }}
              >
                <img src={panoramas[s.id - 1].image} alt="" loading="lazy" />
                <div>
                  <span>
                    {String(s.id).padStart(2, "0")} · {phases[s.phase]}
                  </span>
                  <h3>{s.title}</h3>
                  <small>{s.place}</small>
                </div>
                {progress.seen.includes(s.id) && <Check />}
              </button>
            ))}
          </div>
        </Dialog>
      )}
      {reader && (
        <Reader
          id={active}
          onClose={() => {
            setReader(false);
            if (readRequested) go("journey", { station: active });
          }}
          onNext={(id) => {
            setReader(false);
            visit(id);
          }}
        />
      )}
    </main>
  );
}
