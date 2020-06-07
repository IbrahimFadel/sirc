const env = require('dotenv').config().parsed;
const net = require('net');

import { ClientOpts, ConnectionOpts } from './types';
import { Client } from './Client';

const run = (): void => {
	const { HOST, PORT, NICK, REALNAME, HOSTNAME, SERVERNAME } = env;

	const clientOpts: ClientOpts = {
		nick: NICK,
		realname: REALNAME,
		hostname: HOSTNAME,
		servername: SERVERNAME,
	};
	const client: Client = new Client(clientOpts);

	const connectionOpts: ConnectionOpts = {
		host: HOST,
		port: PORT,
		verbose: true,
	};

	client.connect(connectionOpts, () => {
		// client.nick('dwib');

		client.sendCommand('JOIN', ['#guitar']);
	});
};

run();
