/** Read visible editorial text in DOM order, including captions and comparison figures. */
export function readingSpeech(root: HTMLElement | null): string {
  if (!root) return "";
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const groups: { block: Element; parts: string[] }[] = [];
  let node: Node | null;
  while ((node = walker.nextNode())) {
    const parent = node.parentElement;
    const text = node.textContent?.replace(/\s+/g, " ").trim();
    if (!parent || !text) continue;
    if (
      parent.closest(
        'input,textarea,select,label,summary,svg,[hidden],[aria-hidden="true"],[data-no-narration],.sources,.source-block,.fineprint,.poetry-practice,[role="status"]',
      )
    )
      continue;
    if (
      parent.closest("button,a.text-button,a.button") &&
      !parent.closest(".poem-lines")
    )
      continue;
    if (
      !parent.getClientRects().length ||
      getComputedStyle(parent).visibility === "hidden"
    )
      continue;
    const block =
      parent.closest(
        "h1,h2,h3,h4,p,li,blockquote,dt,dd,tr,figcaption,.poem-lines,div",
      ) || parent;
    const last = groups.at(-1);
    if (last?.block === block) last.parts.push(text);
    else groups.push({ block, parts: [text] });
  }
  return groups.map((g) => g.parts.join(" ")).join("。\n");
}
