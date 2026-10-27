import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent,
} from "react";
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeSlash,
  MapTrifold,
  Minus,
  Plus,
} from "@phosphor-icons/react";
import { atlasRoutes, atlasSelection, homeMapHref } from "../atlas";
import { PageNarrateButton } from "../audio";
import { modules, themeModules } from "../data";
import { moduleNarration } from "../narration";
import { useProgress } from "../state";
import {
  centralRoute,
  expandedJourneyFrame,
  journeyPanBounds,
  contextRoutes,
  geographicPath,
  journeyLocations,
  layoutJourneyLabels,
  projectJourney,
  provinceLabels,
  layoutJourneyCities,
} from "../journeyMap";
import geography from "../journeyGeography.json";

export default function JourneyAtlas({
  params,
  obscured = false,
}: {
  params: URLSearchParams;
  obscured?: boolean;
}) {
  const selected = atlasSelection("journey", params),
    route = atlasRoutes.journey;
  const [preview, setPreview] = useState(selected);
  const [quiet, setQuiet] = useState(false);
  const [showNodes, setShowNodes] = useState(true);
  const [visibleArmies, setVisibleArmies] = useState([true, true, true, true]);
  const [width, setWidth] = useState(760),
    [zoom, setZoom] = useState(1);
  const [mapHeight, setMapHeight] = useState(684);
  const [mobile, setMobile] = useState(false);
  const shell = useRef<HTMLDivElement>(null);
  const surface = useRef<HTMLElement>(null);
  const background = useRef<HTMLImageElement>(null);
  const mapOrigin = useRef({ x: 0, y: 0 });
  const pageSize = useRef({ width: 1280, height: 720 });
  const viewport = useRef<HTMLDivElement>(null),
    plane = useRef<HTMLDivElement>(null);
  const offset = useRef({ x: 0, y: 0 }),
    drag = useRef<{
      id: number;
      x: number;
      y: number;
      ox: number;
      oy: number;
      moved: boolean;
    } | null>(null);
  const suppressClick = useRef(false);
  const panFrame = useRef<number | null>(null);
  function paintOffset() {
    panFrame.current = null;
    const transform = `translate3d(${offset.current.x}px,${offset.current.y}px,0)`;
    if (plane.current) plane.current.style.transform = transform;
    if (background.current) background.current.style.transform = transform;
  }
  function flushOffset() {
    if (panFrame.current !== null) cancelAnimationFrame(panFrame.current);
    paintOffset();
  }
  useEffect(
    () => () => {
      if (panFrame.current !== null) cancelAnimationFrame(panFrame.current);
    },
    [],
  );
  const { progress } = useProgress();
  const compact = width < 500;
  const mapWidth = width * zoom;
  const labels = useMemo(
    () =>
      layoutJourneyLabels(
        mapWidth,
        compact,
        zoom === 1 ? mapHeight : undefined,
      ),
    [mapWidth, compact, mapHeight, zoom],
  );
  const cities = useMemo(
    () =>
      layoutJourneyCities(
        mapWidth,
        visibleArmies,
        zoom === 1 ? mapHeight : undefined,
        compact && zoom === 1,
        mobile,
      ),
    [mapWidth, visibleArmies, mapHeight, zoom, compact, mobile],
  );
  const current = route.stops[preview - 1];
  useEffect(() => setPreview(selected), [selected]);
  function paintBackground() {
    const image = background.current;
    if (!image) return;
    // Expanded artwork: 86–137°E / 8–52°N. Register it to the unchanged
    // 98.5–118°E / 23.5–38.5°N interactive map, including zoom and drag.
    const frame = expandedJourneyFrame(width, mapWidth, mapOrigin.current);
    image.style.width = `${frame.width}px`;
    image.style.height = `${frame.height}px`;
    image.style.left = `${frame.left}px`;
    image.style.top = `${frame.top}px`;
    image.style.transform = `translate3d(${offset.current.x}px,${offset.current.y}px,0)`;
  }
  useEffect(() => {
    const el = viewport.current,
      main = surface.current;
    if (!el || !main) return;
    const measure = () => {
      const map = el.getBoundingClientRect(),
        page = main.getBoundingClientRect();
      mapOrigin.current = { x: map.left - page.left, y: map.top - page.top };
      pageSize.current = { width: page.width, height: page.height };
      setMobile(page.width < 1000);
      const space = shell.current?.getBoundingClientRect();
      if (space) {
        setWidth(
          space.width < 500
            ? space.width
            : Math.min(space.width, space.height / 0.82),
        );
        setMapHeight(space.height);
      }
      paintBackground();
    };
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    observer.observe(main);
    if (shell.current) observer.observe(shell.current);
    const heading = main.querySelector(".journey-map-heading");
    if (heading) observer.observe(heading);
    measure();
    return () => observer.disconnect();
  }, [width, zoom, mapHeight]);
  function move(x: number, y: number) {
    const bounds = journeyPanBounds(
      width,
      mapWidth,
      mapHeight,
      mapOrigin.current,
      pageSize.current,
    );
    offset.current = {
      x: Math.max(bounds.minX, Math.min(bounds.maxX, x)),
      y: Math.max(bounds.minY, Math.min(bounds.maxY, y)),
    };
    // Geometry only changes on resize/zoom. Dragging updates two compositor layers
    // together, at most once per display frame, without width/height/style churn.
    if (panFrame.current === null)
      panFrame.current = requestAnimationFrame(paintOffset);
  }
  useEffect(() => {
    move(0, 0);
  }, [width, zoom]);
  function pointerDown(e: PointerEvent<HTMLElement>) {
    suppressClick.current = false;
    if (!e.isPrimary || e.button !== 0 || obscured || drag.current) return;
    const target = e.target as HTMLElement;
    if (
      target.closest(
        ".journey-map-heading,.journey-map-bottom,.journey-map-tools",
      )
    )
      return;
    drag.current = {
      id: e.pointerId,
      x: e.clientX,
      y: e.clientY,
      ox: offset.current.x,
      oy: offset.current.y,
      moved: false,
    };
    suppressClick.current = false;
  }
  function pointerMove(e: PointerEvent<HTMLElement>) {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    const dx = e.clientX - d.x,
      dy = e.clientY - d.y;
    if (Math.hypot(dx, dy) > 6 && !d.moved) {
      d.moved = true;
      surface.current?.classList.add("is-panning");
      e.currentTarget.setPointerCapture(e.pointerId);
    }
    if (d.moved) move(d.ox + dx, d.oy + dy);
  }
  function pointerEnd(e: PointerEvent<HTMLElement>) {
    if (drag.current?.id !== e.pointerId) return;
    flushOffset();
    suppressClick.current = e.type !== "pointercancel" && drag.current.moved;
    surface.current?.classList.remove("is-panning");
    drag.current = null;
    if (e.currentTarget.hasPointerCapture(e.pointerId))
      e.currentTarget.releasePointerCapture(e.pointerId);
  }
  function select(n: number) {
    setPreview(Math.max(1, Math.min(22, n)));
    if (zoom > 1) {
      const pt = labels[Math.max(0, Math.min(21, n - 1))];
      move(mapWidth / 2 - pt.x, mapWidth * 0.45 - pt.y);
    }
  }
  return (
    <main
      ref={surface}
      className={`journey-atlas ${quiet ? "is-quiet" : ""}`}
      onPointerDown={pointerDown}
      onPointerMove={pointerMove}
      onPointerUp={pointerEnd}
      onPointerCancel={pointerEnd}
      onLostPointerCapture={(e) => {
        if (e.target === e.currentTarget) pointerEnd(e);
      }}
      onClickCapture={(e) => {
        if (suppressClick.current) {
          e.preventDefault();
          e.stopPropagation();
          suppressClick.current = false;
        }
      }}
    >
      <div className="journey-map-background" aria-hidden="true">
        <img
          ref={background}
          src={route.image}
          alt=""
          draggable={false}
          fetchPriority="high"
        />
        <div className="journey-map-background-shade" />
      </div>
      <div className="journey-map-heading">
        <div className="atlas-topline">
          <a href={homeMapHref("journey")}>
            <MapTrifold />
            首页地图
          </a>
          <div>
            <PageNarrateButton
              id="module-journey"
              text={moduleNarration.journey}
              enabled={!obscured}
              label="本页讲解"
            />
            <button
              aria-label={quiet ? "显示路线" : "静观山河"}
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
              {`${modules.find((m) => m.id === "journey")!.name} · 第${String(themeModules.findIndex((m) => m.id === "journey") + 1).padStart(2, "0")}章`}
            </span>
            <h1>{route.title}</h1>
            <p>{route.line}</p>
          </div>
        </header>
      </div>
      <div ref={shell} className="journey-map-shell">
        <div
          className="journey-map-viewport"
          ref={viewport}
          role="region"
          aria-label="红军长征地理路线图"
          tabIndex={0}
          style={{ width, touchAction: "pinch-zoom" }}
          onKeyDown={(e) => {
            if (e.target !== e.currentTarget) return;
            const moves: Record<string, number[]> = {
              ArrowLeft: [60, 0],
              ArrowRight: [-60, 0],
              ArrowUp: [0, 60],
              ArrowDown: [0, -60],
            };
            if (moves[e.key]) {
              e.preventDefault();
              move(
                offset.current.x + moves[e.key][0],
                offset.current.y + moves[e.key][1],
              );
            }
          }}
        >
          <div
            ref={plane}
            className="journey-map-plane"
            style={{
              width: mapWidth,
              height: mapWidth * 0.9,
              left: (width - mapWidth) / 2,
              top: (width - mapWidth) * 0.45,
            }}
          >
            <svg
              viewBox="0 0 1000 900"
              aria-hidden="true"
              className="journey-map-ink"
            >
              <g className="journey-province-lines">
                {geography.provinces.map((d, i) => (
                  <path key={i} d={d} />
                ))}
              </g>
              <g className="journey-rivers">
                {geography.rivers.map((d, i) => (
                  <path key={i} d={d} />
                ))}
              </g>
              <g className="journey-province-labels">
                {provinceLabels.map((p) => {
                  const [x, y] = projectJourney(p.point);
                  return (
                    <text key={p.name} x={x} y={y}>
                      {p.name}
                    </text>
                  );
                })}
              </g>
              <g className="journey-route-layer" opacity={quiet ? 0 : 1}>
                {contextRoutes.map(
                  (r, i) =>
                    visibleArmies[i + 1] && (
                      <path
                        key={r.name}
                        d={geographicPath(r.points)}
                        className="journey-context-route"
                        style={{ stroke: r.color }}
                      />
                    ),
                )}
                {visibleArmies[0] && (
                  <>
                    <path
                      d={geographicPath(centralRoute)}
                      className="journey-main-route-shadow"
                    />
                    <path
                      d={geographicPath(centralRoute)}
                      className="journey-main-route"
                    />
                  </>
                )}
              </g>
            </svg>
            {!showNodes && !quiet && (
              <svg
                className="journey-city-labels"
                viewBox={`0 0 ${mapWidth} ${mapWidth * 0.9}`}
                role="img"
                aria-label="当前部队路线的主要城市与沿途地点"
              >
                <title>
                  {cities.map((city) => city.name).join("、") ||
                    "暂无显示的部队路线"}
                </title>
                {cities.map((city) => (
                  <g key={city.name} className="journey-city-label">
                    <title>{city.name}</title>
                    {city.showLabel && (
                      <path
                        d={`M${city.anchorX},${city.anchorY} L${city.x},${city.y}`}
                      />
                    )}
                    <circle cx={city.anchorX} cy={city.anchorY} r="2.5" />
                    {city.showLabel && (
                      <text
                        x={city.x}
                        y={city.y}
                        dominantBaseline="central"
                        textAnchor="middle"
                      >
                        {city.name}
                      </text>
                    )}
                  </g>
                ))}
              </svg>
            )}
            {showNodes && (
              <>
                <svg
                  viewBox={`0 0 ${mapWidth} ${mapWidth * 0.9}`}
                  aria-hidden="true"
                  className={`journey-map-leaders ${quiet ? "is-hidden" : ""}`}
                >
                  {labels.map((p, i) => (
                    <g
                      key={i}
                      className={preview === i + 1 ? "is-selected" : ""}
                    >
                      <path d={`M${p.anchorX},${p.anchorY} L${p.x},${p.y}`} />
                      <circle
                        cx={p.anchorX}
                        cy={p.anchorY}
                        r={preview === i + 1 ? 4 : 2.5}
                      />
                    </g>
                  ))}
                </svg>
                <div
                  className="journey-map-pins"
                  inert={quiet}
                  aria-hidden={quiet || undefined}
                >
                  {labels.map((p, i) => (
                    <a
                      href={route.stops[i].href}
                      draggable={false}
                      data-stop={i + 1}
                      key={i}
                      className={`journey-map-pin ${compact ? "is-compact" : ""} ${preview === i + 1 ? "is-selected" : ""} ${progress.visited.includes(i + 1) ? "is-visited" : ""}`}
                      style={{ left: p.x, top: p.y } as CSSProperties}
                      aria-label={`第${i + 1}站 ${route.stops[i].title}${progress.visited.includes(i + 1) ? "，已阅读" : ""}`}
                      aria-current={preview === i + 1 ? "location" : undefined}
                      onPointerEnter={(e) => {
                        if (e.pointerType !== "touch" && !drag.current)
                          setPreview(i + 1);
                      }}
                      onFocus={() => setPreview(i + 1)}
                      onKeyDown={(e) => {
                        if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
                          e.preventDefault();
                          const next = Math.max(
                            1,
                            Math.min(
                              22,
                              i + 1 + (e.key === "ArrowRight" ? 1 : -1),
                            ),
                          );
                          select(next);
                          plane.current
                            ?.querySelector<HTMLAnchorElement>(
                              `[data-stop="${next}"]`,
                            )
                            ?.focus({ preventScroll: true });
                        }
                      }}
                    >
                      <span>{String(i + 1).padStart(2, "0")}</span>
                      <b>{journeyLocations[i].place}</b>
                    </a>
                  ))}
                </div>
              </>
            )}
          </div>
          <div className="journey-map-compass" aria-hidden="true">
            <span>北</span>
            <i>↑</i>
          </div>
        </div>
        <div className="journey-map-tools" aria-label="地图缩放">
          <button
            aria-label="缩小地图"
            disabled={zoom <= 1}
            onClick={() => setZoom((z) => Math.max(1, z - 0.5))}
          >
            <Minus />
          </button>
          <button
            aria-label="放大地图"
            disabled={zoom >= 6}
            onClick={() => setZoom((z) => Math.min(6, z + 0.5))}
          >
            <Plus />
          </button>
        </div>
      </div>
      <div
        className="journey-map-bottom"
        inert={quiet}
        aria-hidden={quiet || undefined}
      >
        <div
          className="journey-map-legend"
          role="group"
          aria-label="按部队显示路线"
        >
          {[{ name: "中央红军", color: "#ee9065" }, ...contextRoutes].map(
            (army, i) => (
              <button
                key={army.name}
                className={`journey-map-route-filter ${i === 0 ? "is-main" : ""}`}
                style={{ "--key-color": army.color } as CSSProperties}
                aria-label={`${army.name}路线`}
                aria-pressed={visibleArmies[i]}
                onClick={() =>
                  setVisibleArmies((current) =>
                    current.map((visible, j) => (i === j ? !visible : visible)),
                  )
                }
              >
                <i aria-hidden="true" />
                <span>{army.name}</span>
              </button>
            ),
          )}
          <button
            className="journey-map-route-filter journey-node-filter"
            aria-label="关键节点"
            aria-pressed={showNodes}
            onClick={() => setShowNodes((value) => !value)}
          >
            {showNodes ? (
              <Eye aria-hidden="true" />
            ) : (
              <EyeSlash aria-hidden="true" />
            )}
            <span>关键节点</span>
          </button>
        </div>
        <section className="journey-map-preview" aria-label="当前站点预览">
          <img src={current.image} alt="" width="144" height="86" />
          <div className="journey-map-preview-copy" aria-live="polite">
            <small>{current.subtitle}</small>
            <h2>
              <a
                className="journey-preview-link"
                href={current.href}
                aria-label={`进入第${preview}站：${current.title}`}
              >
                {current.title}
              </a>
            </h2>
            <p>{current.description}</p>
            {journeyLocations[preview - 1].note && (
              <small className="journey-location-note">
                {journeyLocations[preview - 1].note}
              </small>
            )}
          </div>
          <div className="journey-map-stepper">
            <button
              disabled={preview === 1}
              aria-label="预览上一站"
              onClick={() => select(preview - 1)}
            >
              <ArrowLeft />
            </button>
            <span>{String(preview).padStart(2, "0")} / 22</span>
            <button
              disabled={preview === 22}
              aria-label="预览下一站"
              onClick={() => select(preview + 1)}
            >
              <ArrowRight />
            </button>
          </div>
        </section>
        <details className="journey-map-sources">
          <summary>地图依据</summary>
          <p>
            22站以中央红军行程为主，最后一站为1936年三大主力会师。数字旁的细线指向对应地理位置；跨地域章节选取代表地点，路线连接主要经过地。参考线展示其他部队的大致行军走向，省界采用现代地理数据辅助定位。
          </p>
          <p>
            史实依据：
            <a
              href="https://www.mod.gov.cn/gfbw/gfjy_index/js_214151/16418521.html"
              target="_blank"
              rel="noreferrer"
            >
              国防部《红军长征中的会师》
            </a>
            、
            <a
              href="https://dangshi.people.com.cn/n1/2016/0901/c85037-28683887.html"
              target="_blank"
              rel="noreferrer"
            >
              党史资料《各路红军长征经历怎样的历史过程》
            </a>
            。地理数据：
            <a
              href="https://www.naturalearthdata.com/"
              target="_blank"
              rel="noreferrer"
            >
              Natural Earth
            </a>
            。
          </p>
        </details>
      </div>
    </main>
  );
}
