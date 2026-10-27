import { useEffect, useMemo, useRef, useState, type PointerEvent } from "react";
import {
  Minus,
  Plus,
  ArrowCounterClockwise,
  ArrowRight,
} from "@phosphor-icons/react";
import {
  armyChapters,
  armyGeography,
  type ArmyChapter as Chapter,
} from "../armyChapters";
import {
  expandedJourneyFrame,
  geographicPath,
  layoutJourneyCities,
  projectJourney,
  provinceLabels,
} from "../journeyMap";
import geography from "../journeyGeography.json";
import { RichText } from "./ReadingContent";
import "../army-chapter.css";

function ArmyMap({ chapter }: { chapter: Chapter }) {
  const frame = useRef<HTMLDivElement>(null);
  const layer = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(600);
  const [zoom, setZoom] = useState(1);
  const position = useRef({ x: 0, y: 0 });
  const drag = useRef<{
    id: number;
    x: number;
    y: number;
    startX: number;
    startY: number;
  } | null>(null);
  useEffect(() => {
    const observer = new ResizeObserver(([entry]) =>
      setWidth(entry.contentRect.width),
    );
    if (frame.current) observer.observe(frame.current);
    return () => observer.disconnect();
  }, []);
  function move(x: number, y: number) {
    const maxX = (width * (zoom - 1)) / 2;
    const maxY = maxX * 0.9;
    position.current = {
      x: Math.max(-maxX, Math.min(maxX, x)),
      y: Math.max(-maxY, Math.min(maxY, y)),
    };
    if (layer.current)
      layer.current.style.transform = `translate(${position.current.x}px, ${position.current.y}px)`;
  }
  useEffect(() => {
    move(position.current.x, position.current.y);
  }, [width, zoom]);
  const mapWidth = width * zoom;
  const route = armyGeography(chapter.index);
  const terrain = expandedJourneyFrame(1000, 1000, { x: 0, y: 0 });
  const labels = useMemo(
    () =>
      layoutJourneyCities(
        mapWidth,
        [0, 1, 2, 3].map((i) => i === chapter.index),
        mapWidth * 0.9,
        false,
        width < 500 && zoom === 1,
      ),
    [mapWidth, width, zoom, chapter.index],
  );
  function stopDrag(e: PointerEvent<HTMLDivElement>) {
    if (drag.current?.id !== e.pointerId) return;
    drag.current = null;
    if (e.currentTarget.hasPointerCapture(e.pointerId))
      e.currentTarget.releasePointerCapture(e.pointerId);
  }
  return (
    <figure className="army-geographic" data-no-narration>
      <div
        ref={frame}
        className="army-geographic-viewport"
        role="region"
        aria-label={`${chapter.name}行进路线地图`}
        tabIndex={0}
        style={{ touchAction: zoom > 1 ? "none" : "pan-y" }}
        onPointerDown={(e) => {
          if (e.button !== 0 || zoom === 1) return;
          drag.current = {
            id: e.pointerId,
            x: e.clientX,
            y: e.clientY,
            startX: position.current.x,
            startY: position.current.y,
          };
          e.currentTarget.setPointerCapture(e.pointerId);
        }}
        onPointerMove={(e) => {
          const d = drag.current;
          if (d?.id === e.pointerId)
            move(d.startX + e.clientX - d.x, d.startY + e.clientY - d.y);
        }}
        onPointerUp={stopDrag}
        onPointerCancel={stopDrag}
        onLostPointerCapture={(e) => {
          if (e.target === e.currentTarget) stopDrag(e);
        }}
        onKeyDown={(e) => {
          const delta: Record<string, [number, number]> = {
            ArrowLeft: [40, 0],
            ArrowRight: [-40, 0],
            ArrowUp: [0, 40],
            ArrowDown: [0, -40],
          };
          if (delta[e.key] && zoom > 1) {
            e.preventDefault();
            move(
              position.current.x + delta[e.key][0],
              position.current.y + delta[e.key][1],
            );
          }
        }}
      >
        <div
          ref={layer}
          className="army-geographic-layer"
          style={{
            width: mapWidth,
            height: mapWidth * 0.9,
            left: (width - mapWidth) / 2,
            top: (width - mapWidth) * 0.45,
          }}
        >
          <svg viewBox="0 0 1000 900" aria-hidden="true">
            <image
              href="/assets/journey-geographic-corrected.webp"
              x={terrain.left}
              y={terrain.top}
              width={terrain.width}
              height={terrain.height}
              preserveAspectRatio="none"
            />
            <rect width="1000" height="900" fill="#172b27" opacity=".28" />
            <g fill="none" stroke="#d9cda6" strokeWidth="1" opacity=".22">
              {geography.provinces.map((d, i) => (
                <path key={i} d={d} />
              ))}
            </g>
            <g fill="none" stroke="#a7cec5" strokeWidth="1.3" opacity=".5">
              {geography.rivers.map((d, i) => (
                <path key={i} d={d} />
              ))}
            </g>
            <g className="army-province-labels">
              {provinceLabels.map((p) => {
                const [x, y] = projectJourney(p.point);
                return (
                  <text key={p.name} x={x} y={y}>
                    {p.name}
                  </text>
                );
              })}
            </g>
            <path
              d={geographicPath(route.points)}
              fill="none"
              stroke="#14251f"
              strokeWidth="8"
              strokeLinejoin="round"
            />
            <path
              d={geographicPath(route.points)}
              fill="none"
              stroke={route.color}
              strokeWidth="4"
              strokeLinejoin="round"
            />
            {route.cities.map((city) => {
              const [x, y] = projectJourney(city.point);
              return (
                <circle key={city.name} cx={x} cy={y} r="3" fill="#ffe4b0" />
              );
            })}
          </svg>
          <svg
            viewBox={`0 0 ${mapWidth} ${mapWidth * 0.9}`}
            className="army-city-labels"
            aria-hidden="true"
          >
            {labels
              .filter((p) => p.showLabel)
              .map((p) => (
                <g key={p.name}>
                  <path
                    d={`M${p.anchorX},${p.anchorY} L${p.x},${p.y}`}
                    stroke="#eddaad"
                    strokeWidth=".6"
                    opacity=".6"
                  />
                  <text x={p.x} y={p.y + 4}>
                    {p.name}
                  </text>
                </g>
              ))}
          </svg>
        </div>
      </div>
      <div className="army-map-controls" aria-label="路线地图缩放">
        <button
          aria-label="缩小路线地图"
          disabled={zoom === 1}
          onClick={() => setZoom((z) => Math.max(1, z - 0.5))}
        >
          <Minus />
        </button>
        <button
          aria-label="放大路线地图"
          disabled={zoom === 6}
          onClick={() => setZoom((z) => Math.min(6, z + 0.5))}
        >
          <Plus />
        </button>
        <button
          aria-label="复位路线地图"
          disabled={zoom === 1}
          onClick={() => {
            move(0, 0);
            setZoom(1);
          }}
        >
          <ArrowCounterClockwise />
        </button>
      </div>
      <figcaption>北向朝上 · 放大后可拖动查看沿途地点</figcaption>
    </figure>
  );
}

function Sources({ sources }: { sources: Chapter["sources"] }) {
  return (
    <section className="source-block" data-no-narration>
      <h3>史料参考</h3>
      {sources.map((s) => (
        <a key={s.url} href={s.url} target="_blank" rel="noreferrer">
          {s.title}
        </a>
      ))}
    </section>
  );
}

function Comparison() {
  const table = `| 队伍 | 长征时间与行程 | 路线特点 | 主要贡献 |\n| --- | --- | --- | --- |\n${armyChapters
    .map(
      (c) =>
        `| ${c.name} | ${c.period}；${c.distance} | ${c.from} → ${c.to}。${
          [
            "经湘黔滇川甘陕，包含赤水河一带的多次回旋。",
            "经湘黔滇转至川西，再经草地进入甘肃；1936年7月组成方面军。",
            "在川西反复转战，经历北上、南下和再次北上。",
            "经豫西入陕南，创建根据地后转入甘肃，再向陕北前进。",
          ][c.index]
        } | ${c.contribution} |`,
    )
    .join("\n")}`;
  return (
    <article className="army-chapter reader">
      <header className="army-chapter-heading" data-no-narration>
        <p className="chapter-label">四路对照</p>
        <h2>不同的来路，共同的会合</h2>
      </header>
      <p className="army-chapter-lead">
        四支队伍并不是同一天出发，也没有沿同一条路线行军。各自根据地的处境、敌军部署和地理条件，决定了不同的转移过程。把它们放在一起看，才能理解长征如何由几路相互策应的行动，走向西北的会合。
      </p>
      <section>
        <h3>一、时间：两年历程，先后抵达</h3>
        <p>
          中央红军1934年10月出发，红二十五军在同年11月出发；红四方面军1935年3月开始西渡嘉陵江，红二、红六军团则在1935年11月离开桑植。四路的出发时间相差一年多，不能用同一个起点来计算各自的长征。
        </p>
        <div
          className="army-time-comparison"
          data-no-narration
          aria-label="四路红军长征时间对照，1934年10月至1936年10月"
        >
          {armyChapters.map((c, i) => (
            <div key={c.id}>
              <strong>{c.name}</strong>
              <span>{c.period}</span>
              <div className="army-time-axis">
                <i
                  style={{
                    marginLeft: `${([0, 13, 5, 1][i] / 25) * 100}%`,
                    width: `${([13, 12, 20, 11][i] / 25) * 100}%`,
                    background: armyGeography(i).color,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
        <p>
          1935年9月，红二十五军先到陕北；10月，中央红军到达吴起镇。1936年10月，红四方面军在会宁、红二方面军在将台堡同红一方面军会师。三大主力大会师标志着长征胜利结束，并不是四支队伍在同一天到达同一座城。
        </p>
      </section>
      <section>
        <h3>二、路线：回旋、折返与根据地建设</h3>
        <RichText text={table} />
        <p>
          中央红军的路线由东南向西、再转向西北，途中多次改变作战方向；红二、红六军团的行程突出湘黔滇山区的回旋和金沙江以后的北上；红四方面军在川西往返较多，地图上的重叠线段对应着真实的曲折；红二十五军则在陕南停留较长时间，开展根据地建设后才继续北上。
        </p>
        <p>
          这些路线都是部队在战斗、筹粮、休整和政治工作中走出来的。行军里程不能用地图上起点到终点的直线距离代替，也不能把不同部队的全部行动压缩为同一条线。
        </p>
      </section>
      <section>
        <h3>三、贡献：各有侧重，相互支援</h3>
        <p>
          中央红军保存了党中央和重要的军事骨干，推动革命重心转向西北。红二方面军在转战中牵制敌军、保存力量，并为维护团结和实现会师作出贡献。红四方面军策应中央红军，支援主力会合，广大指战员克服曲折后坚持北上。红二十五军建立鄂豫陕根据地，先期到达陕北并壮大当地红军，为党中央和中央红军到来创造条件。
        </p>
        <p>
          各支队伍的作用并不能按人数或里程简单排序。陕甘根据地原有红军、留在南方的红军游击队，以及沿途群众的支援，同样是长征历史的重要部分。四路会合的意义，在于分散的力量逐步汇聚，为此后的抗日斗争创造了新的条件。
        </p>
      </section>
      <nav
        className="army-related"
        aria-label="分别阅读四支队伍"
        data-no-narration
      >
        {armyChapters.map((c) => (
          <a key={c.id} href={`#/armies?army=${c.id}`}>
            {c.name}
            <ArrowRight />
          </a>
        ))}
      </nav>
      <p className="fineprint">
        时间按各路主力长征阶段概述；里程为通行史料的累计行程，不同部队与统计口径可能存在差别。地名随史事使用当时称谓，必要处注明今名。
      </p>
      <Sources
        sources={[
          armyChapters[0].sources[0],
          armyChapters[0].sources[1],
          armyChapters[1].sources[4],
          armyChapters[3].sources[1],
        ]}
      />
    </article>
  );
}

export function Armies({ params }: { params: URLSearchParams }) {
  if (params.get("focus") === "comparison") return <Comparison />;
  const chapter =
    armyChapters.find((c) => c.id === params.get("army")) || armyChapters[0];
  return (
    <article className="army-chapter reader">
      <header className="army-chapter-heading" data-no-narration>
        <p className="chapter-label">{chapter.period}</p>
        <h2>{chapter.name}</h2>
        <p>{chapter.theme}</p>
      </header>
      <p className="army-chapter-lead">{chapter.lead}</p>
      <dl className="army-chapter-facts" data-no-narration>
        <div>
          <dt>出发</dt>
          <dd>{chapter.from}</dd>
        </div>
        <div>
          <dt>抵达</dt>
          <dd>{chapter.to}</dd>
        </div>
        <div>
          <dt>主要领导人</dt>
          <dd>{chapter.leaders}</dd>
        </div>
        <div>
          <dt>累计行程</dt>
          <dd>{chapter.distance}</dd>
        </div>
      </dl>
      <section>
        <h3>行进路线</h3>
        <ArmyMap key={chapter.id} chapter={chapter} />
        <p className="fineprint">
          路线与地点沿用“万里征途”的地理资料，表示主要行军方向和途经地区；回旋、分路不代表逐日完整轨迹，现代省界仅辅助定位。
        </p>
        <details className="army-place-index" data-no-narration>
          <summary>
            沿途地点 · {armyGeography(chapter.index).cities.length}处
          </summary>
          <p>
            {armyGeography(chapter.index)
              .cities.map((c) => c.name)
              .join("、")}
          </p>
        </details>
      </section>
      <section className="army-march">
        <h3>沿途经过</h3>
        {chapter.stages.map((stage, i) => (
          <section className="army-march-stage" key={stage.title}>
            <span className="army-stage-number" aria-hidden="true">
              {String(i + 1).padStart(2, "0")}
            </span>
            <p className="army-stage-date">{stage.time}</p>
            <h4>{stage.title}</h4>
            <p className="army-stage-places">{stage.places}</p>
            <p>{stage.text}</p>
          </section>
        ))}
      </section>
      <section className="army-conclusion">
        <h3>回望这段征程</h3>
        <p>{chapter.conclusion}</p>
      </section>
      <a
        className="army-compare-link"
        href="#/armies?view=reading&stop=5&focus=comparison"
        data-no-narration
      >
        四路对照 · 看时间、路线与贡献的区别
        <ArrowRight />
      </a>
      <Sources sources={chapter.sources} />
    </article>
  );
}
