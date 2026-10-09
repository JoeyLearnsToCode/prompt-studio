/**
 * Motion Tokens
 * 动效系统的唯一事实来源：时长、缓动、弹簧、跟随系数
 * 与 tailwind.config.js 中的 duration-* / ease-* 保持同一套数值
 */

/** 时长（秒）。每一档都对应一种意图，不要凭手感随意取值 */
export const duration = {
  /** 按压 / 光标反馈 */
  instant: 0.09,
  /** hover、切换、小控件 */
  fast: 0.16,
  /** 面板开合、展开收起 */
  standard: 0.3,
  /** 大块位移、页面级进出 */
  gentle: 0.45,
} as const;

type Bezier = [number, number, number, number];

/** 缓动曲线。数组形式供 framer-motion 使用，同名值在 tailwind 中为 ease-* */
export const ease = {
  /** 快进软着陆：入场、展开的默认选择 */
  outExpo: [0.16, 1, 0.3, 1] as Bezier,
  /** 慢起快出：只用于离场 */
  inExpo: [0.7, 0, 0.84, 0] as Bezier,
  /** 对称平滑：循环、来回切换 */
  standard: [0.4, 0, 0.2, 1] as Bezier,
  /** 干脆的机械感：不需要回弹的小控件 */
  snap: [0, 0.55, 0.45, 1] as Bezier,
} as const;

/**
 * 指数跟随的"紧度"(1/s)：越大越跟手
 * 直接拖拽要保持 1:1，只有离散指令（缩放/定位/复位）才走跟随
 */
export const followRate = {
  /** 画布视口 */
  viewport: 14,
  /** 节点 hover */
  hover: 18,
} as const;

/**
 * 帧率无关的指数跟随：x += (target - x) * (1 - exp(-k·dt))
 * per-frame 常数 lerp 在 30/60/120fps 下是三个不同的滤波器，不要写 x += d * 0.1
 */
export function followTo(current: number, target: number, k: number, dt: number): number {
  return current + (target - current) * (1 - Math.exp(-k * dt));
}

/** 是否开启了系统级"减少动态效果" */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
