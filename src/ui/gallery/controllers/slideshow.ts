import type { ReactiveController, ReactiveControllerHost } from "lit";

export class SlideshowController implements ReactiveController {
	private host: ReactiveControllerHost;
	private interval?: number;
	isPlaying = false;

	constructor(host: ReactiveControllerHost) {
		this.host = host;
		host.addController(this);
	}

	hostDisconnected() {
		this.stop();
	}

	start(onTick: () => void, intervalMs = 3000) {
		this.isPlaying = true;
		this.interval = window.setInterval(onTick, intervalMs);
		this.host.requestUpdate();
	}

	stop() {
		if (!this.isPlaying) return;
		this.isPlaying = false;
		clearInterval(this.interval);
		this.interval = undefined;
		this.host.requestUpdate();
	}

	toggle(onTick: () => void, intervalMs = 3000) {
		this.isPlaying ? this.stop() : this.start(onTick, intervalMs);
	}
}
