import { useRef, useState, useEffect } from "react";
import { Player } from "@remotion/player";
import type { PlayerRef } from "@remotion/player";
import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
  useVideoConfig,
} from "remotion";
const beats = [
  {
    title: "一渡 · 转向川南",
    date: "1935年1月29日",
    caption: "土城战斗后改变行动方向，渡过赤水进入川南。",
    path: "M 650 360 Q 590 240 490 225 T 310 160",
    x: 310,
    y: 160,
  },
  {
    title: "二渡 · 重返黔北",
    date: "1935年2月18日至21日",
    caption: "回师黔北，夺取娄山关、遵义战斗的胜利。",
    path: "M 310 160 Q 460 120 540 230 T 720 350",
    x: 720,
    y: 350,
  },
  {
    title: "三渡 · 再向西进",
    date: "1935年3月16日至17日",
    caption: "向西渡河，调动对方兵力，再次寻找主动。",
    path: "M 720 350 Q 590 330 500 270 T 330 230",
    x: 330,
    y: 230,
  },
  {
    title: "四渡 · 向东折返",
    date: "1935年3月21日至22日",
    caption: "迅速东渡，随后南渡乌江，跳出重兵围堵。",
    path: "M 330 230 Q 460 180 560 290 T 640 455",
    x: 640,
    y: 455,
  },
];
function ChishuiFilm() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const index = Math.min(3, Math.floor(frame / (fps * 6)));
  const local = frame - index * fps * 6;
  const b = beats[index];
  return (
    <AbsoluteFill
      style={{
        background: "#ede1c5",
        fontFamily: "var(--font-body)",
        color: "#362e26",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: "url(/assets/hero.webp)",
          backgroundSize: "cover",
          opacity: 0.12,
        }}
      />
      <svg viewBox="0 0 1000 610" style={{ width: "100%", height: "100%" }}>
        <defs>
          <pattern
            id="film-grid"
            width="45"
            height="45"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 45 0 L 0 0 0 45"
              fill="none"
              stroke="#584d34"
              strokeOpacity=".08"
            />
          </pattern>
        </defs>
        <rect width="1000" height="610" fill="url(#film-grid)" />
        <path
          d="M 490 -20 Q 350 110 500 220 T 470 450 T 460 650"
          stroke="#708b89"
          strokeWidth="28"
          fill="none"
          opacity=".4"
        />
        <path
          d="M 490 -20 Q 350 110 500 220 T 470 450 T 460 650"
          stroke="#eee8d8"
          strokeWidth="2"
          fill="none"
        />
        {beats.slice(0, index).map((x, i) => (
          <path
            key={x.title}
            d={x.path}
            fill="none"
            stroke="#9b362b"
            opacity=".25"
            strokeWidth="3"
            strokeDasharray="5 7"
          />
        ))}
        <path
          d={b.path}
          fill="none"
          stroke="#9b362b"
          strokeWidth="5"
          pathLength="1"
          strokeDasharray="1"
          strokeDashoffset={interpolate(local, [0, 3 * fps], [1, 0], {
            extrapolateRight: "clamp",
          })}
        />
        <circle
          cx={b.x}
          cy={b.y}
          r={interpolate(local, [3 * fps, 4 * fps], [0, 12], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          })}
          fill="#9b362b"
        />
        <text x="275" y="120" fontSize="20" fill="#776651">
          川南
        </text>
        <text x="730" y="330" fontSize="20" fill="#776651">
          黔北 · 遵义
        </text>
        <text
          x="430"
          y="410"
          fontSize="19"
          fill="#52736b"
          transform="rotate(-80 430 410)"
        >
          赤水河
        </text>
        <text x="70" y="65" fontSize="15" letterSpacing="5" fill="#9b362b">
          战役复盘 / 路线示意
        </text>
      </svg>
      <div
        style={{
          position: "absolute",
          top: 95,
          left: 65,
          opacity: interpolate(local, [0, 20], [0.4, 1], {
            extrapolateRight: "clamp",
          }),
        }}
      >
        <div style={{ fontSize: 18, color: "#8c6e4e" }}>{b.date}</div>
        <h2 style={{ fontSize: 38, fontWeight: 500, margin: "15px 0" }}>
          {b.title}
        </h2>
      </div>
      <div
        style={{
          position: "absolute",
          bottom: 82,
          left: 65,
          right: 65,
          borderTop: "1px solid #b9a989",
          paddingTop: 20,
          fontSize: 23,
          lineHeight: 1.6,
        }}
      >
        {b.caption}
      </div>
    </AbsoluteFill>
  );
}
export default function StoryFilm() {
  const ref = useRef<PlayerRef>(null);
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const p = ref.current;
    const update = ({ detail }: { detail: { frame: number } }) =>
      setIndex(Math.min(3, Math.floor(detail.frame / 180)));
    p?.addEventListener("frameupdate", update);
    return () => p?.removeEventListener("frameupdate", update);
  }, []);
  return (
    <div className="film">
      <Player
        ref={ref}
        component={ChishuiFilm}
        durationInFrames={720}
        compositionWidth={1000}
        compositionHeight={610}
        fps={30}
        controls
        autoPlay={false}
        showVolumeControls={false}
        style={{ width: "100%" }}
        moveToBeginningWhenEnded={false}
      />
      <div className="film-chapters">
        {beats.map((b, i) => (
          <button
            key={b.title}
            className={index === i ? "selected" : ""}
            onClick={() => {
              ref.current?.pause();
              ref.current?.seekTo(i * 180 + 90);
              setIndex(i);
            }}
          >
            {b.title}
          </button>
        ))}
      </div>
      <p className="fineprint">
        24 秒无声叙事动画 · 点击播放或选择章节 · 路线为教学示意
      </p>
    </div>
  );
}
