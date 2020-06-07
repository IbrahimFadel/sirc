import { CliOpts, TextOpts } from './types';
import { screen, box, Widgets } from 'blessed';

export class Cli {
	private opts: CliOpts;
	private screen: Widgets.Screen;
	private mainBox: Widgets.BoxElement;

	private width: number;
	private height: number;
	// private lines: Array<string>

	constructor(opts: CliOpts) {
		this.opts = opts;
	}

	init(): void {
		this.screen = screen({
			smartCSR: true,
		});
		this.screen.title = this.opts.title;
		this.width = parseInt(this.screen.width.toString());
		this.height = parseInt(this.screen.height.toString());

		this.setEventListeners();

		this.mainBox = box({
			top: 'center',
			left: 'center',
			width: '100%',
			height: '100%',
			tags: true,
			border: {
				type: 'line',
			},
			style: {
				fg: '#fff',
				border: {
					fg: '#f0f0f0',
				},
				hover: {
					bg: 'green',
				},
			},
			scrollable: true,
		});

		this.screen.append(this.mainBox);

		this.screen.render();
	}

	setEventListeners(): void {
		this.screen.key(['escape', 'q', 'C-c', 'C-z'], (char, e) => {
			return process.exit(0);
		});
	}

	line(opts: TextOpts): void {
		const { x, y, text, centered } = opts;
		const col: number = Math.floor(x);
		const row: number = Math.floor(y);

		let xPositionedText: string = '';
		const iteratorMax = centered ? col - Math.floor(text.length / 2) : col;
		for (let i = 0; i < iteratorMax; i++) {
			xPositionedText += ' ';
		}
		xPositionedText += text;
		this.mainBox.setLine(row, xPositionedText);

		// console.log('LINE: ', opts.text);

		this.render();
	}

	appendLine(opts: TextOpts): void {
		const { x, y, text, centered } = opts;
		const col: number = Math.floor(x);
		const row: number = Math.floor(y);

		let xPositionedText: string = '';
		const iteratorMax = centered ? col - Math.floor(text.length / 2) : col;
		for (let i = 0; i < iteratorMax; i++) {
			xPositionedText += ' ';
		}
		xPositionedText += text;
		this.mainBox.setLine(row + 1, xPositionedText);

		// console.log('LINE: ', opts.text);

		this.render();
	}

	render(): void {
		this.screen.render();
	}

	getWidth(): number {
		return this.width;
	}

	getHeight(): number {
		return this.height;
	}

	getBox(): Widgets.BoxElement {
		return this.mainBox;
	}
}
