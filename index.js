import WebSocket, { WebSocketServer } from 'ws'

const socketServer = new WebSocketServer({
	port: process.env.PORT || 3001,
})

const clientNames = new Map()

socketServer.on('error', console.error)
socketServer.on('listening', () => {
	console.log('listening on port %s', socketServer.options.port)
})

socketServer.on('connection', (socket) => {
	socket.on('error', console.error)
	socket.on('close', (code, reason) => {
		console.log('disconnected: %s', clientNames.get(socket))
		clientNames.delete(socket)
	})

	socket.on('message', (message, isBinary) => {
		if (!clientNames.has(socket)) {
			clientNames.set(socket, message.toString())
			console.log('connected: %s', clientNames.get(socket))
		} else {
			const clientName = clientNames.get(socket)
			console.log('received from %s: %s', clientName, message)
			socketServer.clients.forEach((client) => {
				if (client.readyState === WebSocket.OPEN && clientNames.get(client) !== clientName) {
					console.log('sending to %s: %s', clientNames.get(client), message)
					client.send(message, { binary: isBinary })
				}
			})
		}
	})
})
