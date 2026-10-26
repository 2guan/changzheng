// Regional equirectangular map. Coordinates are representative locations,
// not surveyed monument positions; see docs/maps/journey-geography.md.
export type GeoPoint = readonly [number, number];
export const MAP_WIDTH = 1000;
export const MAP_HEIGHT = 900;
export function projectJourney([lon, lat]: GeoPoint): [number, number] {
  return [((lon - 98.5) / 19.5) * MAP_WIDTH, ((38.5 - lat) / 15) * MAP_HEIGHT];
}
export const journeyLocations: {
  place: string;
  point: GeoPoint;
  note?: string;
}[] = [
  { place: "于都", point: [115.42, 25.95] },
  { place: "信丰", point: [114.93, 25.38] },
  { place: "汝城", point: [113.68, 25.55] },
  { place: "宜章", point: [112.95, 25.4] },
  {
    place: "湘江",
    point: [110.67, 25.61],
    note: "以兴安为代表地点，战场沿湘江分布。",
  },
  { place: "老山界", point: [110.45, 25.87] },
  { place: "通道", point: [109.78, 26.16] },
  {
    place: "黎平",
    point: [109.13, 26.23],
    note: "标记黎平；猴场会议位于其西北方向的瓮安猴场。",
  },
  { place: "乌江", point: [107.03, 27.1] },
  { place: "遵义", point: [106.93, 27.7] },
  {
    place: "四渡赤水",
    point: [106.01, 28.28],
    note: "以土城为代表地点，四渡赤水是一段往返机动的行程。",
  },
  {
    place: "威逼昆明",
    point: [103.04, 25.34],
    note: "以昆明东北的嵩明为代表地点，路线经过贵阳周边、盘县、曲靖。",
  },
  { place: "皎平渡", point: [102.41, 26.3] },
  { place: "彝海", point: [102.18, 28.82] },
  { place: "泸定桥", point: [102.23, 29.91] },
  { place: "夹金山", point: [102.7, 30.83] },
  {
    place: "懋功会师",
    point: [102.77, 30.99],
    note: "标记达维初次会师地点；随后在懋功地区会合。",
  },
  {
    place: "草地",
    point: [102.91, 32.6],
    note: "以川西北松潘、若尔盖之间的草地为代表区域。",
  },
  { place: "腊子口", point: [103.89, 34.14] },
  { place: "哈达铺", point: [104.22, 34.22] },
  {
    place: "吴起镇",
    point: [108.18, 36.92],
    note: "标记1935年到达的吴起镇；途中经过六盘山。",
  },
  {
    place: "会宁",
    point: [105.05, 35.69],
    note: "1936年10月在会宁、将台堡等地会师。此站不与吴起镇画成直接行军连线。",
  },
];
const p = (n: number) => journeyLocations[n - 1].point;
export const centralRoute: GeoPoint[] = [
  ...journeyLocations.slice(0, 8).map((s) => s.point),
  [108.42, 27.05],
  [107.48, 27.07],
  p(9),
  p(10),
  p(11),
  [105.05, 27.85],
  [106.02, 28.23],
  [106.82, 28.14],
  p(10),
  [106.38, 27.85],
  [106.01, 28.15],
  [106.12, 28.05],
  [106.55, 27.0],
  [106.98, 26.85],
  [106.68, 26.58],
  [105.47, 25.7],
  [104.47, 25.71],
  [103.8, 25.49],
  p(12),
  [102.93, 25.54],
  p(13),
  [102.25, 27.89],
  p(14),
  [102.27, 29.26],
  p(15),
  [102.83, 30.37],
  p(16),
  p(17),
  [102.35, 31.0],
  [102.39, 31.59],
  [103.0, 32.05],
  p(18),
  [103.4, 33.58],
  p(19),
  p(20),
  [104.03, 34.44],
  [105.25, 35.21],
  [106.23, 35.39],
  [107.31, 36.57],
  p(21),
];
// Broad corridors of the other three forces: context, not day-by-day tracks.
export const contextRoutes: {
  name: string;
  color: string;
  points: GeoPoint[];
}[] = [
  {
    name: "红二方面军",
    color: "#d9b778",
    points: [
      [110.16, 29.4],
      [109.7, 28.6],
      [108.25, 27.94],
      [106.7, 27.1],
      [105.29, 27.28],
      [104.6, 26.23],
      [103.8, 25.5],
      [102.1, 25.1],
      [100.3, 25.7],
      [99.96, 26.83],
      [99.7, 27.8],
      [99.0, 28.7],
      [99.8, 30.0],
      [100.0, 31.62],
      [100.68, 32.27],
      [102.54, 33.0],
      [103.1, 34.0],
      [104.02, 34.44],
      [105.18, 34.19],
      [105.73, 35.52],
      [105.82, 35.83],
    ],
  },
  {
    name: "红四方面军",
    color: "#94b5a5",
    points: [
      [106.9, 31.86],
      [105.9, 31.7],
      [104.52, 31.78],
      [103.6, 31.5],
      [103.0, 31.01],
      p(17),
      [102.39, 31.59],
      [103.0, 32.05],
      [102.7, 32.7],
      [102.4, 31.6],
      [102.35, 31],
      [102.2, 30.1],
      [101.5, 30.98],
      [100, 31.62],
      [100.68, 32.27],
      [102.54, 33.0],
      [103.1, 34],
      [104.02, 34.44],
      [104.9, 35.1],
      p(22),
    ],
  },
  {
    name: "红二十五军",
    color: "#b7a6ce",
    points: [
      [114.53, 32.2],
      [113.75, 31.9],
      [113.35, 33.0],
      [111.85, 33.05],
      [110.9, 33.65],
      [110, 33.87],
      [109.15, 34.2],
      [108.0, 33.8],
      [107.78, 34.06],
      [106.52, 34.89],
      [106.05, 35.7],
      [106.15, 36],
      [107.8, 35.9],
      [108.63, 36.28],
      [109.6, 36.9],
    ],
  },
];
export const provinceLabels: { name: string; point: GeoPoint }[] = [
  { name: "四川", point: [103.9, 30.7] },
  { name: "云南", point: [100.9, 24.8] },
  { name: "贵州", point: [107.0, 25.5] },
  { name: "湖南", point: [112, 28.0] },
  { name: "江西", point: [116.0, 27.5] },
  { name: "广西", point: [109.4, 24.4] },
  { name: "广东", point: [114, 24.0] },
  { name: "甘肃", point: [103.5, 36.3] },
  { name: "陕西", point: [109.2, 35.0] },
  { name: "宁夏", point: [106.2, 37.5] },
  { name: "湖北", point: [113.3, 30.8] },
  { name: "河南", point: [113.7, 34.5] },
  { name: "山西", point: [112.4, 37.3] },
  { name: "青海", point: [100.5, 36.7] },
  { name: "重庆", point: [107.2, 29.6] },
];
// Major route towns, using historical names and approximate town centres.
// Shared stops carry both army indices so either visible route keeps the label.
export const journeyRouteCities: {
  name: string;
  point: GeoPoint;
  armies: number[];
  major?: boolean;
}[] = [
  { name: "于都", point: p(1), armies: [0], major: true },
  { name: "遵义", point: p(10), armies: [0], major: true },
  { name: "泸定", point: p(15), armies: [0], major: true },
  { name: "哈达铺", point: p(20), armies: [0], major: true },
  { name: "吴起镇", point: p(21), armies: [0], major: true },
  { name: "桑植", point: [110.16, 29.4], armies: [1], major: true },
  { name: "毕节", point: [105.29, 27.28], armies: [1], major: true },
  { name: "中甸", point: [99.7, 27.8], armies: [1], major: true },
  { name: "甘孜", point: [100, 31.62], armies: [1, 2], major: true },
  { name: "将台堡", point: [105.82, 35.83], armies: [1], major: true },
  { name: "苍溪", point: [105.94, 31.73], armies: [2], major: true },
  { name: "懋功", point: [102.35, 31], armies: [0, 2], major: true },
  { name: "会宁", point: p(22), armies: [2], major: true },
  { name: "罗山", point: [114.53, 32.2], armies: [3], major: true },
  { name: "南召", point: [111.85, 33.05], armies: [3], major: true },
  { name: "商县", point: [110, 33.87], armies: [3], major: true },
  { name: "永坪", point: [109.6, 36.9], armies: [3], major: true },
  { name: "信丰", point: [114.93, 25.38], armies: [0] },
  { name: "汝城", point: [113.68, 25.55], armies: [0] },
  { name: "宜章", point: [112.95, 25.4], armies: [0] },
  { name: "道县", point: [111.6, 25.53], armies: [0] },
  { name: "全州", point: [111.07, 25.93], armies: [0] },
  { name: "兴安", point: [110.67, 25.61], armies: [0] },
  { name: "通道", point: [109.78, 26.16], armies: [0] },
  { name: "黎平", point: [109.13, 26.23], armies: [0] },
  { name: "剑河", point: [108.42, 26.73], armies: [0] },
  { name: "黄平", point: [107.9, 26.9], armies: [0] },
  { name: "瓮安", point: [107.47, 27.07], armies: [0, 1] },
  { name: "土城", point: [106.01, 28.28], armies: [0] },
  { name: "扎西", point: [105.05, 27.85], armies: [0] },
  { name: "桐梓", point: [106.82, 28.14], armies: [0] },
  { name: "茅台", point: [106.38, 27.85], armies: [0] },
  { name: "息烽", point: [106.74, 27.09], armies: [0] },
  { name: "盘县", point: [104.47, 25.71], armies: [0, 1] },
  { name: "曲靖", point: [103.8, 25.49], armies: [0] },
  { name: "寻甸", point: [103.26, 25.56], armies: [0, 1] },
  { name: "嵩明", point: [103.04, 25.34], armies: [0] },
  { name: "禄劝", point: [102.47, 25.55], armies: [0] },
  { name: "皎平渡", point: [102.41, 26.3], armies: [0] },
  { name: "会理", point: [102.25, 26.66], armies: [0] },
  { name: "冕宁", point: [102.18, 28.55], armies: [0] },
  { name: "安顺场", point: [102.27, 29.26], armies: [0] },
  { name: "天全", point: [102.76, 30.06], armies: [0, 2] },
  { name: "芦山", point: [102.93, 30.14], armies: [0, 2] },
  { name: "宝兴", point: [102.81, 30.37], armies: [0, 2] },
  { name: "达维", point: [102.77, 30.99], armies: [0, 2] },
  { name: "卓克基", point: [102.28, 31.85], armies: [0, 2] },
  { name: "芦花", point: [102.99, 32.06], armies: [0, 2] },
  { name: "毛儿盖", point: [103.03, 32.59], armies: [0, 2] },
  { name: "巴西", point: [103.4, 33.58], armies: [0, 2] },
  { name: "俄界", point: [103.71, 34.0], armies: [0] },
  { name: "榜罗镇", point: [104.96, 35.0], armies: [0] },
  { name: "通渭", point: [105.25, 35.21], armies: [0, 2] },
  { name: "隆德", point: [106.12, 35.62], armies: [0, 3] },
  { name: "环县", point: [107.31, 36.57], armies: [0] },
  { name: "石阡", point: [108.23, 27.52], armies: [1] },
  { name: "江口", point: [108.85, 27.7], armies: [1] },
  { name: "平越", point: [107.52, 26.69], armies: [1] },
  { name: "龙里", point: [106.98, 26.45], armies: [1] },
  { name: "黔西", point: [106.03, 27.01], armies: [1] },
  { name: "大定", point: [105.61, 27.14], armies: [1] },
  { name: "赫章", point: [104.73, 27.12], armies: [1] },
  { name: "镇雄", point: [104.87, 27.44], armies: [1] },
  { name: "宣威", point: [104.1, 26.22], armies: [1] },
  { name: "富民", point: [102.5, 25.22], armies: [1] },
  { name: "楚雄", point: [101.55, 25.04], armies: [1] },
  { name: "姚安", point: [101.24, 25.5], armies: [1] },
  { name: "祥云", point: [100.55, 25.48], armies: [1] },
  { name: "宾川", point: [100.58, 25.83], armies: [1] },
  { name: "鹤庆", point: [100.18, 26.56], armies: [1] },
  { name: "丽江", point: [100.23, 26.87], armies: [1] },
  { name: "石鼓", point: [99.96, 26.87], armies: [1] },
  { name: "理化", point: [100.27, 30.0], armies: [1] },
  { name: "成县", point: [105.73, 33.74], armies: [1] },
  { name: "徽县", point: [106.09, 33.77], armies: [1, 3] },
  { name: "康县", point: [105.61, 33.33], armies: [1] },
  { name: "巴中", point: [106.75, 31.85], armies: [2] },
  { name: "仪陇", point: [106.4, 31.52], armies: [2] },
  { name: "江油", point: [104.75, 31.78], armies: [2] },
  { name: "北川", point: [104.45, 31.82], armies: [2] },
  { name: "茂县", point: [103.85, 31.68], armies: [2] },
  { name: "理番", point: [103.17, 31.44], armies: [2] },
  { name: "丹巴", point: [101.89, 30.88], armies: [2] },
  { name: "道孚", point: [101.12, 30.98], armies: [2] },
  { name: "炉霍", point: [100.68, 31.39], armies: [2] },
  { name: "阿坝", point: [101.7, 32.9], armies: [1, 2] },
  { name: "岷州", point: [104.03, 34.44], armies: [1, 2] },
  { name: "漳县", point: [104.47, 34.85], armies: [2] },
  { name: "渭源", point: [104.22, 35.14], armies: [2] },
  { name: "武山", point: [104.88, 34.72], armies: [2] },
  { name: "独树镇", point: [113.16, 33.37], armies: [3] },
  { name: "卢氏", point: [111.05, 34.05], armies: [3] },
  { name: "庾家河", point: [110.58, 33.69], armies: [3] },
  { name: "雒南", point: [110.15, 34.09], armies: [3] },
  { name: "郧西", point: [110.43, 32.99], armies: [3] },
  { name: "镇安", point: [109.15, 33.42], armies: [3] },
  { name: "柞水", point: [109.11, 33.68], armies: [3] },
  { name: "沣峪口", point: [108.83, 34.04], armies: [3] },
  { name: "宁陕", point: [108.32, 33.31], armies: [3] },
  { name: "凤县", point: [106.52, 33.91], armies: [1, 3] },
  { name: "两当", point: [106.3, 33.91], armies: [1, 3] },
  { name: "天水", point: [105.72, 34.58], armies: [3] },
  { name: "秦安", point: [105.67, 34.86], armies: [3] },
  { name: "静宁", point: [105.73, 35.52], armies: [1, 3] },
  { name: "泾川", point: [107.37, 35.33], armies: [3] },
  { name: "华亭", point: [106.65, 35.22], armies: [3] },
  { name: "合水", point: [108.02, 35.82], armies: [3] },
];

/** Keep town names legible without moving their true geographic anchor dots. */
export function layoutJourneyCities(
  width: number,
  visibleArmies: boolean[],
  height = width * 0.9,
  reserveControls = false,
  keyCitiesOnly = false,
) {
  const placed: { x: number; y: number; half: number }[] = [];
  const visibleCities = journeyRouteCities.filter((city) =>
    city.armies.some((i) => visibleArmies[i]),
  );
  // Keep the phone overview sparse, including after zooming. Fall back to
  // other armies' landmarks when their routes are the only ones selected.
  const mobileNames = [
    "于都",
    "遵义",
    "吴起镇",
    "会宁",
    "桑植",
    "甘孜",
    "将台堡",
    "苍溪",
    "懋功",
    "罗山",
    "商县",
    "永坪",
    "南召",
  ]
    .filter((name) => visibleCities.some((city) => city.name === name))
    .slice(0, 4);
  return visibleCities
    .filter((city) => !keyCitiesOnly || mobileNames.includes(city.name))
    .map((city) => {
      const [anchorX, anchorY] = projectJourney(city.point).map(
        (v) => (v * width) / 1000,
      );
      const half = city.name.length * 6 + 5;
      const candidates: { x: number; y: number; score: number }[] = [];
      const reach = city.major ? 140 : Math.min(140, 40 + width * 0.06);
      for (let dy = -reach; dy <= reach; dy += 8)
        for (let dx = -reach; dx <= reach; dx += 8) {
          const x = Math.max(
            half + 2,
            Math.min(width - half - 2, anchorX + dx),
          );
          const y = Math.max(12, Math.min(height - 12, anchorY + dy));
          if (reserveControls && x + half > width - 88 && y + 10 > height - 44)
            continue;
          if (Math.abs(x - anchorX) < half + 4 && Math.abs(y - anchorY) < 12)
            continue;
          if (
            placed.some(
              (p) =>
                Math.abs(p.x - x) < p.half + half + 3 && Math.abs(p.y - y) < 23,
            )
          )
            continue;
          candidates.push({
            x,
            y,
            score: (x - anchorX) ** 2 + (y - anchorY) ** 2,
          });
        }
      candidates.sort((a, b) => a.score - b.score);
      const position = candidates[0];
      if (position) placed.push({ ...position, half });
      return {
        ...city,
        x: position?.x ?? anchorX,
        y: position?.y ?? anchorY,
        anchorX,
        anchorY,
        showLabel: Boolean(position),
      };
    });
}
export function geographicPath(points: readonly GeoPoint[]) {
  return points
    .map(
      (pt, i) =>
        `${i ? "L" : "M"}${projectJourney(pt)
          .map((v) => v.toFixed(2))
          .join(",")}`,
    )
    .join(" ");
}
// Only label cards move. Their geographic anchors remain fixed and are linked
// by fine leaders, preserving real positions even in the dense southern cluster.
export function layoutJourneyLabels(
  width: number,
  compact: boolean,
  visibleHeight?: number,
) {
  const scale = width / MAP_WIDTH,
    height = visibleHeight ?? width * 0.9;
  const halfW = compact ? 22 : 57,
    halfH = 22;
  const anchors = journeyLocations.map((s) =>
    projectJourney(s.point).map((v) => v * scale),
  );
  const nodes = anchors.map(([x, y]) => ({
    x: Math.max(halfW, Math.min(width - halfW, x)),
    y: Math.max(halfH, Math.min(height - halfH, y)),
  }));
  // Place each label in its nearest free position. Fixed anchors and leaders
  // remain the source of geographic position, not the displaced label cards.
  const toolbarClear = (x: number, y: number) =>
    !compact ||
    visibleHeight === undefined ||
    x + halfW <= width - 88 ||
    y + halfH <= height - 44;
  let placed: { x: number; y: number }[] = [];
  for (let i = 0; i < nodes.length; i++) {
    const free = (x: number, y: number) =>
      toolbarClear(x, y) &&
      placed.every(
        (n) =>
          Math.abs(n.x - x) >= halfW * 2 + 2 ||
          Math.abs(n.y - y) >= halfH * 2 + 2,
      );
    let best = nodes[i];
    if (!free(best.x, best.y)) {
      let distance = Infinity;
      for (let y = halfH; y <= height - halfH; y += 3)
        for (let x = halfW; x <= width - halfW; x += 3) {
          const cost = (x - anchors[i][0]) ** 2 + (y - anchors[i][1]) ** 2;
          if (cost < distance && free(x, y)) {
            distance = cost;
            best = { x, y };
          }
        }
    }
    placed.push(best);
  }
  // Tiny screens need a guaranteed collision-free fallback, including room
  // for the two zoom controls. Leaders keep the geographic anchors unchanged.
  const collides = placed.some(
    (a, i) =>
      !toolbarClear(a.x, a.y) ||
      placed
        .slice(i + 1)
        .some(
          (b) =>
            Math.abs(a.x - b.x) < halfW * 2 || Math.abs(a.y - b.y) < halfH * 2,
        ),
  );
  if (collides) {
    const slots: { x: number; y: number }[] = [];
    for (let y = halfH; y <= height - halfH; y += halfH * 2)
      for (let x = halfW; x <= width - halfW; x += halfW * 2) {
        if (toolbarClear(x, y)) slots.push({ x, y });
      }
    if (slots.length >= anchors.length)
      placed = anchors.map(([x, y]) => {
        let nearest = 0;
        for (let j = 1; j < slots.length; j++)
          if (
            (slots[j].x - x) ** 2 + (slots[j].y - y) ** 2 <
            (slots[nearest].x - x) ** 2 + (slots[nearest].y - y) ** 2
          )
            nearest = j;
        return slots.splice(nearest, 1)[0];
      });
  }
  return placed.map((n, i) => ({
    ...n,
    anchorX: anchors[i][0],
    anchorY: anchors[i][1],
  }));
}

/** Position the expanded terrain in the same coordinate frame as the route. */
export function expandedJourneyFrame(
  viewportWidth: number,
  mapWidth: number,
  origin: { x: number; y: number },
) {
  return {
    width: (mapWidth * 51) / 19.5,
    height: (mapWidth * 0.9 * 44) / 15,
    left: origin.x + (viewportWidth - mapWidth) / 2 - (mapWidth * 12.5) / 19.5,
    top:
      origin.y +
      (viewportWidth - mapWidth) * 0.45 -
      (mapWidth * 0.9 * 13.5) / 15,
  };
}

/** Allow four-way exploration at every zoom without uncovering image edges. */
export function journeyPanBounds(
  width: number,
  mapWidth: number,
  mapHeight: number,
  origin: { x: number; y: number },
  page: { width: number; height: number },
) {
  const frame = expandedJourneyFrame(width, mapWidth, origin);
  const travelX =
    Math.max(0, (mapWidth - width) / 2) + Math.min(120, width * 0.2);
  const travelY =
    Math.max(0, (mapWidth - width) * 0.45) + Math.min(90, mapHeight * 0.2);
  return {
    minX: -Math.min(
      travelX,
      Math.max(0, frame.left + frame.width - page.width),
    ),
    maxX: Math.min(travelX, Math.max(0, -frame.left)),
    minY: -Math.min(
      travelY,
      Math.max(0, frame.top + frame.height - page.height),
    ),
    maxY: Math.min(travelY, Math.max(0, -frame.top)),
  };
}
