import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import {
  ArrowUpRight,
  X,
  ArrowRight,
  Compass,
  BookmarkSimple,
  Check,
} from "@phosphor-icons/react";
import { useProgress } from "../state";
export function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduced ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
export function PageHead({
  number,
  title,
  subtitle,
  en,
}: {
  number: string;
  title: string;
  subtitle: string;
  en: string;
}) {
  return (
    <header className="page-head">
      <div className="page-kicker">
        <span>{number} / 08</span>
        <span>{en}</span>
      </div>
      <h1>
        {title}
        {!/[。！？]$/.test(title) && <span className="heading-period">。</span>}
      </h1>
      <p>{subtitle}</p>
    </header>
  );
}
export function LinkButton({
  href,
  children,
  secondary = false,
}: {
  href: string;
  children: ReactNode;
  secondary?: boolean;
}) {
  return (
    <a className={`button ${secondary ? "secondary" : ""}`} href={href}>
      {children}
      <ArrowUpRight size={20} />
    </a>
  );
}
export function Dialog({
  title,
  children,
  onClose,
  wide = false,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
  wide?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const el = ref.current;
    const old = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    el?.showModal();
    return () => {
      el?.close();
      document.body.style.overflow = old;
    };
  }, []);
  return (
    <dialog
      ref={ref}
      className={`dialog ${wide ? "dialog-wide" : ""}`}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      aria-label={title}
    >
      <div className="dialog-bar">
        <span>
          <Compass size={17} /> 重走长征路 · {title}
        </span>
        <button className="icon-button" aria-label="关闭窗口" onClick={onClose}>
          <X size={22} />
        </button>
      </div>
      <div className="dialog-content">{children}</div>
    </dialog>
  );
}
export function SaveButton({ id }: { id: number }) {
  const { progress, setProgress } = useProgress();
  const saved = progress.saved.includes(id);
  return (
    <button
      className={`text-button ${saved ? "active" : ""}`}
      onClick={() =>
        setProgress((p) => ({
          ...p,
          saved: saved ? p.saved.filter((x) => x !== id) : [...p.saved, id],
        }))
      }
    >
      <BookmarkSimple size={19} weight={saved ? "fill" : "regular"} />
      {saved ? "已收入行囊" : "收入行囊"}
    </button>
  );
}
export function ReadMark({ id }: { id: number }) {
  const { progress, setProgress } = useProgress();
  const read = progress.visited.includes(id);
  return (
    <button
      className={`button ${read ? "secondary" : ""}`}
      onClick={() =>
        setProgress((p) => ({
          ...p,
          visited: [...new Set([...p.visited, id])],
          lastStation: id,
        }))
      }
    >
      {read ? <Check /> : <ArrowRight />}
      {read ? "已留下足迹" : "完成这一站"}
    </button>
  );
}
export function SectionTitle({
  children,
  sub,
}: {
  children: ReactNode;
  sub?: string;
}) {
  return (
    <div className="section-heading">
      <h2>{children}</h2>
      {sub && <p>{sub}</p>}
    </div>
  );
}
