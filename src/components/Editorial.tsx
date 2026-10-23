import { useState, useEffect } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  MagnifyingGlass,
  Check,
  SpeakerHigh,
  Stop,
  Quotes,
  ArrowSquareOut,
} from "@phosphor-icons/react";
import { stories, poems, sources } from "../data";
import { go, useProgress } from "../state";
import { PageHead, Reveal, Dialog, LinkButton } from "./UI";
import { Packing } from "./Learning";
export function Prologue() {
  const { setProgress } = useProgress();
  const [comparison, setComparison] = useState(0);
  const comparisons = [
    {
      title: "兵力",
      left: "8.6万余",
      right: "约50万",
      unit: "出发时中央红军人数 / 直接进攻中央苏区兵力",
      text: "两组数字对应不同时间与统计范围，不能直接当作同一战场上的兵力对比。它们帮助理解战略转移前后的力量条件。",
    },
    {
      title: "战略",
      left: "运动战",
      right: "堡垒推进",
      unit: "集中优势、灵活机动 / 逐步压缩根据地",
      text: "第五次反“围剿”中，对方采用堡垒推进与经济封锁。红军此前有效的机动作战经验，没有得到充分发挥。",
    },
    {
      title: "补给",
      left: "日渐困难",
      right: "封锁加紧",
      unit: "粮食、盐与药品短缺 / 根据地空间持续收缩",
      text: "战争不是只有前线交战。封锁使普通人的生活和军队供给一起承压，失去回旋空间后，战略转移成为选择。",
    },
  ];
  const c = comparisons[comparison];
  return (
    <main className="page-wrap">
      <PageHead
        number="02"
        title="为什么，必须出发？"
        en="BEFORE THE JOURNEY"
        subtitle="理解长征，先回到那场告别发生之前。"
      />
      <div className="prologue-lead">
        <div>
          <span className="large-year">1934</span>
          <span className="chapter-label">中央苏区 · 秋</span>
          <h2>
            不是为了远行，
            <br />
            是为了找到生路。
          </h2>
          <p>
            第五次反“围剿”失利，中央革命根据地不断缩小。军事上的被动，与生活中的匮乏一起逼近。
          </p>
          <p>
            1934年10月，中央红军主力离开根据地，开始战略转移。当时的人们，还不知道这会成为一段跨越万水千山的长征。
          </p>
          <a className="text-button" href="#/journey?station=1&read=1">
            走向于都河畔 <ArrowRight />
          </a>
        </div>
        <figure>
          <img
            src="/assets/relics.webp"
            alt="以草鞋、灯笼和旧笔记呈现行军生活的艺术插画"
            width="1536"
            height="1024"
          />
          <figcaption>
            一双草鞋，一些干粮，一次不知道归期的告别。<span>AI 艺术演绎</span>
          </figcaption>
        </figure>
      </div>
      <section className="section">
        <Reveal>
          <h2>把当时的处境，摆在一起看。</h2>
          <div className="tabs">
            {comparisons.map((x, i) => (
              <button
                key={x.title}
                onClick={() => setComparison(i)}
                className={comparison === i ? "active" : ""}
              >
                {x.title}
              </button>
            ))}
          </div>
          <div className="comparison">
            <div>
              <span>红军与中央苏区</span>
              <strong>{c.left}</strong>
            </div>
            <span className="comparison-divider">与</span>
            <div>
              <span>围堵与封锁</span>
              <strong>{c.right}</strong>
            </div>
          </div>
          <p className="centered fineprint">{c.unit}</p>
          <p className="comparison-explanation" aria-live="polite">
            {c.text}
          </p>
        </Reveal>
      </section>
      <section className="section departure">
        <div className="section-heading">
          <h2>
            离开之前，
            <br />
            他们带上了什么？
          </h2>
          <p>过多的辎重，让行军变得缓慢。亲手打包一次，理解取舍的困难。</p>
        </div>
        <Packing
          onComplete={() =>
            setProgress((p) => ({
              ...p,
              tasks: [...new Set([...p.tasks, "pack"])],
            }))
          }
        />
      </section>
      <section className="source-block">
        <h3>这一章从哪里来</h3>
        <p>
          宏观背景参考公开党史资料。兵力数字须结合统计时间与范围理解，叙事中的概述不作为逐字历史记录。
        </p>
        <a href={sources[0].url} target="_blank" rel="noreferrer">
          {sources[0].title}
          <ArrowSquareOut />
        </a>
      </section>
    </main>
  );
}
export function Stories({ params }: { params: URLSearchParams }) {
  const [filter, setFilter] = useState("全部");
  const [search, setSearch] = useState("");
  const { progress, setProgress } = useProgress();
  const id = Number(params.get("story"));
  const story = stories.find((s) => s.id === id);
  const filtered = stories.filter(
    (s) =>
      (filter === "全部" || s.kind === filter) &&
      `${s.title}${s.subtitle}${s.object}`.includes(search.trim()),
  );
  return (
    <main className="page-wrap stories-page">
      <PageHead
        number="05"
        title="篝火夜话"
        en="HUMAN STORIES"
        subtitle="把目光从山河移向人。历史的温度，藏在一件件小事里。"
      />
      <div className="story-feature">
        <img
          src="/assets/relics.webp"
          alt="草鞋、油灯与行军笔记的艺术演绎"
          width="1536"
          height="1024"
        />
        <div>
          <span className="chapter-label">二十个故事 · 二十种靠近</span>
          <h2>
            他们也曾想家，
            <br />
            也会感到寒冷。
          </h2>
          <p>
            一枚鱼钩，一根火柴，一双草鞋。小小的物件，装着人与人之间的托付。
          </p>
          <button
            className="text-button"
            onClick={() => go("stories", { story: 1 })}
          >
            从一枚鱼钩说起 <ArrowUpRight />
          </button>
        </div>
        <span className="art-note">AI 艺术演绎</span>
      </div>
      <div className="story-toolbar">
        <div className="tabs">
          {["全部", "文学与记忆", "行军百态"].map((t) => (
            <button
              key={t}
              className={t === filter ? "active" : ""}
              onClick={() => setFilter(t)}
            >
              {t}
              {t === "全部" ? " · 20" : ""}
            </button>
          ))}
        </div>
        <label className="search-input">
          <MagnifyingGlass />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="寻找故事、人物或物件…"
            aria-label="搜索故事"
          />
          {search && (
            <button aria-label="清空搜索" onClick={() => setSearch("")}>
              ×
            </button>
          )}
        </label>
      </div>
      <div className="story-grid">
        {filtered.map((s) => (
          <Reveal key={s.id}>
            <button
              className="story-card"
              onClick={() => go("stories", { story: s.id })}
            >
              <div className="story-card-meta">
                <span>{s.kind}</span>
                <span>
                  {progress.stories.includes(s.id) ? (
                    <Check />
                  ) : (
                    String(s.id).padStart(2, "0")
                  )}
                </span>
              </div>
              <span className="story-object" aria-hidden="true">
                {s.object}
              </span>
              <h3>{s.title}</h3>
              <p>{s.subtitle}</p>
              <span className="story-read">
                读这个故事 <ArrowUpRight />
              </span>
            </button>
          </Reveal>
        ))}
      </div>
      {!filtered.length && (
        <div className="empty-state">
          <MagnifyingGlass size={35} />
          <h3>还没有找到这个故事。</h3>
          <p>试试“草鞋”“鱼钩”或“军号”。</p>
          <button
            className="text-button"
            onClick={() => {
              setSearch("");
              setFilter("全部");
            }}
          >
            查看全部故事 <ArrowRight />
          </button>
        </div>
      )}
      <p className="editorial-note">
        文学让我们靠近情感，史料让我们核对事实。每篇故事都说明自己的叙述性质。
      </p>
      {story && (
        <Dialog title="篝火夜话" onClose={() => go("stories")}>
          <article className="reader">
            <span className="chapter-label">
              {story.kind} · 故事 {String(story.id).padStart(2, "0")}
            </span>
            <h2>{story.title}</h2>
            <p className="reader-subtitle">{story.subtitle}</p>
            {story.body.map((p) => (
              <p key={p}>{p}</p>
            ))}
            <aside className="insight">
              <BookOpen />
              <div>
                <span>阅读提示</span>
                <p>
                  本篇为主题阅读。文学情节与纪念叙事不等同于逐字档案记录；具体细节应结合原作品、回忆录与相关史料核对。
                </p>
              </div>
            </aside>
            <div className="reader-actions">
              <button
                className="button"
                onClick={() =>
                  setProgress((p) => ({
                    ...p,
                    stories: [...new Set([...p.stories, story.id])],
                  }))
                }
              >
                {progress.stories.includes(story.id) ? (
                  <>
                    <Check />
                    已记入行囊
                  </>
                ) : (
                  <>
                    读完这个故事
                    <Check />
                  </>
                )}
              </button>
              <a
                className="text-button"
                href={`#/journey?station=${story.station}`}
              >
                回到相关站点 <ArrowRight />
              </a>
            </div>
          </article>
        </Dialog>
      )}
    </main>
  );
}
export function Poetry({ params }: { params: URLSearchParams }) {
  const n = Number(params.get("poem"));
  const active = n >= 0 && n < poems.length ? Math.floor(n) : 0;
  const [reading, setReading] = useState(false);
  const [status, setStatus] = useState("");
  const [highlight, setHighlight] = useState(-1);
  const p = poems[active];
  useEffect(() => {
    window.speechSynthesis?.cancel();
    setReading(false);
    setHighlight(-1);
    return () => window.speechSynthesis?.cancel();
  }, [active]);
  function speak() {
    if (!("speechSynthesis" in window)) {
      setStatus("当前浏览器不支持朗读，可以逐句阅读。");
      return;
    }
    if (reading) {
      window.speechSynthesis.cancel();
      setReading(false);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(p.lines.join("。"));
    utterance.lang = "zh-CN";
    utterance.rate = 0.75;
    utterance.onend = () => setReading(false);
    utterance.onerror = () => {
      setReading(false);
      setStatus("朗读暂时不可用，请检查浏览器的中文语音。");
    };
    setStatus("使用当前设备的中文语音朗读");
    setReading(true);
    window.speechSynthesis.speak(utterance);
  }
  return (
    <main className="page-wrap poetry-page">
      <PageHead
        number="07"
        title="诗意长征"
        en="WORDS THAT ENDURE"
        subtitle="那些无法只用里程丈量的山河，被写进了诗里。"
      />
      <div className="poetry-layout">
        <aside className="poem-index">
          <span>毛泽东长征诗词</span>
          {poems.map((poem, i) => (
            <a
              key={poem.title}
              href={`#/poetry?poem=${i}`}
              className={active === i ? "active" : ""}
            >
              <small>0{i + 1}</small>
              {poem.title}
              <ArrowRight />
            </a>
          ))}
          <p className="fineprint">
            《十六字令三首》合并展示
            <br />
            点击诗句可突出阅读
          </p>
        </aside>
        <div className="poem-paper">
          <div className="poem-landscape" />
          <div className="poem-meta">
            <span>{p.year}</span>
            <span>毛泽东</span>
          </div>
          <h2>{p.title}</h2>
          <div className="poem-lines">
            {p.lines.map((line, i) => (
              <button
                key={line}
                className={highlight === i ? "highlighted" : ""}
                onClick={() => setHighlight(highlight === i ? -1 : i)}
              >
                {line}
              </button>
            ))}
          </div>
          <div className="poem-bottom">
            <span>{p.location}</span>
            <button className="text-button" onClick={speak}>
              {reading ? <Stop /> : <SpeakerHigh />}
              {reading ? "停止朗读" : "听这首诗"}
            </button>
          </div>
          <p className="fineprint" role="status">
            {status}
          </p>
        </div>
      </div>
      <section className="poem-commentary">
        <Quotes size={32} />
        <div>
          <h3>把山河，读进诗里。</h3>
          <p>{p.note}</p>
          <a className="text-button" href={`#/journey?station=${p.station}`}>
            在地图上读这首诗 <ArrowRight />
          </a>
        </div>
      </section>
      <section className="song-note">
        <h3>行军路上，也有歌声。</h3>
        <p>
          红军战地歌谣以容易传唱的语言记录行军、宣传纪律、鼓舞士气。与诗词的个人抒情不同，歌谣常在集体演唱与改编中流传。研究时需要标注版本与采录来源。
        </p>
      </section>
    </main>
  );
}
export function Meaning() {
  const [open, setOpen] = useState<number | null>(null);
  const misconceptions = [
    [
      "长征，是一条路线吗？",
      "不是。红一、红二、红四方面军和红二十五军的出发地、行程、时间并不相同。本站的22站主线以中央红军为中心，并延伸至三大主力会师。",
    ],
    [
      "“两万五千里”适用于每一支队伍吗？",
      "它通常用于概括中央红军长征行程。其他队伍有不同的路径与里程统计，不应套用同一个数字。",
    ],
    [
      "1935年与1936年，哪个才是结束？",
      "1935年10月中央红军到达陕北；1936年10月三大主力会师，标志着红军长征胜利结束。要先明确讨论的对象。",
    ],
    [
      "故事里的每一句话，都能当作史料吗？",
      "不能。文学作品、口述回忆、纪念叙事与同期档案有不同性质。感受故事的价值，并不意味着放弃来源核对。",
    ],
  ];
  return (
    <main className="page-wrap meaning-page">
      <PageHead
        number="06"
        title="长征回响"
        en="BEYOND THE JOURNEY"
        subtitle="长征结束了，关于勇气、选择与共同前行的思考没有结束。"
      />
      <div className="meaning-opening">
        <span className="seal">回望</span>
        <h2>
          走过的路，
          <br />
          成为后来人的光。
        </h2>
        <p>
          从战略转移到开辟新的局面，长征保存和锻炼了革命力量，也让沿途的人们认识了这支队伍。
        </p>
      </div>
      {[
        {
          word: "宣言书",
          line: "在绝境中，证明仍有可能。",
          body: "跨越封锁与自然险阻，意味着这支队伍没有被困境终结。“宣言书”强调的是行动本身向外界传递的意志与力量。",
        },
        {
          word: "宣传队",
          line: "让人们在相遇中，认识彼此。",
          body: "纪律、政策、宣传与日常交往，让沿途群众以具体经验认识红军。传播不只发生在口号里，也发生在一次公平交易、一次帮助和一段共同生活里。",
        },
        {
          word: "播种机",
          line: "一些影响，在离开之后继续生长。",
          body: "组织、观念与联系，在沿途留下种子。长征的影响超出行军本身，进入地方社会与后续革命进程。",
        },
      ].map((x, i) => (
        <Reveal className="meaning-chapter" key={x.word}>
          <div>
            <small>0{i + 1}</small>
            <span>{x.word}</span>
          </div>
          <article>
            <h3>{x.line}</h3>
            <p>{x.body}</p>
          </article>
        </Reveal>
      ))}
      <p className="fineprint">
        三个比喻出自毛泽东《论反对日本帝国主义的策略》（1935年12月），本页为现代语言释义。
      </p>
      <section className="section">
        <h2>多问一步，才能看得更完整。</h2>
        <div className="questions-list">
          {misconceptions.map(([q, a], i) => (
            <div key={q}>
              <button
                onClick={() => setOpen(open === i ? null : i)}
                aria-expanded={open === i}
              >
                {q}
                <span>{open === i ? "−" : "+"}</span>
              </button>
              {open === i && <p>{a}</p>}
            </div>
          ))}
        </div>
      </section>
      <section className="meaning-end">
        <h2>今天的你，会带走什么？</h2>
        <p>尊重事实的耐心、改变计划的勇气，或是照顾身边人的自觉。</p>
        <LinkButton href="#/learn">把理解留在行囊里</LinkButton>
      </section>
    </main>
  );
}
