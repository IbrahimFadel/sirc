import { ClientOpts, ConnectionOpts, IRCMessage, TypingState } from "./types";
import { Socket, createConnection } from "net";
import { parseData } from "./parseData";
import { emitKeypressEvents, Key, clearLine, cursorTo } from "readline";
import {
  join,
  leave,
  msg,
  prev,
  next,
  welcome,
  receivedMsg,
} from "./sircCommands";
import { bgGray, black, bgWhite, red } from "chalk";
import { log } from "./debug";

export class Client {
  opts: ClientOpts;
  socket: Socket;
  connected: boolean;
  motd: string;
  typingState: TypingState;
  command: string;
  quitSequences: Array<string>;
  // tabs: Map<number, string>;
  tabs: Array<string>;
  tab: number;
  tabData: Map<number, Array<string>>;

  constructor(opts: ClientOpts) {
    this.opts = opts;
    this.socket;
    this.connected = false;
    this.motd = "";
    this.typingState = TypingState.normal;
    this.command = "";
    this.quitSequences = ["\x03", "\x1A", "\x1B"]; // C-c, C-z, Esc
    // this.tabs = new Map<number, string>([[0, '*']]);
    this.tabs = ["*"];
    this.tab = 0;
    this.tabData = new Map<number, Array<string>>([[0, []]]);

    emitKeypressEvents(process.stdin);
    process.stdin.setRawMode(true);
    process.stdin.on("keypress", (str, key) => this.handleKeyPress(key));
  }

  handleKeyPress(key: Key) {
    const { sequence } = key;

    if (this.quitSequences.includes(sequence)) {
      process.exit(0);
    }

    if (this.typingState == TypingState.command) {
      if (sequence === "\r") {
        clearLine(process.stdout, 0);
        cursorTo(process.stdout, 0, process.stdout.rows - 1);
        this.sircCommand(this.command);
        this.command = "";
        this.typingState = TypingState.normal;
      } else if (sequence === "\x7F") {
        if (this.command.length !== 0) {
          this.command = this.command.substring(0, this.command.length - 1);
          process.stdout.clearLine(0);
          process.stdout.cursorTo(0, process.stdout.rows - 1);
          process.stdout.write("/" + this.command);
        } else {
          this.typingState = TypingState.normal;
          process.stdout.clearLine(0);
          process.stdout.cursorTo(0, process.stdout.rows - 1);
        }
      } else {
        this.command += sequence;
        process.stdout.clearLine(0);
        process.stdout.cursorTo(0, process.stdout.rows - 1);
        process.stdout.write("/" + this.command);
      }
    } else if (this.typingState == TypingState.normal) {
      if (sequence === "/") {
        process.stdout.clearLine(0);
        process.stdout.cursorTo(0, process.stdout.rows - 1);
        process.stdout.write("/");
        this.typingState = TypingState.command;
      }
    }
  }

  sircCommand(commandString: string) {
    const commandArray: Array<string> = commandString.split(" ");
    const command: string = commandArray[0];

    switch (command.toLowerCase()) {
      case "join":
        join(this, commandString);
        break;
      case "leave":
        leave(this);
        break;
      case "msg":
        msg(this, commandString);
        break;
      case "prev":
        prev(this);
        break;
      case "next":
        next(this);
        break;
    }
  }

  connect(opts: ConnectionOpts, cb: Function): void {
    this.socket = createConnection(opts, () => {
      if (opts.verbose) {
        this.socket.on("data", (buf) => this.onData(buf));
      }

      this.clear();
      this.writeTabs();
      this.authenticate();
      cb();
    });
  }

  writeTabs() {
    cursorTo(process.stdout, 0, 0);
    clearLine(process.stdout, 0);
    for (let i = 0; i < this.tabs.length; i++) {
      const tab = this.tabs[i];
      const bg = i === this.tab ? bgWhite : bgGray;
      process.stdout.write(`${bg(black(tab))} `);
    }
    cursorTo(process.stdout, 0, process.stdout.rows - 1);
  }

  onData(buf: Buffer): void {
    const str = buf.toString();
    const lines = str.split("\r\n");

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
    log(data.command);
    log("\n");
    switch (data.command) {
      case "rpl_welcome":
        welcome(this, data.params[1].slice(1, data.params[1].length));
        // this.print_raw(data.params[1].slice(1, data.params[1].length));
        break;
      case "rpl_motdstart":
        this.motd = data.params[1] + "\n";
        break;
      case "rpl_motd":
        this.motd += data.params[1] + "\n";
        break;
      case "rpl_endofmotd":
        this.print_raw(this.motd);
        break;
      case "rpl_namreply":
        this.print_raw(`${data.params[2]} -- Names: ${data.params[3]}`);
        break;
      case "rpl_endofnames":
        break;
      case "err_nosuchnick":
        this.error("No such nickname");
        break;
      case "privmsg":
        receivedMsg(this, data);
        break;
    }
  }

  error(msg: string) {
    cursorTo(process.stdout, 0, process.stdout.rows - 1);
    process.stdout.write(red(msg));
  }

  clear() {
    for (let i = 0; i < process.stdout.rows; i++) {
      cursorTo(process.stdout, 0, i);
      clearLine(process.stdout, 0);
    }
  }

  writeTabData() {
    this.clear();
    cursorTo(process.stdout, 0, 1);

    process.stdout.write("\n");
    const tabData: Array<string> = [...this.tabData.get(this.tab)];
    for (const buffer of tabData) {
      process.stdout.write(buffer);
    }

    this.writeTabs();
  }

  print_raw(text: string): void {
    cursorTo(process.stdout, 0, process.stdout.rows - 1);
    // process.stdout.write(text);
    const tabData: Array<string> = [...this.tabData.get(this.tab)];
    tabData.push(text);

    this.clear();
    cursorTo(process.stdout, 0, 1);
    for (const buffer of tabData) {
      process.stdout.write(buffer);
    }

    this.tabData.set(this.tab, tabData);
    this.writeTabs();
  }

  sendCommand(command: string, args?: Array<string>): void {
    if (!args) {
      this.socket.write(`${command}\r\n`);
      return;
    }
    const commandString = `${command} ${args.join(" ")} \r\n`;
    log(commandString);
    this.socket.write(commandString);
  }

  authenticate(): void {
    this.sendCommand("USER", [
      this.opts.nick,
      this.opts.hostname,
      this.opts.servername,
      this.opts.realname,
    ]);
  }

  nick(nick: string): void {
    this.sendCommand("NICK", [nick]);
    this.opts.nick = nick;
  }

  listUsers(): void {
    this.sendCommand("NAMES");
  }
}
