import { Server, Socket } from 'socket.io'
import { createRoom, joinRoom } from './roomManager'

export const handleSocket = (socket: Socket, io: Server) => {
  socket.on('createRoom', ({ createdBy, roomId }, callback) => {
    const room = createRoom(roomId, createdBy, socket)
    callback?.({ roomId })
    io.to(roomId).emit('roomUpdate', room)
  })

  socket.on('joinRoom', ({ roomId, userId }, callback) => {
    joinRoom(socket, io, roomId, userId, callback)
  })
}
