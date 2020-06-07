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
