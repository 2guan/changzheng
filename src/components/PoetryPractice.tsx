import { useState } from "react";
import { Check, Eye, EyeSlash } from "@phosphor-icons/react";
export function PoetryPractice({
  poem,
}: {
  poem: { title: string; lines: string[] };
}) {
  const [hidden, setHidden] = useState(false),
    [revealed, setRevealed] = useState<number[]>([]),
    [answer, setAnswer] = useState(""),
    [checked, setChecked] = useState(false);
  const line = poem.lines[0];
  const parts = line.split(/[，。]/).filter(Boolean);
  const missing = parts[parts.length - 1];
  return (
    <section className="poetry-practice">
      <div className="section-heading">
        <div>
          <span className="chapter-label">把诗句，留在心里</span>
          <h2>读过，再试着回想。</h2>
        </div>
        <button
          className="text-button"
          onClick={() => {
            setHidden((h) => !h);
            setRevealed([]);
          }}
        >
          {hidden ? <Eye /> : <EyeSlash />}
          {hidden ? "显示全文" : "遮住诗句，自主背诵"}
        </button>
      </div>
      <div className="recite-lines">
        {poem.lines.map((l, i) => (
          <button
            key={l}
            aria-label={
              hidden && !revealed.includes(i) ? `揭晓第${i + 1}句` : l
            }
            onClick={() =>
              setRevealed((v) =>
                v.includes(i) ? v.filter((n) => n !== i) : [...v, i],
              )
            }
          >
            {hidden && !revealed.includes(i) ? (
              <span className="masked-line">点击揭晓第 {i + 1} 句</span>
            ) : (
              l
            )}
          </button>
        ))}
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setChecked(true);
        }}
      >
        <label htmlFor="poem-answer">
          补全首句：{line.slice(0, line.lastIndexOf(missing))}
          <span className="blank-answer">＿＿＿＿</span>
        </label>
        <div>
          <input
            id="poem-answer"
            autoComplete="off"
            value={answer}
            onChange={(e) => {
              setAnswer(e.target.value);
              setChecked(false);
            }}
            placeholder="写下缺少的诗句"
          />
          <button className="button" disabled={!answer.trim()} type="submit">
            核对 <Check />
          </button>
        </div>
      </form>
      {checked && (
        <p role="status">
          {answer.replace(/[\s，。！？]/g, "") === missing
            ? "记住了。再想想这句诗与眼前山河的联系。"
            : `这里是“${missing}”。再读一遍，感受句子里的画面。`}
        </p>
      )}
    </section>
  );
}
