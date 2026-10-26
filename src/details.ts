import { atlasRoutes, atlasSelection, isAtlasRoute } from "./atlas.ts";

/** Resolve old and current detail links to one selected map node. */
export function atlasDetail(page: string, params: URLSearchParams) {
  if (page === "journey" || !atlasRoutes[page] || isAtlasRoute(page, params))
    return null;
  const route = atlasRoutes[page];
  const focus =
    page === "meaning" && params.get("focus") === "questions"
      ? "anniversary"
      : params.get("focus");
  const focusIndex = route.stops.findIndex(
    (stop) =>
      new URLSearchParams(stop.href.split("?")[1]).get("focus") === focus,
  );
  const stop =
    (!params.has("stop") || page === "meaning") &&
    params.has("focus") &&
    focusIndex >= 0
      ? focusIndex + 1
      : atlasSelection(page, params);
  const node = route.stops[stop - 1];
  return {
    page,
    stop,
    title: node.title,
    params: new URLSearchParams(node.href.split("?")[1]),
  };
}
