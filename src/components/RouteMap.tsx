import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import {
  MagnifyingGlassPlus,
  MagnifyingGlassMinus,
  ArrowsOutSimple,
} from "@phosphor-icons/react";
import { armies, milestones, project, routePath } from "../data";
export function RouteMap({
  active = 1,
  onSelect,
  army = "first",
  setArmy,
  compact = false,
}: {
  active?: number;
  onSelect?: (id: number) => void;
  army?: string;
  setArmy?: (id: string) => void;
  compact?: boolean;
}) {
  const [zoom, setZoom] = useState(1);
  const reduced = useReducedMotion();
  const selected = armies.find((a) => a.id === army) || armies[0];
  const current = milestones[active - 1];
  const c = project(current.point);
  return (
    <div
      className={`route-map ${compact ? "compact-map" : ""} ${active === 16 ? "snow-map" : active === 18 ? "grass-map" : ""}`}
    >
      <div className="map-caption">
        <span>山河行迹图</span>
        <small>1934 — 1936 / 示意地图</small>
      </div>
      <svg
        viewBox="0 0 1000 620"
        role="group"
        aria-label={
          army === "first"
            ? `${selected.name}长征路线，当前${current.title}`
            : `${selected.name}长征路线示意`
        }
      >
        <defs>
          <pattern
            id="map-grid"
            width="50"
            height="50"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 50 0 L 0 0 0 50"
              fill="none"
              stroke="#998967"
              strokeOpacity=".13"
              strokeWidth=".7"
            />
          </pattern>
          <radialGradient id="map-paper">
            <stop
              offset="0%"
              stopColor={
                active === 16
                  ? "#edf0ec"
                  : active === 18
                    ? "#eef0da"
                    : "#f5edda"
              }
            />
            <stop
              offset="100%"
              stopColor={
                active === 16
                  ? "#cad7d6"
                  : active === 18
                    ? "#d1d4b6"
                    : "#e7dab8"
              }
            />
          </radialGradient>
        </defs>
        <rect width="1000" height="620" fill="url(#map-paper)" />
        <rect width="1000" height="620" fill="url(#map-grid)" />
        <g
          style={{
            transform: `translate(${500 - 500 * zoom}px,${310 - 310 * zoom}px) scale(${zoom})`,
            transformOrigin: "0 0",
          }}
        >
          {Array.from({ length: 16 }, (_, i) => (
            <path
              key={i}
              d={`M ${80 + i * 9} 650 Q ${180 + i * 9} 450 ${110 + i * 16} 300 T ${210 + i * 13} -30`}
              stroke="#b4a17b"
              strokeWidth=".8"
              opacity=".22"
              fill="none"
            />
          ))}
          <path
            d="M 190 360 Q 260 450 360 385 T 515 425 T 680 370 T 930 380"
            stroke="#93a4a0"
            strokeWidth="4"
            fill="none"
            opacity=".5"
          />
          <path
            d="M 260 10 Q 300 130 440 100 T 600 145 T 740 195"
            stroke="#93a4a0"
            strokeWidth="3"
            fill="none"
            opacity=".4"
          />
          <g className="map-regions">
            <text x="250" y="260">
              四 川
            </text>
            <text x="245" y="530">
              云 南
            </text>
            <text x="500" y="430">
              贵 州
            </text>
            <text x="735" y="415">
              湖 南
            </text>
            <text x="870" y="405">
              江 西
            </text>
            <text x="405" y="65">
              甘 肃
            </text>
            <text x="625" y="130">
              陕 西
            </text>
            <text x="540" y="560">
              广 西
            </text>
          </g>
          <text x="665" y="365" className="river-label">
            长 江
          </text>
          <text x="650" y="185" className="river-label">
            黄 河
          </text>
          {armies.map((a) => (
            <path
              key={a.id}
              d={routePath(a.points)}
              fill="none"
              stroke={a.color}
              strokeWidth={a.id === army ? 3.5 : 1.4}
              strokeDasharray={a.id === "first" ? "none" : "6 5"}
              opacity={a.id === army ? (army === "first" ? 0.35 : 1) : 0.15}
            />
          ))}
          {army === "first" && (
            <motion.path
              key={active}
              d={routePath(milestones.slice(0, active).map((m) => m.point))}
              fill="none"
              stroke="#9c3029"
              strokeWidth="5"
              initial={reduced ? false : { pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: reduced ? 0 : 1 }}
            />
          )}
          {army === "first"
            ? milestones.map((m) => {
                const [x, y] = project(m.point);
                return (
                  <g
                    key={m.id}
                    onClick={() => onSelect?.(m.id)}
                    role={onSelect ? "button" : undefined}
                    tabIndex={onSelect ? 0 : undefined}
                    onKeyDown={(e) => {
                      if ((e.key === "Enter" || e.key === " ") && onSelect) {
                        e.preventDefault();
                        onSelect(m.id);
                      }
                    }}
                    aria-label={`第${m.id}站 ${m.title}`}
                    className="map-node"
                  >
                    <circle cx={x} cy={y} r="15" fill="transparent" />
                    <circle
                      cx={x}
                      cy={y}
                      r={m.id === active ? 7 : 4}
                      fill={m.id === active ? "#982b24" : "#f7f1e1"}
                      stroke="#982b24"
                      strokeWidth="1.8"
                    />
                    {[1, 5, 10, 13, 15, 16, 18, 19, 21, 22].includes(m.id) && (
                      <text
                        x={x + 10}
                        y={y + (m.id % 2 === 0 ? -11 : 19)}
                        className={m.id === active ? "current-label" : ""}
                      >
                        {m.id === 21
                          ? "吴起镇"
                          : m.id === 22
                            ? "会宁 / 将台堡"
                            : m.title.replace("突破", "").split(" · ")[0]}
                      </text>
                    )}
                  </g>
                );
              })
            : selected.points.map((p, i) => {
                const [x, y] = project(p);
                return (
                  <circle
                    key={i}
                    cx={x}
                    cy={y}
                    r="5"
                    fill={selected.color}
                    stroke="#f7f1e1"
                    strokeWidth="2"
                  />
                );
              })}
          {army === "first" && (
            <g className="map-beacon">
              <circle
                cx={c[0]}
                cy={c[1]}
                r="16"
                fill="none"
                stroke="#9c3029"
                opacity=".4"
              />
              <circle
                cx={c[0]}
                cy={c[1]}
                r="24"
                fill="none"
                stroke="#9c3029"
                opacity=".15"
              />
            </g>
          )}
        </g>
        <g transform="translate(920 70)" className="map-compass">
          <text x="0" y="-18" textAnchor="middle">
            北
          </text>
          <path d="M 0 -8 L 7 15 L 0 10 L -7 15 Z" fill="#8e7c5a" />
          <path
            d="M -16 8 H 16 M 0 -7 V 28"
            stroke="#8e7c5a"
            strokeWidth=".7"
          />
        </g>
      </svg>
      {setArmy && (
        <div className="map-legend">
          {armies.map((a) => (
            <button
              key={a.id}
              onClick={() => setArmy(a.id)}
              aria-pressed={army === a.id}
              className={army === a.id ? "selected" : ""}
            >
              <span style={{ background: a.color }} />
              {a.name}
            </button>
          ))}
        </div>
      )}
      {!compact && (
        <div className="map-controls">
          <button
            className="icon-button"
            aria-label="放大地图"
            onClick={() => setZoom((z) => Math.min(1.7, z + 0.2))}
            disabled={zoom >= 1.7}
          >
            <MagnifyingGlassPlus size={20} />
          </button>
          <button
            className="icon-button"
            aria-label="缩小地图"
            onClick={() => setZoom((z) => Math.max(1, z - 0.2))}
            disabled={zoom <= 1}
          >
            <MagnifyingGlassMinus size={20} />
          </button>
          <button
            className="icon-button"
            aria-label="重置地图"
            onClick={() => setZoom(1)}
          >
            <ArrowsOutSimple size={20} />
          </button>
        </div>
      )}
      <div className="map-note">路线与地形为学习示意，不用于导航</div>
    </div>
  );
}
