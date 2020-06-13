const env = require("dotenv").config().parsed;

import { ClientOpts, ConnectionOpts, CliOpts, TextOpts } from "./types";
import { Client } from "./Client";

const run = (): void => {
  const cliOpts: CliOpts = {
    title: "SIRC",
  };

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
    client.nick("dwibber");
  });
};

run();
