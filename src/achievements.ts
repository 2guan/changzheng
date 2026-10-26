import type { Progress } from "./storage.ts";
export const badges = [
  {
    id: "first-light",
    name: "星火初程",
    motif: "红星 · 启程",
    description: "完成任意一站史料阅读",
    goal: 1,
    metric: (p: Progress) => p.visited.length,
  },
  {
    id: "mountain-path",
    name: "千里跋涉",
    motif: "群山 · 足迹",
    description: "完成六站史料阅读",
    goal: 6,
    metric: (p: Progress) => p.visited.length,
  },
  {
    id: "reunion",
    name: "万里同归",
    motif: "旗帜 · 会师",
    description: "完成全部二十二站阅读",
    goal: 22,
    metric: (p: Progress) => p.visited.length,
  },
  {
    id: "fireside",
    name: "篝火拾光",
    motif: "灯火 · 倾听",
    description: "读完五则篝火夜话故事",
    goal: 5,
    metric: (p: Progress) => p.stories.length,
  },
  {
    id: "memories",
    name: "山河记忆",
    motif: "书卷 · 铭记",
    description: "读完全部二十则故事",
    goal: 20,
    metric: (p: Progress) => p.stories.length,
  },
  {
    id: "practice",
    name: "躬行知难",
    motif: "草鞋 · 实践",
    description: "完成一个情境任务",
    goal: 1,
    metric: (p: Progress) =>
      p.tasks.filter((x) => !x.startsWith("station-")).length,
  },
  {
    id: "together",
    name: "同心协力",
    motif: "桥梁 · 同行",
    description: "完成四个不同的情境任务",
    goal: 4,
    metric: (p: Progress) =>
      p.tasks.filter((x) => !x.startsWith("station-")).length,
  },
  {
    id: "learning",
    name: "学有所思",
    motif: "麦穗 · 求知",
    description: "完成十五道知识测验",
    goal: 15,
    metric: (p: Progress) => p.answers.filter((x) => x !== null).length,
  },
];
export const badgeIds = badges.map((b) => b.id);
export function earnedBadgeIds(progress: Progress) {
  return badges.filter((b) => b.metric(progress) >= b.goal).map((b) => b.id);
}
