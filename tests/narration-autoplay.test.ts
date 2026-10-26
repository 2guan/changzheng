import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import ts from "typescript";

// Run the real page-guide effects and storage code with a controlled audio state.
function setup(saved = new Map<string, string>(), storageBlocked = false) {
  const storage = {
    getItem(key: string) {
      if (storageBlocked) throw new Error("Storage unavailable");
      return saved.get(key) ?? null;
    },
    setItem(key: string, value: string) {
      if (storageBlocked) throw new Error("Storage unavailable");
      saved.set(key, value);
    },
  };
  const compile = (path: string, globals: Record<string, unknown>) => {
    const exports: any = {};
    runInNewContext(
      ts.transpileModule(readFileSync(new URL(path, import.meta.url), "utf8"), {
        compilerOptions: {
          module: ts.ModuleKind.CommonJS,
          target: ts.ScriptTarget.ES2022,
          jsx: ts.JsxEmit.ReactJSX,
        },
      }).outputText,
      { exports, ...globals },
    );
    return exports;
  };
  const history = compile("../src/narrationHistory.ts", {
    localStorage: storage,
  });
  const effects: (() => unknown)[] = [];
  const timers = new Map<number, () => void>();
  const calls: string[] = [];
  let nextTimer = 0;
  const audio = {
    playing: true,
    state: { id: "", loading: false, error: "" },
    speak: (id: string) => calls.push(id),
    stop() {},
  };
  const jsx = (type: unknown, props: any) => ({ type, props });
  const module = compile("../src/audio.tsx", {
    require: (name: string) => {
      if (name === "./narrationHistory") return history;
      if (name === "react/jsx-runtime") return { jsx, jsxs: jsx };
      if (name === "react")
        return {
          createContext: () => ({}),
          useContext: () => audio,
          useRef: (current: unknown) => ({ current }),
          useEffect: (effect: () => unknown) => effects.push(effect),
        };
      return {};
    },
    window: {
      setTimeout: (fn: () => void) => {
        timers.set(++nextTimer, fn);
        return nextTimer;
      },
      clearTimeout: (id: number) => timers.delete(id),
    },
  });
  return {
    audio,
    calls,
    saved,
    history,
    render(id = "module-home", enabled = true) {
      effects.length = 0;
      const element = module.PageNarrateButton({
        id,
        text: "讲解正文",
        label: "讲解",
        enabled,
      });
      const cleanups = effects.map((effect) => effect());
      return {
        cleanup: () =>
          cleanups.forEach((fn) => {
            if (typeof fn === "function") fn();
          }),
        manualClick: () => {
          const button = module.NarrateButton(element.props).props.children[0];
          button.props.onClick();
        },
      };
    },
    flush() {
      const pending = [...timers.values()];
      timers.clear();
      pending.forEach((fn) => fn());
    },
  };
}

test("successful autoplay is remembered across navigation and browser reloads", () => {
  const s = setup();
  s.render();
  s.flush();
  assert.deepEqual(s.calls, ["module-home"]);
  s.audio.state = { id: "module-home", loading: false, error: "" };
  s.render();
  const reloaded = setup(s.saved);
  reloaded.render();
  reloaded.flush();
  assert.deepEqual(reloaded.calls, []);
  reloaded.render("station-1");
  reloaded.flush();
  assert.deepEqual(reloaded.calls, ["station-1"]);
});

test("manual playback without music suppresses later autoplay but allows manual replay", () => {
  const s = setup();
  s.audio.playing = false;
  s.render().manualClick();
  s.audio.state = { id: "module-home", loading: false, error: "" };
  s.render();
  s.audio.state = { id: "", loading: false, error: "" };
  s.audio.playing = true;
  const page = s.render();
  s.flush();
  assert.equal(s.calls.length, 1);
  page.manualClick();
  assert.equal(s.calls.length, 2);
});

test("loading, failed requests and unrelated detail readings do not count as heard", () => {
  for (const state of [
    { id: "module-home", loading: true, error: "" },
    { id: "module-home", loading: false, error: "连接失败" },
    { id: "reader-detail", loading: false, error: "" },
  ]) {
    const s = setup();
    s.audio.playing = false;
    s.audio.state = state;
    s.render();
    assert.equal(s.history.hasPlayedNarration("module-home"), false);
    s.audio.playing = true;
    s.audio.state = { id: "", loading: false, error: "" };
    s.render();
    s.flush();
    assert.deepEqual(s.calls, ["module-home"]);
  }
});

test("cancelled navigation and covered pages do not start autoplay", () => {
  const s = setup();
  s.render().cleanup();
  s.flush();
  s.render("module-home", false);
  s.flush();
  assert.deepEqual(s.calls, []);
});

test("a manual start during the entry delay prevents a duplicate autoplay", () => {
  const s = setup();
  s.render();
  s.audio.state = { id: "module-home", loading: false, error: "" };
  s.render();
  s.flush();
  assert.deepEqual(s.calls, []);
});

test("blocked browser storage still remembers playback until the tab is closed", () => {
  const s = setup(new Map(), true);
  s.audio.state = { id: "station-3", loading: false, error: "" };
  s.render("station-3");
  s.audio.state = { id: "", loading: false, error: "" };
  s.render("station-3");
  s.flush();
  assert.deepEqual(s.calls, []);
});
