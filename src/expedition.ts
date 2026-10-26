/** A fictional viewpoint through historical places, not a simulation of casualties. */
export const EXPEDITION_KEY = "changzheng-expedition-v1";
export const roles = [
  {
    id: "courier",
    name: "通信员",
    object: "一封待送的信",
    line: "把消息送到，也把沿途的人记住。",
    hint: "先看路径与信号，再决定下一步。",
  },
  {
    id: "medic",
    name: "卫生员",
    object: "一卷干净的布",
    line: "在漫长的路上，照看身边的人。",
    hint: "别只看前面的路，也看看身后的同伴。",
  },
  {
    id: "chronicler",
    name: "记录员",
    object: "一本空白手记",
    line: "记下山河，也记下普通人的名字。",
    hint: "留心物件，它们也是历史的讲述者。",
  },
] as const;
export const chapters = [
  {
    title: "带上什么，出发",
    short: "整装",
    date: "1934 · 十月",
    place: "江西 · 于都",
    station: 1,
    bg: "hero",
    quote: "出发时，没有人知道这条路究竟有多长。",
    task: "从桌上的五件物品中，选三件放进行囊。",
  },
  {
    title: "河的另一边",
    short: "夜渡",
    date: "1934 · 十月",
    place: "江西 · 于都河",
    station: 1,
    bg: "scene-night",
    quote: "灯火压低了。河面很宽，脚下的木板轻轻作响。",
    task: "观察河岸三处线索，再推动行军标记渡河。",
  },
  {
    title: "转身，也是前进",
    short: "赤水",
    date: "1935 · 一月至三月",
    place: "川黔滇交界 · 赤水河",
    station: 11,
    bg: "terrain",
    quote: "地图上折返的线，藏着一次次重新判断。",
    task: "读懂每一程的消息，在地图上找到下一处方向。",
  },
  {
    title: "等一等，后面的人",
    short: "雪山",
    date: "1935 · 六月",
    place: "四川 · 夹金山",
    station: 16,
    bg: "scene-snow",
    quote: "风声吞没了脚步声。你回头，看见一个身影慢了下来。",
    task: "拂开风雪，找到同伴，与他一起走过山口。",
  },
  {
    title: "脚下，没有路",
    short: "草地",
    date: "1935 · 八月",
    place: "川西北 · 草地",
    station: 18,
    bg: "scene-marsh",
    quote: "看起来一样的绿色，脚下却可能完全不同。",
    task: "用木杖逐行探查落脚处，再沿可靠的草墩前进。",
  },
  {
    title: "把这段路，写下来",
    short: "回响",
    date: "1936 · 十月",
    place: "甘肃 · 会宁",
    station: 22,
    bg: "hero",
    quote: "当人们再一次相逢，走过的路有了共同的名字。",
    task: "翻看你的行军手记，给今天的自己留下一句话。",
  },
] as const;
export const gear = [
  {
    id: "shoes",
    name: "草鞋",
    image: "object-18",
    detail: "轻便，也会磨损。路长了，修补和替换一样重要。",
  },
  {
    id: "cloth",
    name: "旧棉衣",
    image: "object-02",
    detail: "可以御寒，也能分给身边的同伴。",
  },
  {
    id: "bowl",
    name: "粗瓷碗",
    image: "object-11",
    detail: "一只碗，盛过水，也分过有限的食物。",
  },
  {
    id: "book",
    name: "火柴",
    image: "object-04",
    detail: "小小的火种，需要认真防潮、妥善保存。",
  },
  {
    id: "rope",
    name: "皮带",
    image: "object-03",
    detail: "系紧衣物，也能在长途中用于修补与捆扎。",
  },
] as const;
export type Expedition = {
  version: 1;
  role: string;
  started: boolean;
  chapter: number;
  completed: number[];
  gear: string[];
  observed: string[];
  crossing: number;
  crossings: number;
  snow: number;
  companion: boolean;
  kindness: string;
  steps: number;
  probes: string[];
  letter: string;
};
export const freshExpedition = (): Expedition => ({
  version: 1,
  role: "courier",
  started: false,
  chapter: 0,
  completed: [],
  gear: [],
  observed: [],
  crossing: 0,
  crossings: 0,
  snow: 0,
  companion: false,
  kindness: "",
  steps: 0,
  probes: [],
  letter: "",
});
export function sanitizeExpedition(raw: unknown): Expedition {
  const base = freshExpedition();
  if (!raw || typeof raw !== "object") return base;
  const p = raw as Record<string, unknown>;
  if (p.version !== 1) return base;
  const count = (v: unknown, max: number) =>
    typeof v === "number" && Number.isInteger(v)
      ? Math.min(max, Math.max(0, v))
      : 0;
  const strings = (v: unknown, allowed: string[]) =>
    Array.isArray(v)
      ? [
          ...new Set(
            v.filter(
              (x): x is string => typeof x === "string" && allowed.includes(x),
            ),
          ),
        ]
      : [];
  const completed = Array.isArray(p.completed)
    ? [
        ...new Set(
          p.completed.filter(
            (x): x is number => Number.isInteger(x) && x >= 0 && x <= 5,
          ),
        ),
      ]
    : [];
  // Only a contiguous sequence can unlock chapters.
  const safeCompleted: number[] = [];
  for (let i = 0; i < 6 && completed.includes(i); i++) safeCompleted.push(i);
  return {
    ...base,
    role: roles.some((r) => r.id === p.role) ? (p.role as string) : base.role,
    started: p.started === true,
    chapter: Math.min(count(p.chapter, 5), safeCompleted.length),
    completed: safeCompleted,
    gear: strings(
      p.gear,
      gear.map((g) => g.id),
    ).slice(0, 3),
    observed: strings(p.observed, ["boats", "lamp", "bridge"]),
    crossing: count(p.crossing, 100),
    crossings: count(p.crossings, 4),
    snow: count(p.snow, 100),
    companion: p.companion === true,
    kindness: ["cloth", "share"].includes(p.kindness as string)
      ? (p.kindness as string)
      : "",
    steps: count(p.steps, 4),
    probes: strings(
      p.probes,
      Array.from({ length: 12 }, (_, i) => `${Math.floor(i / 3)}-${i % 3}`),
    ),
    letter: typeof p.letter === "string" ? p.letter.slice(0, 500) : "",
  };
}
export const marshPath = [1, 0, 1, 2];
export function isChapterReady(p: Expedition): boolean {
  return [
    p.gear.length === 3,
    p.observed.length === 3 && p.crossing === 100,
    p.crossings === 4,
    p.snow >= 65 && p.companion && !!p.kindness,
    p.steps === 4,
    p.letter.trim().length >= 2,
  ][p.chapter];
}
export function completeChapter(p: Expedition): Expedition {
  if (!isChapterReady(p)) return p;
  return {
    ...p,
    completed: [...new Set([...p.completed, p.chapter])],
    chapter: Math.min(5, p.chapter + 1),
  };
}
