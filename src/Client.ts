import { ClientOpts, ConnectionOpts, TextOpts, IRCMessage } from './types';
import { Socket, createConnection } from 'net';
import { Cli } from './cli';
import { parseData } from './parseData';
import { commands } from './commands';

export class Client {
	opts: ClientOpts;
	socket: Socket;
	connected: boolean;
	cli: Cli;

	constructor(opts: ClientOpts) {
		this.opts = opts;
		this.socket;
		this.connected = false;
	}

	connect(opts: ConnectionOpts, cb: Function): void {
		this.socket = createConnection(opts, () => {
			if (opts.verbose) {
				this.socket.on('data', buf => this.onData(buf));
			}

			this.socket.on('connect', () => {
				console.log('CONNECTED!!');
			});

			this.authenticate();
			cb();
		});
	}

	onData(buf: Buffer): void {
		const str = buf.toString();
		const lines = str.split('\r\n');

		const parsedData: Array<IRCMessage> = [];
		for (const line of lines) {
			const parsedLine: IRCMessage = parseData(line);
			parsedData.push(parsedLine);
		}

		for (const data of parsedData) {
			if (data.ignore) continue;

			console.log(data.command);
		}
	}

	sendCommand(command: string, args?: Array<string>): void {
		if (!args) {
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
