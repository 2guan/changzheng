import { BadgeGallery } from "./Badges";
import { PANORAMA_KEY, sanitizePanoramaProgress } from "../panoramas";
import { Experiences, Reflection, ProgressBackup } from "./Experiences";
import { useState } from "react";
import {
  Backpack,
  Check,
  ArrowRight,
  ArrowCounterClockwise,
  Download,
  Certificate,
  BookmarkSimple,
  Footprints,
  BookOpen,
  Scales,
  Flag,
  Boat,
  Bridge,
  WarningCircle,
} from "@phosphor-icons/react";
import { milestones, quiz } from "../data";
import { useProgress } from "../state";
import { packingStats, scoreAnswers } from "../storage";
import { Dialog, LinkButton } from "./UI";
const items = [
  { name: "步枪", weight: 4.5, note: "基本装备" },
  { name: "弹药", weight: 1.5, note: "有限携带" },
  { name: "三天干粮", weight: 2, note: "行军补给" },
  { name: "水壶与饮水", weight: 1.5, note: "沿途补水" },
  { name: "换洗衣物", weight: 1, note: "保暖与卫生" },
  { name: "备用草鞋", weight: 0.5, note: "易损必需品" },
  { name: "印刷机零件", weight: 20, note: "集体物资" },
  { name: "大铜锅", weight: 10, note: "集体炊具" },
  { name: "简易药包", weight: 0.5, note: "照护同伴" },
];
export function Packing({ onComplete }: { onComplete?: () => void }) {
  const [selected, setSelected] = useState([0, 1, 2, 3, 5]);
  const [done, setDone] = useState(false);
  const stats = packingStats(selected.map((i) => items[i].weight));
  const ready =
    selected.includes(2) &&
    selected.includes(3) &&
    selected.includes(5) &&
    stats.weight <= 15;
  return (
    <div className="packing">
      <div className="task-intro">
        <span className="chapter-label">行军负重实验</span>
        <h3>带上什么，放下什么？</h3>
        <p>
          你需要为接下来的行军打包。物资越多，负担越重。试着保留干粮、饮水和草鞋，并把负重控制在
          15 公斤以内。
        </p>
      </div>
      <div className="packing-layout">
        <div className="packing-items">
          {items.map((item, i) => (
            <label
              key={item.name}
              className={selected.includes(i) ? "checked" : ""}
            >
              <input
                type="checkbox"
                checked={selected.includes(i)}
                onChange={() => {
                  setDone(false);
                  setSelected((s) =>
                    s.includes(i) ? s.filter((x) => x !== i) : [...s, i],
                  );
                }}
              />
              <span>
                <strong>{item.name}</strong>
                <small>{item.note}</small>
              </span>
              <em>{item.weight} kg</em>
            </label>
          ))}
        </div>
        <div className="packing-result" aria-live="polite">
          <Backpack size={50} weight="duotone" />
          <span>当前负重</span>
          <strong>
            {stats.weight.toFixed(1)}
            <small> kg</small>
          </strong>
          <div className="weight-meter">
            <span
              style={{ transform: `scaleX(${Math.min(stats.weight / 45, 1)})` }}
            />
          </div>
          <h4>{stats.effort}</h4>
          <p>
            教学模型行军速度
            <br />
            <b>{stats.speed.toFixed(1)} km/h</b>
          </p>
          <button
            className="button"
            onClick={() => {
              setDone(true);
              if (ready) onComplete?.();
            }}
          >
            检视我的行囊 <ArrowRight />
          </button>
        </div>
      </div>
      {done && (
        <div
          className={`task-feedback ${ready ? "success" : ""}`}
          role="status"
        >
          {ready ? <Check /> : <WarningCircle />}
          <div>
            <strong>{ready ? "你的行囊已经准备好。" : "再做一次取舍。"}</strong>
            <p>
              {ready
                ? "这不是唯一正确的清单。大型器械属于集体资源，但如果不能协调运输，整支队伍都可能受到拖累。长征初期的辎重问题，需要在队伍尺度上理解。"
                : "请保留干粮、饮水和备用草鞋，并将总重量降至15公斤以内。尝试把需要多人搬运的集体物资交由专门队伍协调。"}
            </p>
          </div>
        </div>
      )}
      <p className="fineprint">
        重量、速度与阈值是简化的教学模型，不代表历史实测或户外行军建议。
      </p>
    </div>
  );
}
export function Decision({ onComplete }: { onComplete: () => void }) {
  const [selected, setSelected] = useState<number | null>(null);
  return (
    <div className="decision-task">
      <span className="chapter-label">1934年12月 · 通道</span>
      <h3>前方是重兵，你往哪里走？</h3>
      <p>
        原计划向北前往湘西，但这一方向已有重兵等待。向西进入贵州，意味着调整既定计划。你将如何选择？
      </p>
      <div className="decision-options">
        {[
          "坚持向北，严格执行原有计划",
          "向西转兵，根据新的敌情调整",
          "留在原地，等待形势自行改变",
        ].map((o, i) => (
          <button
            key={o}
            className={selected === i ? "selected" : ""}
            onClick={() => {
              setSelected(i);
              if (i === 1) onComplete();
            }}
          >
            <span>{["A", "B", "C"][i]}</span>
            {o}
            <ArrowRight />
          </button>
        ))}
      </div>
      {selected !== null && (
        <div className="task-feedback" role="status">
          <BookOpen />
          <div>
            <strong>
              {selected === 1
                ? "你选择了历史上的转兵方向。"
                : "把新的信息放进决策里，再想一次。"}
            </strong>
            <p>
              通道转兵为红军摆脱被动争取了机会。关键不是猜中地图上的方向，而是意识到：当实际条件改变，计划也需要改变。
            </p>
            <a href="#/journey?station=7">回到通道，了解历史现场</a>
          </div>
        </div>
      )}
    </div>
  );
}
function SequenceTask({
  type,
  onComplete,
}: {
  type: "night" | "bridge";
  onComplete: () => void;
}) {
  const [step, setStep] = useState(0);
  const [message, setMessage] = useState("");
  const isNight = type === "night";
  const correct = isNight ? [1, 0, 2] : [2, 0, 1];
  const labels = isNight
    ? ["组织队伍夜间渡河", "收集木船与桥板，架设浮桥", "拂晓前拆桥，隐蔽船只"]
    : [
        "铺设桥板，扩大通行能力",
        "组织后续队伍有序通过",
        "火力掩护突击队夺取桥头",
      ];
  const explain = isNight
    ? [
        "先组织材料与架桥人员。",
        "在夜色掩护下有序通行。",
        "黎明前拆桥隐蔽，避免暴露。",
      ]
    : [
        "首先建立对桥头的控制。",
        "为后续队伍恢复通行条件。",
        "保持秩序，让更多人安全通过。",
      ];
  return (
    <div className="sequence-task">
      <span className="chapter-label">
        {isNight ? "于都夜渡 · 组织协作" : "泸定桥 · 行动协同"}
      </span>
      <h3>{isNight ? "一夜之间，让队伍过河。" : "一座桥，需要怎样的协作？"}</h3>
      <p>请按合理顺序选择三个行动，看看一场行动如何环环相扣。</p>
      <div className={`sequence-scene ${isNight ? "night-scene" : ""}`}>
        {isNight ? (
          <Boat size={76} weight="duotone" />
        ) : (
          <Bridge size={76} weight="duotone" />
        )}
        <div>
          {[0, 1, 2].map((i) => (
            <span key={i} className={i < step ? "done" : ""}>
              {i < step ? <Check /> : i + 1}
            </span>
          ))}
        </div>
        <strong>
          {step === 3
            ? "协作完成"
            : isNight
              ? ["17:00 · 准备", "20:00 · 渡河", "05:00 · 隐蔽"][step]
              : ["先取得立足点", "再恢复通道", "最后有序通行"][step]}
        </strong>
      </div>
      <div className="decision-options">
        {labels.map((l, i) => (
          <button
            key={l}
            disabled={correct.slice(0, step).includes(i) || step === 3}
            onClick={() => {
              if (i === correct[step]) {
                setMessage(explain[step]);
                setStep((s) => s + 1);
                if (step === 2) onComplete();
              } else setMessage("顺序还需要调整：" + explain[step]);
            }}
          >
            <span>
              {correct.slice(0, step).includes(i) ? (
                <Check />
              ) : (
                ["A", "B", "C"][i]
              )}
            </span>
            {l}
          </button>
        ))}
      </div>
      <p className="task-feedback" role="status">
        {message || "选择你的第一个行动。"}
      </p>
      {step === 3 && (
        <button
          className="text-button"
          onClick={() => {
            setStep(0);
            setMessage("");
          }}
        >
          <ArrowCounterClockwise />
          重新体验
        </button>
      )}
      <p className="fineprint">
        这是理解组织与协同的简化任务，不是对战斗过程的完整模拟。
      </p>
    </div>
  );
}
export const taskNames = {
  pack: "行军负重",
  decision: "通道抉择",
  night: "于都夜渡",
  bridge: "泸定桥协作",
};
export function TaskDialog({
  task,
  onClose,
}: {
  task: keyof typeof taskNames;
  onClose: () => void;
}) {
  const { setProgress } = useProgress();
  const complete = () =>
    setProgress((p) => ({ ...p, tasks: [...new Set([...p.tasks, task])] }));
  return (
    <Dialog narratable title={taskNames[task]} onClose={onClose} wide>
      {task === "pack" ? (
        <Packing onComplete={complete} />
      ) : task === "decision" ? (
        <Decision onComplete={complete} />
      ) : (
        <SequenceTask type={task} onComplete={complete} />
      )}
    </Dialog>
  );
}
async function createCertificate(name: string, score: number, visited: number) {
  await Promise.all([
    document.fonts.load('24px "ChangzhengBody"', name + "长征路上的同行者"),
    document.fonts.load('70px "ChangzhengTitle"', "山河为证，初心如炬"),
  ]).catch(() => []);
  const canvas = document.createElement("canvas");
  canvas.width = 1600;
  canvas.height = 1100;
  const c = canvas.getContext("2d");
  if (!c) return;
  c.fillStyle = "#f7f1e1";
  c.fillRect(0, 0, 1600, 1100);
  c.strokeStyle = "#9c3029";
  c.lineWidth = 3;
  c.strokeRect(46, 46, 1508, 1008);
  c.lineWidth = 1;
  c.strokeRect(58, 58, 1484, 984);
  c.textAlign = "center";
  c.fillStyle = "#9c3029";
  c.font = "24px ChangzhengBody, serif";
  c.fillText("重走长征路 · 学习纪念", 800, 150);
  c.font = "70px ChangzhengTitle, serif";
  c.fillText("山河为证，初心如炬", 800, 300);
  c.fillStyle = "#3c332b";
  c.font = "44px ChangzhengBody, serif";
  c.fillText(name.trim().slice(0, 20) || "长征路上的同行者", 800, 450);
  c.font = "28px ChangzhengBody, serif";
  c.fillText("已完成长征知识测验", 800, 540);
  c.fillText(`答对 ${score} / 15 题    ·    阅读 ${visited} / 22 站`, 800, 610);
  c.font = "30px ChangzhengBody, serif";
  c.fillText("每一次回望，都是新的出发。", 800, 750);
  c.font = "20px ChangzhengBody, serif";
  c.fillStyle = "#857560";
  c.fillText(new Intl.DateTimeFormat("zh-CN").format(new Date()), 800, 880);
  c.fillText("个人学习纪念 · 不代表官方认证或学历证明", 800, 950);
  return canvas.toDataURL("image/png");
}
export function Quiz({ onClose }: { onClose: () => void }) {
  const { progress, setProgress } = useProgress();
  const first = quiz.findIndex((_, i) => progress.answers[i] == null);
  const [index, setIndex] = useState(first === -1 ? 15 : first);
  const [name, setName] = useState("");
  const [certificate, setCertificate] = useState<string | undefined>();
  const [review, setReview] = useState(false);
  const score = scoreAnswers(
    progress.answers,
    quiz.map((q) => q.answer),
  );
  const wrong = quiz
    .map((q, i) => (progress.answers[i] !== q.answer ? i : -1))
    .filter((i) => i >= 0);
  const q = quiz[index];
  const answer = progress.answers[index];
  return (
    <Dialog narratable title="长征知识测验" onClose={onClose} wide>
      {index < 15 ? (
        <div className="quiz">
          <div className="quiz-top">
            <span>征途问答</span>
            <span>{String(index + 1).padStart(2, "0")} / 15</span>
          </div>
          <div className="quiz-progress">
            {quiz.map((_, i) => (
              <span
                key={i}
                className={
                  i === index
                    ? "current"
                    : progress.answers[i] != null
                      ? "done"
                      : ""
                }
              />
            ))}
          </div>
          <h2>{q.question}</h2>
          <div className="quiz-options">
            {q.options.map((o, i) => (
              <button
                key={o}
                disabled={answer != null}
                className={
                  answer != null
                    ? i === q.answer
                      ? "correct"
                      : i === answer
                        ? "incorrect"
                        : ""
                    : ""
                }
                onClick={() =>
                  setProgress((p) => {
                    if (p.answers[index] != null) return p;
                    const answers = Array.from(
                      { length: 15 },
                      (_, j) => p.answers[j] ?? null,
                    );
                    answers[index] = i;
                    return { ...p, answers };
                  })
                }
              >
                <span>{String.fromCharCode(65 + i)}</span>
                {o}
                {answer != null && i === q.answer && <Check />}
              </button>
            ))}
          </div>
          {answer != null && (
            <div className="quiz-explanation" role="status">
              <strong>
                {answer === q.answer
                  ? "理解得很准确。"
                  : "再看一眼历史的细节。"}
              </strong>
              <p>{q.explanation}</p>
              <a
                href={`#/journey?station=${q.station}&read=1`}
                onClick={onClose}
              >
                查看相关站点 <ArrowRight />
              </a>
            </div>
          )}
          <div className="quiz-bottom">
            <span>答案与进度自动保存在此浏览器</span>
            <button
              className="button"
              disabled={answer == null}
              onClick={() => {
                if (review) {
                  const next = wrong.find((n) => n > index);
                  setIndex(next ?? 15);
                } else setIndex((i) => i + 1);
              }}
            >
              {review ? "下一道错题" : index === 14 ? "查看学习结果" : "下一题"}
              <ArrowRight />
            </button>
          </div>
        </div>
      ) : (
        <div className="quiz-result">
          <Certificate size={64} weight="duotone" />
          <p className="chapter-label">每一次回望，都是新的出发</p>
          <h2>这一程，你认真走过。</h2>
          <div className="quiz-score">
            <strong>{score}</strong>
            <span>/ 15 题</span>
          </div>
          <p>
            {score === 15
              ? "全部答对。把理解带到更广阔的阅读里。"
              : `还有 ${15 - score} 个问题值得回看。理解，比一次答对更重要。`}
          </p>
          <label className="certificate-name">
            纪念证书上的名字
            <input
              value={name}
              maxLength={20}
              onChange={(e) => setName(e.target.value)}
              placeholder="长征路上的同行者"
            />
          </label>
          <button
            className="button"
            onClick={async () =>
              setCertificate(
                await createCertificate(name, score, progress.visited.length),
              )
            }
          >
            <Certificate />
            生成学习纪念证书
          </button>
          {certificate && (
            <div className="certificate-preview">
              <img
                src={certificate}
                alt="已生成的长征学习纪念证书"
                width="1600"
                height="1100"
              />
              <a
                className="button"
                href={certificate}
                download="重走长征路-学习纪念.png"
              >
                <Download />
                保存 PNG 证书
              </a>
              <p className="fineprint">也可以长按图片保存到设备。</p>
            </div>
          )}
          <div className="result-actions">
            {wrong.length > 0 && (
              <button
                className="text-button"
                onClick={() => {
                  setReview(true);
                  setIndex(wrong[0]);
                }}
              >
                回看错题 <BookOpen />
              </button>
            )}
            <button
              className="text-button"
              onClick={() => {
                setProgress((p) => ({ ...p, answers: [] }));
                setReview(false);
                setCertificate(undefined);
                setIndex(0);
              }}
            >
              <ArrowCounterClockwise />
              重新测验
            </button>
          </div>
          <p className="fineprint">
            个人学习纪念，不代表官方认证。姓名只用于本地生成，不会上传。
          </p>
        </div>
      )}
    </Dialog>
  );
}
export function Learning({ params }: { params: URLSearchParams }) {
  const { progress, storageError } = useProgress();
  const [panorama] = useState(() => {
    try {
      return sanitizePanoramaProgress(
        JSON.parse(localStorage.getItem(PANORAMA_KEY) || "null"),
      );
    } catch {
      return sanitizePanoramaProgress(null);
    }
  });
  const [task, setTask] = useState<keyof typeof taskNames | null>(null);
  const [quizOpen, setQuiz] = useState(false);
  const focus = params.get("focus");
  const [tab, setTab] = useState("saved");
  const answered = progress.answers.filter((a) => a != null).length;
  const ids = tab === "saved" ? progress.saved : progress.visited;
  return (
    <div className="topic-content learning-detail">
      {storageError && (
        <p className="task-feedback" role="alert">
          当前浏览器无法保存本地记录，仍可继续学习；关闭页面后进度可能丢失。
        </p>
      )}
      {focus === "progress" && (
        <>
          <BadgeGallery />{" "}
          <a
            className="exp-learning-entry"
            href={`#/journey?station=${panorama.lastStation}`}
          >
            <div>
              <span>万里征途 · 二十二站全景</span>
              <h2>
                {panorama.seen.length > 0
                  ? `上次走到 · ${milestones[panorama.lastStation - 1].title}`
                  : "把二十二站山河，慢慢看完。"}
              </h2>
              <p>全景环顾，沿途叙事。无需完成任务，随时前行或停留。</p>
            </div>
            <span>
              <strong>
                {panorama.seen.length}
                <small> / 22</small>
              </strong>
              {panorama.seen.length > 0 ? "继续全景漫游" : "展开第一站"}
              <ArrowRight />
            </span>
          </a>
          <a className="panorama-legacy-link" href="#/journey?mode=interactive">
            可选：六幕互动体验 <ArrowRight />
          </a>
          <div id="atlas-progress" tabIndex={-1} className="progress-overview">
            <div>
              <Footprints />
              <strong>
                {progress.visited.length}
                <small>/22</small>
              </strong>
              <span>留下足迹</span>
            </div>
            <div>
              <BookOpen />
              <strong>
                {progress.stories.length}
                <small>/20</small>
              </strong>
              <span>读过故事</span>
            </div>
            <div>
              <Flag />
              <strong>
                {progress.tasks.filter((x) => !x.startsWith("station-")).length}
                <small>/9</small>
              </strong>
              <span>完成情境任务</span>
            </div>
            <div>
              <Certificate />
              <strong>
                {answered}
                <small>/15</small>
              </strong>
              <span>回答问题</span>
            </div>
          </div>
          <section className="learning-actions">
            <div className="continue-panel">
              <span className="chapter-label">沿着上次的脚步</span>
              <h2>{milestones[progress.lastStation - 1].title}</h2>
              <p>
                第 {String(progress.lastStation).padStart(2, "0")} 站 ·{" "}
                {milestones[progress.lastStation - 1].place}
              </p>
              <LinkButton href={`#/journey?station=${progress.lastStation}`}>
                继续我的征途
              </LinkButton>
            </div>
            <div id="atlas-quiz" tabIndex={-1} className="quiz-invite">
              <Certificate size={45} />
              <h2>你会如何理解这段历史？</h2>
              <p>15 道情境题，逐题解析。完成后生成一张专属学习纪念。</p>
              <button className="text-button" onClick={() => setQuiz(true)}>
                {answered === 15
                  ? "查看结果与证书"
                  : answered
                    ? "继续知识测验"
                    : "开始知识测验"}
                <ArrowRight />
              </button>
            </div>
          </section>
        </>
      )}
      {focus === "tasks" && (
        <>
          {" "}
          <section id="atlas-tasks" tabIndex={-1} className="section">
            <h2>走进当时，做一次选择。</h2>
            <div className="task-grid">
              {(Object.keys(taskNames) as (keyof typeof taskNames)[]).map(
                (key, i) => {
                  const Icon = [Scales, Flag, Boat, Bridge][i];
                  return (
                    <button key={key} onClick={() => setTask(key)}>
                      <Icon size={36} />
                      <span className="task-number">0{i + 1}</span>
                      <h3>{taskNames[key]}</h3>
                      <p>
                        {
                          [
                            "你能背起多少物资？",
                            "当计划遇到新的敌情。",
                            "在黎明前完成一次渡河。",
                            "在有限通道中理解协作。",
                          ][i]
                        }
                      </p>
                      <span className="task-status">
                        {progress.tasks.includes(key) ? (
                          <>
                            <Check />
                            已完成 · 再体验
                          </>
                        ) : (
                          <>
                            进入情境
                            <ArrowRight />
                          </>
                        )}
                      </span>
                    </button>
                  );
                },
              )}
            </div>
          </section>
          <Experiences />
          <div className="station-check-progress">
            <strong>
              {progress.tasks.filter((x) => x.startsWith("station-")).length} /
              22
            </strong>
            <span>站点思考已完成</span>
            <a href="#/journey?mode=archive">继续在地图上思考 →</a>
          </div>
        </>
      )}
      {focus === "reflection" && <Reflection />}
      {focus === "backup" && <ProgressBackup />}
      {focus === "saved" && (
        <>
          {" "}
          <section id="atlas-saved" tabIndex={-1} className="section">
            <div className="tabs">
              <button
                className={tab === "saved" ? "active" : ""}
                onClick={() => setTab("saved")}
              >
                <BookmarkSimple />
                收藏的站点 · {progress.saved.length}
              </button>
              <button
                className={tab === "visited" ? "active" : ""}
                onClick={() => setTab("visited")}
              >
                <Footprints />
                走过的站点 · {progress.visited.length}
              </button>
            </div>
            {ids.length ? (
              <div className="saved-list">
                {ids.map((id) => (
                  <a key={id} href={`#/journey?station=${id}&read=1`}>
                    <span>{String(id).padStart(2, "0")}</span>
                    <div>
                      <strong>{milestones[id - 1].title}</strong>
                      <small>{milestones[id - 1].place}</small>
                    </div>
                    <ArrowRight />
                  </a>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <Backpack size={40} />
                <h3>
                  {tab === "saved"
                    ? "行囊还轻，故事正等着你。"
                    : "第一枚足迹，从一次阅读开始。"}
                </h3>
                <p>
                  在历史站点中点击“收入行囊”收藏，点击“完成这一站”记录阅读。
                </p>
                <a className="text-button" href="#/journey?mode=archive">
                  去地图上走走 <ArrowRight />
                </a>
              </div>
            )}
          </section>
        </>
      )}
      <p className="fineprint centered">
        你的学习记录保存在当前浏览器，无需注册，可在行囊备份中导出。
      </p>
      {task && <TaskDialog task={task} onClose={() => setTask(null)} />}
      {quizOpen && <Quiz onClose={() => setQuiz(false)} />}
    </div>
  );
}
