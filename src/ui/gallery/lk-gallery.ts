import { parseBooleanAttribute } from "@ui/utils/boolean-attribute";
import { html, LitElement, unsafeCSS } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import { unsafeHTML } from "lit/directives/unsafe-html.js";
import { FullscreenController } from "./controllers/fullscreen.js";
import { KeyboardController } from "./controllers/keyboard.js";
import { SlideshowController } from "./controllers/slideshow.js";
import styles from "./lk-gallery.css?inline";

import "@ui/carousel/lk-carousel";
import "@ui/panzoom/lk-panzoom";
import "./lk-gallery-toolbar.js";

export interface galleryItem {
	src: string;
	type?: "image" | "html";
	alt?: string;
	caption?: string;
}

type CarouselElement = HTMLElement & {
	goToNext?: () => void;
	goToPrev?: () => void;
	goToIndex?: (i: number) => void;
};

type PanzoomElement = HTMLElement & {
	reset?: () => void;
};

// Panzoom action name → lk-panzoom method name
const PANZOOM_METHOD: Record<string, string> = {
	"zoom-in": "zoomIn",
	"zoom-out": "zoomOut",
	"one-to-one": "toggleOneToOne",
	"rotate-left": "rotateLeft",
	"rotate-right": "rotateRight",
	"flip-h": "toggleFlipX",
	"flip-v": "toggleFlipY",
	reset: "reset",
};

@customElement("lk-gallery")
export class Gallery extends LitElement {
	static styles = unsafeCSS(styles);

	@property({ type: Boolean, reflect: true, converter: parseBooleanAttribute })
	open = false;
	@property({ type: String }) layout: "grid" | "inline" = "inline";
	@property({ type: Array }) items: galleryItem[] = [];
	@property({ type: Number }) initialIndex = 0;
	@property({
		type: Boolean,
		attribute: "show-thumbnails",
		converter: parseBooleanAttribute,
	})
	showThumbnails = false;
	@property({ type: String }) toolbar = "zoom, play, fullscreen, close";

	@state() private currentSlideIndex = 0;

	private slideshow = new SlideshowController(this);
	private fullscreen = new FullscreenController(this);
	private keyboard = new KeyboardController(this);

	private mutationObserver: MutationObserver | null = null;

	@query("dialog.modal") private dialogEl!: HTMLDialogElement;
	@query(".modal-content") private modalContentEl!: HTMLElement;

	connectedCallback() {
		super.connectedCallback();
		this.currentSlideIndex = this.initialIndex;
	}

	protected firstUpdated() {
		this.shadowRoot?.addEventListener("slotchange", this.updateItems);
		this.mutationObserver = new MutationObserver(this.updateItems);
		this.mutationObserver.observe(this, { childList: true, subtree: true });
		this.addEventListener("click", this.handleDelegatedClick);
		this.updateItems();
	}

	disconnectedCallback() {
		super.disconnectedCallback();
		this.mutationObserver?.disconnect();
		if (this.open) {
			document.body.style.overflow = "";
			document.exitFullscreen().catch(() => {});
		}
	}

	private getTriggers(): HTMLElement[] {
		const rawTriggers = Array.from(
			this.querySelectorAll("a[href], [data-src], img, video"),
		) as HTMLElement[];
		return rawTriggers.filter((el) => {
			let parent = el.parentElement;
			while (parent && parent !== this) {
				if (rawTriggers.includes(parent)) return false;
				parent = parent.parentElement;
			}
			return true;
		});
	}

	private updateItems = () => {
		const triggers = this.getTriggers();
		const items: galleryItem[] = [];

		triggers.forEach((el) => {
			if (el instanceof HTMLImageElement) {
				items.push({
					src: el.src || el.getAttribute("data-src") || "",
					alt: el.alt,
					caption: el.getAttribute("data-caption") || el.alt || undefined,
				});
			} else if (
				el instanceof HTMLVideoElement &&
				!el.hasAttribute("data-src")
			) {
				const clone = el.cloneNode(true) as HTMLVideoElement;
				clone.controls = true;
				clone.autoplay = false;
				// Strip thumbnail-specific inline styles; modal CSS (.html-slide video) controls sizing.
				clone.style.cssText = "";
				clone.removeAttribute("width");
				clone.removeAttribute("height");
				items.push({
					src: clone.outerHTML,
					type: "html",
					caption: el.getAttribute("data-caption") || undefined,
				});
			} else {
				const src = el.getAttribute("href") || el.getAttribute("data-src");
				if (src) {
					items.push({
						src,
						caption: el.getAttribute("data-caption") || undefined,
						type: (el.getAttribute("data-type") as "image" | "html") || "image",
					});
					if (el instanceof HTMLAnchorElement) {
						el.addEventListener("click", (e) => e.preventDefault(), {
							once: true,
						});
					}
				}
			}
		});

		if (items.length > 0) {
			this.items = items;
		}
	};

	private handleDelegatedClick = (e: MouseEvent) => {
		const path = e.composedPath() as HTMLElement[];
		const triggers = this.getTriggers();

		for (const el of path) {
			const index = triggers.indexOf(el);
			if (index !== -1) {
				if (el instanceof HTMLAnchorElement) e.preventDefault();
				if (el instanceof HTMLVideoElement) {
					// Only protect the native controls area when controls are actually visible.
					if (el.controls) {
						const rect = el.getBoundingClientRect();
						if (e.clientY - rect.top > rect.height - 50) return;
					}
					el.pause();
				}
				this.initialIndex = index;
				this.open = true;
				break;
			}
		}
	};

	protected async updated(changedProperties: Map<string, unknown>) {
		if (changedProperties.has("open")) {
			if (this.open) {
				if (changedProperties.get("open") === false) {
					this.currentSlideIndex = this.initialIndex;
				}
				if (this.dialogEl && !this.dialogEl.open) {
					this.dialogEl.showModal();
					document.body.style.overflow = "hidden";
					this.keyboard.attach(this.onKeyDown);
				}
			} else {
				if (this.dialogEl?.open) {
					this.dialogEl.close();
					document.body.style.overflow = "";
					this.keyboard.detach();
				}
				this.slideshow.stop();
			}
		}

		if (
			changedProperties.has("open") ||
			changedProperties.has("currentSlideIndex")
		) {
			await this.updateComplete;
			const slides = Array.from(
				this.shadowRoot?.querySelectorAll(".slide-content") ?? [],
			);
			slides.forEach((slide, index) => {
				const video = slide.querySelector("video");
				if (video) {
					if (this.open && index === this.currentSlideIndex) {
						video.play().catch(() => {});
					} else {
						video.pause();
					}
				}
			});
		}
	}

	private onKeyDown = (e: KeyboardEvent) => {
		if (!this.open) return;
		const carousel = this.shadowRoot?.querySelector(
			"lk-carousel",
		) as CarouselElement | null;
		if (!carousel) return;
		if (
			e.key === "ArrowRight" &&
			this.currentSlideIndex < this.items.length - 1
		) {
			carousel.goToNext?.();
		} else if (e.key === "ArrowLeft" && this.currentSlideIndex > 0) {
			carousel.goToPrev?.();
		}
	};

	public close() {
		this.open = false;
		this.dispatchEvent(
			new CustomEvent("close", { bubbles: true, composed: true }),
		);
		document.exitFullscreen().catch(() => {});
		this.keyboard.detach();
		this.shadowRoot?.querySelectorAll("video").forEach((v) => {
			v.pause();
		});
	}

	private onDialogCancel = (e: Event) => {
		e.preventDefault();
		this.close();
	};

	private onDialogClick = (e: MouseEvent) => {
		if (e.target === this.dialogEl) this.close();
	};

	private handleCarouselChange = (e: CustomEvent) => {
		this.currentSlideIndex = e.detail.index;
		this.shadowRoot?.querySelectorAll("lk-panzoom").forEach((pz) => {
			const typed = pz as PanzoomElement;
			if (typeof typed.reset === "function") (typed.reset as () => void)();
		});
	};

	private callPanzoomMethod(method: string) {
		if (this.items[this.currentSlideIndex]?.type === "html") return;
		const slides = Array.from(
			this.shadowRoot?.querySelectorAll(".slide-content") ?? [],
		);
		const el = slides[this.currentSlideIndex]?.querySelector("lk-panzoom");
		if (!el) return;
		const pz = el as unknown as Record<string, unknown>;
		if (typeof pz[method] === "function") {
			(pz[method] as () => void)();
		}
	}

	private advanceSlide() {
		const carousel = this.shadowRoot?.querySelector(
			"lk-carousel",
		) as CarouselElement | null;
		if (!carousel) return;
		if (this.currentSlideIndex >= this.items.length - 1) {
			carousel.goToIndex?.(0);
		} else {
			carousel.goToNext?.();
		}
	}

	private handleToolbarAction = (e: CustomEvent<{ action: string }>) => {
		const pzMethod = PANZOOM_METHOD[e.detail.action];
		if (pzMethod) {
			this.callPanzoomMethod(pzMethod);
			return;
		}
		switch (e.detail.action) {
			case "play":
				this.slideshow.toggle(() => this.advanceSlide());
				break;
			case "fullscreen":
				this.fullscreen.toggle(this.modalContentEl);
				break;
			case "close":
				this.close();
				break;
		}
	};

	private renderImageSlide(item: galleryItem) {
		return html`
      <lk-panzoom>
        <img src=${item.src} alt=${item.alt ?? ""} draggable="false" />
      </lk-panzoom>
    `;
	}

	// Trust boundary: item.src for html-type slides is either a cloned video's
	// outerHTML (controlled DOM content) or a consumer-provided data-src value.
	// Consumers are responsible for sanitizing data-src values before passing
	// data-type="html" content to this component.
	private renderHtmlSlide(item: galleryItem) {
		return html`<div class="html-slide">${unsafeHTML(item.src)}</div>`;
	}

	private renderSlide(item: galleryItem) {
		return html`
      <div part="slide-content" class="slide-content">
        ${item.type === "html" ? this.renderHtmlSlide(item) : this.renderImageSlide(item)}
      </div>
    `;
	}

	private renderCarousel() {
		if (this.items.length === 0) return html``;
		return html`
      <lk-carousel
        @change=${this.handleCarouselChange}
        .currentIndex=${this.currentSlideIndex}
        ?show-thumbnails=${this.showThumbnails && this.items.length > 1}
        ?show-nav=${this.items.length > 1}
        ?show-dots=${this.items.length > 1}
        style="height: 100%; --carousel-aspect-ratio: auto; --carousel-image-fit: contain;"
      >
        ${this.items.map((item) => this.renderSlide(item))}
      </lk-carousel>
    `;
	}

	private renderCaption() {
		const caption = this.items[this.currentSlideIndex]?.caption;
		if (!caption) return html``;
		return html`<div part="caption" class="caption">${caption}</div>`;
	}

	render() {
		return html`
      <slot></slot>
      <dialog class="modal" @cancel=${this.onDialogCancel} @click=${this.onDialogClick}>
        <div class="modal-content">
          <lk-gallery-toolbar
            part="toolbar"
            .toolbar=${this.toolbar}
            .currentIndex=${this.currentSlideIndex}
            .total=${this.items.length}
            .isPlaying=${this.slideshow.isPlaying}
            .isFullscreen=${this.fullscreen.isActive}
            .isHtmlSlide=${this.items[this.currentSlideIndex]?.type === "html"}
            @action=${this.handleToolbarAction}
          ></lk-gallery-toolbar>
          <div part="carousel-container" class="carousel-container">
            ${this.renderCarousel()}
          </div>
          ${this.renderCaption()}
        </div>
      </dialog>
    `;
	}
}

declare global {
	interface HTMLElementTagNameMap {
		"lk-gallery": Gallery;
	}
}
