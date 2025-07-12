import chalk from 'chalk'
import { Server, Socket } from 'socket.io'
import { SocketRoom } from './types/SocketRoom'

export const activeRooms: Record<string, SocketRoom> = {
  //Exemplo de Sala: SgzoRnFl14hTZuKjd6CW
  SgzoRnFl14hTZuKjd6CW: {
    id: 'SgzoRnFl14hTZuKjd6CW',
    players: [{ socketId: '', playerId: 'iCz4i2kae9MJUJiYqr8MOY6Wwa93' }],
    status: 'waiting',
  },
}

export function createRoom(
  roomId: string,
  createdBy: string,
  socket: Socket
): SocketRoom {
  const newRoom: SocketRoom = {
    id: roomId,
    players: [{ socketId: socket.id, playerId: createdBy }],
    status: 'waiting',
  }

  activeRooms[roomId] = newRoom
  socket.join(roomId)

  console.log(
    chalk.magenta('[Criando Sala]'),
    `Sala ${chalk.bold(roomId)} criada por ${chalk.green(createdBy)} (${
      socket.id
    })`
  )

  return newRoom
}

export function joinRoom(
  socket: Socket,
  io: Server,
  roomId: string,
  userId: string,
  callback?: Function
) {
  const room = activeRooms[roomId]

  if (!room) {
    console.log(chalk.red('[Entrar Sala] Falha: Sala não encontrada:'), roomId)
    callback?.({ success: false, error: 'Sala não encontrada.' })
    return
  }

  const existingPlayer = room.players.find(p => p.playerId === userId)

  if (existingPlayer) {
    leaveAllOtherRooms(socket)
    socket.join(roomId)
    console.log(
      chalk.yellow('[Entrar Sala] Jogador já estava na sala.'),
      userId
    )
    callback?.({ success: true })
    io.to(roomId).emit('roomUpdate', room)
    return
  }

  if (room.players.length >= 2) {
    console.log(chalk.red('[Entrar Sala] Sala cheia:'), roomId)
    callback?.({ success: false, error: 'Sala cheia.' })
    return
  }

  room.players.push({ socketId: socket.id, playerId: userId })
  socket.join(roomId)
  console.log(chalk.green('[Entrar Sala] Jogador adicionado:'), userId)

  callback?.({ success: true })
  io.to(roomId).emit('roomUpdate', room)
}

function leaveAllOtherRooms(socket: Socket) {
  const roomsToLeave = Array.from(socket.rooms).filter(r => r !== socket.id)
  roomsToLeave.forEach(r => socket.leave(r))
}
