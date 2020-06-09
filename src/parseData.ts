import { IRCMessage } from './types';
import { commands } from './commands';

/**
 * According to IRC message specifications: https://tools.ietf.org/html/rfc1459#section-2.3.1
 * I don't know regex... does anyone??. This is probably pretty trash
 */
export const parseData = (line: string): IRCMessage => {
	/**
	 *! Just remove prefix from string, to use simplified regex for command
	 */
	var message: IRCMessage = {
		prefix: '',
		params: [],
		ignore: false,
	};

	const prefixRegex: RegExp = /^:[A-z]+\.[A-z]+\.[A-z]+|^:[A-z]+/g;
	const commandRegex: RegExp = /^:[A-z]+\.[A-z]+\.[A-z]+ ([A-z]+|\d\d\d)|^:[A-z]+ ([A-z]+|\d\d\d)/g;

	let match = line.match(prefixRegex);
	if (match) {
		const prefix = match[0].slice(1, match[0].length);
		message.prefix = prefix;
	} else {
		message.ignore = true;
		return message;
	}

	match = line.match(commandRegex);
	if (match) {
		const command = match[0].slice(message.prefix.length + 2, match[0].length);
		message.command = isNaN(command)
			? command.toLowerCase()
			: commands.get(command).toLowerCase();
	} else {
		message.ignore = true;
		return message;
	}

	const end = line.slice(match[0].length, line.length);
	const split = end.split(' ').splice(1, end.length);
	const params = [];
	let i = 0;
	for (const param of split) {
		if (param[0] === ':') {
			let paramString = '';
			for (let x = i; x < split.length; x++) {
				paramString += split[x] + ' ';
			}
			params.push(paramString.trim());
			break;
		}
		params.push(param);
		i++;
	}
	message.params = params;

	return message;
};
