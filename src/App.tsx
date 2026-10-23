import { useEffect, useState, Suspense, lazy } from "react";
import {
  MotionConfig,
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";
import {
  ArrowRight,
  ArrowUpRight,
  Compass,
  Backpack,
  MagnifyingGlass,
  List,
  MapTrifold,
  BookOpen,
  Mountains,
  Flag,
  Notebook,
  ArrowSquareOut,
  Footprints,
} from "@phosphor-icons/react";
import { modules, milestones, stories, sources } from "./data";
import { ProgressProvider, useProgress, useRoute, go } from "./state";
import { Reveal, Dialog, LinkButton } from "./components/UI";
import { RouteMap } from "./components/RouteMap";
const Journey = lazy(() =>
  import("./components/Journey").then((m) => ({ default: m.Journey })),
);
const Armies = lazy(() =>
  import("./components/Journey").then((m) => ({ default: m.Armies })),
);
const Prologue = lazy(() =>
  import("./components/Editorial").then((m) => ({ default: m.Prologue })),
);
const Stories = lazy(() =>
  import("./components/Editorial").then((m) => ({ default: m.Stories })),
);
const Poetry = lazy(() =>
  import("./components/Editorial").then((m) => ({ default: m.Poetry })),
);
const Meaning = lazy(() =>
  import("./components/Editorial").then((m) => ({ default: m.Meaning })),
);
const Learning = lazy(() =>
  import("./components/Learning").then((m) => ({ default: m.Learning })),
);
function Home() {
  const { progress } = useProgress();
  const reduced = useReducedMotion();
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 800], [0, 90]);
  return (
    <main className="home">
      <section className="hero">
        <motion.img
          className="hero-art"
          src="/assets/hero.webp"
          alt="水墨山川间，一支微小的行军队伍沿山路向前"
          width="1536"
          height="1024"
          fetchPriority="high"
          style={{ y: reduced ? 0 : y }}
        />
        <div className="hero-wash" />
        <div className="hero-content">
          <motion.div
            initial={reduced ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="hero-eyebrow">
              <span className="red-line" />
              一段改变中国的远征<span className="hero-years">1934 — 1936</span>
            </div>
            <h1>
              重走
              <span>
                长征路<span className="title-seal">不忘初心</span>
              </span>
            </h1>
            <p>
              循着先辈的足迹，走进山河深处。
              <br />
              在每一次选择与跋涉中，读懂长征。
            </p>
            <div className="hero-actions">
              <LinkButton href={`#/journey?station=${progress.lastStation}`}>
                {progress.visited.length ? "继续我的征途" : "开启我的征途"}
              </LinkButton>
              <a className="hero-secondary" href="#/prologue">
                <span>
                  <BookOpen size={20} />
                </span>
                从历史序幕读起
                <ArrowRight size={17} />
              </a>
            </div>
          </motion.div>
        </div>
        <div className="hero-side-note">
          <span>山河为证</span>
          <i />
          <span>初心如炬</span>
        </div>
        <div className="hero-coordinates">
          <Compass size={28} weight="thin" />
          <div>
            起点 · 江西于都<small>25°57′N · 115°25′E</small>
          </div>
        </div>
        <span className="hero-art-credit">山河长卷 · AI 艺术演绎</span>
        <div className="hero-bottom-line" />
      </section>
      <section className="journey-stats" aria-label="长征学习概览">
        <div>
          <strong>
            25,000<span>里</span>
          </strong>
          <p>用脚步丈量的信仰</p>
        </div>
        <div>
          <strong>
            22<span>站</span>
          </strong>
          <p>走进关键历史现场</p>
        </div>
        <div>
          <strong>
            4<span>支</span>
          </strong>
          <p>奔向同一个方向</p>
        </div>
        <div>
          <strong>
            20<span>篇</span>
          </strong>
          <p>有温度的人与故事</p>
        </div>
        <div className="stats-note">
          <span>不是遥远的历史</span>
          <strong>是一群人的真实前行。</strong>
        </div>
      </section>
      <section className="section home-route">
        <Reveal>
          <div className="section-heading">
            <p className="small-label">把历史，放回山河之间</p>
            <h2>
              万水千山，
              <br />
              每一程都有答案。
            </h2>
            <p>
              从于都河畔的告别，到西北高原的重逢。
              <br />
              点开地图上的一站，让抽象的历史变成具体的现场。
            </p>
          </div>
        </Reveal>
        <Reveal className="home-map-wrap">
          <RouteMap
            active={1}
            onSelect={(id) => go("journey", { station: id })}
            compact
          />
          <a className="map-entry" href="#/journey">
            <span>
              <MapTrifold size={24} />
              探索完整长征路线
            </span>
            <ArrowUpRight size={24} />
          </a>
        </Reveal>
      </section>
      <section className="section home-stories">
        <Reveal className="story-image">
          <img
            src="/assets/relics.webp"
            alt="草鞋与灯火中的行军生活艺术插画"
            width="1536"
            height="1024"
            loading="lazy"
          />
          <span className="image-caption">AI 艺术演绎</span>
        </Reveal>
        <Reveal className="story-invitation">
          <span className="small-label">篝火夜话</span>
          <h2>
            大历史里，
            <br />
            小小的你我。
          </h2>
          <p>
            我们记得山河与战役，
            <br />
            也记得一双草鞋、一根火柴、半条被子。
          </p>
          <p className="muted">把视线放低一点，靠近那些普通人的勇气。</p>
          <a className="text-button" href="#/stories">
            围坐下来，听一个故事 <ArrowRight />
          </a>
        </Reveal>
      </section>
      <section className="section home-directory">
        <Reveal>
          <div className="section-heading">
            <h2>八扇门，一段完整的长征。</h2>
            <p>你可以顺着历史向前，也可以从最感兴趣的地方走进去。</p>
          </div>
        </Reveal>
        <div className="module-directory">
          {modules.slice(1).map((m, i) => (
            <a key={m.id} href={`#/${m.id}`}>
              <span>0{i + 2}</span>
              <div>
                <h3>{m.name}</h3>
                <p>{m.desc}</p>
              </div>
              <ArrowUpRight />
            </a>
          ))}
          <div className="directory-note">
            <Compass size={32} weight="thin" />
            <p>
              让每一次探索，
              <br />
              都成为自己的理解。
            </p>
          </div>
        </div>
      </section>
      <Reveal className="home-poem">
        <span>七律 · 长征</span>
        <p>
          更喜岷山千里雪，
          <br />
          三军过后尽开颜。
        </p>
        <a href="#/poetry">
          在诗句里，重读这段山河 <ArrowUpRight />
        </a>
      </Reveal>
    </main>
  );
}
function Search({ onClose }: { onClose: () => void }) {
  const [q, setQ] = useState("");
  const term = q.trim();
  const results = term
    ? [
        ...milestones
          .filter((m) => `${m.title}${m.place}${m.summary}`.includes(term))
          .map((m) => ({
            title: m.title,
            meta: `历史坐标 · ${m.place}`,
            href: `#/journey?station=${m.id}&read=1`,
          })),
        ...stories
          .filter((s) => `${s.title}${s.subtitle}`.includes(term))
          .map((s) => ({
            title: s.title,
            meta: "篝火夜话",
            href: `#/stories?story=${s.id}`,
          })),
        ...modules
          .filter((m) => m.name.includes(term))
          .map((m) => ({ title: m.name, meta: "网站模块", href: `#/${m.id}` })),
      ]
    : [];
  return (
    <Dialog title="寻找历史坐标" onClose={onClose}>
      <div className="global-search">
        <label>
          <MagnifyingGlass />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="搜索地点、事件或故事…"
            aria-label="全站搜索"
          />
        </label>
        {!term ? (
          <div className="search-suggestions">
            <p>从一个熟悉的名字开始</p>
            {["遵义", "赤水", "草地", "草鞋", "于都"].map((t) => (
              <button key={t} onClick={() => setQ(t)}>
                {t}
                <ArrowUpRight />
              </button>
            ))}
          </div>
        ) : (
          <>
            <p className="fineprint">找到 {results.length} 个相关内容</p>
            <div className="search-results">
              {results.map((r) => (
                <a href={r.href} key={r.href} onClick={onClose}>
                  <div>
                    <strong>{r.title}</strong>
                    <small>{r.meta}</small>
                  </div>
                  <ArrowRight />
                </a>
              ))}
              {!results.length && (
                <p className="empty-state">
                  没有找到相关内容，试试其他关键词。
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </Dialog>
  );
}
function Site() {
  const { page, params } = useRoute();
  const [menu, setMenu] = useState(false);
  const [search, setSearch] = useState(false);
  const [about, setAbout] = useState(false);
  const { progress } = useProgress();
  const valid = modules.some((m) => m.id === page);
  useEffect(() => {
    setMenu(false);
    window.scrollTo({ top: 0, behavior: "instant" });
    document.title = `${modules.find((m) => m.id === page)?.name || "页面未找到"} · 重走长征路`;
  }, [page]);
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearch((v) => !v);
      }
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, []);
  return (
    <MotionConfig reducedMotion="user">
      <a
        className="skip-link"
        href="#main-content"
        onClick={(e) => {
          e.preventDefault();
          document.getElementById("main-content")?.focus();
        }}
      >
        跳到主要内容
      </a>
      <header className="site-header">
        <a className="brand" href="#/home" aria-label="重走长征路，首页">
          <span className="brand-mark">征</span>
          <span>
            <strong>重走长征路</strong>
            <small>THE LONG MARCH</small>
          </span>
        </a>
        <nav className="desktop-nav" aria-label="全站导航">
          {modules.slice(1, 7).map((m) => (
            <a
              key={m.id}
              href={`#/${m.id}`}
              aria-current={page === m.id ? "page" : undefined}
              className={page === m.id ? "active" : ""}
            >
              {m.name}
            </a>
          ))}
        </nav>
        <div className="header-actions">
          <button
            className="icon-button search-trigger"
            onClick={() => setSearch(true)}
            aria-label="全站搜索"
          >
            <MagnifyingGlass size={21} />
          </button>
          <a
            className={`backpack-link ${page === "learn" ? "active" : ""}`}
            href="#/learn"
            aria-label="我的行囊"
          >
            <Backpack size={19} />
            <span>我的行囊</span>
            {progress.visited.length > 0 && (
              <small>{progress.visited.length}</small>
            )}
          </a>
          <button
            className="icon-button mobile-menu"
            aria-label="打开全站目录"
            aria-expanded={menu}
            onClick={() => setMenu(!menu)}
          >
            <List size={23} />
          </button>
        </div>
      </header>
      {menu && (
        <Dialog title="全站目录" onClose={() => setMenu(false)}>
          <nav className="mobile-nav">
            {modules.map((m, i) => (
              <a key={m.id} href={`#/${m.id}`} onClick={() => setMenu(false)}>
                <span>0{i + 1}</span>
                {m.name}
                <ArrowUpRight />
              </a>
            ))}
          </nav>
        </Dialog>
      )}
      <div id="main-content" tabIndex={-1}>
        <Suspense
          fallback={
            <div className="page-loading">
              <Compass size={40} />
              <p>正在展开这一页山河…</p>
            </div>
          }
        >
          {page === "home" ? (
            <Home />
          ) : page === "prologue" ? (
            <Prologue />
          ) : page === "journey" ? (
            <Journey params={params} />
          ) : page === "armies" ? (
            <Armies params={params} />
          ) : page === "stories" ? (
            <Stories params={params} />
          ) : page === "meaning" ? (
            <Meaning />
          ) : page === "poetry" ? (
            <Poetry params={params} />
          ) : page === "learn" ? (
            <Learning />
          ) : null}
        </Suspense>
        {!valid && (
          <div className="empty-state">
            <Mountains size={40} />
            <h1>这条路还没有出现在地图上。</h1>
            <LinkButton href="#/home">回到启程首页</LinkButton>
          </div>
        )}
      </div>
      <footer className="site-footer">
        <div className="footer-top">
          <a className="brand" href="#/home">
            <span className="brand-mark">征</span>
            <span>
              <strong>重走长征路</strong>
              <small>山河为证 · 初心如炬</small>
            </span>
          </a>
          <p>让历史可见，让理解发生。</p>
          <a href="#/journey">
            重新出发 <ArrowUpRight />
          </a>
        </div>
        <div className="footer-bottom">
          <span>1934 — 1936 · 数字历史学习计划</span>
          <div>
            <button onClick={() => setAbout(true)}>史料与创作说明</button>
            <span>学习记录仅存于本地</span>
          </div>
          <span>铭记来路，走向远方。</span>
        </div>
      </footer>
      {search && <Search onClose={() => setSearch(false)} />}{" "}
      {about && (
        <Dialog title="史料与创作说明" onClose={() => setAbout(false)}>
          <article className="reader">
            <h2>认真讲述，也认真求证。</h2>
            <p>
              本站以历史概要、文学阅读与互动教学，呈现长征中的行动、选择与普通人的经历。22站主线以中央红军行程为中心，并延伸至1936年三大主力会师。
            </p>
            <p>
              地图为路线示意；阶段里程、海拔与补给为教学概述，不代表精准测绘或连续实测。互动任务为简化模型。AI生成画作均为艺术演绎，不是历史照片或文物实拍。
            </p>
            <p>
              故事区明确区分文学作品、纪念叙事和史实概要。正式商业发行前，仍需对全文史料、文学作品使用与素材权利进行专项审校。
            </p>
            <h3>关键时间线参考</h3>
            <div className="sources">
              {sources.map((s) => (
                <a key={s.url} href={s.url} target="_blank" rel="noreferrer">
                  {s.title}
                  <ArrowSquareOut />
                </a>
              ))}
            </div>
            <p className="fineprint">
              本站没有收集或上传个人学习记录。清除浏览器数据将移除本地进度。
            </p>
          </article>
        </Dialog>
      )}
    </MotionConfig>
  );
}
export default function App() {
  return (
    <ProgressProvider>
      <Site />
    </ProgressProvider>
  );
}
