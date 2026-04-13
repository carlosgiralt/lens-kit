import type { ReactiveController, ReactiveControllerHost } from "lit";

export class FullscreenController implements ReactiveController {
	private host: ReactiveControllerHost;
	isActive = false;

	constructor(host: ReactiveControllerHost) {
		this.host = host;
		host.addController(this);
	}

	hostConnected() {
		document.addEventListener("fullscreenchange", this.onFullscreenChange);
	}

	hostDisconnected() {
		document.removeEventListener("fullscreenchange", this.onFullscreenChange);
		this.isActive = false;
	}

	private onFullscreenChange = () => {
		this.isActive = !!document.fullscreenElement;
		this.host.requestUpdate();
	};

	enter(element: HTMLElement) {
		element.requestFullscreen().catch((err: Error) => {
			console.warn(`Fullscreen request failed: ${err.message}`);
		});
	}

	exit() {
		if (document.fullscreenElement) {
			document.exitFullscreen().catch(() => {});
		}
	}

	toggle(element: HTMLElement) {
		this.isActive ? this.exit() : this.enter(element);
	}
}
