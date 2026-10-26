import { useState } from "react";
import { Mountains, Drop, ArrowRight } from "@phosphor-icons/react";
import { milestones } from "../data";
import content from "../content.json";
export const terrainFeatures = [
  {
    name: "于都河",
    station: 1,
    type: "河流",
    text: "渡河不仅取决于河面宽窄。船只、桥板、架桥时机与当地群众的支援，共同决定通行能力。",
    metric: "浮桥 · 夜渡 · 隐蔽",
  },
  {
    name: "湘江",
    station: 5,
    type: "河流",
    text: "江河构成天然阻隔。渡口能维持多久、后续队伍何时抵达，会直接影响整个行动。",
    metric: "渡口 · 阻击 · 时间",
  },
  {
    name: "乌江",
    station: 9,
    type: "河流",
    text: "峡谷中的江流与陡岸增加了渡河难度，侦察渡口、制作竹筏和建立掩护需要协同。",
    metric: "峡谷 · 急流 · 陡岸",
  },
  {
    name: "赤水河",
    station: 11,
    type: "河流",
    text: "在川滇黔交界反复转向，河流既是阻隔，也是改变行动方向与调动对手的重要地理条件。",
    metric: "四次渡河 · 机动",
  },
  {
    name: "金沙江",
    station: 13,
    type: "河流",
    text: "金沙江穿过高山峡谷，渡口稀少。船工与连续组织渡运，是理解巧渡的重要线索。",
    metric: "皎平渡 · 船工 · 渡运",
  },
  {
    name: "大渡河",
    station: 15,
    type: "河流",
    text: "安顺场强渡与泸定桥夺桥相互衔接。沿江道路、渡船容量和桥梁通行决定方案。",
    metric: "渡口与桥梁 · 双重路径",
  },
  {
    name: "夹金山",
    station: 16,
    type: "山地",
    text: "高海拔环境中空气密度降低，缺氧和寒冷叠加。海拔是认识地形的入口，不能替代实际气象记录。",
    metric: "约4,114米 · 高山环境",
  },
  {
    name: "松潘草地",
    station: 18,
    type: "湿地",
    text: "草甸与沼泽外观相近，地表承载差异很大。路径选择、向导与补给，共同影响行军。",
    metric: "高寒湿地 · 地面承载",
  },
  {
    name: "腊子口",
    station: 19,
    type: "山地",
    text: "狭窄山口与两侧峭壁形成通行瓶颈。从局部地形寻找迂回空间，是理解这一战斗的关键。",
    metric: "峡口 · 峭壁 · 迂回",
  },
  {
    name: "六盘山",
    station: 21,
    type: "山地",
    text: "越过六盘山，前方通向陕北。登高远望既是地理经验，也成为诗词表达的重要意象。",
    metric: "登高 · 北上 · 陕北",
  },
];
export function TerrainExplore({
  onSelect,
}: {
  onSelect?: (n: number) => void;
}) {
  const [selected, setSelected] = useState(0);
  const f = terrainFeatures[selected];
  return (
    <div className="terrain-explore">
      <div className="terrain-switches" aria-label="探索地理天险">
        {terrainFeatures.map((x, i) => (
          <button
            key={x.name}
            aria-pressed={i === selected}
            className={i === selected ? "selected" : ""}
            onClick={() => {
              setSelected(i);
              onSelect?.(x.station);
            }}
          >
            {x.type === "河流" ? <Drop /> : <Mountains />}
            {x.name}
          </button>
        ))}
      </div>
      <div className="terrain-fact" aria-live="polite">
        <div>
          <small>{f.type}观察</small>
          <strong>{f.name}</strong>
        </div>
        <p>
          {f.text}
          <small>{f.metric}</small>
        </p>
      </div>
    </div>
  );
}
export function ElevationTrail({
  active,
  onSelect,
}: {
  active: number;
  onSelect: (n: number) => void;
}) {
  const m = milestones[active - 1];
  return (
    <section className="elevation-trail">
      <div>
        <span className="chapter-label">沿途地势 · 点选跳转</span>
        <strong>
          {m.elevation.toLocaleString()} <small>米</small>
        </strong>
        <span>行程约 {(m.distance / 2).toLocaleString()} 公里</span>
      </div>
      <div className="elevation-bars" aria-label="22站海拔剖面示意">
        {milestones.map((s) => (
          <button
            key={s.id}
            title={`${s.title} 约${s.elevation}米`}
            aria-label={`${s.title} 约${s.elevation}米`}
            aria-pressed={s.id === active}
            onClick={() => onSelect(s.id)}
          >
            <span
              style={{ height: `${Math.max(8, (s.elevation / 4500) * 100)}%` }}
            />
            <small>{s.id === active ? s.id : ""}</small>
          </button>
        ))}
      </div>
      <div className="troop-observation">
        <span>参考兵力记录 · 非逐日实测</span>
        <strong>{content.stations[active - 1].troops}</strong>
        <small>不同站点的统计时点与范围可能不同</small>
      </div>
    </section>
  );
}
