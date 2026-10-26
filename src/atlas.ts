import { themeModules, milestones, stories, armies, poems } from "./data.ts";
import { panoramas } from "./panoramas.ts";

export type AtlasStop = {
  title: string;
  subtitle: string;
  description: string;
  href: string;
  image?: string;
};
export type AtlasRoute = {
  title: string;
  line: string;
  image: string;
  alt: string;
  mobileFocusX: number;
  stops: AtlasStop[];
};
const detail = (page: string, stop: number, focus: string) =>
  `#/${page}?view=reading&stop=${stop}&focus=${focus}`;
export const atlasRoutes: Record<string, AtlasRoute> = {
  home: {
    mobileFocusX: 0.72,
    title: "重走长征路",
    line: "循着先辈的足迹，走进山河深处。\n在每一次选择与跋涉中，读懂长征。",
    image: "/assets/hero.webp",
    alt: "暖金色晨光照亮层叠雪山，行军队伍沿山路前行",
    stops: themeModules.map((m, i) => ({
      title: m.name,
      subtitle: `第 ${String(i + 1).padStart(2, "0")} 章`,
      description: m.desc,
      href: `#/${m.id}`,
    })),
  },
  prologue: {
    mobileFocusX: 0.76,
    title: "回到出发之前。",
    line: "山雨将至。理解一场远行，先理解为什么必须离开。",
    image: "/assets/scene-night.webp",
    alt: "于都河畔，月光与灯火映照出发前的渡口",
    stops: [
      {
        title: "当时的处境",
        subtitle: "01 · 看见困境",
        description: "把兵力、战略与补给放在一起，理解根据地面临的压力。",
        href: detail("prologue", 1, "comparison"),
      },
      {
        title: "山雨欲来",
        subtitle: "02 · 反“围剿”背景",
        description: "从机动作战到消耗战，军事失利如何改变局面。",
        href: detail("prologue", 2, "chapter-0"),
      },
      {
        title: "出发前夕",
        subtitle: "03 · 告别与准备",
        description: "草鞋、粮盐与辎重背后，是苏区百姓的托付。",
        href: detail("prologue", 3, "chapter-1"),
      },
      {
        title: "整理行囊",
        subtitle: "04 · 可选体验",
        description: "亲手做一次取舍，感受有限负重与漫长行程之间的矛盾。",
        href: detail("prologue", 4, "packing"),
      },
    ],
  },
  journey: {
    mobileFocusX: 0.46,
    title: "万水千山，步步征程",
    line: "循着中央红军的脚步，延伸至三大主力会师。每一站，都可以停留。",
    image: "/assets/journey-geographic-corrected.webp",
    alt: "北向朝上的红军长征山河地图",
    stops: milestones.map((m, i) => ({
      title: m.title,
      subtitle: `${m.date} · ${m.place}`,
      description: m.summary,
      href: `#/journey?station=${m.id}`,
      image: panoramas[i].image,
    })),
  },
  armies: {
    mobileFocusX: 0.47,
    title: "不同来路，共赴远方。",
    line: "四支队伍，四段行程。选择一条来路，读懂长征的全貌。",
    image: "/assets/panorama-17.webp",
    alt: "群山之间的河谷与桥梁上，两支队伍相遇",
    stops: armies.map((a) => ({
      title: a.name,
      subtitle: a.time,
      description: a.description,
      href: `#/armies?army=${a.id}`,
    })),
  },
  stories: {
    mobileFocusX: 0.8,
    title: "围坐下来，听他们的故事。",
    line: "二十件物品，二十次相遇。山河之外，还有人的温度。",
    image: "/assets/atlas-camp.webp",
    alt: "暮色山谷边，行军的人们围坐在一小簇篝火旁",
    stops: stories.map((s) => ({
      title: s.title,
      subtitle: s.kind,
      description: s.subtitle,
      href: `#/stories?story=${s.id}`,
      image: `/assets/object-${String(s.id).padStart(2, "0")}.webp`,
    })),
  },
  meaning: {
    mobileFocusX: 0.76,
    title: "远行之后，回响未歇。",
    line: "越过历史的终点，再问一问：这段路，留下了什么？",
    image: "/assets/panorama-22.webp",
    alt: "会宁城门前，人们迎来远行的队伍",
    stops: [
      {
        title: "赓续长征",
        subtitle: "01 · 九十周年",
        description:
          "学习长征胜利90周年纪念大会讲话，回望胜利之路，理解长征精神的当代意义。",
        href: detail("meaning", 1, "anniversary"),
      },
      {
        title: "三个比喻",
        subtitle: "02 · 历史的表达",
        description: "从宣言书、宣传队与播种机，读懂长征的历史意义。",
        href: detail("meaning", 2, "chapter-0"),
      },
      {
        title: "四重价值",
        subtitle: "03 · 战略转移",
        description:
          "保存力量、实现转折、走向联合、锻炼队伍：回到完整史料中理解。",
        href: detail("meaning", 3, "chapter-1"),
      },
      {
        title: "写下回望",
        subtitle: "04 · 留给今天",
        description: "将一次触动写成自己的文字，保存在本地行囊中。",
        href: detail("meaning", 4, "reflection"),
      },
    ],
  },
  poetry: {
    mobileFocusX: 0.8,
    title: "把山河，读进诗里。",
    line: "沿着六组诗词，在山口、江边与雪峰之间，听见另一种叙述。",
    image: "/assets/atlas-poetry.webp",
    alt: "日出照亮云海与层叠群山，远行者沿山径前行",
    stops: poems.map((p, i) => ({
      title: p.mapTitle || p.title,
      subtitle: `${p.year} · ${p.location}`,
      description: p.lines[0],
      href: `#/poetry?poem=${i}`,
    })),
  },
  learn: {
    mobileFocusX: 0.82,
    title: "走过的路，装进行囊。",
    line: "在这里停一停，整理足迹，也留下属于自己的理解。",
    image: "/assets/atlas-study.webp",
    alt: "山间木屋的书桌上摊着笔记本，窗外是晨光中的群山",
    stops: [
      {
        title: "足迹与勋章",
        subtitle: "01 · 回看旅程",
        description: "查看已获得的学习勋章与阅读进度，沿着上次的脚步继续前行。",
        href: detail("learn", 1, "progress"),
      },
      {
        title: "知识测验",
        subtitle: "02 · 十五道思考",
        description: "逐题理解、查看解析，完成后留下自己的学习纪念。",
        href: detail("learn", 2, "quiz"),
      },
      {
        title: "情境体验",
        subtitle: "03 · 可选实践",
        description: "打包、渡河、协作与判断。想亲手尝试时，再走进这些情境。",
        href: detail("learn", 3, "tasks"),
      },
      {
        title: "行军笔记",
        subtitle: "04 · 写给自己",
        description: "记录最有触动的一站，让看见的历史成为自己的思考。",
        href: detail("learn", 4, "reflection"),
      },
      {
        title: "我的收藏",
        subtitle: "05 · 值得重读",
        description: "重访收藏的历史坐标，找回想再读一遍的内容。",
        href: detail("learn", 5, "saved"),
      },
      {
        title: "行囊备份",
        subtitle: "06 · 带走记录",
        description: "导出或导入阅读与测验进度；文字笔记可在笔记区单独下载。",
        href: detail("learn", 6, "backup"),
      },
    ],
  },
};
export function isAtlasRoute(page: string, params: URLSearchParams) {
  if (!atlasRoutes[page]) return false;
  if (page === "home") return true;
  if (params.get("view") === "map") return true;
  return !["view", "mode", "station", "army", "story", "poem", "read"].some(
    (k) => params.has(k),
  );
}
export function atlasSelection(page: string, params: URLSearchParams) {
  const count = atlasRoutes[page]?.stops.length || 1;
  const direct =
    page === "journey"
      ? Number(params.get("station"))
      : page === "stories"
        ? Number(params.get("story"))
        : page === "poetry" && params.has("poem")
          ? Number(params.get("poem")) + 1
          : page === "armies"
            ? armies.findIndex((a) => a.id === params.get("army")) + 1
            : 0;
  const n = direct || Number(params.get("stop"));
  return Number.isInteger(n) && n >= 1 && n <= count ? n : 1;
}
export function atlasMapHref(page: string, params: URLSearchParams) {
  return `#/${page}?stop=${atlasSelection(page, params)}`;
}
// Narrative positions, intentionally independent from geographic coordinates.
export function atlasPositions(count: number): [number, number][] {
  if (count === 8)
    return [
      [9, 38],
      [24, 20],
      [43, 34],
      [64, 15],
      [87, 38],
      [77, 78],
      [52, 72],
      [23, 80],
    ];
  const rows = count > 12 ? 3 : count > 6 ? 2 : 1;
  const cols = Math.ceil(count / rows);
  return Array.from({ length: count }, (_, i) => {
    const row = Math.floor(i / cols),
      col = i % cols;
    const x =
      cols === 1
        ? 50
        : 10 + ((row % 2 ? cols - 1 - col : col) * 80) / (cols - 1);
    const y =
      rows === 1
        ? 48 + Math.sin(i * 1.8) * 17
        : 20 + row * (60 / (rows - 1)) + Math.sin(col * 1.5) * 5;
    return [x, y];
  });
}
// Four-stop chapters use two columns; other mobile routes use at most three.
export function atlasMobileLayout(
  count: number,
  columns = count === 4 ? 2 : 3,
) {
  const rows = Math.ceil(count / columns);
  const height = rows * 140 + 30;
  const points: [number, number][] = Array.from({ length: count }, (_, i) => {
    const row = Math.floor(i / columns);
    const column = row % 2 ? columns - 1 - (i % columns) : i % columns;
    const x = columns === 2 ? 26 + column * 48 : 18 + column * 32;
    return [x, ((row * 140 + 40) / height) * 100];
  });
  return { height, points, rows };
}
export function atlasPath(points: [number, number][]) {
  return points
    .map(([x, y], i) => {
      if (!i) return `M ${x * 10} ${y * 4}`;
      const [px, py] = points[i - 1];
      return Math.abs(x - px) < 1
        ? `C ${x * 10 + 65} ${py * 4}, ${x * 10 + 65} ${y * 4}, ${x * 10} ${y * 4}`
        : `C ${(px + x) * 5} ${py * 4}, ${(px + x) * 5} ${y * 4}, ${x * 10} ${y * 4}`;
    })
    .join(" ");
}

// Scale the bends to row height so long routes do not amplify them vertically.
export function atlasMobilePath(points: [number, number][], height: number) {
  const bend = (60 / height) * 400;
  return points
    .map(([x, y], i) => {
      const endX = x * 10;
      const endY = y * 4;
      if (!i) return `M ${endX} ${endY}`;
      const startX = points[i - 1][0] * 10;
      const startY = points[i - 1][1] * 4;
      if (Math.abs(endX - startX) < 10) {
        const outside = endX + (x >= 50 ? 115 : -115);
        const dy = endY - startY;
        return `C ${outside} ${startY + dy * 0.25}, ${outside} ${endY - dy * 0.25}, ${endX} ${endY}`;
      }
      const dx = endX - startX;
      const direction = i % 2 ? -1 : 1;
      return `C ${startX + dx * 0.32} ${startY + bend * direction}, ${startX + dx * 0.7} ${endY - bend * direction * 0.8}, ${endX} ${endY}`;
    })
    .join(" ");
}

export function homeMapHref(page: string) {
  const index = themeModules.findIndex((m) => m.id === page);
  return index < 0 ? "#/home" : `#/home?stop=${index + 1}`;
}
