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
	motd: string;

	constructor(opts: ClientOpts) {
		this.opts = opts;
		this.socket;
		this.connected = false;
		this.motd = '';
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

			this.handleMessage(data);
		}
	}

	handleMessage(data: IRCMessage): void {
		// console.log(data.command);
		switch (data.command) {
			case 'rpl_welcome':
				this.print_raw(data.params[1].slice(1, data.params[1].length));
				break;
			case 'rpl_motdstart':
				this.motd = data.params[1] + '\n';
				break;
			case 'rpl_motd':
				this.motd += data.params[1] + '\n';
				break;
			case 'rpl_endofmotd':
				this.print_raw(this.motd);
				break;
			case 'rpl_namreply':
				// console.log(data.params);
				this.print_raw(`${data.params[2]} -- Names: ${data.params[3]}`);
				break;
			case 'rpl_endofnames':
				break;
		}
	}

	print_raw(text: string): void {
		console.log(text);
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
