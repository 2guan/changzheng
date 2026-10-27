import JourneyAtlas from "./JourneyAtlas";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import {
  ArrowLeft,
  ArrowRight,
  MapTrifold,
  Eye,
  EyeSlash,
  Play,
  Pause,
} from "@phosphor-icons/react";
import { modules, themeModules } from "../data";
import {
  armyAtlasLayout,
  armyAtlasPath,
  atlasRoutes,
  atlasSelection,
  atlasPositions,
  atlasMobileLayout,
  atlasMobilePath,
  atlasPath,
  atlasMapHref,
  homeMapHref,
} from "../atlas";
import { useProgress } from "../state";
import { PageNarrateButton, useAudio } from "../audio";
import { moduleNarration } from "../narration";
import { useLandscapeDrag } from "./useLandscapeDrag";

type AtlasProps = { page: string; params: URLSearchParams; obscured?: boolean };
export default function Atlas(props: AtlasProps) {
  return props.page === "journey" ? (
    <JourneyAtlas params={props.params} obscured={props.obscured} />
  ) : (
    <NarrativeAtlas {...props} />
  );
}
function NarrativeAtlas({
  page,
  params,
  obscured = false,
}: {
  page: string;
  params: URLSearchParams;
  obscured?: boolean;
}) {
  const route = atlasRoutes[page];
  const audio = useAudio();
  const landscape = useLandscapeDrag(page, obscured, route.mobileFocusX);
  const selected = atlasSelection(page, params);
  const [preview, setPreview] = useState(selected);
  const current = route.stops[preview - 1];
  const points =
    page === "armies"
      ? armyAtlasLayout().desktop
      : atlasPositions(route.stops.length);
  const mobile =
    page === "armies"
      ? armyAtlasLayout().mobile
      : atlasMobileLayout(route.stops.length, page === "home" ? 2 : undefined);
  const [quiet, setQuiet] = useState(false);
  const [failed, setFailed] = useState(false);
  const { progress } = useProgress();
  const viewport = useRef<HTMLDivElement>(null);
  const title = useRef<HTMLHeadingElement>(null);
  const wasObscured = useRef(obscured);
  const module = modules.find((m) => m.id === page)!;
  const chapter = themeModules.findIndex((m) => m.id === page) + 1;
  const select = (n: number) => {
    if (n < 1 || n > route.stops.length) return;
    setPreview(n);
    const el = viewport.current;
    const node = el?.querySelector<HTMLElement>(`[data-stop="${n}"]`);
    if (el && node) {
      if (window.matchMedia("(max-width: 768px)").matches) {
        node.scrollIntoView({ block: "center", behavior: "instant" });
      } else {
        el.scrollTo({
          left: node.offsetLeft - el.clientWidth / 2,
          behavior: "instant",
        });
      }
    }
  };
  useEffect(() => {
    setFailed(false);
    setQuiet(false);
    title.current?.focus({ preventScroll: true });
  }, [page]);
  useEffect(() => {
    setPreview(selected);
    const returning = wasObscured.current && !obscured;
    wasObscured.current = obscured;
    if (obscured) return;
    const el = viewport.current;
    const node = el?.querySelector<HTMLElement>(`[data-stop="${selected}"]`);
    if (!el || !node) return;
    if (returning) node.focus({ preventScroll: true });
    if (window.matchMedia("(max-width: 768px)").matches) {
      if (selected > 1 && !quiet) {
        const frame = requestAnimationFrame(() =>
          node.scrollIntoView({ block: "center", behavior: "instant" }),
        );
        return () => cancelAnimationFrame(frame);
      }
    } else {
      el.scrollTo({
        left: node.offsetLeft - el.clientWidth / 2,
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "instant"
          : "smooth",
      });
    }
  }, [selected, page, quiet, obscured]);
  function status(i: number) {
    if (page === "journey")
      return progress.visited.includes(i + 1) ? "已阅读" : "";
    if (page === "stories")
      return progress.stories.includes(i + 1) ? "已阅读" : "";
    return "";
  }
  return (
    <main
      ref={landscape.surface}
      {...landscape.handlers}
      className={`atlas atlas-${page} ${page !== "journey" && page !== "stories" ? "atlas-fit" : ""} ${quiet ? "atlas-quiet" : ""}`}
      style={
        {
          "--fit-map-min-height": `${mobile.rows * (page === "poetry" ? 110 : page === "armies" ? 100 : 80)}px`,
        } as CSSProperties
      }
    >
      <img
        ref={landscape.artwork}
        draggable={false}
        className="atlas-landscape"
        src={failed ? "/assets/hero.webp" : route.image}
        alt={route.alt}
        onError={() => setFailed(true)}
        fetchPriority="high"
      />
      <div className="atlas-shade" aria-hidden="true" />
      <div className="atlas-topline">
        {page !== "home" && (
          <a href={homeMapHref(page)}>
            <MapTrifold />
            首页地图
          </a>
        )}
        <div>
          {page === "home" && (
            <button
              className="narrate-button"
              aria-label={audio.playing ? "暂停背景音乐" : "播放背景音乐"}
              aria-pressed={audio.playing}
              disabled={!audio.tracks[audio.selected]}
              onClick={audio.toggleMusic}
            >
              {audio.playing ? (
                <Pause aria-hidden="true" />
              ) : (
                <Play aria-hidden="true" />
              )}
            </button>
          )}
          <PageNarrateButton
            id={`module-${page}`}
            text={moduleNarration[page]}
            enabled={!obscured}
            label="本页讲解"
          />
          <button
            aria-label={quiet ? "显示路线" : "静观全景"}
            aria-pressed={quiet}
            onClick={() => setQuiet(!quiet)}
          >
            {quiet ? <Eye /> : <EyeSlash />}
          </button>
        </div>
      </div>
      <header className="atlas-heading">
        <div>
          <span className="atlas-eyebrow">
            {page === "home"
              ? "山河为证 · 初心如炬"
              : page === "learn"
                ? "学习中心 · 我的行囊"
                : `${module.name} · 第${String(chapter).padStart(2, "0")}章`}
          </span>
          <h1 ref={title} tabIndex={-1}>
            {page === "home" ? (
              <>
                <span className="atlas-title-lead">重走</span>
                <span className="atlas-title-cinnabar">长征路</span>
              </>
            ) : (
              route.title
            )}
          </h1>
          <p>{route.line}</p>
        </div>
      </header>
      <div
        className="atlas-map-area"
        aria-hidden={quiet || undefined}
        inert={quiet}
      >
        <div
          className="atlas-map-viewport"
          ref={viewport}
          role="region"
          aria-label={`${module.name}路线图`}
          tabIndex={0}
        >
          <div
            className={`atlas-map-canvas ${route.stops.length > 12 ? "atlas-dense" : ""}`}
            style={
              { "--mobile-map-height": `${mobile.height}px` } as CSSProperties
            }
          >
            <svg
              className="atlas-desktop-road"
              viewBox="0 0 1000 400"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <path
                className="atlas-road-shadow"
                d={
                  page === "armies" ? armyAtlasPath(points) : atlasPath(points)
                }
              />
              <path
                className="atlas-road"
                d={
                  page === "armies" ? armyAtlasPath(points) : atlasPath(points)
                }
              />
              <path
                className="atlas-road-progress"
                d={
                  page === "armies"
                    ? armyAtlasPath(points, preview)
                    : atlasPath(points.slice(0, preview))
                }
              />
            </svg>
            <svg
              className="atlas-mobile-road"
              viewBox="0 0 1000 400"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <path
                className="atlas-road-shadow"
                d={
                  page === "armies"
                    ? armyAtlasPath(mobile.points, undefined, mobile.height)
                    : atlasMobilePath(mobile.points, mobile.height)
                }
              />
              <path
                className="atlas-road"
                d={
                  page === "armies"
                    ? armyAtlasPath(mobile.points, undefined, mobile.height)
                    : atlasMobilePath(mobile.points, mobile.height)
                }
              />
              <path
                className="atlas-road-progress"
                d={
                  page === "armies"
                    ? armyAtlasPath(mobile.points, preview, mobile.height)
                    : atlasMobilePath(
                        mobile.points.slice(0, preview),
                        mobile.height,
                      )
                }
              />
            </svg>
            {route.stops.map((s, i) => (
              <a
                key={s.href}
                href={s.href}
                data-stop={i + 1}
                className={`atlas-stop ${page === "armies" && i === 4 ? "atlas-comparison-stop" : ""} ${i + 1 === preview ? "is-selected" : ""}`}
                style={
                  {
                    "--desktop-x": `${points[i][0]}%`,
                    "--desktop-y": `${points[i][1]}%`,
                    "--mobile-x": `${mobile.points[i][0]}%`,
                    "--mobile-y": `${mobile.points[i][1]}%`,
                  } as CSSProperties
                }
                aria-label={`第${i + 1}站 ${s.title}${status(i) ? "，已阅读" : ""}`}
                aria-current={preview === i + 1 ? "location" : undefined}
                onPointerEnter={(e) => {
                  if (e.pointerType !== "touch" && !landscape.dragging.current)
                    setPreview(i + 1);
                }}
                onFocus={() => {
                  if (!landscape.dragging.current) setPreview(i + 1);
                }}
                onKeyDown={(e) => {
                  if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
                    e.preventDefault();
                    const next = Math.max(
                      1,
                      Math.min(
                        route.stops.length,
                        i + 1 + (e.key === "ArrowRight" ? 1 : -1),
                      ),
                    );
                    select(next);
                    viewport.current
                      ?.querySelectorAll<HTMLAnchorElement>(".atlas-stop")
                      [next - 1]?.focus({ preventScroll: true });
                  }
                }}
              >
                <span className="atlas-stop-pin">
                  {page === "home" ? (
                    <span className="atlas-home-pin-title">{s.title}</span>
                  ) : page === "armies" && i === 4 ? (
                    <span className="atlas-comparison-pin-title">
                      {s.title}
                    </span>
                  ) : (
                    String(i + 1).padStart(2, "0")
                  )}
                </span>
                {page !== "home" && !(page === "armies" && i === 4) && (
                  <span className="atlas-stop-title">{s.title}</span>
                )}
                {status(i) && <small>{status(i)}</small>}
              </a>
            ))}
          </div>
        </div>
      </div>
      <section
        className="atlas-dock"
        aria-label="当前站点预览"
        aria-hidden={quiet || undefined}
        inert={quiet}
      >
        <div className="atlas-preview" aria-live="polite">
          {current.image ? (
            <img
              src={current.image}
              alt={current.title + "主题艺术插画"}
              width="144"
              height="86"
            />
          ) : (
            <span className="atlas-selected-number">
              {String(preview).padStart(2, "0")}
            </span>
          )}
          <div key={current.href} className="atlas-preview-copy">
            <span>{current.subtitle}</span>
            <h2>{current.title}</h2>
            <p>{current.description}</p>
          </div>
        </div>
        <div className="atlas-dock-actions">
          <div className="atlas-stepper">
            <button
              aria-label="预览上一站"
              disabled={preview === 1}
              onClick={() => select(preview - 1)}
            >
              <ArrowLeft />
            </button>
            <span>
              {String(preview).padStart(2, "0")} /{" "}
              {String(route.stops.length).padStart(2, "0")}
            </span>
            <button
              aria-label="预览下一站"
              disabled={preview === route.stops.length}
              onClick={() => select(preview + 1)}
            >
              <ArrowRight />
            </button>
          </div>
        </div>
      </section>
      <div className="atlas-colophon">
        {page === "journey" ? (
          <a href={`#/journey?mode=archive&station=${preview}`}>
            查看地理资料地图 <ArrowRight />
          </a>
        ) : (
          <span>1934 — 1936 · 山河为证</span>
        )}
      </div>
    </main>
  );
}
export function AtlasReturn({
  page,
  params,
}: {
  page: string;
  params: URLSearchParams;
}) {
  return (
    <nav className="atlas-return" aria-label="返回地图">
      <a href={atlasMapHref(page, params)}>
        <ArrowLeft />
        返回
        {page === "home"
          ? "首页地图"
          : `${modules.find((m) => m.id === page)?.name}路线`}
      </a>
      {page !== "home" && (
        <a href={homeMapHref(page)}>
          <MapTrifold />
          首页地图
        </a>
      )}
    </nav>
  );
}
// Called inside each lazy-loaded reading view, after its target nodes mount.
export function useAtlasFocus(params: URLSearchParams) {
  const target = params.get("focus");
  useEffect(() => {
    if (!target) return;
    const node = document.getElementById(
      target.startsWith("chapter-") ? "atlas-reading" : `atlas-${target}`,
    );
    if (node) {
      node.scrollIntoView({ block: "start", behavior: "instant" });
      node.focus({ preventScroll: true });
    }
  }, [target]);
}
