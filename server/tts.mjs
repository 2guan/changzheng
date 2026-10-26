/** Empty style instructions are omitted so the selected preset speaks naturally. */
export function ttsRequest(text, env = process.env) {
  const voice = env.MIMO_TTS_VOICE?.trim() || "白桦";
  const prompt = env.MIMO_TTS_PROMPT?.trim() || "";
  return {
    model: "mimo-v2.5-tts",
    stream: true,
    audio: { voice, format: "pcm16" },
    messages: [
      ...(prompt ? [{ role: "user", content: prompt }] : []),
      { role: "assistant", content: text },
    ],
  };
}

/** MiMo SSE frames can be split at any network byte boundary. */
export async function* audioChunks(body) {
  const decoder = new TextDecoder();
  let pending = "";
  for await (const bytes of body) {
    pending += decoder.decode(bytes, { stream: true });
    let end;
    while ((end = pending.indexOf("\n")) >= 0) {
      const line = pending.slice(0, end).trim();
      pending = pending.slice(end + 1);
      if (!line.startsWith("data:")) continue;
      const data = line.slice(5).trim();
      if (!data || data === "[DONE]") continue;
      const frame = JSON.parse(data);
      if (frame.error) throw new Error("语音服务暂时不可用，请稍后重试。");
      const audio = frame.choices?.[0]?.delta?.audio?.data;
      if (audio) yield Buffer.from(audio, "base64");
    }
  }
  if (pending.trim() && !pending.includes("[DONE]"))
    throw new Error("语音流意外中断");
}
