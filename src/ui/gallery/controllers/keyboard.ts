import type { ReactiveController, ReactiveControllerHost } from "lit";

export class KeyboardController implements ReactiveController {
	private handler?: (e: KeyboardEvent) => void;

	constructor(host: ReactiveControllerHost) {
		host.addController(this);
	}

	hostDisconnected() {
		this.detach();
	}

	attach(handler: (e: KeyboardEvent) => void) {
		this.detach();
		this.handler = handler;
		window.addEventListener("keydown", this.handler);
	}

	detach() {
		if (this.handler) {
			window.removeEventListener("keydown", this.handler);
			this.handler = undefined;
		}
	}
}
