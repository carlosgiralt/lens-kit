import { LitElement, html, unsafeCSS } from "lit";
import { classMap } from "lit/directives/class-map.js";
import {
	customElement,
	property,
	state,
	query,
	queryAssignedElements,
} from "lit/decorators.js";
import { parseBooleanAttribute } from "@ui/utils/boolean-attribute";
import { iconChevronLeft, iconChevronRight } from "../utils/icons.js";
import styles from "./lk-carousel.css?inline";

@customElement("lk-carousel")
export class Carousel extends LitElement {
	static styles = unsafeCSS(styles);

	@property({ type: Number, attribute: "slide-width" }) slideWidth = 100; // Expected to be 100% of container by default
	@property({
		type: Boolean,
		attribute: "show-dots",
		converter: parseBooleanAttribute,
	})
	showDots = true;
	@property({
		type: Boolean,
		attribute: "show-nav",
		converter: parseBooleanAttribute,
	})
	showNav = true;
	@property({
		type: Boolean,
		attribute: "show-thumbnails",
		converter: parseBooleanAttribute,
	})
	showThumbnails = false;
	@property({ type: Boolean, reflect: true, converter: parseBooleanAttribute })
	overlay = false;

	@property({ type: Number }) currentIndex = 0;
	@state() private isDragging = false;
	@state() private dragOffset = 0;
	@state() private containerWidth = 1000;
	@state() private slideCount = 0;

	@query(".track") private trackEl!: HTMLElement;
	@queryAssignedElements() private slides!: HTMLElement[];

	private startX = 0;
	private currentX = 0;
	private isSwiping = false;
	private resizeObserver!: ResizeObserver;

	private get maxTranslate() {
		return Math.max(0, this.slideCount * this.slideWidth - 100);
	}

	private get maxIndex() {
		if (this.slideWidth <= 0) return 0;
		return Math.ceil(this.maxTranslate / this.slideWidth);
	}

	connectedCallback() {
		super.connectedCallback();
		this.addEventListener("click", this.onClickCapture, { capture: true });
	}

	disconnectedCallback() {
		super.disconnectedCallback();
		this.removeEventListener("click", this.onClickCapture, { capture: true });
		this.resizeObserver?.disconnect();
	}

	private onClickCapture = (e: MouseEvent) => {
		if (this.isSwiping) {
			e.stopPropagation();
			e.preventDefault();
			this.isSwiping = false; // Reset
		}
	};

	protected updated(changedProperties: Map<string, unknown>) {
		if (changedProperties.has("slideWidth")) {
			this.style.setProperty("--slide-width", `${this.slideWidth}%`);
		}
	}

	protected firstUpdated() {
		this.style.setProperty("--slide-width", `${this.slideWidth}%`);
		this.slideCount = this.slides.length;

		// Track container width reactively — no getBoundingClientRect in render
		this.resizeObserver = new ResizeObserver(([entry]) => {
			this.containerWidth = entry.contentRect.width || 1000;
		});
		this.resizeObserver.observe(this);

		// Add event listeners for touch/mouse dragging
		this.trackEl.addEventListener("pointerdown", this.onPointerDown);
		this.trackEl.addEventListener("pointermove", this.onPointerMove);
		this.trackEl.addEventListener("pointerup", this.onPointerUp);
		this.trackEl.addEventListener("pointercancel", this.onPointerUp);
		this.trackEl.addEventListener("pointerleave", this.onPointerUp);

		// Watch for slot changes — slideCount is @state() so assignment triggers update
		this.shadowRoot?.addEventListener("slotchange", () => {
			this.slideCount = this.slides.length;
		});
	}

	private onPointerDown = (e: PointerEvent) => {
		if (e.button !== 0 && e.pointerType === "mouse") return; // only left click
		this.isDragging = true;
		this.isSwiping = false;
		this.startX = e.clientX;
		this.currentX = e.clientX;
		const target = e.target as Element;
		if (target.setPointerCapture) {
			target.setPointerCapture(e.pointerId);
		}
	};

	private onPointerMove = (e: PointerEvent) => {
		if (!this.isDragging) return;
		this.currentX = e.clientX;
		this.dragOffset = this.currentX - this.startX;
		if (Math.abs(this.dragOffset) > 5) {
			this.isSwiping = true;
		}
	};

	private onPointerUp = (e: PointerEvent) => {
		if (!this.isDragging) return;
		this.isDragging = false;
		const target = e.target as Element;
		if (target.hasPointerCapture?.(e.pointerId)) {
			target.releasePointerCapture(e.pointerId);
		}

		// If dragged enough, change slide
		const containerWidth = this.getBoundingClientRect().width;
		const threshold = containerWidth * 0.2; // 20% to trigger swipe

		if (this.dragOffset > threshold && this.currentIndex > 0) {
			this.currentIndex--;
		} else if (
			this.dragOffset < -threshold &&
			this.currentIndex < this.maxIndex
		) {
			this.currentIndex++;
		}

		this.dragOffset = 0;
		this.dispatchEvent(
			new CustomEvent("change", { detail: { index: this.currentIndex } }),
		);
	};

	public goToNext() {
		if (this.currentIndex < this.maxIndex) {
			this.currentIndex++;
			this.dispatchEvent(
				new CustomEvent("change", { detail: { index: this.currentIndex } }),
			);
		}
	}

	public goToPrev() {
		if (this.currentIndex > 0) {
			this.currentIndex--;
			this.dispatchEvent(
				new CustomEvent("change", { detail: { index: this.currentIndex } }),
			);
		}
	}

	public goToIndex(index: number) {
		if (index >= 0 && index < this.slideCount) {
			this.currentIndex = index;
			this.dispatchEvent(
				new CustomEvent("change", { detail: { index: this.currentIndex } }),
			);
		}
	}

	private get trackTransformX() {
		const baseTranslate = Math.min(
			this.currentIndex * this.slideWidth,
			this.maxTranslate,
		);
		const raw =
			-baseTranslate + (this.dragOffset / (this.containerWidth || 1)) * 100;
		return Math.min(0, Math.max(-this.maxTranslate, raw));
	}

	private getThumbnailSrc(slide: HTMLElement): string {
		if (slide instanceof HTMLImageElement) {
			return (
				slide.src ||
				slide.getAttribute("data-src") ||
				slide.getAttribute("data-thumb") ||
				""
			);
		}
		if (slide instanceof HTMLVideoElement) {
			return slide.poster || slide.getAttribute("data-thumb") || "";
		}
		const img = slide.querySelector("img");
		if (img) {
			return (
				img.src ||
				img.getAttribute("data-src") ||
				img.getAttribute("data-thumb") ||
				""
			);
		}
		const video = slide.querySelector("video");
		return video ? video.poster || video.getAttribute("data-thumb") || "" : "";
	}

	private renderNav() {
		if (!this.showNav || this.slideCount <= 1) return html``;
		return html`
      <button
        part="nav-button nav-prev"
        class="nav-btn nav-prev"
        @click=${this.goToPrev}
        ?disabled=${this.currentIndex === 0}
      >${iconChevronLeft}</button>
      <button
        part="nav-button nav-next"
        class="nav-btn nav-next"
        @click=${this.goToNext}
        ?disabled=${this.currentIndex >= this.maxIndex}
      >${iconChevronRight}</button>
    `;
	}

	private indicatorPart(base: string, i: number) {
		return i === this.currentIndex ? `${base} ${base}-active` : base;
	}

	private renderDot(i: number) {
		return html`
      <button
        part=${this.indicatorPart("dot", i)}
        class=${classMap({ dot: true, active: i === this.currentIndex })}
        @click=${() => this.goToIndex(i)}
        aria-label="Go to slide ${i + 1}"
      ></button>
    `;
	}

	private renderThumbnail(slide: HTMLElement, i: number) {
		return html`
      <button
        part=${this.indicatorPart("thumbnail", i)}
        class=${classMap({ thumbnail: true, active: i === this.currentIndex })}
        style="background-image: url('${this.getThumbnailSrc(slide)}')"
        @click=${() => this.goToIndex(i)}
        aria-label="View slide ${i + 1}"
      ></button>
    `;
	}

	private renderDots() {
		if (!this.showDots || this.showThumbnails || this.slideCount <= 1)
			return html``;
		return html`
      <div part="dots" class="dots">
        ${Array.from({ length: this.maxIndex + 1 }, (_, i) => this.renderDot(i))}
      </div>
    `;
	}

	private renderThumbnails() {
		if (!this.showThumbnails || this.slideCount <= 1 || !this.slides)
			return html``;
		return html`
      <div part="thumbnails" class="thumbnails">
        ${this.slides.map((slide, i) => this.renderThumbnail(slide, i))}
      </div>
    `;
	}

	render() {
		return html`
      <div class="carousel-main">
        ${this.renderNav()}
        <div
          class=${classMap({ track: true, dragging: this.isDragging })}
          style="transform: translateX(${this.trackTransformX}%)"
        >
          <slot></slot>
        </div>
      </div>
      ${this.renderDots()}
      ${this.renderThumbnails()}
    `;
	}
}

declare global {
	interface HTMLElementTagNameMap {
		"lk-carousel": Carousel;
	}
}
