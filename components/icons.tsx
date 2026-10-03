/**
 * The six icons the reveal needs, inline. Same names and `size` prop as the icon library the
 * production app uses, so the component ports over unchanged — without adding a dependency.
 */
import type {SVGProps} from "react";

type Props = {size?: number} & SVGProps<SVGSVGElement>;

const box = (size: number) => ({
  width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor",
  strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const,
  "aria-hidden": true, focusable: false
});

export const ArrowRight = ({size = 24, ...p}: Props) => <svg {...box(size)} {...p}><path d="M5 12h14M13 6l6 6-6 6" /></svg>;
export const Check = ({size = 24, ...p}: Props) => <svg {...box(size)} {...p}><path d="M20 6 9 17l-5-5" /></svg>;
export const LockKeyhole = ({size = 24, ...p}: Props) => <svg {...box(size)} {...p}><rect x="4" y="10" width="16" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /><circle cx="12" cy="15.5" r="1.5" /></svg>;
export const Share2 = ({size = 24, ...p}: Props) => <svg {...box(size)} {...p}><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4" /></svg>;
export const Sparkles = ({size = 24, ...p}: Props) => <svg {...box(size)} {...p}><path d="M12 3.2l1.9 4.9 4.9 1.9-4.9 1.9L12 16.8l-1.9-4.9L5.2 10l4.9-1.9z" /><path d="M18.4 15.2l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8z" /></svg>;
export const Star = ({size = 24, ...p}: Props) => <svg {...box(size)} {...p}><path d="m12 3.4 2.6 5.5 6 .8-4.4 4.2 1.1 6-5.3-3-5.3 3 1.1-6L3.4 9.7l6-.8z" /></svg>;
