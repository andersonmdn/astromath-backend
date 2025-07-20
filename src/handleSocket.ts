import chalk from 'chalk'
import { Server, Socket } from 'socket.io'
import { landingSpaceship, registerBoard } from './GameManager'
import { createRoom, joinRoom } from './roomManager'
import Board from './types/Board'
import { Spaceship } from './types/Spaceship'

export const handleSocket = (socket: Socket, io: Server) => {
  socket.on('createRoom', ({ createdBy, roomId }, callback) => {
    const room = createRoom(roomId, createdBy, socket)
    callback?.({ roomId })
    io.to(roomId).emit('roomUpdate', room)
  })

  socket.on('joinRoom', ({ roomId, userId }, callback) => {
    joinRoom(socket, io, roomId, userId, callback)
  })

  socket.on('registerBoard', ({ roomId, playerId, board }, callback) => {
    if (!roomId || !playerId || !board) {
      console.log(chalk.red('Dados inválidos para registro de tabuleiro:'), {
        roomId,
        playerId,
        board,
      })

      return callback({ success: false, error: 'Dados inválidos' })
    }

    registerBoard(roomId, playerId, board, io)

    callback({ success: true })
  })

  socket.on(
    'tryLandingSpaceship',
    (
      {
        roomId,
        playerId,
        coordinate,
        spaceship,
      }: {
        roomId: string
        playerId: string
        coordinate: Board
        spaceship: Spaceship
      },
      callback
    ) => {
      if (!roomId || !playerId || !coordinate) {
        console.log(
          chalk.red('Dados inválidos para tentativa de posicionamento:'),
          {
            roomId,
            playerId,
            coordinate,
          }
        )

        return callback({ success: false, error: 'Dados inválidos' })
      }

      console.log(
        chalk.blue(
          `Tentativa de posicionamento de nave: ${JSON.stringify(
            coordinate
          )} por ${playerId} na sala ${roomId}`
        )
      )
      landingSpaceship(roomId, playerId, coordinate, spaceship, socket)
      callback({ success: true })
    }
  )
}
