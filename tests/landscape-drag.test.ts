import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import ts from "typescript";
import { focalPan } from "../src/landscapeFocus.ts";

// Exercise the real pointer handlers with a mobile surface and a controlled frame clock.
function setup() {
  const effects: (() => unknown)[] = [];
  const updates: unknown[] = [];
  const frames = new Map<number, () => void>();
  let nextFrame = 0;
  const exports: any = {};
  const source = readFileSync(
    new URL("../src/components/useLandscapeDrag.ts", import.meta.url),
    "utf8",
  );
  runInNewContext(
    ts.transpileModule(source, {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
      },
    }).outputText,
    {
      exports,
      require: (id: string) =>
        id === "react"
          ? {
              useRef: (current: unknown) => ({ current }),
              useState: (initial: unknown) => [
                initial,
                (value: unknown) => updates.push(value),
              ],
              useEffect: (effect: () => unknown) => effects.push(effect),
            }
          : { focalPan },
      requestAnimationFrame: (fn: () => void) => {
        frames.set(++nextFrame, fn);
        return nextFrame;
      },
      cancelAnimationFrame: (id: number) => frames.delete(id),
      ResizeObserver: class {
        observe() {}
        disconnect() {}
      },
      window: { matchMedia: () => ({ matches: true }) },
    },
  );
  const hook = exports.useLandscapeDrag("home", false, 0.5);
  const surface = {
    clientWidth: 390,
    setPointerCapture() {},
    hasPointerCapture: () => false,
  };
  const image = {
    naturalWidth: 2000,
    naturalHeight: 1000,
    clientHeight: 800,
    style: {} as Record<string, string>,
    addEventListener() {},
    removeEventListener() {},
  };
  hook.surface.current = surface;
  hook.artwork.current = image;
  const cleanups = effects.map((effect) => effect());
  const flush = () => {
    const callbacks = [...frames.values()];
    frames.clear();
    callbacks.forEach((fn) => fn());
  };
  flush();
  updates.length = 0;
  const event = (x: number, y: number, control = false) => ({
    pointerId: 1,
    isPrimary: true,
    button: 0,
    clientX: x,
    clientY: y,
    currentTarget: surface,
    target: {
      closest: (selector: string) =>
        control && selector.includes("button") ? {} : null,
    },
  });
  return { hook, image, updates, frames, flush, event, cleanups };
}

test("mobile drag batches moves into one frame without rerendering the map per move", () => {
  const s = setup();
  const initial = s.image.style.transform;
  s.hook.handlers.onPointerDown(s.event(100, 100));
  for (let x = 110; x <= 230; x++)
    s.hook.handlers.onPointerMove(s.event(x, 102));
  assert.equal(s.frames.size, 1);
  assert.deepEqual(s.updates, [true]);
  assert.equal(s.image.style.transform, initial);
  s.flush();
  assert.notEqual(s.image.style.transform, initial);
  s.hook.handlers.onPointerUp(s.event(230, 102));
  let prevented = false;
  s.hook.handlers.onClickCapture({
    preventDefault() {
      prevented = true;
    },
    stopPropagation() {},
  });
  assert.equal(prevented, true);
  assert.deepEqual(s.updates, [true, false]);
});

test("vertical swipes, taps and toolbar controls do not pan or suppress navigation", () => {
  for (const mode of ["vertical", "tap", "control"]) {
    const s = setup();
    const initial = s.image.style.transform;
    s.hook.handlers.onPointerDown(s.event(100, 100, mode === "control"));
    if (mode !== "tap")
      s.hook.handlers.onPointerMove(
        s.event(mode === "vertical" ? 102 : 200, 140),
      );
    s.hook.handlers.onPointerUp(s.event(102, 140));
    s.flush();
    assert.equal(s.image.style.transform, initial);
    s.hook.handlers.onClickCapture({
      preventDefault() {
        assert.fail("ordinary tap was blocked");
      },
      stopPropagation() {},
    });
  }
});

test("leaving the page cancels pending drag frames", () => {
  const s = setup();
  s.hook.handlers.onPointerDown(s.event(100, 100));
  s.hook.handlers.onPointerMove(s.event(150, 100));
  assert.equal(s.frames.size, 1);
  s.cleanups.forEach((fn) => {
    if (typeof fn === "function") fn();
  });
  assert.equal(s.frames.size, 0);
});
