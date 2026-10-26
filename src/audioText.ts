export function speechParts(text: string) {
  const sentences =
    text
      .replace(/\s+/g, " ")
      .trim()
      .match(/[^。！？；\n]+[。！？；]?/g) || [];
  const chunks: string[] = [];
  let part = "";
  for (const sentence of sentences) {
    if (part.length + sentence.length > 500 && part) {
      chunks.push(part);
      part = "";
    }
    for (let i = 0; i < sentence.length; i += 500) {
      const piece = sentence.slice(i, i + 500);
      if (part.length + piece.length > 500) {
        chunks.push(part);
        part = "";
      }
      part += piece;
    }
  }
  if (part) chunks.push(part);
  return chunks;
}
