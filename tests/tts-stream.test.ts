import test from "node:test";
import assert from "node:assert/strict";
import { audioChunks, ttsRequest } from "../server/tts.mjs";
test("TTS defaults to 白桦 with no style message", () => {
  const request = ttsRequest("正文。", {});
  assert.equal(request.audio.voice, "白桦");
  assert.equal(request.audio.format, "pcm16");
  assert.equal(request.stream, true);
  assert.deepEqual(request.messages, [{ role: "assistant", content: "正文。" }]);
});
test("TTS voice and style come from environment without changing the text", () => {
  const request = ttsRequest("正文。", {
    MIMO_TTS_VOICE: " 苏打 ",
    MIMO_TTS_PROMPT: "  语速稍慢。\n句间自然停顿。  ",
  });
  assert.equal(request.audio.voice, "苏打");
  assert.deepEqual(request.messages, [
    { role: "user", content: "语速稍慢。\n句间自然停顿。" },
    { role: "assistant", content: "正文。" },
  ]);
});
test("Empty voice falls back and blank style never adds a user message", () => {
  for (const blank of ["", " \n "]) {
    const request = ttsRequest("正文。", {
      MIMO_TTS_VOICE: blank,
      MIMO_TTS_PROMPT: blank,
    });
    assert.equal(request.audio.voice, "白桦");
    assert.deepEqual(request.messages, [{ role: "assistant", content: "正文。" }]);
  }
});
test("MiMo stream tolerates fragmented SSE and skips metadata frames", async () => {
  const pcm = Buffer.from([1, 2, 3, 4]);
  const input = `data: {"choices":[]}\n\ndata: ${JSON.stringify({ choices: [{ delta: { audio: { data: pcm.toString("base64") } } }] })}\r\n\r\ndata: [DONE]\n\n`;
  async function* bytes() {
    for (let i = 0; i < input.length; i += 3)
      yield Buffer.from(input.slice(i, i + 3));
  }
  const result = [];
  for await (const chunk of audioChunks(bytes())) result.push(chunk);
  assert.deepEqual(Buffer.concat(result), pcm);
});
test("upstream error is surfaced instead of a successful silent stream", async () => {
  async function* bytes() {
    yield Buffer.from('data: {"error":{"message":"quota"}}\n\n');
  }
  await assert.rejects(async () => {
    for await (const chunk of audioChunks(bytes())) void chunk;
  });
});
