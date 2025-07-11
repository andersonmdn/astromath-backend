import chalk from 'chalk'
import { Server, Socket } from 'socket.io'

interface Player {
  socketId: string
  playerId: string
}

interface Room {
  id: string
  players: Player[]
  status: 'waiting' | 'playing'
  turn?: string
}

const activeRooms: Record<string, Room> = {}

export const handleSocket = (socket: Socket, io: Server) => {
  socket.on('createRoom', ({ createdBy, roomId }, callback) => {
    console.log(
      chalk.magenta('[Criando Sala]'),
      `Sala ${chalk.bold(roomId)} criada por ${chalk.green(createdBy)} (${
        socket.id
      })`
    )

    const newRoom: Room = {
      id: roomId,
      players: [{ socketId: socket.id, playerId: createdBy }],
      status: 'waiting',
    }

    activeRooms[roomId] = newRoom
    socket.join(roomId)

    if (typeof callback === 'function') {
      callback({ roomId })
    }

    io.to(roomId).emit('roomUpdate', activeRooms[roomId])
  })

  // Entrar em sala existente
  socket.on('joinRoom', ({ roomId, createdBy }, callback) => {
    const room = activeRooms[roomId]

    if (!room) {
      console.log(chalk.red('[JOIN FAIL] Sala não encontrada:'), roomId)
      callback({ error: 'Sala não encontrada.' })
      return
    }

    if (room.players.length >= 2) {
      console.log(chalk.red('[JOIN FAIL] Sala cheia:'), roomId)
      callback({ error: 'Sala cheia.' })
      return
    }

    room.players.push({ socketId: socket.id, playerId: createdBy })
    socket.join(roomId)

    console.log(
      chalk.cyan('[JOIN]'),
      `Jogador ${chalk.green(createdBy)} (${
        socket.id
      }) entrou na sala ${chalk.bold(roomId)}`
    )

    callback({ success: true })
    io.to(roomId).emit('roomUpdate', room)

    if (room.players.length === 2) {
      room.status = 'playing'
      room.turn = room.players[0].socketId
      console.log(
        chalk.bgBlue.white('[START]'),
        `Jogo iniciado na sala ${chalk.bold(roomId)} - turno de ${chalk.green(
          room.turn
        )}`
      )
      io.to(roomId).emit('gameStart', { turn: room.turn })
    }
  })
}
