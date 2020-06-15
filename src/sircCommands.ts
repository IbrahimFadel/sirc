import { Client } from './Client';
import { red, blue, green, yellow } from 'chalk';
import { clearLine, cursorTo } from 'readline';
import { IRCMessage } from './types';

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
};

export const prev = (client: Client): void => {
	client.tab = client.tab === 0 ? client.tabs.length - 1 : client.tab - 1;
	client.writeTabData();
};

export const next = (client: Client): void => {
	client.tab = client.tab === client.tabs.length - 1 ? 0 : client.tab + 1;
	client.writeTabData();
};

export const welcome = (client: Client, message: string) => {
	const messageArray: Array<string> = message.split(' ');
	let colouredMessage: string = '';
	for (const word of messageArray) {
		if (word.toLowerCase() === 'welcome') {
			colouredMessage += green(word) + ' ';
		} else if (
			word.toLowerCase() === 'internet' ||
			word.toLowerCase() === 'relay' ||
			word.toLowerCase() === 'chat'
		) {
			colouredMessage += blue(word) + ' ';
		} else if (word === client.opts.nick) {
			colouredMessage += red(word) + ' ';
		} else {
			colouredMessage += word + ' ';
		}
	}
	colouredMessage += '\n';

	const tabData: Array<string> = [...client.tabData.get(client.tab)];
	tabData.push(`\n${colouredMessage}`);
	client.tabData.set(client.tab, tabData);
	client.writeTabData();
};

export const receivedMsg = (client: Client, message: IRCMessage) => {
	const nickRegex: RegExp = /[A-z-_\[\]\{\}\\\|]+/g;
	const match: RegExpMatchArray = message.prefix.match(nickRegex);
	if (!match) return;
	const nick: string = match[0];

	const indexOfSender: number = client.tabs.indexOf(nick);
	if (indexOfSender !== -1) {
		client.tab = indexOfSender;
	} else {
		client.tabs.push(nick);
		client.tab = client.tabs.length - 1;
		client.tabData.set(client.tab, []);
	}

	let messageString: string = message.params
		.slice(1, message.params.length)
		.join(' ');
	messageString = messageString.slice(1, messageString.length);

	const tabData: Array<string> = [...client.tabData.get(client.tab)];
	tabData.push(`\n${yellow(nick)} ${blue('-->')} ${green(messageString)}`);
	client.tabData.set(client.tab, tabData);
	client.writeTabData();
};
