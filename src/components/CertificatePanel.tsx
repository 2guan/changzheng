import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { Certificate, Download, MagnifyingGlassPlus, MagnifyingGlassMinus, X } from "@phosphor-icons/react";
import { createCertificate } from "../certificate";
import { useProgress } from "../state";

export function CertificatePanel() {
  const { progress } = useProgress();
  const [name, setName] = useState("");
  const [certificate, setCertificate] = useState<string>();
  const [enlarged, setEnlarged] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    setCertificate(undefined);
    setEnlarged(false);
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
          <button
            className="certificate-enlarge"
            aria-label="放大查看纪念证书"
            onClick={() => setEnlarged(true)}
          >
            <img
              src={certificate}
              alt="学习纪念证书，包含个人学习足迹和已获得的勋章"
              width="1800"
              height="1560"
            />
          </button>
          {enlarged && <CertificateViewer src={certificate} onClose={() => setEnlarged(false)} />}
          <a
            className="button"
            href={certificate}
            download="重走长征路-学习纪念.png"
          >
            <Download />
            保存 PNG 证书
          </a>
          <p className="fineprint">点击图片放大查看，也可以长按图片保存到设备。</p>
        </div>
      )}
      <p className="fineprint">按当前学习记录生成，姓名与图片只在本机处理。</p>
    </section>
  );
}

function CertificateViewer({ src, onClose }: { src: string; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const [zoomed, setZoomed] = useState(false);
  const scroller = useRef<HTMLDivElement>(null);
  const gesture = useRef<{ id: number; x: number; y: number; left: number; top: number } | null>(null);
  const moved = useRef(false);
  const frame = useRef(0);
  const offset = useRef({ left: 0, top: 0 });
  const paint = () => {
    frame.current = 0;
    scroller.current?.scrollTo(offset.current.left, offset.current.top);
  };
  const finishDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (gesture.current?.id !== event.pointerId) return;
    if (frame.current) { cancelAnimationFrame(frame.current); paint(); }
    gesture.current = null;
    event.currentTarget.classList.remove("is-dragging");
    if (event.currentTarget.hasPointerCapture(event.pointerId))
      event.currentTarget.releasePointerCapture(event.pointerId);
  };
  useEffect(() => {
    scroller.current?.scrollTo(0, 0);
    return () => { cancelAnimationFrame(frame.current); };
  }, [zoomed]);
  useEffect(() => {
    const dialog = ref.current;
    dialog?.showModal();
    return () => dialog?.close();
  }, []);
  return (
    <dialog
      ref={ref}
      className="certificate-viewer"
      aria-label="纪念证书大图"
      onCancel={(event) => { event.preventDefault(); onClose(); }}
    >
      <div className="certificate-viewer-toolbar">
        <span>纪念证书</span>
        <button className="icon-button" aria-label={zoomed ? "适应窗口" : "放大细节"} onClick={() => setZoomed(!zoomed)}>
          {zoomed ? <MagnifyingGlassMinus size={24} /> : <MagnifyingGlassPlus size={24} />}
        </button>
        <button className="icon-button" aria-label="关闭证书大图" onClick={onClose}><X size={24} /></button>
      </div>
      <div
        ref={scroller}
        className={`certificate-viewer-scroll ${zoomed ? "is-zoomed" : ""}`}
        onPointerDown={(event) => {
          if (!zoomed || !event.isPrimary || event.button !== 0) return;
          moved.current = false;
          gesture.current = { id: event.pointerId, x: event.clientX, y: event.clientY,
            left: event.currentTarget.scrollLeft, top: event.currentTarget.scrollTop };
        }}
        onPointerMove={(event) => {
          const start = gesture.current;
          if (!start || start.id !== event.pointerId) return;
          const dx = event.clientX - start.x, dy = event.clientY - start.y;
          if (!moved.current && Math.hypot(dx, dy) < 6) return;
          if (!moved.current) {
            moved.current = true;
            event.currentTarget.setPointerCapture(event.pointerId);
            event.currentTarget.classList.add("is-dragging");
          }
          offset.current = { left: start.left - dx, top: start.top - dy };
          if (!frame.current) frame.current = requestAnimationFrame(paint);
        }}
        onPointerUp={finishDrag}
        onPointerCancel={finishDrag}
        onLostPointerCapture={(event) => {
          if (event.target === event.currentTarget) finishDrag(event);
        }}
        onClickCapture={(event) => {
          if (moved.current && event.detail !== 0) {
            event.preventDefault();
            event.stopPropagation();
            moved.current = false;
          }
        }}
      >
        <button aria-label={zoomed ? "缩小证书" : "放大证书细节"} onClick={() => setZoomed(!zoomed)}>
          <img src={src} alt="学习纪念证书完整大图" width="1800" height="1560" draggable={false} />
        </button>
      </div>
    </dialog>
  );
}
