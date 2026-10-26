import { useEffect, useState } from "react";
import { Certificate, Download } from "@phosphor-icons/react";
import { createCertificate } from "../certificate";
import { useProgress } from "../state";

export function CertificatePanel() {
  const { progress } = useProgress();
  const [name, setName] = useState("");
  const [certificate, setCertificate] = useState<string>();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    setCertificate(undefined);
    setError("");
  }, [progress, name]);
  return (
    <section
      className="learning-certificate"
      aria-label="生成学习纪念证书"
      data-no-narration
    >
      <span className="chapter-label">把这一程，珍藏下来</span>
      <h3>一页山河，一路收获。</h3>
      <p>
        将阅读、故事、体验与问答的足迹，连同已获得的勋章，汇成一张专属学习纪念。
      </p>
      <label className="certificate-name">
        纪念证书上的名字
        <input
          value={name}
          maxLength={20}
          disabled={busy}
          onChange={(e) => setName(e.target.value)}
          placeholder="长征路上的同行者"
          autoComplete="name"
        />
      </label>
      <button
        className="button"
        disabled={busy}
        aria-busy={busy}
        onClick={async () => {
          setBusy(true);
          setError("");
          try {
            setCertificate(await createCertificate(name, progress));
          } catch (e) {
            setError(e instanceof Error ? e.message : "生成失败，请重试。");
          } finally {
            setBusy(false);
          }
        }}
      >
        <Certificate />
        {busy ? "正在绘制纪念证书…" : "生成学习纪念证书"}
      </button>
      {error && <p role="alert">{error}</p>}
      {certificate && (
        <div className="certificate-preview">
          <img
            src={certificate}
            alt="学习纪念证书，包含个人学习足迹和已获得的勋章"
            width="1800"
            height="1560"
          />
          <a
            className="button"
            href={certificate}
            download="重走长征路-学习纪念.png"
          >
            <Download />
            保存 PNG 证书
          </a>
          <p className="fineprint">也可以长按图片保存到设备。</p>
        </div>
      )}
      <p className="fineprint">按当前学习记录生成，姓名与图片只在本机处理。</p>
    </section>
  );
}
