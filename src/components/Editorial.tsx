import { poetrySongs } from "../poetrySongs";
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
  ArrowSquareOut,
} from "@phosphor-icons/react";
import { stories, poems, sources } from "../data";
import { useProgress } from "../state";
import { ImportantDiscourse } from "./ImportantDiscourse";
import { Packing } from "./Learning";

export function Prologue({ params }: { params: URLSearchParams }) {
  const { setProgress } = useProgress();
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
    <article id="atlas-comparison" tabIndex={-1} className="reader">
      <h2 data-no-narration>当时的处境</h2>
      <p>
        1933年秋，第五次反“围剿”开始。中央苏区面对的压力，既来自国民党军队在兵力和装备上的优势，也来自封锁加紧、物资不足，以及红军军事指挥上的错误。到1934年秋，这些困难使红军难以继续留在原来的根据地作战。
      </p>
      <h3>兵力和装备：双方的条件并不相同</h3>
      <p>
        第五次反“围剿”开始时，中央革命根据地的主力红军有8万多人，国民党方面先以约50万兵力向中央苏区进攻。国民党军队人数较多、装备较好；红军兵力较少、装备较差。这是整个作战区域的总体情况，并不是某一场战斗中同时交战的人数。
      </p>
      <h3>作战方式：堡垒推进，压缩回旋余地</h3>
      <p>
        国民党军队改变了过去长驱直入的办法，采取持久作战和堡垒推进，边修筑工事边向前推进，逐步缩小苏区范围。红军过去依靠灵活机动、集中兵力，曾在敌军总体占优的情况下取得反“围剿”的胜利。
      </p>
      <p>
        但在第五次反“围剿”中，博古、李德等人放弃了此前行之有效的积极防御方针，先采取冒险进攻，要求在根据地之外战胜敌军，受挫后又转向消极防御。红军被要求同装备更好的对手打阵地战、堡垒战，人员和弹药不断消耗，机动作战的长处难以发挥。
      </p>
      <h3>补给和生活：封锁也落在百姓身上</h3>
      <p>
        国民党方面在军事进攻之外，还严控交通和贸易，限制粮食、食盐、布匹、药材等物资进入苏区。苏区既要维持群众生活，又要供应前线；战争造成的损耗和不当的经济政策，又加重了困难。食盐、药品等物资短缺，不只影响军队，也影响普通家庭。
      </p>
      <p>
        苏区军民曾通过发展生产、组织贸易和秘密运输争取补给，缓解了一部分困难，但随着封锁加紧和根据地缩小，物资来源仍然受到很大限制。
      </p>
      <h3>从坚守到转移</h3>
      <p>
        1934年4月，广昌失守，此后根据地继续缩小，军队和群众的负担越来越重。5月，中央书记处决定准备撤出主力；到9月，国民党军队进一步进攻苏区腹地，局面更加困难。10月，中共中央、中革军委率中央红军主力等8.6万余人开始战略转移。
      </p>
      <p>
        因此，长征出发前的处境，不能只用兵力多少来解释。敌军的优势、严密的封锁和红军指挥上的错误共同造成了困局。离开中央苏区，是第五次反“围剿”失利后，为保存力量、寻找新的发展条件而采取的行动。
      </p>
      <section className="source-block" data-no-narration>
        <h3>参考资料</h3>
        <p>
          <a
            href="https://www.12371.cn/2022/04/11/ARTI1649653908063997.shtml"
            target="_blank"
            rel="noreferrer"
          >
            共产党员网：《为什么中央红军要进行战略转移的漫漫长征？》
            <ArrowSquareOut />
          </a>
        </p>
        <p>
          <a
            href="https://www.mem.gov.cn/xw/ztzl/2021/dsxxjy/xxfd/202103/t20210329_382254.shtml"
            target="_blank"
            rel="noreferrer"
          >
            学习时报：《1933：高天滚滚寒流急》（应急管理部转载）
            <ArrowSquareOut />
          </a>
        </p>
        <p>
          <a
            href="https://www.dswxyjy.org.cn/n1/2016/0530/c219021-28393265.html"
            target="_blank"
            rel="noreferrer"
          >
            中央党史和文献研究院：《中央苏区时期的经济封锁与反封锁》
            <ArrowSquareOut />
          </a>
        </p>
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
      <ImportantDiscourse page="stories" params={params} />
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
  const song = poetrySongs[p.title];
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
      <a className="text-button" href={`#/journey?station=${p.station}`}>
        在地图上读这首诗 <ArrowRight />
      </a>
      <PoetryPractice key={`practice-${p.title}`} poem={p} />
      {song && (
        <section className="song-note" aria-label="行军路上，也有歌声">
          <h3>行军路上，也有歌声。</h3>
          <h4 className="poetry-song-title">《{song.title}》</h4>
          <p className="poetry-song-meta">{song.collection}<br />{song.credits}</p>
          {song.lyrics && <div className="poetry-song-lyrics" aria-label="歌词">
            {song.lyrics.split("\n\n").map((stanza, index) => <p key={index}>{stanza}</p>)}
          </div>}
          <p>{song.background}</p>
          <p>{song.connection}</p>
          <a className="text-button" href={song.video.url} target="_blank" rel="noreferrer">
            {song.video.label}<ArrowSquareOut />
          </a>
          <p className="fineprint" data-no-narration>
            曲目资料：<a href={song.source.url} target="_blank" rel="noreferrer">{song.source.title}</a>
          </p>
        </section>
      )}
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
