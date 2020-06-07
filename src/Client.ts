import { ClientOpts, ConnectionOpts, TextOpts } from './types';
import { Socket, createConnection } from 'net';
import { Cli } from './cli';

export class Client {
	opts: ClientOpts;
	socket: Socket;
	connected: boolean;
	cli: Cli;

	constructor(opts: ClientOpts) {
		this.opts = opts;
		this.socket;
		this.connected = false;
		this.cli = opts.cli;
	}

	connect(opts: ConnectionOpts, cb: Function): void {
		this.socket = createConnection(opts, () => {
			if (opts.verbose) {
				this.socket.on('data', buf => this.onData(buf));
			}

			this.socket.on('connect', () => {
				const opts: TextOpts = {
					x: this.cli.getWidth() / 2,
					y: this.cli.getHeight() / 2,
					text: 'Connected',
					centered: true,
				};

				this.cli.line(opts);
				console.log('CONNECTED!!');
			});

			this.authenticate();
			cb();
		});
	}

	onData(buf: Buffer): void {
		const str = buf.toString();
		const lines = str.split('\r\n');

		for (const line of lines) {
			// const indexOfNick = line.indexOf(this.opts.nick);
			// if (indexOfNick === -1) return;
		}

		const opts: TextOpts = {
			x: 0,
			y: 0,
			text: str,
			centered: false,
		};
		this.cli.appendLine(opts);
		// console.log(str);
	}

	sendCommand(command: string, args?: Array<string>): void {
		if (!args) {
			const opts: TextOpts = {
				x: 0,
				y: 0,
				text: `Sending Command: ${command}`,
				centered: false,
			};

			this.cli.line(opts);

			// console.log(`Sending Command: ${command}`);

			this.socket.write(`${command}\r\n`);
			return;
		}
		let commandString: string = '';
		let commands: Array<string> = [];
		commands.push(command);
		for (const arg of args) {
			commands.push(arg);
		}
		commands.push('\r\n');
		commandString = commands.join(' ');

		const opts: TextOpts = {
			x: 0,
			y: 0,
			text: `Sending Command: ${commandString}`,
			centered: false,
		};

		this.cli.appendLine(opts);
		// console.log(`Sending Command: ${commandString}`);

		this.socket.write(commandString);
	}

	authenticate(): void {
		this.sendCommand('USER', [
			this.opts.nick,
			this.opts.hostname,
			this.opts.servername,
			this.opts.realname,
		]);
	}

	nick(nick: string): void {
		this.sendCommand('NICK', [nick]);
		this.opts.nick = nick;
	}

	listUsers(): void {
		this.sendCommand('NAMES');
	}
}
