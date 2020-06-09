const env = require('dotenv').config().parsed;

import { ClientOpts, ConnectionOpts, CliOpts, TextOpts } from './types';
import { Client } from './Client';
// import { Cli } from './cli';

const run = (): void => {
	const cliOpts: CliOpts = {
		title: 'SIRC',
	};

	// const cli: Cli = new Cli(cliOpts);
	// cli.init();

	const { HOST, PORT, NICK, REALNAME, HOSTNAME, SERVERNAME } = env;

	const clientOpts: ClientOpts = {
		nick: NICK,
		realname: REALNAME,
		hostname: HOSTNAME,
		servername: SERVERNAME,
		// cli,
	};

	const client: Client = new Client(clientOpts);
	const connectionOpts: ConnectionOpts = {
		host: HOST,
		port: PORT,
		verbose: true,
	};

	client.connect(connectionOpts, () => {
		client.nick('dwibber');

		client.sendCommand('JOIN', ['#guitar']);

		client.sendCommand('NAMES');
	});

	// client.connect(connectionOpts, () => {
	// 	cli.line({
	// 		x: cli.getWidth() / 2,
	// 		y: cli.getHeight() / 2,
	// 		text: 'Connecting...',
	// 		centered: true,
	// 	});

	// 	client.nick('dwibber');
	// 	// client.sendCommand('JOIN', ['#guitar']);
	// });
};

run();
