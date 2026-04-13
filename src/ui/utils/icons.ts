// Lucide icon set (MIT License) — https://lucide.dev
import { html } from "lit";
import { unsafeSVG } from "lit/directives/unsafe-svg.js";
import {
	ZoomIn,
	ZoomOut,
	Play,
	Pause,
	Maximize2,
	Minimize2,
	X,
	RotateCcw,
	RotateCw,
	RefreshCw,
	FlipHorizontal2,
	FlipVertical2,
	ChevronLeft,
	ChevronRight,
} from "lucide";

// lucide does not export its IconNode type; define a compatible local type.
// SVGProps uses `string | number | undefined` — undefined values are filtered out.
type LucideIconNode = readonly (readonly [
	string,
	Readonly<Record<string, string | number | undefined>>,
])[];

/**
 * Converts a Lucide icon node array into an `html` template with proper SVG
 * namespace handling. The `<svg>` root lives in the html template; its children
 * are injected via `unsafeSVG` so they are parsed in SVG namespace context.
 *
 * All string ops run at module-evaluation time — no DOM calls.
 */
function lucideIcon(icon: LucideIconNode, size = 20) {
	const children = icon
		.map(([tag, attrs]) => {
			const attrStr = Object.entries(attrs)
				.filter(([, v]) => v !== undefined)
				.map(([k, v]) => `${k}="${v}"`)
				.join(" ");
			return `<${tag} ${attrStr}/>`;
		})
		.join("");

	return html`<svg
    width="${size}"
    height="${size}"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
  >${unsafeSVG(children)}</svg>`;
}

export const iconZoomIn = lucideIcon(ZoomIn);
export const iconZoomOut = lucideIcon(ZoomOut);
export const iconPlay = lucideIcon(Play);
export const iconPause = lucideIcon(Pause);
export const iconMaximize = lucideIcon(Maximize2);
export const iconMinimize = lucideIcon(Minimize2);
export const iconClose = lucideIcon(X);
export const iconRotateCcw = lucideIcon(RotateCcw);
export const iconRotateCw = lucideIcon(RotateCw);
export const iconRefreshCw = lucideIcon(RefreshCw);
export const iconFlipH = lucideIcon(FlipHorizontal2);
export const iconFlipV = lucideIcon(FlipVertical2);
export const iconChevronLeft = lucideIcon(ChevronLeft, 24);
export const iconChevronRight = lucideIcon(ChevronRight, 24);

// Custom — no Lucide equivalent for "1:1"
export const iconOneToOne = html`<svg
  width="20"
  height="20"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
>
  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
  <text
    x="12"
    y="15.5"
    text-anchor="middle"
    font-size="10"
    stroke="none"
    fill="currentColor"
    font-weight="bold"
    font-family="sans-serif"
  >1:1</text>
</svg>`;
