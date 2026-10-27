import { useState, useEffect } from "react";
import {
  Boat,
  Bridge,
  Leaf,
  Radio,
  FlowerLotus,
  ArrowCounterClockwise,
  Check,
  ArrowRight,
  Notebook,
  Download,
} from "@phosphor-icons/react";
import { useProgress } from "../state";
import { sanitizeProgress } from "../storage";
const scenarios: [string, string[], number, string][] = [
  [
    "黎明将近，浮桥还留在河面。接下来最重要的是什么？",
    ["再搭一座桥", "拆桥、隐蔽船只与行军痕迹", "等天亮再整理"],
    1,
    "夜间架桥、拂晓拆桥，将群众的支援与行动的隐蔽结合起来。",
  ],
  [
    "面对广东地方势力与中央军的矛盾，应怎样理解通路的打开？",
    ["只看正面交战", "结合军事行动与谈判", "任何谈判都没有意义"],
    1,
    "第一道封锁线的突破也涉及统一战线和地方势力之间的关系。",
  ],
  [
    "半条被子的故事里，信任从哪里来？",
    ["具体的关心与分享", "物资越多越可信", "一次口头承诺足够"],
    0,
    "军民关系落实在可以感受到的生活细节中。",
  ],
  [
    "机器在窄路卡住，队伍停滞。最值得重新评估的是？",
    ["让所有人加速跑", "增加更多辎重", "集体运输组织与携行物资"],
    2,
    "全队速度取决于通道、组织与最慢的环节。",
  ],
  [
    "湘江前卫已经到达渡口，但主力尚在后方。关键问题是？",
    ["只有桥的宽度", "渡口掩护与全军通过时间", "只需向前冲锋"],
    1,
    "阻击战与渡河行动必须合在一起理解。",
  ],
  [
    "读老山界的行军记忆时，哪一种观察更完整？",
    ["只记海拔", "只记出发日期", "把山路、休息、饥饿和互助联系起来"],
    2,
    "自然条件与人的行动共同构成行军经验。",
  ],
  [
    "新的敌情推翻原来的安全判断，你会怎样做？",
    ["根据敌情调整方向", "继续执行不变的计划", "不再需要侦察"],
    0,
    "通道转兵体现了实事求是的选择。",
  ],
  [
    "通道、黎平、猴场之间有什么联系？",
    ["彼此无关", "决定只发生一次", "战略方向逐步确立"],
    2,
    "历史转折往往由一系列判断、讨论和决定构成。",
  ],
  [
    "强渡乌江需要什么配合？",
    ["只增加船只", "侦察、渡河与掩护协同", "全部集中等候"],
    1,
    "天险的突破依靠组织与多环节配合。",
  ],
  [
    "遵义会议的意义，应该放在哪种尺度里理解？",
    ["军事领导调整与随后实践", "一次会议解决了全部问题", "只看会场建筑"],
    0,
    "会议是转折的重要节点，新的指挥关系与战略仍在实践中发展。",
  ],
  [
    "四渡赤水为何多次转向？",
    ["单纯绕远", "迷失方向", "根据敌情争取主动"],
    2,
    "转向不是终点，调动对手、寻找有利时机才是关键。",
  ],
  [
    "兵逼贵阳、威逼昆明，为什么不等于一定要攻占城市？",
    ["行军没有目标", "行动可以调动对手的部署", "城市没有价值"],
    1,
    "佯动与机动可以打开新的战略空间。",
  ],
  [
    "小船数量有限，怎样让大队人马渡江？",
    ["统筹船工、渡运与后卫掩护", "各自争抢船只", "只渡最快的人"],
    0,
    "巧渡金沙江背后有连续渡运与后卫保障。",
  ],
  [
    "通过彝族地区，建立信任需要什么？",
    ["只要求对方让路", "尊重当地群众并遵守约定", "只展示武力"],
    1,
    "彝海结盟让民族政策成为具体的行动与关系。",
  ],
  [
    "突击队夺取桥头后，还需要什么？",
    ["马上停止协作", "各自行动", "铺板与后续队伍组织"],
    2,
    "夺桥与恢复通行是相互衔接的行动。",
  ],
  [
    "今天回看雪山经历，应怎样理解辣椒汤？",
    ["它能替代防寒衣", "在匮乏条件下的生活经验", "它能治疗高原病"],
    1,
    "历史经验不能直接作为现代户外或医疗建议。",
  ],
  [
    "会师之后，是否意味着分歧与困难自动消失？",
    ["还要面对路线、组织与团结问题", "一切问题都已解决", "无需再讨论"],
    0,
    "懋功会师与之后的会议说明团结需要持续维护。",
  ],
  [
    "草地行军为什么需要向导和相互照应？",
    ["只是为了走得更快", "草地没有方向", "地面承载、路线和补给都不确定"],
    2,
    "把自然环境、组织和照护放在一起看，才能理解草地的困难。",
  ],
  [
    "腊子口正面通道狭窄，为什么要寻找侧翼路径？",
    ["让所有人挤在一起", "改变单一正面进攻的处境", "放弃侦察"],
    1,
    "侦察地形与协同迂回能改变局部条件。",
  ],
  [
    "哈达铺的报纸说明了什么？",
    ["信息能改变下一步判断", "只有武器有价值", "旧新闻永远无用"],
    0,
    "在信息极度有限时，新的线索能够帮助寻找落脚点。",
  ],
  [
    "中央红军抵达陕北后，意味着什么？",
    [
      "所有队伍此时都结束长征",
      "从此不再行动",
      "中央红军完成长征，其他主力仍在行进",
    ],
    2,
    "要区分1935年中央红军到达陕北与1936年三大主力会师。",
  ],
  [
    "把会宁和将台堡放在一起看，有助于理解什么？",
    ["只有一个会师地点", "三大主力在不同地点陆续会师", "各军路线完全相同"],
    1,
    "不同路线与会师时刻共同构成长征全景。",
  ],
];
export function StationDecision({ id }: { id: number }) {
  const [choice, setChoice] = useState<number | null>(null);
  const { progress, setProgress } = useProgress();
  const [q, options, answer, note] = scenarios[id - 1];
  return (
    <section className="station-decision">
      <span className="chapter-label">停下来，想一想 · 第 {id} 站</span>
      <h3>{q}</h3>
      <div className="scenario-options">
        {options.map((o, i) => (
          <button
            key={o}
            aria-pressed={choice === i}
            className={
              choice === i ? (i === answer ? "correct" : "incorrect") : ""
            }
            onClick={() => {
              setChoice(i);
              if (i === answer)
                setProgress((p) => ({
                  ...p,
                  tasks: [...new Set([...p.tasks, `station-${id}`])],
                }));
            }}
          >
            <small>{String.fromCharCode(65 + i)}</small>
            {o}
          </button>
        ))}
      </div>
      {choice !== null && (
        <p role="status" className="scenario-feedback">
          {choice === answer
            ? "你抓住了关键。"
            : "再把当时的条件放进去想一想。"}{" "}
          {note}
        </p>
      )}
      {progress.tasks.includes(`station-${id}`) && (
        <small className="completion-mark">
          <Check />
          本站思考已记录
        </small>
      )}
    </section>
  );
}
export const experienceNames = [
  "夜渡调度",
  "铁索协作",
  "草地探路",
  "电报译读",
  "湘江献花",
];
const experienceKeys = [
  "night-lab",
  "bridge-lab",
  "marsh",
  "cipher",
  "tribute",
];
export function Experiences({
  initial = 0,
  embedded = false,
}: {
  initial?: number;
  embedded?: boolean;
}) {
  const [tab, setTab] = useState(initial);
  const { progress, setProgress } = useProgress();
  const complete = () =>
    setProgress((p) => ({
      ...p,
      tasks: [...new Set([...p.tasks, experienceKeys[tab]])],
    }));
  return (
    <section className={`experience-hub ${embedded ? "embedded" : ""}`}>
      <div className="section-heading">
        <div>
          <span className="chapter-label">在体验中理解</span>
          <h2>在选择中，理解征途。</h2>
        </div>
        <p>观察条件，试一次，再读历史。</p>
      </div>
      <div className="experience-tabs" role="tablist" aria-label="互动体验">
        {experienceNames.map((n, i) => {
          const Icon = [Boat, Bridge, Leaf, Radio, FlowerLotus][i];
          return (
            <button
              key={n}
              role="tab"
              aria-selected={tab === i}
              className={tab === i ? "active" : ""}
              onClick={() => setTab(i)}
            >
              <Icon />
              {n}
              {progress.tasks.includes(experienceKeys[i]) && (
                <Check size={14} />
              )}
            </button>
          );
        })}
      </div>
      <div className="experience-stage" key={tab}>
        {tab === 0 ? (
          <NightLab complete={complete} />
        ) : tab === 1 ? (
          <BridgeLab complete={complete} />
        ) : tab === 2 ? (
          <MarshLab complete={complete} />
        ) : tab === 3 ? (
          <CipherLab complete={complete} />
        ) : (
          <Tribute complete={complete} />
        )}
      </div>
    </section>
  );
}
function Reset({ onClick }: { onClick: () => void }) {
  return (
    <button className="text-button" onClick={onClick}>
      <ArrowCounterClockwise />
      重新体验
    </button>
  );
}
function NightLab({ complete }: { complete: () => void }) {
  const [hour, setHour] = useState(17),
    [wood, setWood] = useState(0),
    [groups, setGroups] = useState(0),
    [hidden, setHidden] = useState(false),
    [note, setNote] = useState("先收集三批木船与桥板，随后组织四批队伍渡河。");
  const failed = hour >= 29 && !hidden;
  const action = (type: string) => {
    if (hidden || failed) return;
    if (type === "gather") {
      setWood(Math.min(3, wood + 1));
      setHour(hour + 1);
      setNote("群众送来船只和木料，浮桥向对岸延伸。");
    }
    if (type === "cross") {
      if (wood < 3) {
        setHour(hour + 1);
        setNote("浮桥尚未完成，先把材料准备齐。");
        return;
      }
      setGroups(Math.min(4, groups + 1));
      setHour(hour + 1.5);
      setNote("一批队伍渡过了河，渡口保持有序通行。");
    }
    if (type === "hide") {
      if (groups < 4) {
        setNote("还有队伍在此岸，不能先拆掉通路。");
        return;
      }
      setHour(hour + 1);
      if (hour + 1 > 29) {
        setNote("拆桥尚未完成，天已经亮了。请重新安排时间。");
        return;
      }
      setHidden(true);
      complete();
      setNote("队伍完成渡河，浮桥拆除。河面恢复平静。");
    }
  };
  return (
    <div className="lab-layout">
      <div>
        <span className="chapter-label">1934 · 于都河畔</span>
        <h3>天亮之前，让队伍过河。</h3>
        <p>
          将 17:00 至次日 05:00
          的一夜，分给准备、渡河和隐蔽。每一步都会消耗时间。
        </p>
        <div className="lab-metrics">
          <strong>
            {String(Math.floor(hour) % 24).padStart(2, "0")}:
            {hour % 1 ? "30" : "00"}
          </strong>
          <span>已渡河 {groups} / 4 批</span>
        </div>
        <div className="lab-actions">
          <button
            disabled={wood === 3 || hidden || failed}
            onClick={() => action("gather")}
          >
            收集木船与桥板 · 1小时
          </button>
          <button
            disabled={groups === 4 || hidden || failed}
            onClick={() => action("cross")}
          >
            组织一批队伍渡河 · 1.5小时
          </button>
          <button disabled={hidden || failed} onClick={() => action("hide")}>
            拆桥并隐蔽 · 1小时
          </button>
        </div>
        <p className="scenario-feedback" role="status">
          {failed ? "天已经亮了，试着让准备与渡河衔接得更紧密。" : note}
        </p>
        <Reset
          onClick={() => {
            setHour(17);
            setWood(0);
            setGroups(0);
            setHidden(false);
            setNote("重新安排这一夜。");
          }}
        />
        <p className="fineprint">批次与用时为教学模型，不是历史实测。</p>
      </div>
      <div className="night-canvas">
        <span className="moon" />
        <div className="night-mountains" />
        <div className="night-water" />
        <div className="pontoon">
          {[0, 1, 2].map((i) => (
            <span key={i} className={i < wood && !hidden ? "built" : ""} />
          ))}
        </div>
        <div className="river-travellers">
          {Array.from({ length: 12 }, (_, i) => (
            <span key={i} className={i < groups * 3 ? "crossed" : ""}>
              •
            </span>
          ))}
        </div>
        <span className="scene-caption">
          {hidden ? "拂晓 · 河面重新安静" : "船与木板，连起两岸"}
        </span>
      </div>
    </div>
  );
}
function BridgeLab({ complete }: { complete: () => void }) {
  const [step, setStep] = useState(0),
    [seconds, setSeconds] = useState(30),
    [running, setRunning] = useState(false),
    [slow, setSlow] = useState(false),
    [note, setNote] = useState(
      "按顺序：掩护 → 铺板 → 通过。完成四个协作回合。",
    );
  useEffect(() => {
    if (!running || slow || step >= 12) return;
    const t = setInterval(() => setSeconds((v) => Math.max(0, v - 1)), 1000);
    return () => clearInterval(t);
  }, [running, slow, step]);
  const done = step >= 12,
    failed = !slow && seconds === 0 && !done;
  function act(n: number) {
    if (done || failed) return;
    setRunning(true);
    if (step % 3 !== n) {
      setNote("步骤不衔接。先掩护，再铺板，最后组织通过。");
      return;
    }
    const next = step + 1;
    setStep(next);
    setNote(
      [
        "掩护到位，桥面作业可以开始。",
        "桥板就位，保持有序通行。",
        "一组人员通过，继续下一段。",
      ][n],
    );
    if (next === 12) {
      complete();
      setNote("协作完成。夺桥并非只有突击，也需要掩护、铺板与后续组织。");
    }
  }
  return (
    <div className="bridge-lab">
      <div className="lab-title">
        <div>
          <span className="chapter-label">泸定桥 · 协作节奏</span>
          <h3>每一步，都需要有人照应。</h3>
        </div>
        <strong className="countdown">
          {slow ? "从容模式" : `${seconds}s`}
        </strong>
      </div>
      <label className="mode-switch">
        <input
          type="checkbox"
          checked={slow}
          onChange={(e) => setSlow(e.target.checked)}
        />
        关闭倒计时，从容体验
      </label>
      <div className="bridge-canvas">
        <div className="bridge-cables" />
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className={`bridge-plank ${step >= i * 3 + 2 ? "laid" : ""} ${step >= i * 3 + 3 ? "passed" : ""}`}
          >
            {step >= i * 3 + 3 ? <Check /> : String(i + 1).padStart(2, "0")}
          </span>
        ))}
      </div>
      <div className="bridge-action-row">
        {["建立掩护", "铺设桥板", "组织通过"].map((a, i) => (
          <button
            key={a}
            disabled={done || failed}
            className={step % 3 === i && !done ? "next-action" : ""}
            onClick={() => act(i)}
          >
            <small>{i + 1}</small>
            {a}
          </button>
        ))}
      </div>
      <p role="status" className="scenario-feedback">
        {failed ? "时间用完了。可以重新开始，或关闭倒计时。" : note}
      </p>
      <Reset
        onClick={() => {
          setStep(0);
          setSeconds(30);
          setRunning(false);
          setNote("重新开始：掩护 → 铺板 → 通过。");
        }}
      />
      <p className="fineprint">
        时间与回合仅用于交互教学，不模拟真实战斗或考核身体能力。
      </p>
    </div>
  );
}
const safe = [2, 2, 1, 1, 2];
function MarshLab({ complete }: { complete: () => void }) {
  const [row, setRow] = useState(0),
    [col, setCol] = useState(2),
    [probed, setProbed] = useState<number[]>([]),
    [trail, setTrail] = useState<number[]>([]),
    [note, setNote] = useState("先探路，再踏上与当前位置相邻的草墩。");
  return (
    <div className="lab-layout">
      <div>
        <span className="chapter-label">松潘草地 · 读懂地面</span>
        <h3>看起来平坦，不等于安全。</h3>
        <p>
          每一行代表一段路。先用木杖探查，再选择下一行可承重的草墩；方向最多偏移一格。
        </p>
        <div className="lab-metrics">
          <strong>{row} / 5</strong>
          <span>已通过路段</span>
        </div>
        <button
          className="button"
          disabled={row >= 5 || probed.includes(row)}
          onClick={() => {
            setProbed((p) => [...p, row]);
            setNote("当前一行已探明：“实”表示可承重，“湿”表示湿陷。");
          }}
        >
          用木杖探查前方
        </button>
        <p role="status" className="scenario-feedback">
          {note}
        </p>
        <Reset
          onClick={() => {
            setRow(0);
            setCol(2);
            setTrail([]);
            setProbed([]);
            setNote("重新从第一行出发。");
          }}
        />
        <p className="fineprint">简化环境学习，不是现实湿地通行指南。</p>
      </div>
      <div className="marsh-grid" aria-label="五行草地探路棋盘">
        {Array.from({ length: 25 }, (_, i) => {
          const r = Math.floor(i / 5),
            c = i % 5;
          const isSafe = safe[r] === c;
          return (
            <button
              key={i}
              disabled={r !== row || Math.abs(c - col) > 1}
              className={`${trail.includes(i) ? "walked" : ""} ${probed.includes(r) ? (isSafe ? "solid" : "wet") : ""}`}
              aria-label={`第${r + 1}行第${c + 1}格${probed.includes(r) ? (isSafe ? " 坚实" : " 湿陷") : ""}`}
              onClick={() => {
                if (!probed.includes(r)) {
                  setNote("还不清楚地面承载情况，先用木杖探查。");
                  return;
                }
                if (!isSafe) {
                  setNote("这处草墩下面湿陷，退回已知的落脚点，再选择。");
                  return;
                }
                setTrail((t) => [...t, i]);
                setCol(c);
                setRow(r + 1);
                setNote(
                  r === 4
                    ? "你完成了探路。向导、侦察与互助，是理解草地行军的重要线索。"
                    : "这一步稳妥，继续探查下一段。",
                );
                if (r === 4) complete();
              }}
            >
              {trail.includes(i) ? (
                <Check />
              ) : probed.includes(r) ? (
                isSafe ? (
                  "实"
                ) : (
                  "湿"
                )
              ) : (
                <Leaf />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
function CipherLab({ complete }: { complete: () => void }) {
  const words = ["上", "北", "陕", "前"];
  const [picked, setPicked] = useState<string[]>([]),
    [checked, setChecked] = useState(false);
  const correct = picked.join("") === "北上陕北";
  return (
    <div className="cipher-lab">
      <div>
        <span className="chapter-label">军委二局 · 信息的价值</span>
        <h3>把电码，译成方向。</h3>
        <p>用教学码本译出四个字。信息只有被准确接收和理解，才能参与决策。</p>
      </div>
      <div className="cipher-desk">
        <div className="telegram">
          <Radio size={32} />
          <small>收到的电文 · 教学示意</small>
          <strong>02 · 01 · 03 · 02</strong>
          <div className="decode-slots">
            {[0, 1, 2, 3].map((i) => (
              <span key={i}>{picked[i] || "□"}</span>
            ))}
          </div>
        </div>
        <div className="codebook">
          <span>临时代码表</span>
          {words.map((w, i) => (
            <button
              key={w}
              disabled={picked.length >= 4}
              onClick={() => {
                setChecked(false);
                setPicked((p) => [...p, w]);
              }}
            >
              <small>0{i + 1}</small>
              {w}
              <PlusIcon />
            </button>
          ))}
        </div>
      </div>
      <div className="lab-actions">
        <button
          className="button"
          disabled={picked.length !== 4}
          onClick={() => {
            setChecked(true);
            if (correct) complete();
          }}
        >
          核对译文 <Check />
        </button>
        <button
          className="text-button"
          disabled={!picked.length}
          onClick={() => {
            setPicked((p) => p.slice(0, -1));
            setChecked(false);
          }}
        >
          撤回一字
        </button>
        <Reset
          onClick={() => {
            setPicked([]);
            setChecked(false);
          }}
        />
      </div>
      {checked && (
        <p role="status" className="scenario-feedback">
          {correct
            ? "北上陕北。你完成了译读；真实的无线电情报工作远比这复杂，还包括侦收、分析与保密。"
            : "还有字没有对应上。逐个核对代码表，再试一次。"}
        </p>
      )}
      <p className="fineprint">此码本为教学设计，不是历史密码或真实电报。</p>
    </div>
  );
}
function PlusIcon() {
  return <span aria-hidden="true">＋</span>;
}
function Tribute({ complete }: { complete: () => void }) {
  const [count, setCount] = useState(() => {
      try {
        return Math.min(
          999,
          Math.max(0, Number(localStorage.getItem("changzheng-flowers")) || 0),
        );
      } catch {
        return 0;
      }
    }),
    [status, setStatus] = useState("");
  return (
    <div className="tribute">
      <span className="chapter-label">湘江 · 记住每一个普通的人</span>
      <h3>留一朵白花，留一点时间。</h3>
      <div className="flower-field" aria-hidden="true">
        {Array.from({ length: Math.min(count, 9) }, (_, i) => (
          <FlowerLotus key={i} size={40 + (i % 3) * 10} weight="duotone" />
        ))}
      </div>
      <p>
        阻击、掩护与突围的背后，是无数人的生命与牺牲。红三十四师的许多战士来自闽西，家乡包括长汀、宁化、上杭、连城、永定等地。
      </p>
      <button
        className="button"
        onClick={() => {
          const n = Math.min(count + 1, 999);
          setCount(n);
          try {
            localStorage.setItem("changzheng-flowers", String(n));
            setStatus("这份纪念已保存在当前浏览器。");
          } catch {
            setStatus("本次纪念已呈现，浏览器暂时无法保存。");
          }
          complete();
        }}
      >
        <FlowerLotus />
        敬献一朵白花
      </button>
      <small>你在本设备留下 {count} 朵白花</small>
      <p role="status">{status}</p>
      <a className="text-button" href="#/journey?station=5&read=1">
        读湘江战役的完整记述 <ArrowRight />
      </a>
    </div>
  );
}
export function Reflection() {
  const [text, setText] = useState(() => {
      try {
        return localStorage.getItem("changzheng-reflection") || "";
      } catch {
        return "";
      }
    }),
    [status, setStatus] = useState("");
  return (
    <section className="reflection">
      <Notebook size={35} />
      <div>
        <span className="chapter-label">写给今天的自己</span>
        <h3>哪一个细节，让你停了下来？</h3>
        <label htmlFor="reflection">
          记录一件物品、一个人物，或一次改变你理解的选择。
        </label>
        <textarea
          id="reflection"
          value={text}
          maxLength={2000}
          onChange={(e) => {
            setText(e.target.value);
            setStatus("尚未保存");
          }}
          placeholder="例如：我记住了那枚生锈的鱼钩，因为……"
        />
        <div className="reflection-actions">
          <button
            className="button"
            onClick={() => {
              try {
                localStorage.setItem("changzheng-reflection", text);
                setStatus("手记已保存到本设备。");
              } catch {
                setStatus("无法保存，请先复制你的文字。");
              }
            }}
          >
            保存这页手记
          </button>
          <span role="status">
            {status || `${text.length} / 2000 字 · 仅保存在本地`}
          </span>
        </div>
      </div>
    </section>
  );
}
export function ProgressBackup() {
  const { progress, setProgress } = useProgress();
  const [status, setStatus] = useState("");
  function download() {
    const blob = new Blob(
      [
        JSON.stringify(
          { format: "changzheng-progress", version: 2, progress },
          null,
          2,
        ),
      ],
      { type: "application/json" },
    );
    const u = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = u;
    a.download = "长征学习记录.json";
    a.click();
    setTimeout(() => URL.revokeObjectURL(u), 1000);
    setStatus("已生成本地学习记录文件。");
  }
  return (
    <section className="backup-panel">
      <div>
        <h3>把这一路，带在身边。</h3>
        <p>导出收藏、阅读和任务记录；换一个浏览器时，可从文件恢复。</p>
      </div>
      <div className="backup-actions">
        <button className="text-button" onClick={download}>
          <Download />
          导出学习记录
        </button>
        <label className="file-button">
          从文件恢复
          <input
            type="file"
            accept="application/json,.json"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              try {
                if (file.size > 100000) throw Error();
                const data = JSON.parse(await file.text());
                if (data.format !== "changzheng-progress" || data.version !== 2)
                  throw Error();
                const next = sanitizeProgress(data.progress);
                setProgress((p) => ({
                  ...p,
                  badges: [...new Set([...p.badges, ...next.badges])],
                  visited: [...new Set([...p.visited, ...next.visited])],
                  saved: [...new Set([...p.saved, ...next.saved])],
                  stories: [...new Set([...p.stories, ...next.stories])],
                  tasks: [...new Set([...p.tasks, ...next.tasks])],
                  answers: Array.from(
                    { length: 15 },
                    (_, i) => p.answers[i] ?? next.answers[i] ?? null,
                  ),
                  lastQuizAnswers: p.lastQuizAnswers.length ? p.lastQuizAnswers : next.lastQuizAnswers,
                  lastStation: next.lastStation,
                }));
                setStatus("记录已合并，已有收藏与足迹会保留。");
              } catch {
                setStatus("未导入：请选择本站导出的有效学习记录文件。");
              }
              e.target.value = "";
            }}
          />
        </label>
      </div>
      <p role="status">{status}</p>
    </section>
  );
}
