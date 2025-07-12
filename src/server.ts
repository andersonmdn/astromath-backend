import chalk from 'chalk'
import express from 'express'
import http from 'http'
import { Server } from 'socket.io'
import { handleSocket } from './handleSocket'

const app = express()
const server = http.createServer(app)
const io = new Server(server, {
  cors: {
    origin: '*',
  },
})

io.on('connection', socket => {
  const previousSocketId = socket.handshake.query.previousId as string
  const userId = socket.handshake.query.userId as string

  if (previousSocketId) {
    console.log(
      chalk.yellow.bold('[Reconectando cliente]'),
      chalk.cyan(userId),
      chalk.gray('de'),
      chalk.magenta(previousSocketId),
      chalk.gray('(Antigo)'),
      chalk.green(socket.id),
      chalk.gray('(Novo)')
    )

    io.emit('reconnect', { previousSocketId })
  } else {
    console.log(
      chalk.green.bold('[Novo Cliente Conectado]'),
      chalk.bold(userId)
    )
  }

  handleSocket(socket, io)

  socket.on('disconnect', () => {
    console.log(chalk.red.bold('[Cliente Desconectado]'), chalk.bold(socket.id))
  })
})

const PORT = 3001
server.listen(PORT, () => {
  console.log(
    chalk.green(`[Servidor Iniciado] Servidor rodando na porta ${PORT}`)
  )
})
