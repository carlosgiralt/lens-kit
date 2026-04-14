import { css, html, LitElement, type TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";
import {
	iconClose,
	iconFlipH,
	iconFlipV,
	iconMaximize,
	iconMinimize,
	iconOneToOne,
	iconPause,
	iconPlay,
	iconRefreshCw,
	iconRotateCcw,
	iconRotateCw,
	iconZoomIn,
	iconZoomOut,
} from "../utils/icons.js";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/**
 * Context passed to every custom tool renderer so it can react to live
 * gallery state without needing a reference to the host element.
 */
export interface CustomToolContext {
	/** The toolbar host element — use sparingly; prefer the fields below. */
	host: GalleryToolbar;
	/** 0-based index of the currently visible slide. */
	currentIndex: number;
	/** Total number of slides. */
	total: number;
	/** Whether the slideshow auto-play is active. */
	isPlaying: boolean;
	/** Whether the gallery is in fullscreen mode. */
	isFullscreen: boolean;
	/**
	 * Whether the current slide is an HTML/video slide.
	 * Built-in panzoom tools are hidden when this is true.
	 * Custom tools registered via {@link GalleryToolbar.registerTool} are
	 * NEVER filtered — handle this flag yourself if your tool is panzoom-dependent.
	 */
	isHtmlSlide: boolean;
	/**
	 * Fire the standard `action` CustomEvent on the toolbar host.
	 * The event bubbles and is composed, so `lk-gallery` will receive it.
	 *
	 * @param action - Arbitrary string identifier for the action.
	 * @param detail - Optional extra data merged into `event.detail`.
	 */
	dispatch(action: string, detail?: Record<string, unknown>): void;
}

/**
 * A function that returns a Lit `html` template for a custom toolbar tool.
 * Return `html\`\`` to conditionally hide the tool.
 *
 * For non-Lit environments, use {@link GalleryToolbar.registerToolElement}
 * instead — it accepts a plain DOM `HTMLElement` factory.
 */
export type CustomToolRenderer = (
	ctx: CustomToolContext,
) => TemplateResult | Node;

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const PANZOOM_TOOLS = new Set([
	"zoom",
	"zoom-in",
	"zoom-out",
	"1:1",
	"one-to-one",
	"rotate-left",
	"rotate-ccw",
	"rotate-right",
	"rotate-cw",
	"flip-x",
	"flip-h",
	"flip-y",
	"flip-v",
	"reset",
]);

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

@customElement("lk-gallery-toolbar")
export class GalleryToolbar extends LitElement {
	// -------------------------------------------------------------------------
	// Static custom-tool registry
	// -------------------------------------------------------------------------

	/**
	 * Global registry of custom tool renderers, keyed by the tool name used
	 * in the `toolbar` attribute string (case-insensitive, trimmed).
	 *
	 * Populated via {@link GalleryToolbar.registerTool}.
	 *
	 * @example
	 * ```ts
	 * GalleryToolbar.registerTool("share", ({ dispatch }) => html`
	 *   <button class="action-btn" @click=${() => dispatch("share")}>
	 *     Share
	 *   </button>
	 * `);
	 * ```
	 */
	static readonly customRenderers: Map<string, CustomToolRenderer> = new Map();

	/**
	 * Register a renderer for a custom tool name.
	 *
	 * - Call this **before** the component renders (top-level module scope is fine).
	 * - The `name` is normalised to lowercase and trimmed, matching the toolbar
	 *   string parsing behaviour.
	 * - Registering the same name twice overwrites the previous renderer —
	 *   useful for overriding built-in tools in advanced scenarios.
	 *
	 * **Requires Lit.** If you are not using Lit, use {@link registerToolElement}
	 * instead.
	 *
	 * @param name     Tool name as it appears in the `toolbar` attribute string.
	 * @param renderer Function that receives a {@link CustomToolContext} and
	 *                 returns a Lit `TemplateResult` or a DOM `Node`.
	 */
	static registerTool(name: string, renderer: CustomToolRenderer): void {
		GalleryToolbar.customRenderers.set(name.trim().toLowerCase(), renderer);
	}

	/**
	 * Register a custom tool using a plain DOM element factory — **no Lit required**.
	 *
	 * The factory is called on every render cycle with a fresh {@link CustomToolContext}
	 * snapshot, and the returned element replaces the previous one. Attach event
	 * listeners inside the factory; they will be re-registered on each render.
	 *
	 * Use `ctx.dispatch(action, detail?)` to fire the standard `action` CustomEvent
	 * that `lk-gallery` already listens for — no extra wiring needed.
	 *
	 * @param name    Tool name as it appears in the `toolbar` attribute string.
	 * @param factory Function that receives a {@link CustomToolContext} and returns
	 *                an `HTMLElement`.
	 *
	 * @example Vanilla JS:
	 * ```js
	 * GalleryToolbar.registerToolElement('download', (ctx) => {
	 *   const btn = document.createElement('button');
	 *   btn.className = 'action-btn';
	 *   btn.setAttribute('aria-label', 'Download');
	 *   btn.innerHTML = '<svg ...>...</svg>';
	 *   btn.addEventListener('click', () =>
	 *     ctx.dispatch('download', { index: ctx.currentIndex })
	 *   );
	 *   return btn;
	 * });
	 * ```
	 */
	static registerToolElement(
		name: string,
		factory: (ctx: CustomToolContext) => HTMLElement,
	): void {
		GalleryToolbar.customRenderers.set(name.trim().toLowerCase(), factory);
	}

	// -------------------------------------------------------------------------
	// Styles
	// -------------------------------------------------------------------------

	static styles = css`
    :host {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      padding: 1rem 1.5rem;
      z-index: 10;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: var(--gallery-toolbar-background, linear-gradient(to bottom, rgba(0, 0, 0, 0.7), transparent));
    }
    .slide-counter {
      font-size: 14px;
      font-family: inherit;
      color: var(--gallery-counter-color, #ffffff);
      letter-spacing: 0.5px;
    }
    .toolbar-actions {
      display: flex;
      gap: 16px;
      align-items: center;
    }
    .toolbar-divider {
      width: var(--gallery-divider-width, 1px);
      height: var(--gallery-divider-height, 20px);
      background: var(--gallery-divider-color, rgba(255, 255, 255, 0.4));
      opacity: var(--gallery-divider-opacity, 1);
      margin: var(--gallery-divider-margin, 0 8px);
    }
    .action-btn {
      background: var(--gallery-action-bg, rgba(0, 0, 0, 0.5));
      border: var(--gallery-action-border, 1px solid rgba(255, 255, 255, 0.25));
      border-radius: var(--gallery-action-radius, 999px);
      min-width: var(--gallery-action-size, 36px);
      min-height: var(--gallery-action-size, 36px);
      padding: var(--gallery-action-padding, 6px);
      color: var(--gallery-action-color, #ffffff);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: var(--gallery-action-shadow, 0 2px 10px rgba(0, 0, 0, 0.25));
      transition: color 0.2s, background 0.2s, border-color 0.2s, transform 0.2s;
    }
    .action-btn:hover {
      color: var(--gallery-action-hover-color, #ffffff);
      background: var(--gallery-action-hover-bg, rgba(0, 0, 0, 0.7));
      border-color: var(--gallery-action-hover-border-color, rgba(255, 255, 255, 0.45));
      transform: translateY(-1px);
    }
    .action-btn:focus-visible {
      outline: var(--gallery-focus-outline, 2px solid #ffffff);
      outline-offset: 2px;
    }
    /*
     * Slotted custom actions: give authors a way to style their slotted
     * buttons consistently with built-in buttons by targeting the slot
     * itself. Authors can also use the CSS custom properties above.
     */
    ::slotted([slot="actions-end"]) {
      display: contents;
    }
  `;

	// -------------------------------------------------------------------------
	// Properties
	// -------------------------------------------------------------------------

	@property({ type: String }) toolbar = "zoom, play, fullscreen, close";
	@property({ type: Number }) currentIndex = 0;
	@property({ type: Number }) total = 0;
	@property({ type: Boolean }) isPlaying = false;
	@property({ type: Boolean }) isFullscreen = false;
	@property({ type: Boolean }) isHtmlSlide = false;

	private tools: string[] = this.toolbar
		.split(",")
		.map((t) => t.trim().toLowerCase());

	// -------------------------------------------------------------------------
	// Lifecycle
	// -------------------------------------------------------------------------

	protected willUpdate(changedProperties: Map<string, unknown>) {
		if (changedProperties.has("toolbar")) {
			this.tools = this.toolbar.split(",").map((t) => t.trim().toLowerCase());
		}
	}

	// -------------------------------------------------------------------------
	// Public API
	// -------------------------------------------------------------------------

	/**
	 * Dispatch the standard `action` CustomEvent from the toolbar host.
	 *
	 * This is the same event that built-in buttons fire, so `lk-gallery`'s
	 * `@action` listener will receive it without any extra wiring.
	 *
	 * Slotted buttons in the `"actions-end"` slot should call this method via
	 * a reference to the toolbar element, or use the `lk-toolbar-action` event
	 * helper below.
	 *
	 * @param action - Arbitrary action identifier string.
	 * @param detail - Optional extra data merged into `event.detail`.
	 *
	 * @example Plain HTML (slot approach):
	 * ```html
	 * <lk-gallery-toolbar id="tb">
	 *   <button slot="actions-end"
	 *           onclick="document.getElementById('tb').dispatchAction('share')">
	 *     Share
	 *   </button>
	 * </lk-gallery-toolbar>
	 * ```
	 */
	public dispatchAction(
		action: string,
		detail: Record<string, unknown> = {},
	): void {
		this.dispatchEvent(
			new CustomEvent("action", {
				detail: { action, ...detail },
				bubbles: true,
				composed: true,
			}),
		);
	}

	// -------------------------------------------------------------------------
	// Private helpers
	// -------------------------------------------------------------------------

	/** Internal dispatch used by built-in buttons. */
	private dispatch(action: string) {
		this.dispatchAction(action);
	}

	private btn(name: string, icon: unknown, label: string) {
		return html`
      <button
        part="action-button action-${name}"
        class="action-btn"
        aria-label=${label}
        @click=${() => this.dispatch(name)}
      >${icon}</button>
    `;
	}

	/** Build the {@link CustomToolContext} passed to every registered renderer. */
	private buildContext(): CustomToolContext {
		return {
			host: this,
			currentIndex: this.currentIndex,
			total: this.total,
			isPlaying: this.isPlaying,
			isFullscreen: this.isFullscreen,
			isHtmlSlide: this.isHtmlSlide,
			dispatch: (action, detail) => this.dispatchAction(action, detail),
		};
	}

	private renderTool(tool: string): TemplateResult | Node {
		// Built-in panzoom tools are hidden when the current slide is HTML/video.
		// Custom tools in the registry are deliberately NOT subject to this filter —
		// each renderer receives `isHtmlSlide` in its context and decides for itself.
		if (this.isHtmlSlide && PANZOOM_TOOLS.has(tool)) return html``;

		switch (tool) {
			case "zoom":
			case "zoom-in":
				return this.btn("zoom-in", iconZoomIn, "Zoom in");
			case "zoom-out":
				return this.btn("zoom-out", iconZoomOut, "Zoom out");
			case "1:1":
			case "one-to-one":
				return this.btn("one-to-one", iconOneToOne, "1:1");
			case "rotate-left":
			case "rotate-ccw":
				return this.btn("rotate-left", iconRotateCcw, "Rotate left");
			case "rotate-right":
			case "rotate-cw":
				return this.btn("rotate-right", iconRotateCw, "Rotate right");
			case "flip-x":
			case "flip-h":
				return this.btn("flip-h", iconFlipH, "Flip horizontal");
			case "flip-y":
			case "flip-v":
				return this.btn("flip-v", iconFlipV, "Flip vertical");
			case "reset":
				return this.btn("reset", iconRefreshCw, "Reset");
			case "play":
			case "slideshow":
				if (this.total <= 1) return html``;
				return this.btn(
					"play",
					this.isPlaying ? iconPause : iconPlay,
					"Slideshow",
				);
			case "fullscreen":
				return this.btn(
					"fullscreen",
					this.isFullscreen ? iconMinimize : iconMaximize,
					"Fullscreen",
				);
			case "close":
				return this.btn("close", iconClose, "Close");
			case "|":
			case "divider":
				return html`<div part="toolbar-divider" class="toolbar-divider"></div>`;
			default: {
				// Consult the custom renderer registry before giving up.
				const renderer = GalleryToolbar.customRenderers.get(tool);
				if (renderer) {
					return renderer(this.buildContext());
				}
				// Unknown tool name — warn in development to aid debugging.
				if (import.meta.env.DEV) {
					console.warn(
						`[lk-gallery-toolbar] Unknown tool "${tool}". ` +
							`Register a renderer with GalleryToolbar.registerTool("${tool}", renderer) ` +
							`or add it to the "actions-end" slot.`,
					);
				}
				return html``;
			}
		}
	}

	// -------------------------------------------------------------------------
	// Render
	// -------------------------------------------------------------------------

	render() {
		return html`
      ${
				this.total > 1
					? html`<div part="slide-counter" class="slide-counter">${this.currentIndex + 1} / ${this.total}</div>`
					: html`<div></div>`
			}
      <div part="toolbar-actions" class="toolbar-actions">
        ${this.tools.map((tool) => this.renderTool(tool))}
        <!--
          Slot for declarative custom actions.
          Slotted elements are appended after built-in tools.
          Use the host's dispatchAction() method to fire the standard "action"
          event, or dispatch a plain CustomEvent that bubbles + composed.
        -->
        <slot name="actions-end"></slot>
      </div>
    `;
	}
}

declare global {
	interface HTMLElementTagNameMap {
		"lk-gallery-toolbar": GalleryToolbar;
	}
}
