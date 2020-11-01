const fs = require("fs");

export const log = (msg: string): void => {
  fs.appendFile("log", msg, (err: Error, data: any) => {
    if (err) throw err;
  });
};
