import { useEffect, useState, Suspense, lazy } from "react";
import { MotionConfig } from "motion/react";
import {
  ArrowRight,
  ArrowUpRight,
  Compass,
  Backpack,
  MagnifyingGlass,
  List,
  BookOpen,
  Mountains,
  ArrowSquareOut,
} from "@phosphor-icons/react";
import { modules, milestones, stories, sources } from "./data";
import { ProgressProvider, useRoute, go } from "./state";
import { Dialog, LinkButton } from "./components/UI";
import { isAtlasRoute } from "./atlas";
import Atlas from "./components/Atlas";
import { atlasDetail } from "./details";
import { AudioProvider, AudioControls } from "./audio";
import { BadgeToast } from "./components/Badges";
import TopicDialog from "./components/TopicDialog";
const Panorama = lazy(() => import("./components/Panorama"));
const Expedition = lazy(() => import("./components/Expedition"));
const Journey = lazy(() =>
  import("./components/Journey").then((m) => ({ default: m.Journey })),
);
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
  const atlas = isAtlasRoute(page, params);
  const valid = modules.some((m) => m.id === page);
  const detail = atlasDetail(page, params);
  const archive =
    !atlas && page === "journey" && params.get("mode") === "archive";
  const mapVisible = atlas || !!detail || archive;
  const immersive = !mapVisible && page === "journey";
  useEffect(() => {
    setMenu(false);
    window.scrollTo({ top: 0, behavior: "instant" });
    document.title = `${modules.find((m) => m.id === page)?.name || "页面未找到"} · 重走长征路`;
  }, [page, mapVisible]);
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
          <img
            className="brand-logo"
            src="/assets/department-logo.png"
            alt=""
            width={48}
            height={48}
          />
          <span>
            <strong>重走长征路</strong>
            <small className="brand-subtitle">
              交付事业部纪念长征胜利90周年专栏
            </small>
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
          <AudioControls />
          <button
            className="icon-button header-icon search-trigger"
            onClick={() => setSearch(true)}
            aria-label="全站搜索"
          >
            <MagnifyingGlass size={21} />
          </button>
          <a
            className={`icon-button header-icon ${page === "learn" ? "active" : ""}`}
            href="#/learn"
            aria-label="学习中心"
            title="学习中心 · 我的行囊"
          >
            <Backpack size={21} />
          </a>
          <button
            className="icon-button header-icon"
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
            {modules
              .filter((m) => m.id !== "learn")
              .map((m, i) => (
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
        {mapVisible && (
          <Atlas
            key={page}
            page={page}
            params={
              detail
                ? new URLSearchParams({ stop: String(detail.stop) })
                : params
            }
            obscured={!!detail || archive}
          />
        )}
        {detail && (
          <TopicDialog
            key={`${page}:${detail.stop}`}
            detail={detail}
            onClose={() => go(page, { stop: detail.stop })}
          />
        )}
        <Suspense
          fallback={
            <div className="page-loading">
              <Compass size={40} />
              <p>正在展开这一页山河…</p>
            </div>
          }
        >
          {archive ? (
            <Dialog
              title="地理资料地图"
              wide
              onClose={() =>
                go("journey", { stop: params.get("station") || "1" })
              }
            >
              <Journey params={params} />
            </Dialog>
          ) : immersive ? (
            params.get("mode") === "interactive" ? (
              <Expedition />
            ) : (
              <Panorama params={params} />
            )
          ) : null}
        </Suspense>
        {!valid && (
          <div className="empty-state">
            <Mountains size={40} />
            <h1>这条路还没有出现在地图上。</h1>
            <LinkButton href="#/home">回到首页</LinkButton>
          </div>
        )}
      </div>
      <footer
        className={`site-footer ${immersive || mapVisible ? "exp-hide-footer" : ""}`}
      >
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
        <Dialog
          narratable
          title="史料与创作说明"
          onClose={() => setAbout(false)}
        >
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
              学习记录保存在当前浏览器。点击讲解时，选中的文字会发送至小米语音服务合成声音。清除浏览器数据将移除本地进度。
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
      <AudioProvider>
        <Site />
        <BadgeToast />
      </AudioProvider>
    </ProgressProvider>
  );
}
