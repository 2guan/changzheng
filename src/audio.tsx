import { speechParts } from "./audioText";
import { hasPlayedNarration, markNarrationPlayed } from "./narrationHistory";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  Microphone,
  Stop,
  MusicNotes,
  Play,
  Pause,
  X,
  CircleNotch,
} from "@phosphor-icons/react";

type Track = { title: string; src: string; credit?: string };
type AudioState = { id: string; loading: boolean; error: string };
type AudioService = {
  state: AudioState;
  speak: (id: string, text: string) => void;
  stop: (id?: string) => void;
  musicVolume: number;
  voiceVolume: number;
  setMusicVolume: (v: number) => void;
  setVoiceVolume: (v: number) => void;
  tracks: Track[];
  selected: number;
  selectTrack: (n: number) => void;
  playing: boolean;
  toggleMusic: () => void;
  musicError: string;
};
const AudioContextValue = createContext<AudioService>(null!);
export const useAudio = () => useContext(AudioContextValue);
const preference = (name: string, fallback: number) => {
  try {
    const stored = localStorage.getItem(name);
    const v = Number(stored);
    return stored !== null && Number.isFinite(v)
      ? Math.min(1, Math.max(0, v))
      : fallback;
  } catch {
    return fallback;
  }
};
export function AudioProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AudioState>({
    id: "",
    loading: false,
    error: "",
  });
  const [musicVolume, setMusicVolume] = useState(() =>
    preference("changzheng-music-volume", 0.3),
  );
  const [voiceVolume, setVoiceVolume] = useState(() =>
    preference("changzheng-voice-volume", 0.7),
  );
  const voiceVolumeRef = useRef(voiceVolume);
  voiceVolumeRef.current = voiceVolume;
  const ctx = useRef<AudioContext | null>(null),
    gain = useRef<GainNode | null>(null);
  const sources = useRef(new Set<AudioBufferSourceNode>());
  const controller = useRef<AbortController | null>(null),
    current = useRef(""),
    epoch = useRef(0);
  const music = useRef<HTMLAudioElement | null>(null);
  const [tracks, setTracks] = useState<Track[]>([]),
    [selected, setSelected] = useState(0),
    [playing, setPlaying] = useState(false),
    [musicError, setMusicError] = useState("");
  const stop = useCallback((id?: string) => {
    if (id && current.current !== id) return;
    epoch.current++;
    controller.current?.abort();
    controller.current = null;
    sources.current.forEach((s) => {
      try {
        s.stop();
      } catch {
        /* Already ended. */
      }
    });
    sources.current.clear();
    current.current = "";
    setState({ id: "", loading: false, error: "" });
  }, []);
  useEffect(() => {
    const el = music.current!;
    const error = () => {
      setPlaying(false);
      setMusicError("音乐未能加载，请重试。");
    };
    el.addEventListener("error", error);
    const request = new AbortController();
    fetch("/audio/tracks.json", { signal: request.signal })
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data))
          setTracks(
            data.filter(
              (t) =>
                typeof t.title === "string" &&
                typeof t.src === "string" &&
                t.src.startsWith("/audio/"),
            ),
          );
      })
      .catch(() => {});
    return () => {
      request.abort();
      el.pause();
      el.removeEventListener("error", error);
      stop();
      void ctx.current?.close();
      ctx.current = null;
      gain.current = null;
    };
  }, [stop]);
  useEffect(() => {
    if (music.current) music.current.volume = musicVolume;
    try {
      localStorage.setItem("changzheng-music-volume", String(musicVolume));
    } catch {}
  }, [musicVolume]);
  useEffect(() => {
    if (gain.current) gain.current.gain.value = voiceVolume;
    try {
      localStorage.setItem("changzheng-voice-volume", String(voiceVolume));
    } catch {}
  }, [voiceVolume]);
  const voiceContext = useCallback(() => {
    if (!ctx.current || ctx.current.state === "closed") {
      ctx.current = new AudioContext();
      gain.current = ctx.current.createGain();
      gain.current.connect(ctx.current.destination);
    }
    gain.current!.gain.value = voiceVolumeRef.current;
    return ctx.current;
  }, []);
  const speak = useCallback(
    async (id: string, text: string) => {
      if (current.current === id) {
        stop();
        return;
      }
      stop();
      const run = epoch.current;
      const abort = new AbortController();
      controller.current = abort;
      current.current = id;
      setState({ id, loading: true, error: "" });
      try {
        const audio = voiceContext();
        await audio.resume();
        if (run !== epoch.current) return;
        let when = audio.currentTime + 0.12,
          received = false;
        const sleep = (ms: number) =>
          new Promise<void>((resolve, reject) => {
            const cancel = () => {
              clearTimeout(timer);
              reject(new DOMException("Aborted", "AbortError"));
            };
            const timer = setTimeout(() => {
              abort.signal.removeEventListener("abort", cancel);
              resolve();
            }, ms);
            abort.signal.addEventListener("abort", cancel, { once: true });
          });
        const parts = speechParts(text);
        if (!parts.length) throw new Error("这一页暂时没有可朗读的正文。");
        for (const part of parts) {
          if (run !== epoch.current) return;
          const response = await fetch("/api/tts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: part }),
            signal: abort.signal,
          });
          if (!response.ok) {
            const result = await response.json().catch(() => ({}));
            throw new Error(result.error || "讲解暂时无法连接，请稍后重试。");
          }
          if (!response.body) throw new Error("浏览器暂不支持流式讲解。");
          const reader = response.body.getReader();
          let carry: number | undefined;
          while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            if (run !== epoch.current) {
              await reader.cancel();
              return;
            }
            let bytes = value;
            if (carry !== undefined) {
              bytes = new Uint8Array(value.length + 1);
              bytes[0] = carry;
              bytes.set(value, 1);
              carry = undefined;
            }
            if (bytes.length % 2) {
              carry = bytes[bytes.length - 1];
              bytes = bytes.subarray(0, -1);
            }
            if (!bytes.length) continue;
            const buffer = audio.createBuffer(1, bytes.length / 2, 24000),
              samples = buffer.getChannelData(0),
              view = new DataView(
                bytes.buffer,
                bytes.byteOffset,
                bytes.byteLength,
              );
            for (let i = 0; i < samples.length; i++)
              samples[i] = view.getInt16(i * 2, true) / 32768;
            const source = audio.createBufferSource();
            source.buffer = buffer;
            source.connect(gain.current!);
            sources.current.add(source);
            source.onended = () => {
              sources.current.delete(source);
              source.disconnect();
            };
            when = Math.max(when, audio.currentTime + 0.06);
            source.start(when);
            when += buffer.duration;
            if (!received) {
              received = true;
              setState({ id, loading: false, error: "" });
            }
          }
          if (carry !== undefined) throw new Error("讲解音频不完整，请重试。");
          // Bound the queued audio before asking for another paragraph.
          while (when - audio.currentTime > 2 && run === epoch.current)
            await sleep(200);
        }
        if (!received) throw new Error("未收到讲解音频，请重试。");
        while (when > audio.currentTime && run === epoch.current)
          await sleep(150);
        if (run === epoch.current) {
          current.current = "";
          setState({ id: "", loading: false, error: "" });
        }
      } catch (error) {
        if (run !== epoch.current) return;
        stop();
        setState({
          id,
          loading: false,
          error:
            error instanceof Error ? error.message : "讲解播放失败，请重试。",
        });
      }
    },
    [stop, voiceContext],
  );
  const playTrack = async (n: number) => {
    const el = music.current,
      track = tracks[n];
    if (!el || !track) return;
    // Unlock speech in the same user gesture as music, for later page introductions.
    void voiceContext()
      .resume()
      .catch(() => {});
    setMusicError("");
    if (el.getAttribute("src") !== track.src) el.src = track.src;
    try {
      await el.play();
      setPlaying(true);
    } catch {
      setPlaying(false);
      setMusicError("音乐未能播放，请点击重试。");
    }
  };
  const toggleMusic = () => {
    if (playing) {
      music.current?.pause();
      setPlaying(false);
    } else void playTrack(selected);
  };
  const selectTrack = (n: number) => {
    music.current?.pause();
    setPlaying(false);
    setSelected(n);
    setMusicError("");
  };
  return (
    <AudioContextValue.Provider
      value={{
        state,
        speak,
        stop,
        musicVolume,
        voiceVolume,
        setMusicVolume,
        setVoiceVolume,
        tracks,
        selected,
        selectTrack,
        playing,
        toggleMusic,
        musicError,
      }}
    >
      <audio ref={music} loop preload="none" aria-label="背景音乐" hidden />
      {children}
    </AudioContextValue.Provider>
  );
}
export function NarrateButton({
  id,
  text,
  label = "讲解",
  iconOnly = false,
  pageGuide = false,
}: {
  id: string;
  text: string | (() => string);
  label?: string;
  iconOnly?: boolean;
  pageGuide?: boolean;
}) {
  const audio = useAudio();
  const active = audio.state.id === id && !audio.state.error;
  useEffect(() => () => audio.stop(id), [id, audio.stop]);
  return (
    <span className="narration-control" data-no-narration>
      <button
        className={`narrate-button ${pageGuide ? "page-guide-button" : ""} ${active ? "is-speaking" : ""}`}
        aria-label={active ? `停止${label}` : label}
        aria-pressed={active}
        aria-busy={active && audio.state.loading}
        onClick={() =>
          audio.speak(id, typeof text === "function" ? text() : text)
        }
      >
        {active ? (
          audio.state.loading ? (
            <CircleNotch className="audio-loading" />
          ) : (
            <Stop weight="fill" />
          )
        ) : (
          <Microphone aria-hidden="true" />
        )}
        {!iconOnly && (
          <span>
            {active ? (audio.state.loading ? "连接中…" : "停止朗读") : label}
          </span>
        )}
      </button>
      {audio.state.id === id && audio.state.error && (
        <span className="narration-error" role="alert">
          {audio.state.error}
        </span>
      )}
    </span>
  );
}

/** Autoplay only unheard page guides; successful manual playback counts too. */
export function PageNarrateButton({
  id,
  text,
  label,
  enabled = true,
}: {
  id: string;
  text: string;
  label: string;
  enabled?: boolean;
}) {
  const audio = useAudio();
  const latest = useRef({ audio, text, enabled });
  latest.current = { audio, text, enabled };
  useEffect(() => {
    if (audio.state.id === id && !audio.state.loading && !audio.state.error)
      markNarrationPlayed(id);
  }, [id, audio.state.id, audio.state.loading, audio.state.error]);
  useEffect(() => {
    if (
      !latest.current.audio.playing ||
      !latest.current.enabled ||
      hasPlayedNarration(id)
    )
      return;
    // Cancel quick transitions and StrictMode's trial mount before requesting TTS.
    const timer = window.setTimeout(() => {
      const { audio, text, enabled } = latest.current;
      // A manual reading started during entry takes precedence.
      if (
        enabled &&
        audio.playing &&
        !hasPlayedNarration(id) &&
        (!audio.state.id || audio.state.error)
      )
        audio.speak(id, text);
    }, 200);
    return () => window.clearTimeout(timer);
  }, [id]);
  return <NarrateButton id={id} text={text} label={label} iconOnly pageGuide />;
}

export function AudioControls() {
  const audio = useAudio(),
    panel = useRef<HTMLDivElement>(null),
    id = useId();
  const track = audio.tracks[audio.selected];
  return (
    <>
      <button
        className={`icon-button header-icon ${audio.playing ? "active" : ""}`}
        aria-label="音乐与讲解音量"
        title="音乐与讲解音量"
        popoverTarget={id}
      >
        <MusicNotes size={21} weight={audio.playing ? "fill" : "regular"} />
      </button>
      <div
        id={id}
        ref={panel}
        popover="auto"
        className="audio-panel"
        role="dialog"
        aria-label="声音设置"
      >
        <header>
          <span>沿途的声音</span>
          <button
            className="icon-button"
            aria-label="关闭声音设置"
            onClick={() => panel.current?.hidePopover()}
          >
            <X />
          </button>
        </header>
        <div className="audio-track-heading">
          <p className="audio-track-name">{track?.title || "暂无可用曲目"}</p>
          {track && (
            <button
              className="audio-play"
              aria-label={audio.playing ? "暂停音乐" : "播放音乐"}
              onClick={audio.toggleMusic}
            >
              {audio.playing ? (
                <Pause aria-hidden="true" />
              ) : (
                <Play aria-hidden="true" />
              )}
            </button>
          )}
        </div>
        {track?.credit && <small>{track.credit}</small>}
        {audio.tracks.length > 1 && (
          <label className="audio-track-select">
            背景曲目
            <select
              value={audio.selected}
              onChange={(e) => audio.selectTrack(Number(e.target.value))}
            >
              {audio.tracks.map((t, i) => (
                <option key={t.src} value={i}>
                  {t.title}
                </option>
              ))}
            </select>
          </label>
        )}
        {!track && (
          <p className="audio-empty">音乐暂未加载，请稍后刷新页面。</p>
        )}
        <label className="audio-volume">
          背景音乐 <output>{Math.round(audio.musicVolume * 100)}%</output>
          <input
            aria-label="背景音乐音量"
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={audio.musicVolume}
            onChange={(e) => audio.setMusicVolume(Number(e.target.value))}
          />
        </label>
        <label className="audio-volume">
          讲解 <output>{Math.round(audio.voiceVolume * 100)}%</output>
          <input
            aria-label="讲解音量"
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={audio.voiceVolume}
            onChange={(e) => audio.setVoiceVolume(Number(e.target.value))}
          />
        </label>
        {audio.state.id && !audio.state.error && (
          <button className="audio-stop" onClick={() => audio.stop()}>
            <Stop />
            停止当前讲解
          </button>
        )}
        {audio.musicError && <p role="alert">{audio.musicError}</p>}
      </div>
    </>
  );
}
