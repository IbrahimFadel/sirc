import { CliOpts, TextOpts } from './types';
import { screen, box, Widgets, textarea, form } from 'blessed';

export class Cli {
	private opts: CliOpts;
	private screen: Widgets.Screen;
	private mainBox: Widgets.BoxElement;
	private inputBox: Widgets.TextareaElement;
	private inputForm: Widgets.FormElement<any>;

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
			top: 0,
			left: 0,
			width: '100%',
			height: '95%',
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

		this.inputBox = textarea({
			parent: this.screen,
			bottom: 0,
			left: 0,
			height: '5%',
			width: '100%',
			inputOnFocus: true,
			// keys: true,
			mouse: true,
			style: {
				fg: 'white',
				bg: 'blue',
				border: {
					fg: '#f0f0f0',
				},
			},
		});

		this.inputBox.key(['enter'], () => {
			this.inputBox.submit();
		});

		this.inputBox.on('submit', e => {
			console.log('submit', e);
		});

		// this.inputForm = form({

		// });

		// this.inputBox = textbox({
		// 	bottom: 0,
		// 	left: 0,
		// 	height: '5%',
		// 	width: '99%',
		// 	keys: true,
		// 	mouse: true,
		// 	inputOnFocus: true,
		// 	style: {
		// 		fg: 'white',
		// 		bg: 'blue', // Blue background so you see this is different from body,
		// 		border: {
		// 			fg: '#f0f0f0',
		// 		},
		// 	},
		// });

		// this.inputBox.on('action', e => {
		// console.log(e);
		// });

		this.screen.append(this.inputBox);
		this.screen.append(this.mainBox);

		this.mainBox.focus();

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
		// console.log(row, xPositionedText);
		try {
			// this.mainBox.pushLine(xPositionedText);
			// this.mainBox.insertLine(row, xPositionedText);
		} catch {
			// this.mainBox.setLine(row, xPositionedText);
		}
		// this.mainBox.insertLine(row, xPositionedText);
		// this.mainBox.setLine(row, xPositionedText);

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
