import test from "node:test";
import assert from "node:assert/strict";
import { publicConfig } from "../server/public-config.mjs";

test("version card defaults to one anniversary line", () => {
  assert.deepEqual(publicConfig({}), { producerLines: ["纪念长征胜利90周年专题"] });
});
test("version card accepts two configurable lines and omits blank lines", () => {
  assert.deepEqual(publicConfig({ SITE_PRODUCER: " 交付事业部 ", SITE_PRODUCER_BRANCH: "测试工程党支部" }), {
    producerLines: ["交付事业部", "测试工程党支部"],
  });
  assert.deepEqual(publicConfig({ SITE_PRODUCER: "专题", SITE_PRODUCER_BRANCH: "  " }), { producerLines: ["专题"] });
  assert.deepEqual(publicConfig({ SITE_PRODUCER: "", SITE_PRODUCER_BRANCH: "" }), { producerLines: [] });
});
test("public configuration never includes unrelated environment values", () => {
  assert.deepEqual(publicConfig({ MIMO_API_KEY: "private-test-key", MIMO_TTS_PROMPT: "private", OTHER_SECRET: "secret" }), {
    producerLines: ["纪念长征胜利90周年专题"],
  });
});
