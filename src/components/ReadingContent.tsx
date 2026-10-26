import { useState, useEffect } from "react";
import {
  MagnifyingGlassPlus,
  Minus,
  Plus,
  BookOpen,
} from "@phosphor-icons/react";
import content from "../content.json";

function Inline({ text }: { text: string }) {
  return (
    <>
      {text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).map((s, i) =>
        s.startsWith("**") ? (
          <strong key={i}>{s.slice(2, -2)}</strong>
        ) : s.startsWith("`") ? (
          <span className="data-ink" key={i}>
            {s.slice(1, -1)}
          </span>
        ) : (
          s
        ),
      )}
    </>
  );
}
/** Renders trusted editorial text as React nodes; never evaluates embedded HTML. */
export function RichText({ text }: { text: string }) {
  const lines = text.split("\n");
  const blocks: React.ReactNode[] = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line || line === "---") continue;
    if (line.startsWith("|")) {
      const table: string[][] = [];
      while (i < lines.length && lines[i].trim().startsWith("|")) {
        const row = lines[i]
          .trim()
          .split("|")
          .slice(1, -1)
          .map((s) => s.trim());
        if (!row.every((s) => /^[- :]+$/.test(s))) table.push(row);
        i++;
      }
      i--;
      blocks.push(
        <div className="reading-table-group" key={i}>
          <div
            className="reading-table"
            tabIndex={0}
            role="region"
            aria-label="横向滚动查看完整对照表"
          >
            <table>
              <thead>
                <tr>
                  {table[0]?.map((c, j) => (
                    <th scope="col" key={j}>
                      <Inline text={c} />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {table.slice(1).map((row, j) => (
                  <tr key={j}>
                    {row.map((c, k) => (
                      <td key={k}>
                        <Inline text={c} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div
            className="reading-table-cards"
            role="list"
            aria-label="逐项对照"
          >
            {table.slice(1).map((row, j) => (
              <div className="reading-table-card" role="listitem" key={j}>
                <dl>
                  {row.map((c, k) => (
                    <div className="reading-card-field" key={k}>
                      <dt>
                        <Inline text={table[0]?.[k] || `第${k + 1}项`} />
                      </dt>
                      <dd>
                        <Inline text={c} />
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            ))}
          </div>
        </div>,
      );
      continue;
    }
    if (/^#{1,6} /.test(line)) {
      blocks.push(
        <h3 key={i}>
          <Inline text={line.replace(/^#+ /, "")} />
        </h3>,
      );
      continue;
    }
    if (line.startsWith(">")) {
      blocks.push(
        <blockquote key={i}>
          <Inline text={line.replace(/^>\s*/, "")} />
        </blockquote>,
      );
      continue;
    }
    const prose = line.replace(/^\* /, "").replace(/^\d+\. /, "");
    const sentences = prose.match(/[^。！？]+[。！？]?[”」]?/g) || [prose];
    let paragraph = "";
    const chunks: string[] = [];
    sentences.forEach((s) => {
      paragraph += s;
      if (paragraph.length > 170) {
        chunks.push(paragraph);
        paragraph = "";
      }
    });
    if (paragraph) chunks.push(paragraph);
    chunks.forEach((p, j) =>
      blocks.push(
        <p
          key={`${i}-${j}`}
          className={
            /^\*\*[^*]+\*\*$/.test(p.trim()) ? "reading-subtitle" : undefined
          }
        >
          <Inline text={p} />
        </p>,
      ),
    );
  }
  return <div className="rich-text">{blocks}</div>;
}
export function ReadingChapters({
  chapters,
  label = "深入阅读",
  initialActive = 0,
}: {
  chapters: { title: string; text: string }[];
  label?: string;
  initialActive?: number;
}) {
  const [active, setActive] = useState(initialActive);
  useEffect(() => setActive(initialActive), [initialActive]);
  const [size, setSize] = useState(18);
  return (
    <section id="atlas-reading" tabIndex={-1} className="deep-reading section">
      <div className="section-heading">
        <div>
          <span className="chapter-label">读完整段历史</span>
          <h2>{label}</h2>
        </div>
        <span className="reading-count">
          {chapters.reduce((n, c) => n + c.text.length, 0).toLocaleString()} 字
          · 完整阅读
        </span>
      </div>
      <div className="reading-columns">
        <nav aria-label={`${label}目录`}>
          {chapters.map((c, i) => (
            <button
              key={c.title}
              aria-current={active === i ? "true" : undefined}
              className={active === i ? "active" : ""}
              onClick={() => setActive(i)}
            >
              <small>{String(i + 1).padStart(2, "0")}</small>
              <span>{c.title}</span>
            </button>
          ))}
        </nav>
        <article style={{ fontSize: size }}>
          <div className="reading-tools">
            <span>历史阅读 · 情境重述</span>
            <button
              aria-label="缩小正文"
              disabled={size <= 16}
              onClick={() => setSize((s) => s - 1)}
            >
              <Minus />
            </button>
            <button
              aria-label="放大正文"
              disabled={size >= 24}
              onClick={() => setSize((s) => s + 1)}
            >
              <Plus />
            </button>
          </div>
          <RichText text={chapters[active]?.text || ""} />
        </article>
      </div>
    </section>
  );
}
export function StationChapters({ id }: { id: number }) {
  const s = content.stations[id - 1];
  return (
    <div className="station-chapters">
      {s.sections.map((b, i) => (
        <section key={b.title}>
          <h3>
            <small>{String(i + 1).padStart(2, "0")}</small>
            {b.title}
          </h3>
          <RichText text={b.text} />
        </section>
      ))}
    </div>
  );
}
export function ArtifactViewer({ id }: { id: number }) {
  const [zoom, setZoom] = useState(false);
  const s = content.stories[id - 1];
  return (
    <figure
      className={`artifact-viewer ${zoom ? "is-zoomed" : ""}`}
      data-no-narration
    >
      <button
        onClick={() => setZoom((z) => !z)}
        aria-label={zoom ? "还原藏品图片" : "放大藏品图片"}
        aria-pressed={zoom}
      >
        <img
          src={`/assets/object-${String(id).padStart(2, "0")}.webp`}
          alt={s.object}
          width="1536"
          height="1024"
        />
        <span>
          <MagnifyingGlassPlus />
          {zoom ? "点击还原" : "点击细看"}
        </span>
      </button>
      <figcaption>
        {s.object.replace("（现存中国国家博物馆）", "")}
        <small>AI 艺术再现 · 非馆藏实物照片</small>
      </figcaption>
    </figure>
  );
}
export function ContentNote({ storyId }: { storyId?: number }) {
  const notes: Record<number, string> = {
    1: "《金色的鱼钩》是长征题材文学叙事；老班长的对白与具体情节不能作为逐字档案。",
    2: "《丰碑》属于文学作品，本篇为主题重述；人物与对白应在文学语境中理解。",
    3: "本篇采用纪念叙事版本。红四方面军此段过草地发生于1936年，不能与1935年中央红军行程混为一谈。",
    4: "《七根火柴》为王愿坚的短篇小说，卢进勇是作品人物。",
    7: "本叙事中“小兰”的姓名、年龄和战斗对白尚缺独立史料核证，本篇作为情境叙事呈现。",
    8: "钟赤兵的行程包含战友抬担架、骑马与拄拐等多种方式，不宜理解为全程独自单腿步行。",
    11: "辣椒汤反映物资匮乏中的生活经验，不能防止失温，也不能替代保暖、食物与医疗。",
    17: "薄复礼与勃沙特是同一位传教士的不同中文译名。",
  };
  return (
    <aside className="content-note" data-no-narration>
      <BookOpen />
      <p>
        {(storyId && notes[storyId]) ||
          "本篇采用纪念叙事与文学重述的完整版本。叙事性对白、人数和具体细节不作为逐字档案；阅读时请区分文学重述、回忆资料与可核对的事实。"}
      </p>
    </aside>
  );
}
export { content };
