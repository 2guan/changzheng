/** Explicit public allowlist: never expose the server environment wholesale. */
export function publicConfig(env = process.env) {
  return {
    producerLines: [
      env.SITE_PRODUCER ?? "纪念长征胜利90周年专题",
      env.SITE_PRODUCER_BRANCH ?? "",
    ].map((line) => line.trim()).filter(Boolean),
  };
}
