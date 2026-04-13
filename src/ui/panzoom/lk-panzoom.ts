import { LitElement, html, unsafeCSS } from "lit";
import { customElement, property, state, query } from "lit/decorators.js";
import styles from "./lk-panzoom.css?inline";

@customElement("lk-panzoom")
export class Panzoom extends LitElement {
	static styles = unsafeCSS(styles);

	@property({ type: Number }) maxScale = 5;
	@property({ type: Number }) minScale = 1;
	@property({ type: Boolean }) disabled = false;

	@state() private currentScale = 1;
	@state() private x = 0;
	@state() private y = 0;
	@state() private rotation = 0;
	@state() private scaleX = 1;
	@state() private scaleY = 1;

	@query(".content") contentEl!: HTMLElement;

	private isPointerDown = false;
	private startX = 0;
	private startY = 0;

	private initialPinchDistance = 0;
	private initialScale = 1;

	private pointers: Map<number, PointerEvent> = new Map();

	connectedCallback() {
		super.connectedCallback();
		this.addEventListener("pointerdown", this.onPointerDown);
		this.addEventListener("pointermove", this.onPointerMove);
		this.addEventListener("pointerup", this.onPointerUp);
		this.addEventListener("pointercancel", this.onPointerUp);
		this.addEventListener("pointerleave", this.onPointerUp);
		this.addEventListener("wheel", this.onWheel, { passive: false });
	}

	disconnectedCallback() {
		super.disconnectedCallback();
		this.removeEventListener("pointerdown", this.onPointerDown);
		this.removeEventListener("pointermove", this.onPointerMove);
		this.removeEventListener("pointerup", this.onPointerUp);
		this.removeEventListener("pointercancel", this.onPointerUp);
		this.removeEventListener("pointerleave", this.onPointerUp);
		this.removeEventListener("wheel", this.onWheel);
	}

	private onPointerDown = (e: PointerEvent) => {
		if (this.disabled) return;
		this.pointers.set(e.pointerId, e);

		if (this.pointers.size === 1) {
			this.isPointerDown = true;
			this.startX = e.clientX - this.x;
			this.startY = e.clientY - this.y;
			this.setPointerCapture(e.pointerId);
		} else if (this.pointers.size === 2) {
			// Pinch start
			const points = Array.from(this.pointers.values());
			this.initialPinchDistance = this.getDistance(points[0], points[1]);
			this.initialScale = this.currentScale;
		}
	};

	private onPointerMove = (e: PointerEvent) => {
		if (this.disabled) return;
		if (!this.pointers.has(e.pointerId)) return;
		this.pointers.set(e.pointerId, e);

		if (this.pointers.size === 1 && this.isPointerDown) {
			// Pan — @state() properties schedule their own update
			this.x = e.clientX - this.startX;
			this.y = e.clientY - this.startY;
		} else if (this.pointers.size === 2) {
			// Pinch zoom — @state() property schedules its own update
			const points = Array.from(this.pointers.values());
			const currentDistance = this.getDistance(points[0], points[1]);
			const scaleChange = currentDistance / this.initialPinchDistance;

			this.currentScale = Math.max(
				this.minScale,
				Math.min(this.maxScale, this.initialScale * scaleChange),
			);
		}
	};

	private onPointerUp = (e: PointerEvent) => {
		this.pointers.delete(e.pointerId);
		if (this.pointers.size === 0) {
			this.isPointerDown = false;
			this.releasePointerCapture(e.pointerId);
		} else if (this.pointers.size === 1) {
			// If one finger remains after pinch, reset start position for panning
			const remainingPoint = Array.from(this.pointers.values())[0];
			this.startX = remainingPoint.clientX - this.x;
			this.startY = remainingPoint.clientY - this.y;
		}
	};

	private onWheel = (e: WheelEvent) => {
		if (this.disabled) return;
		e.preventDefault();
		const zoomFactor = -e.deltaY * 0.01;
		const newScale = Math.max(
			this.minScale,
			Math.min(this.maxScale, this.currentScale * (1 + zoomFactor)),
		);

		if (newScale !== this.currentScale) {
			// Adjust x and y to zoom towards cursor
			let rect = { left: 0, top: 0 };
			if (typeof this.getBoundingClientRect === "function") {
				rect = this.getBoundingClientRect();
			}
			const cursorX = e.clientX - rect.left;
			const cursorY = e.clientY - rect.top;

			const ratio = newScale / this.currentScale;
			this.x = cursorX - (cursorX - this.x) * ratio;
			this.y = cursorY - (cursorY - this.y) * ratio;
			this.currentScale = newScale;
		}
	};

	private getDistance(p1: PointerEvent, p2: PointerEvent) {
		return Math.hypot(p2.clientX - p1.clientX, p2.clientY - p1.clientY);
	}

	public reset() {
		this.currentScale = 1;
		this.x = 0;
		this.y = 0;
		this.rotation = 0;
		this.scaleX = 1;
		this.scaleY = 1;
	}

	public zoomIn() {
		this.zoomToScale(Math.min(this.maxScale, this.currentScale * 1.5));
	}

	public zoomOut() {
		this.zoomToScale(Math.max(this.minScale, this.currentScale / 1.5));
	}

	public toggleOneToOne() {
		if (this.currentScale === 1) {
			// Pick a moderately cropped zoom
			this.zoomToScale(2);
		} else {
			this.reset();
		}
	}

	private zoomToScale(newScale: number) {
		if (newScale === this.currentScale) return;

		// Zoom from center
		let rect = { width: 0, height: 0 };
		if (typeof this.getBoundingClientRect === "function") {
			rect = this.getBoundingClientRect();
		}
		const centerX = rect.width / 2 || window.innerWidth / 2;
		const centerY = rect.height / 2 || window.innerHeight / 2;

		const ratio = newScale / this.currentScale;
		this.x = centerX - (centerX - this.x) * ratio;
		this.y = centerY - (centerY - this.y) * ratio;
		this.currentScale = newScale;
	}

	public rotateLeft() {
		this.rotation -= 90;
	}

	public rotateRight() {
		this.rotation += 90;
	}

	public toggleFlipX() {
		this.scaleX *= -1;
	}

	public toggleFlipY() {
		this.scaleY *= -1;
	}

	private get contentTransform() {
		return `translate(${this.x}px, ${this.y}px) scale(${this.currentScale})`;
	}

	private get rotatorTransform() {
		return `scaleX(${this.scaleX}) scaleY(${this.scaleY}) rotate(${this.rotation}deg)`;
	}

	render() {
		return html`
      <div class="wrapper">
        <div class="content" style="transform: ${this.contentTransform}">
          <div class="rotator" style="transform: ${this.rotatorTransform}">
            <slot></slot>
          </div>
        </div>
      </div>
    `;
	}
}

declare global {
	interface HTMLElementTagNameMap {
		"lk-panzoom": Panzoom;
	}
}
