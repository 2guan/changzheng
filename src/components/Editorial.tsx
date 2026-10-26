import { meaningAnniversary } from "../meaningAnniversary";
import { NarrateButton } from "../audio";
import {
  RichText,
  ArtifactViewer,
  ContentNote,
  content,
} from "./ReadingContent";
import { Reflection } from "./Experiences";
import { PoetryPractice } from "./PoetryPractice";
import { useState, useEffect } from "react";
import {
  ArrowRight,
  BookOpen,
  Check,
  Quotes,
  ArrowSquareOut,
} from "@phosphor-icons/react";
import { stories, poems, sources } from "../data";
import { useProgress } from "../state";
import { Reveal } from "./UI";
import { Packing } from "./Learning";

export function Prologue({ params }: { params: URLSearchParams }) {
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
  const focus = params.get("focus");
  if (focus?.startsWith("chapter-")) {
    const chapter = content.prologue[focus === "chapter-1" ? 1 : 0];
    return (
      <article className="reader">
        <h2 data-no-narration>{chapter.title}</h2>
        <RichText text={chapter.text} />{" "}
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
      </article>
    );
  }
  if (focus === "packing")
    return (
      <article className="topic-content">
        <h2 data-no-narration>整理行囊</h2>
        <p>过多的辎重，让行军变得缓慢。亲手打包一次，理解取舍的困难。</p>
        <Packing
          onComplete={() =>
            setProgress((p) => ({
              ...p,
              tasks: [...new Set([...p.tasks, "pack"])],
            }))
          }
        />
      </article>
    );
  return (
    <article className="topic-content">
      {" "}
      <section id="atlas-comparison" tabIndex={-1} className="section">
        <Reveal>
          <h2 data-no-narration>把当时的处境，摆在一起看。</h2>
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
    </article>
  );
}

export function Stories({ params }: { params: URLSearchParams }) {
  const { progress, setProgress } = useProgress();
  const story =
    stories.find((s) => s.id === Number(params.get("story"))) || stories[0];
  return (
    <article className="reader">
      <span className="chapter-label" data-no-narration>
        {story.kind} · 故事 {String(story.id).padStart(2, "0")}
      </span>
      <h2 data-no-narration>{story.title}</h2>
      <p className="reader-subtitle" data-no-narration>
        {story.subtitle}
      </p>
      <ArtifactViewer id={story.id} />
      <ContentNote storyId={story.id} />
      <RichText text={content.stories[story.id - 1].text} />
      <aside className="insight">
        <BookOpen />
        <div>
          <span>教育微点拨</span>
          <p>{content.stories[story.id - 1].insight}</p>
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
        <a className="text-button" href={`#/journey?station=${story.station}`}>
          回到相关站点 <ArrowRight />
        </a>
      </div>
    </article>
  );
}

export function Poetry({ params }: { params: URLSearchParams }) {
  const n = Number(params.get("poem"));
  const active = n >= 0 && n < poems.length ? Math.floor(n) : 0;
  const [highlight, setHighlight] = useState(-1);
  const p = poems[active];
  useEffect(() => setHighlight(-1), [active]);
  return (
    <article className="topic-content poetry-detail">
      <div className="poetry-layout">
        <div className="poem-paper">
          <div className="poem-landscape" />
          <div className="poem-meta" data-no-narration>
            <span>{p.year}</span>
            <span>毛泽东</span>
          </div>
          <h2 data-no-narration>{p.title}</h2>
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
          <div className="poem-bottom" data-no-narration>
            <span>{p.location}</span>
            <NarrateButton
              id={`poem-${active}`}
              text={`${p.lines.join("。")}。`}
              label="听这首诗"
            />
          </div>
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
      <section className="reader">
        <h3>写诗背景与白话解读</h3>
        <RichText
          text={content.poems.find((x) => x.title === p.title)?.text || p.note}
        />
        {p.source && (
          <p className="fineprint">
            史料出处：
            <a href={p.source.url} target="_blank" rel="noreferrer">
              {p.source.title}
            </a>
          </p>
        )}
      </section>
      <PoetryPractice key={`practice-${p.title}`} poem={p} />
      <section className="song-note">
        <h3>行军路上，也有歌声。</h3>
        <p>
          歌谣把月份、地点与行军记忆连成容易传唱的句子。以下为长征题材歌谣节选；流传版本需结合出处核对。
        </p>
        <RichText text={content.songs} />
      </section>
    </article>
  );
}

export function Meaning({ params }: { params: URLSearchParams }) {
  const focus = params.get("focus");
  if (focus === "reflection")
    return (
      <div className="topic-content">
        <Reflection />
      </div>
    );
  if (focus === "anniversary" || focus === "questions")
    return (
      <article className="reader">
        <div className="reader-date" data-no-narration>
          {meaningAnniversary.date} · 讲话要点导读
        </div>
        <h2 data-no-narration>{meaningAnniversary.title}</h2>
        <p className="reader-subtitle" data-no-narration>
          {meaningAnniversary.sourceTitle}
        </p>
        <p className="fineprint">
          参考人民网专题摘编整理；“要点概述”“历史对照”“导读”为本站编写，非逐字原文。
        </p>
        <RichText text={meaningAnniversary.text} />
        <p className="fineprint">
          参考来源：{meaningAnniversary.source}；
          {meaningAnniversary.excerpts.source}《
          {meaningAnniversary.excerpts.title}》（
          {meaningAnniversary.excerpts.date}）。
        </p>
        <a
          className="text-button"
          href={meaningAnniversary.url}
          target="_blank"
          rel="noreferrer"
        >
          阅读讲话原文 <ArrowSquareOut />
        </a>
      </article>
    );
  const chapter = content.meaning[focus === "chapter-1" ? 1 : 0];
  return (
    <article className="reader">
      <h2 data-no-narration>{chapter.title}</h2>
      <RichText text={chapter.text} />
    </article>
  );
}
