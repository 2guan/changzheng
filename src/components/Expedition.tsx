import { useEffect, useRef, useState, type CSSProperties } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  ArrowRight,
  ArrowLeft,
  Check,
  X,
  SpeakerHigh,
  SpeakerSlash,
  Notebook,
  Backpack,
  MapTrifold,
  Hand,
  Footprints,
  DownloadSimple,
  ArrowCounterClockwise,
  ArrowsOutSimple,
  ArrowsInSimple,
} from "@phosphor-icons/react";
import {
  chapters,
  roles,
  gear,
  EXPEDITION_KEY,
  freshExpedition,
  sanitizeExpedition,
  isChapterReady,
  completeChapter,
  marshPath,
  type Expedition as ExpeditionState,
} from "../expedition";
import { Dialog } from "./UI";
import { go } from "../state";
import { Reader } from "./Reader";

const observations = [
  {
    id: "boats",
    name: "岸边的木船",
    x: 21,
    y: 64,
    text: "船停在岸边。渡河的准备，离不开当地群众筹集的船只、木料与人力。你在手记上写下：一支队伍的出发，也是一片土地的托举。",
  },
  {
    id: "lamp",
    name: "低低的灯火",
    x: 88,
    y: 74,
    text: "灯下是告别的人。夜渡不只是路线的起点，也是许多人离开故乡的时刻。你把这一点微光记在心里。",
  },
  {
    id: "bridge",
    name: "河上的浮桥",
    x: 62,
    y: 44,
    text: "小船和木板连起浮桥。1934年10月，中央红军主力从于都等地集结出发，踏上战略转移的征途。你走向桥头。",
  },
];
const crossings = [
  {
    name: "一渡 · 转向川南",
    target: 0,
    signal: "1935年1月：土城作战后，原定计划需要调整。向西渡过赤水，转向川南。",
    after:
      "一渡后向川南行动，随后根据敌情放弃原定渡江计划。方向改变，源于对现实的判断。",
  },
  {
    name: "二渡 · 重返黔北",
    target: 1,
    signal: "1935年2月：敌军兵力调动，黔北出现机会。向东回师，再渡赤水。",
    after: "二渡后重返黔北，取得娄山关、遵义等战斗胜利，打开新的局面。",
  },
  {
    name: "三渡 · 再向西进",
    target: 2,
    signal: "1935年3月：继续调动对手。再次向西，进入古蔺、叙永一带。",
    after: "三渡向西，造成再次北渡长江的态势，牵动敌军部署。",
  },
  {
    name: "四渡 · 向东折返",
    target: 3,
    signal: "1935年3月：敌军向西追堵。迅速折返向东，第四次渡过赤水。",
    after: "四渡后南渡乌江，继而采取佯攻贵阳、威逼昆明等行动，逐步跳出包围。",
  },
];
const points = [
  { x: 26, y: 32, label: "川南" },
  { x: 74, y: 62, label: "黔北" },
  { x: 24, y: 67, label: "古蔺一带" },
  { x: 77, y: 27, label: "向东折返" },
];
const facts = [
  "行囊里的每一件东西都有重量。长途行军中，补给、修补和互相帮助，往往比某一件物品更重要。这里的三件限制是体验设计，不是红军统一装备标准。",
  "1934年10月，中央红军主力开始长征。于都是重要的集结出发地；当地群众支持渡河的记忆，至今保存在纪念叙事与相关史料中。",
  "四渡赤水不是出发前就画好的完美路线，而是在敌情变化中连续作出判断。图中路径只说明折返关系，不是精确地理坐标。",
  "1935年6月，中央红军翻越夹金山。高海拔、严寒、缺乏装备和补给共同构成困难。相互照应，是许多回忆中反复出现的细节。",
  "1935年8月，中央红军穿越川西北草地。沼泽、风雨、缺粮使前行极为艰难。格点探路是教学模型，不能用作现实野外行走指南。",
  "1936年10月，红军三大主力在甘肃会宁、将台堡地区会师，标志着长征胜利结束。本体验把中央红军的行程延伸到这一历史节点。",
];
function journalLines(p: ExpeditionState) {
  return [
    `我以${roles.find((r) => r.id === p.role)?.name}的视角出发，带上${gear
      .filter((g) => p.gear.includes(g.id))
      .map((g) => g.name)
      .join("、")}。`,
    `于都河畔，我停下脚步，看看木船、浮桥与低低的灯火，再走向对岸。${p.gear.includes("book") ? "我把带来的火柴重新包好，让火种避开河上的湿气。" : ""}`,
    "在赤水河边，我四次改变方向，明白了判断比固守原路更重要。",
    p.kindness === "cloth"
      ? "雪山上，我把带来的棉衣分给同伴。行囊轻了一点，我们靠近了一点。"
      : `雪山上，我陪落队的同伴一起分担行囊。${p.gear.includes("rope") ? "我用带来的皮带重新捆紧行李。" : ""}我们以同样的步速越过山口。`,
    p.gear.includes("bowl")
      ? "走出草地，我拿出碗。文学作品里的鱼汤，让“分享”有了具体的形状。"
      : "走出草地，我记住了一枚鱼钩。一个人努力留下的，是别人继续走下去的希望。",
    `抵达后，我写下：${p.letter}`,
  ];
}
function useAmbience(enabled: boolean, chapter: number, onFailure: () => void) {
  useEffect(() => {
    if (!enabled) return;
    let ctx: AudioContext | undefined;
    let source: AudioBufferSourceNode | undefined;
    try {
      ctx = new AudioContext();
      const buffer = ctx.createBuffer(1, ctx.sampleRate * 4, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let previous = 0;
      for (let i = 0; i < data.length; i++) {
        previous = (previous + Math.random() * 0.04 - 0.02) / 1.025;
        data[i] = previous;
      }
      source = ctx.createBufferSource();
      source.buffer = buffer;
      source.loop = true;
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = chapter === 3 ? 1500 : chapter === 1 ? 700 : 400;
      const gain = ctx.createGain();
      gain.gain.value = 0.55;
      source.connect(filter).connect(gain).connect(ctx.destination);
      source.start();
      void ctx.resume().catch(onFailure);
    } catch {
      onFailure();
    }
    const visibility = () => {
      if (document.hidden) void ctx?.suspend();
      else void ctx?.resume().catch(onFailure);
    };
    document.addEventListener("visibilitychange", visibility);
    return () => {
      document.removeEventListener("visibilitychange", visibility);
      source?.stop();
      void ctx?.close();
    };
  }, [enabled, chapter]); // Audio is created only after an explicit user action.
}
export default function Expedition() {
  const [p, setP] = useState<ExpeditionState>(() => {
    try {
      return sanitizeExpedition(
        JSON.parse(localStorage.getItem(EXPEDITION_KEY) || "null"),
      );
    } catch {
      return freshExpedition();
    }
  });
  const [saved, setSaved] = useState(true);
  const [focused, setFocused] = useState(p.started);
  const [sound, setSound] = useState(false);
  const [soundError, setSoundError] = useState(false);
  const [panel, setPanel] = useState<
    "journal" | "pack" | "chapters" | "restart" | null
  >(null);
  const [reader, setReader] = useState(false);
  const [notice, setNotice] = useState("");
  const [probe, setProbe] = useState(true);
  const [reveal, setReveal] = useState(false);
  const [letter, setLetter] = useState(p.letter);
  const stageRef = useRef<HTMLElement>(null);
  const panoramaRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const c = chapters[p.chapter];
  const role = roles.find((r) => r.id === p.role)!;
  const ready = isChapterReady(p);
  const patch = (change: Partial<ExpeditionState>) =>
    setP((v) => ({ ...v, ...change }));
  useAmbience(sound, p.chapter, () => {
    setSound(false);
    setSoundError(true);
  });
  useEffect(() => {
    try {
      localStorage.setItem(EXPEDITION_KEY, JSON.stringify(p));
      setSaved(true);
    } catch {
      setSaved(false);
    }
  }, [p]);
  useEffect(() => {
    setNotice("");
    setReveal(false);
    setProbe(true);
    stageRef.current?.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [p.chapter, p.started]);
  useEffect(() => {
    const next = chapters[Math.min(5, p.chapter + 1)];
    const img = new Image();
    img.src = `/assets/${next.bg}.webp`;
  }, [p.chapter]);
  useEffect(() => {
    const exitFocus = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !panel && !reader && !reveal)
        setFocused(false);
    };
    window.addEventListener("keydown", exitFocus);
    return () => window.removeEventListener("keydown", exitFocus);
  }, [panel, reader, reveal]);
  useEffect(() => {
    if (p.chapter === 4 && p.steps > 0 && p.steps < 4)
      stageRef.current
        ?.querySelector<HTMLButtonElement>(".exp-marsh-row.current button")
        ?.focus({ preventScroll: true });
  }, [p.steps, p.chapter]);
  const next = () => {
    if (ready) {
      setP(completeChapter);
      setReveal(false);
    }
  };
  const toggleGear = (id: string) => {
    if (p.gear.includes(id)) patch({ gear: p.gear.filter((g) => g !== id) });
    else if (p.gear.length < 3) patch({ gear: [...p.gear, id] });
    else setNotice("行囊已经装了三件。取出一件，就可以重新选择。");
  };
  const exportJournal = () => {
    const text = `重走长征路 · 我的亲历手记\n虚构视角下的个人学习记录\n\n${journalLines(
      p,
    )
      .filter((_, i) => p.completed.includes(i))
      .join("\n\n")}`;
    const url = URL.createObjectURL(
      new Blob([text], { type: "text/plain;charset=utf-8" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "我的行军手记.txt";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  return (
    <main
      className={`expedition ${focused ? "is-focused" : ""} ${p.started ? "is-started" : "is-intro"} exp-scene-${p.chapter}`}
      ref={stageRef}
      tabIndex={-1}
      aria-label="亲历长征互动体验"
    >
      <AnimatePresence>
        <motion.div
          key={p.started ? c.bg : "intro"}
          className="exp-backdrop"
          initial={reduced ? false : { opacity: 0, scale: 1.035 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.55 }}
          style={{
            backgroundImage: `url(/assets/${p.started ? c.bg : "scene-night"}.webp)`,
          }}
        />
      </AnimatePresence>
      <div className="exp-shade" />
      {p.started && p.chapter === 3 && (
        <div
          className="exp-snow"
          aria-hidden="true"
          style={{ opacity: (100 - p.snow) / 110 }}
        >
          {Array.from({ length: 26 }, (_, i) => (
            <i
              key={i}
              style={{
                left: `${i * 3.9}%`,
                animationDelay: `${i * -0.31}s`,
                animationDuration: `${2 + (i % 4)}s`,
              }}
            />
          ))}
        </div>
      )}
      <div className="exp-toolbar">
        <a href="#/journey?mode=archive">
          <ArrowLeft /> 资料地图
        </a>
        <span className="exp-edition">
          万里征途 <b>亲历模式</b>
        </span>
        <div>
          <button onClick={() => setPanel("chapters")} aria-label="行程章节">
            <MapTrifold />
            <span>行程</span>
          </button>
          <button onClick={() => setPanel("pack")} aria-label="打开随身行囊">
            <Backpack />
            <span>行囊</span>
          </button>
          <button onClick={() => setPanel("journal")} aria-label="打开行军手记">
            <Notebook />
            <span>手记</span>
          </button>
          <button
            aria-label={focused ? "退出专注模式" : "进入专注模式"}
            aria-pressed={focused}
            onClick={() => setFocused(!focused)}
          >
            {focused ? <ArrowsInSimple /> : <ArrowsOutSimple />}
          </button>
          <button
            aria-label={sound ? "关闭环境声" : "开启环境声"}
            aria-pressed={sound}
            onClick={() => {
              setSoundError(false);
              setSound(!sound);
            }}
          >
            {sound ? <SpeakerHigh /> : <SpeakerSlash />}
          </button>
        </div>
      </div>
      {soundError && (
        <p className="exp-alert" role="status">
          浏览器暂时无法播放环境声，你仍可继续体验。
        </p>
      )}
      {!saved && (
        <p className="exp-alert" role="status">
          当前浏览器无法保存进度，请保持页面开启；完成后可导出手记。
        </p>
      )}
      {!p.started ? (
        <section className="exp-intro">
          <span className="exp-eyebrow">1934—1936 / 一段由你走近的历史</span>
          <h1>
            这一次，
            <br />
            走进那段路。
          </h1>
          <p className="exp-intro-copy">
            把一件物品放进行囊，等一等落在后面的同伴。
            <br className="desktop-break" />
            在山河之间，理解那些脚步为何向前。
          </p>
          <fieldset className="exp-roles">
            <legend>选择一个观察视角</legend>
            {roles.map((r, i) => (
              <button
                key={r.id}
                aria-pressed={p.role === r.id}
                className={p.role === r.id ? "selected" : ""}
                onClick={() => patch({ role: r.id })}
              >
                <span>0{i + 1}</span>
                <strong>{r.name}</strong>
                <small>{r.line}</small>
                {p.role === r.id && <Check />}
              </button>
            ))}
          </fieldset>
          <div className="exp-start">
            <button
              className="exp-primary"
              onClick={() => {
                patch({ started: true });
                setFocused(true);
              }}
            >
              带着{role.object}出发 <ArrowRight />
            </button>
            <span>六幕体验 · 随时离开，自动续行</span>
          </div>
          <p className="exp-disclaimer">
            虚构身份与教学情境 · 史实在每幕之后展开
          </p>
        </section>
      ) : (
        <>
          <header className="exp-heading">
            <span className="exp-eyebrow">
              第 {String(p.chapter + 1).padStart(2, "0")} 幕 / {c.date} /{" "}
              {c.place}
            </span>
            <h1>{c.title}</h1>
            <p>{c.quote}</p>
          </header>
          <div className="exp-stage">
            {p.chapter === 0 && (
              <section className="exp-pack-scene" aria-label="选择行囊物品">
                <div className="exp-instruction">
                  <Backpack />
                  <span>
                    选三件带走 <b>{p.gear.length} / 3</b>
                  </span>
                </div>
                <div className="exp-gear-table">
                  {gear.map((g, i) => (
                    <button
                      className={`exp-gear ${p.gear.includes(g.id) ? "selected" : ""}`}
                      key={g.id}
                      aria-pressed={p.gear.includes(g.id)}
                      disabled={p.completed.includes(0)}
                      onClick={() => toggleGear(g.id)}
                      style={
                        { "--tilt": `${((i % 3) - 1) * 2}deg` } as CSSProperties
                      }
                    >
                      <img src={`/assets/${g.image}.webp`} alt={g.name} />
                      <span className="exp-gear-label">
                        <strong>{g.name}</strong>
                        <span>{p.gear.includes(g.id) ? <Check /> : "＋"}</span>
                      </span>
                      <small>{g.detail}</small>
                    </button>
                  ))}
                </div>
                <p className="exp-quiet">
                  {p.completed.includes(0)
                    ? "这是出发时的行囊。若想换一种选择，可以在行程中重新出发。"
                    : "没有唯一正确的行囊。你带上的东西，会在后面的路上遇到它的用途。"}
                </p>
              </section>
            )}
            {p.chapter === 1 && (
              <section className="exp-night-scene" aria-label="于都河岸观察">
                <div className="exp-panorama-tools">
                  <button
                    aria-label="向左看河岸"
                    onClick={() =>
                      panoramaRef.current?.scrollBy({
                        left: -260,
                        behavior: reduced ? "instant" : "smooth",
                      })
                    }
                  >
                    <ArrowLeft />
                  </button>
                  <span>左右滑动画面，观察河岸</span>
                  <button
                    aria-label="向右看河岸"
                    onClick={() =>
                      panoramaRef.current?.scrollBy({
                        left: 260,
                        behavior: reduced ? "instant" : "smooth",
                      })
                    }
                  >
                    <ArrowRight />
                  </button>
                </div>
                <div className="exp-panorama" ref={panoramaRef}>
                  <div className="exp-hotspot-field">
                    {observations.map((o) => (
                      <button
                        key={o.id}
                        className={`exp-hotspot ${p.observed.includes(o.id) ? "observed" : ""}`}
                        style={{ left: `${o.x}%`, top: `${o.y}%` }}
                        onClick={() => {
                          patch({
                            observed: [...new Set([...p.observed, o.id])],
                          });
                          setNotice(
                            o.text +
                              (o.id === "lamp" && p.gear.includes("book")
                                ? " 你摸了摸包好的火柴，确认它们没有受潮。微小的火种，也需要被认真照顾。"
                                : ""),
                          );
                        }}
                      >
                        <span>
                          {p.observed.includes(o.id) ? <Check /> : "＋"}
                        </span>
                        <b>{o.name}</b>
                      </button>
                    ))}
                    <div
                      className="exp-walker"
                      style={{
                        left: `${78 - p.crossing * 0.19}%`,
                        top: `${74 - p.crossing * 0.35}%`,
                      }}
                      aria-hidden="true"
                    >
                      <Footprints />
                    </div>
                  </div>
                </div>
                <div className="exp-crossing-control">
                  <label htmlFor="cross-river">
                    {p.observed.length < 3
                      ? `先观察河岸 · 已发现 ${p.observed.length} / 3`
                      : p.crossing === 100
                        ? "你已抵达对岸"
                        : "拖动标记，向对岸前进"}
                    <span>{p.crossing}%</span>
                  </label>
                  <input
                    id="cross-river"
                    aria-label="渡河进度"
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    disabled={p.observed.length < 3}
                    value={p.crossing}
                    onChange={(e) =>
                      patch({ crossing: Number(e.target.value) })
                    }
                  />
                  <small>支持触摸拖动，或聚焦滑块后使用方向键。</small>
                </div>
              </section>
            )}
            {p.chapter === 2 && (
              <section className="exp-river-scene">
                <div className="exp-dispatch">
                  <span>行军消息 / {Math.min(4, p.crossings + 1)}</span>
                  <p>
                    {p.crossings < 4
                      ? crossings[p.crossings].signal
                      : "四次折返已经连成一条路。现在回看，这些转向不是原地徘徊，而是在变化中争取主动。"}
                  </p>
                </div>
                <div className="exp-tactical-map" aria-label="四渡赤水行动图">
                  <svg
                    viewBox="0 0 100 100"
                    preserveAspectRatio="none"
                    aria-hidden="true"
                  >
                    <path
                      className="exp-river"
                      d="M50 0 Q28 20 52 38 T48 70 T52 100"
                    />
                    {points.slice(0, p.crossings).map((pt, i) => {
                      const from = i ? points[i - 1] : { x: 72, y: 87 };
                      return (
                        <path
                          key={i}
                          className="exp-route-line"
                          d={`M${from.x} ${from.y} Q50 ${(from.y + pt.y) / 2 - 10} ${pt.x} ${pt.y}`}
                        />
                      );
                    })}
                  </svg>
                  <span className="exp-river-label">赤 水 河</span>
                  {points.map((pt, i) => (
                    <button
                      key={pt.label}
                      className={`exp-map-point ${i < p.crossings ? "passed" : ""}`}
                      style={{ left: `${pt.x}%`, top: `${pt.y}%` }}
                      onClick={() => {
                        if (i === p.crossings) {
                          patch({ crossings: p.crossings + 1 });
                          setNotice(crossings[i].after);
                        } else
                          setNotice(
                            i < p.crossings
                              ? crossings[i].after
                              : "先读左侧的新消息：每一次转向，都有当时的原因。",
                          );
                      }}
                    >
                      <span>{i < p.crossings ? <Check /> : i + 1}</span>
                      <b>{pt.label}</b>
                    </button>
                  ))}
                  <small>战役方向示意 · 非精确地图</small>
                </div>
              </section>
            )}
            {p.chapter === 3 && (
              <section className="exp-snow-scene">
                <div className="exp-weather-control">
                  <label htmlFor="clear-snow">
                    拨开眼前的风雪{" "}
                    <span>
                      {p.snow >= 65 ? "看见同伴了" : "寻找身后的脚步"}
                    </span>
                  </label>
                  <input
                    id="clear-snow"
                    type="range"
                    min="0"
                    max="100"
                    value={p.snow}
                    onChange={(e) => patch({ snow: Number(e.target.value) })}
                  />
                  <p>
                    {p.gear.includes("shoes")
                      ? "你低头拢紧草鞋上的系带，慢慢抬头寻找身后的同伴。"
                      : "慢慢移动滑块，让远处的身影显现。"}
                  </p>
                </div>
                <div
                  className="exp-companion"
                  style={{ opacity: p.snow >= 65 ? 1 : 0.15 }}
                >
                  {p.snow >= 65 && (
                    <button
                      className="exp-hotspot"
                      onClick={() => {
                        patch({ companion: true });
                        setNotice(
                          "你停了下来。他抬起头：“我还能走，就是肩上的行李有些沉。”你决定和他一起过山口。",
                        );
                      }}
                    >
                      <span>{p.companion ? <Check /> : "＋"}</span>
                      <b>走近落队的同伴</b>
                    </button>
                  )}
                </div>
                {p.companion && (
                  <div className="exp-care">
                    <span>你蹲下来，打开行囊。</span>
                    {!p.kindness ? (
                      <>
                        <button
                          disabled={!p.gear.includes("cloth")}
                          onClick={() => {
                            patch({ kindness: "cloth" });
                            setNotice(
                              "你拿出带来的棉衣，帮同伴裹住肩头。画面里的风渐渐小了。你们一起向山口走去。",
                            );
                          }}
                        >
                          分出带来的棉衣{" "}
                          {!p.gear.includes("cloth") && "（行囊中未携带）"}
                        </button>
                        <button
                          onClick={() => {
                            patch({ kindness: "share" });
                            setNotice(
                              "你把一部分行李移到自己肩上，放慢脚步。" +
                                (p.gear.includes("rope")
                                  ? "带来的皮带帮你捆紧了行李。"
                                  : "") +
                                "翻过这座山，不只需要一个人走得快。",
                            );
                          }}
                        >
                          帮他分担行囊，一起走
                        </button>
                      </>
                    ) : (
                      <p>
                        <Check />{" "}
                        {p.kindness === "cloth"
                          ? "一件棉衣，两个人的温度。"
                          : "让脚步慢一点，让同伴近一点。"}
                      </p>
                    )}
                  </div>
                )}
              </section>
            )}
            {p.chapter === 4 && (
              <section className="exp-marsh-scene">
                <div className="exp-marsh-side">
                  <span className="exp-eyebrow">一步一步 / {p.steps} · 4</span>
                  <h2>
                    {p.steps === 4
                      ? "脚下，终于坚实了。"
                      : "先探一探，再迈步。"}
                  </h2>
                  <p>
                    {p.steps === 4
                      ? "有人在一只碗里，留下了继续向前的力量。"
                      : "每一排只有一处可靠的草墩。探过的地方会留下标记；这一次，不急着赶路。"}
                  </p>
                  <div className="exp-tool-switch">
                    <button aria-pressed={probe} onClick={() => setProbe(true)}>
                      <Hand />
                      木杖探查
                    </button>
                    <button
                      aria-pressed={!probe}
                      onClick={() => setProbe(false)}
                    >
                      <Footprints />
                      迈出一步
                    </button>
                  </div>
                  {p.steps === 4 && (
                    <button
                      className="exp-relic-reveal"
                      onClick={() => setReveal(!reveal)}
                    >
                      <img
                        src="/assets/object-01.webp"
                        alt="艺术演绎的金色鱼钩"
                      />
                      <span>
                        拾起故事里的鱼钩 <ArrowRight />
                      </span>
                    </button>
                  )}
                </div>
                <div
                  className="exp-marsh-grid"
                  aria-label="草地落脚点，按第一至第四排前进"
                >
                  {[3, 2, 1, 0].map((row) => (
                    <div
                      className={`exp-marsh-row ${row === p.steps ? "current" : ""}`}
                      key={row}
                    >
                      <small>{row + 1}</small>
                      {[0, 1, 2].map((col) => {
                        const id = `${row}-${col}`;
                        const checked = p.probes.includes(id);
                        const safe = marshPath[row] === col;
                        const passed = row < p.steps && safe;
                        return (
                          <button
                            key={id}
                            disabled={row !== p.steps}
                            className={`${checked ? (safe ? "safe" : "bog") : ""} ${passed ? "passed" : ""}`}
                            aria-label={`第${row + 1}排第${col + 1}处${checked ? (safe ? "，可靠草墩" : "，松软泥水") : ""}`}
                            onClick={() => {
                              if (probe) {
                                patch({
                                  probes: [...new Set([...p.probes, id])],
                                });
                                setNotice(
                                  safe
                                    ? "杖尖下是坚实的草根。切换到“迈出一步”，从这里通过。"
                                    : "木杖陷了下去。这一处不可靠，换个落脚点再探一探。",
                                );
                              } else if (checked && safe) {
                                patch({ steps: p.steps + 1 });
                                setProbe(true);
                                setNotice(
                                  p.steps === 3
                                    ? "你们走到了坚实的土地上。回过头，每一步都有人走过。"
                                    : "站稳了。再探查前面一排。",
                                );
                              } else
                                setNotice(
                                  checked
                                    ? "这处已经探明是松软泥水，请换一处。"
                                    : "还没有探查这里，先用木杖试一试。",
                                );
                            }}
                          >
                            {passed ? (
                              <Footprints />
                            ) : checked ? (
                              safe ? (
                                <Check />
                              ) : (
                                <X />
                              )
                            ) : (
                              <span />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  ))}
                  <span className="exp-bank">你从这里出发 ↑</span>
                </div>
              </section>
            )}
            {p.chapter === 5 && (
              <section className="exp-ending">
                <div className="exp-ending-journal">
                  <span className="exp-eyebrow">你的路，不只有里程</span>
                  {journalLines(p)
                    .slice(1, 5)
                    .map((line, i) => (
                      <p key={i}>
                        <span>0{i + 2}</span>
                        {line}
                      </p>
                    ))}
                </div>
                <div className="exp-letter">
                  <label htmlFor="journey-letter">
                    如果给今天的自己留一句话，你会写什么？
                  </label>
                  <textarea
                    id="journey-letter"
                    maxLength={500}
                    value={letter}
                    onChange={(e) => {
                      setLetter(e.target.value);
                      patch({ letter: e.target.value });
                    }}
                    placeholder="走完这段路，我想记住……"
                  />
                  <span>
                    {letter.length} / 500 ·{" "}
                    {saved ? "保存在这台设备上" : "暂未保存"}
                  </span>
                  {p.completed.includes(5) && (
                    <div className="exp-seal">
                      山河为证<small>六幕亲历 · 已完成</small>
                    </div>
                  )}
                </div>
              </section>
            )}
          </div>
          {notice && (
            <div className="exp-notice" role="status">
              <span>沿途所见</span>
              <p>{notice}</p>
              <button aria-label="收起沿途提示" onClick={() => setNotice("")}>
                <X />
              </button>
            </div>
          )}
          <footer className="exp-bottom">
            <div className="exp-chapter-dots" aria-label="六幕进度">
              {chapters.map((ch, i) => (
                <button
                  key={ch.short}
                  disabled={i > p.completed.length}
                  aria-label={`第${i + 1}幕 ${ch.short}`}
                  aria-current={p.chapter === i ? "step" : undefined}
                  onClick={() => patch({ chapter: i })}
                >
                  <span>
                    {p.completed.includes(i) ? (
                      <Check />
                    ) : (
                      String(i + 1).padStart(2, "0")
                    )}
                  </span>
                  <small>{ch.short}</small>
                </button>
              ))}
            </div>
            <div className="exp-next">
              <span>{ready ? "这一刻，值得记住。" : c.task}</span>
              {p.chapter === 5 && p.completed.includes(5) ? (
                <button
                  className="exp-primary"
                  onClick={() => setPanel("journal")}
                >
                  展开完整手记 <Notebook />
                </button>
              ) : (
                <button
                  className="exp-primary"
                  disabled={!ready}
                  onClick={() => setReveal(true)}
                >
                  {p.chapter === 5 ? "留下我的这段路" : "记下这一刻"}{" "}
                  <ArrowRight />
                </button>
              )}
            </div>
          </footer>
          <div className="exp-caption">
            <span>
              {role.name}视角 · {role.hint}
            </span>
            <span>{saved ? "进度自动保存" : "进度未保存"} · 可随时退出</span>
          </div>
        </>
      )}
      {reveal && (
        <Dialog
          narratable
          title={
            p.chapter === 4
              ? "草地上的一枚鱼钩"
              : p.chapter === 5
                ? "这一程，带回今天"
                : "刚才的行动，通向怎样的历史？"
          }
          onClose={() => setReveal(false)}
        >
          <div className="exp-history">
            {p.chapter === 4 && (
              <img src="/assets/object-01.webp" alt="金色鱼钩艺术演绎" />
            )}
            <span className="chapter-label">{c.place} / 历史回望</span>
            <h2>{p.chapter === 4 ? "金色，是一种精神的颜色。" : c.title}</h2>
            <p>{facts[p.chapter]}</p>
            {p.chapter === 4 && (
              <p>
                《金色的鱼钩》是一篇文学作品：老班长以鱼汤照料病号，自己却承受饥饿。生锈的鱼钩被赋予“金色”的意义，来自舍己为人的精神。这里的物件是艺术演绎，不是文物实拍。
              </p>
            )}
            <blockquote>{journalLines(p)[p.chapter]}</blockquote>
            <button
              className="text-button"
              onClick={() => {
                setReveal(false);
                setReader(true);
              }}
            >
              展开这一站的完整史料 <ArrowRight />
            </button>
            <button
              className="button"
              onClick={() => {
                next();
                if (p.chapter === 5) setPanel("journal");
              }}
            >
              {p.chapter === 5
                ? "完成并收好手记"
                : `走向下一幕 · ${chapters[Math.min(5, p.chapter + 1)].short}`}{" "}
              <ArrowRight />
            </button>
          </div>
        </Dialog>
      )}
      {reader && (
        <Reader
          id={c.station}
          onClose={() => setReader(false)}
          onNext={(id) => {
            setReader(false);
            go("journey", { station: id, read: 1 });
          }}
        />
      )}
      {panel && (
        <Dialog
          narratable={panel === "journal"}
          title={
            {
              journal: "我的行军手记",
              pack: "随身行囊",
              chapters: "一段可以走回去的路",
              restart: "重新开始这一段旅程",
            }[panel]
          }
          onClose={() => setPanel(null)}
        >
          {panel === "journal" && (
            <div className="exp-journal-content">
              <span className="chapter-label">
                {role.name} / {p.completed.length} 段记忆
              </span>
              {p.completed.length === 0 ? (
                <p>旅程刚刚开始。每一幕结束时，亲手把这一刻写进手记。</p>
              ) : (
                journalLines(p).map(
                  (line, i) =>
                    p.completed.includes(i) && (
                      <article key={i}>
                        <small>
                          {chapters[i].date} · {chapters[i].place}
                        </small>
                        <h3>{chapters[i].title}</h3>
                        <p>{line}</p>
                      </article>
                    ),
                )
              )}
              {p.completed.length > 0 && (
                <button className="button" onClick={exportJournal}>
                  <DownloadSimple />
                  导出我的手记
                </button>
              )}
              <p className="fineprint">
                个人学习记录中的“我”为虚构观察视角，不对应真实历史人物。
              </p>
            </div>
          )}
          {panel === "pack" && (
            <div className="exp-bag">
              <p>{role.object}，还有你亲手选下的东西。</p>
              {gear
                .filter((g) => p.gear.includes(g.id))
                .map((g) => (
                  <div key={g.id}>
                    <img src={`/assets/${g.image}.webp`} alt={g.name} />
                    <span>
                      <strong>{g.name}</strong>
                      <p>{g.detail}</p>
                    </span>
                  </div>
                ))}
              {!p.gear.length && <p>行囊还是空的。在第一幕挑选三件物品。</p>}
            </div>
          )}
          {panel === "chapters" && (
            <div className="exp-chapter-menu">
              {chapters.map((ch, i) => (
                <button
                  key={ch.title}
                  disabled={i > p.completed.length}
                  onClick={() => {
                    patch({ chapter: i, started: true });
                    setPanel(null);
                  }}
                >
                  <span>0{i + 1}</span>
                  <div>
                    <strong>{ch.title}</strong>
                    <small>
                      {ch.date} · {ch.place}
                    </small>
                  </div>
                  {p.completed.includes(i) ? <Check /> : <ArrowRight />}
                </button>
              ))}
              <button onClick={() => setPanel("restart")}>
                <ArrowCounterClockwise />
                重新选择身份与行囊
              </button>
              <p className="fineprint">
                学习情境分幕节选，未呈现全部22个历史站点。
                <a href="#/journey?mode=archive" onClick={() => setPanel(null)}>
                  展开完整资料地图
                </a>
              </p>
            </div>
          )}
          {panel === "restart" && (
            <div>
              <p>
                这会清除当前六幕亲历进度与这封信。资料阅读、收藏和原有学习记录不受影响。
              </p>
              <div className="exp-reset-actions">
                <button
                  className="button secondary"
                  onClick={() => setPanel(null)}
                >
                  保留这一程
                </button>
                <button
                  className="button"
                  onClick={() => {
                    setP(freshExpedition());
                    setFocused(false);
                    setLetter("");
                    setPanel(null);
                    setNotice("");
                  }}
                >
                  重新出发
                </button>
              </div>
            </div>
          )}
        </Dialog>
      )}
    </main>
  );
}
