export interface ClientOpts {
  nick: string;
  realname: string;
  hostname: string;
  servername: string;
}

export interface ConnectionOpts {
  host: string;
  port: number;
  verbose: boolean;
}

export interface CliOpts {
  title: string;
}

export interface TextOpts {
  text: string;
  centered: boolean;
  x: number;
  y: number;
}

export interface IRCMessage {
  prefix?: string;
  command?: string;
  params?: Array<string>;
  ignore: boolean;
}

export enum TypingState {
  normal,
  command,
}
