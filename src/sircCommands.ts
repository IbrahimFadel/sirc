import { Client } from "./Client";
import { red, blue, green, yellow } from "chalk";

export const join = (client: Client, rawCommand: string) => {
  const commandArray: Array<string> = rawCommand.split(" ");
  const args: Array<string> = commandArray.slice(1, commandArray.length);

  client.sendCommand("JOIN", args);

  console.log(
    `${blue("-->")} ${red(client.opts.nick)} has joined ${yellow(args[0])}`
  );
};

export const msg = (client: Client, rawCommand: string) => {
  const commandArray: Array<string> = rawCommand.split(" ");
  const args: Array<string> = commandArray.slice(1, commandArray.length);
  const message: string = args.slice(1, args.length).join(" ");

  const ircArgs = [args[0], ":" + message];
  client.sendCommand("PRIVMSG", ircArgs);
  console.log(`${red(client.opts.nick)} ${blue("-->")} ${green(message)}`);
};
