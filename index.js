const env = require('dotenv').config().parsed;
const net = require('net');

const options = {
	host: env.HOST,
	port: env.PORT,
};

const socket = net.createConnection(options, () => {
	console.log(socket);

	socket.setEncoding('utf-8');
	socket.on('data', buf => {
		console.log(buf.toString());
	});

	socket.write(
		'USER ibrahim ibrahim.fadel ibrahim.fadel :ibrahim\r\n',
		err => {},
	);

	socket.write('NICK mytest1234\r\n', err => {});

	// socket.write('NAMES\r\n', err => {});
	socket.write('JOIN #kisslinux\r\n', err => {});

	socket.on('error', err => {
		console.error(err);
	});
});
