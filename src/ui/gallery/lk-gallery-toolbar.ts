import { css, html, LitElement } from "lit";
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

@customElement("lk-gallery-toolbar")
export class GalleryToolbar extends LitElement {
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
  `;

	@property({ type: String }) toolbar = "zoom, play, fullscreen, close";
	@property({ type: Number }) currentIndex = 0;
	@property({ type: Number }) total = 0;
	@property({ type: Boolean }) isPlaying = false;
	@property({ type: Boolean }) isFullscreen = false;
	@property({ type: Boolean }) isHtmlSlide = false;

	private tools: string[] = this.toolbar
		.split(",")
		.map((t) => t.trim().toLowerCase());

	protected willUpdate(changedProperties: Map<string, unknown>) {
		if (changedProperties.has("toolbar")) {
			this.tools = this.toolbar.split(",").map((t) => t.trim().toLowerCase());
		}
	}

	private dispatch(action: string) {
		this.dispatchEvent(
			new CustomEvent("action", {
				detail: { action },
				bubbles: true,
				composed: true,
			}),
		);
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

	private renderTool(tool: string) {
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
			default:
				return html``;
		}
	}

	render() {
		return html`
      ${
				this.total > 1
					? html`<div part="slide-counter" class="slide-counter">${this.currentIndex + 1} / ${this.total}</div>`
					: html`<div></div>`
			}
      <div part="toolbar-actions" class="toolbar-actions">
        ${this.tools.map((tool) => this.renderTool(tool))}
      </div>
    `;
	}
}

declare global {
	interface HTMLElementTagNameMap {
		"lk-gallery-toolbar": GalleryToolbar;
	}
}
