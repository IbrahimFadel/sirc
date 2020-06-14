import { Client } from './Client';
import { red, blue, green, yellow } from 'chalk';
import { clearLine, cursorTo } from 'readline';

export const join = (client: Client, rawCommand: string): void => {
	const commandArray: Array<string> = rawCommand.split(' ');
	const args: Array<string> = commandArray.slice(1, commandArray.length);

	client.sendCommand('JOIN', args);

	client.tabs.push(args[0]);
	client.tab = client.tabs.length - 1;
	client.tabData.set(client.tab, [
		`${blue('-->')} ${red(client.opts.nick)} has joined ${yellow(args[0])}\n`,
	]);
};

export const msg = (client: Client, rawCommand: string): void => {
	const commandArray: Array<string> = rawCommand.split(' ');
	const args: Array<string> = commandArray.slice(1, commandArray.length);
	const message: string = args.slice(1, args.length).join(' ');

	const ircArgs = [args[0], ':' + message];
	client.sendCommand('PRIVMSG', ircArgs);

	const indexOfRecipient = client.tabs.indexOf(args[0]);
	console.log(indexOfRecipient);
	if (indexOfRecipient !== -1) {
		client.tab = indexOfRecipient;
	} else {
		client.tabs.push(args[0]);
		client.tab = client.tabs.length - 1;
		client.tabData.set(client.tab, []);
	}

	const tabData: Array<string> = [...client.tabData.get(client.tab)];
	tabData.push(`\n${red(client.opts.nick)} ${blue('-->')} ${green(message)}`);
	client.tabData.set(client.tab, tabData);
	client.writeTabData();
	// cursorTo(process.stdout, 0, process.stdout.rows - 1);
	// process.stdout.write(
	// 	`${red(client.opts.nick)} ${blue('-->')} ${green(message)}\n`,
	// );
};

export const prev = (client: Client): void => {
	client.tab = client.tab === 0 ? client.tabs.length - 1 : client.tab - 1;
	client.writeTabData();
};

export const next = (client: Client): void => {
	client.tab = client.tab === client.tabs.length - 1 ? 0 : client.tab + 1;
	client.writeTabData();
};
