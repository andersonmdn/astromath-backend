import chalk from 'chalk'
import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import * as http from 'http'
import { Server } from 'socket.io'
import { generateSecureConnectionId } from './secureID'

dotenv.config()

const app = express()
const server = http.createServer(app)
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
})

app.use(cors())
app.use(express.json())

const rooms = {} // Armazena os grupos
const userToRoom = {} // Mapeia usuários para suas salas

io.on('connection', socket => {
  console.log(`Usuário conectado: ${chalk.green(socket.id)}`) // Estiliza a saída do console
  const connectionId = generateSecureConnectionId(socket.id) // Gera um ID seguro para o usuário

  console.log(
    `ID seguro gerado para ${chalk.green(socket.id)}: ${chalk.green(
      connectionId
    )}`
  ) // Estiliza a saída do console

  // Tenta encontrar ou criar uma sala
  const joinRoom = () => {
    for (const room in rooms) {
      if (rooms[room].length < 2) {
        rooms[room].push(socket.id)
        userToRoom[socket.id] = room
        socket.join(room)
        console.log(
          `Usuário ${chalk.blue(socket.id)} entrou na sala ${chalk.blue(room)}`
        ) // Estiliza a saída do console
        io.to(room).emit('message', `Usuário ${socket.id} entrou na sala.`)
        socket.emit('roomJoined', room)
        return
      }
    }

    // Se nenhuma sala disponível, cria uma nova
    const newRoom = `room-${socket.id}`
    rooms[newRoom] = [socket.id]
    userToRoom[socket.id] = newRoom
    socket.join(newRoom)
    console.log(
      `Nova sala criada: ${chalk.yellow(newRoom)} por ${chalk.yellow(
        socket.id
      )}`
    ) // Estiliza a saída do console
    socket.emit('roomJoined', newRoom)
  }

  joinRoom()

  socket.on('setNickname', nickname => {
    socket.data.nickname = nickname
    console.log(
      `Usuário ${chalk.magenta(
        socket.id
      )} definiu o apelido como ${chalk.magenta(nickname)}`
    ) // Estiliza a saída do console
    const room = userToRoom[socket.id]
    if (room) {
      io.to(room).emit(
        'message',
        `Usuário ${socket.id} agora é conhecido como ${nickname}`
      )
    }
  })

  socket.on('joinSpecificRoom', room => {
    if (userToRoom[socket.id]) {
      const oldRoom = userToRoom[socket.id]
      rooms[oldRoom] = rooms[oldRoom].filter(id => id !== socket.id)
      socket.leave(oldRoom)
      if (rooms[oldRoom].length === 0) {
        delete rooms[oldRoom]
        console.log(`Sala ${oldRoom} removida pois ficou vazia.`)
      }
    }

    if (!rooms[room]) {
      rooms[room] = []
    }

    if (rooms[room].length < 2) {
      rooms[room].push(socket.id)
      userToRoom[socket.id] = room
      socket.join(room)
      console.log(`Usuário ${socket.id} entrou na sala ${room}`)
      io.to(room).emit('message', `Usuário ${socket.id} entrou na sala.`)
      socket.emit('roomJoined', room)
    } else {
      socket.emit('roomFull', room)
    }
  })

  socket.on('message', data => {
    const room = userToRoom[socket.id]
    if (room) {
      console.log(
        `[${chalk.cyan(socket.id)}] Mensagem recebida na sala ${chalk.cyan(
          room
        )}: ${chalk.cyan(data)}`
      )
      io.to(room).emit('message', data)
    }
  })

  socket.on('disconnect', () => {
    console.log(`Usuário desconectado: ${chalk.red(socket.id)}`) // Estiliza a saída do console
    const room = userToRoom[socket.id]
    if (room) {
      rooms[room] = rooms[room].filter(id => id !== socket.id)
      delete userToRoom[socket.id]
      if (rooms[room].length === 0) {
        delete rooms[room]
        console.log(`Sala ${chalk.red(room)} removida pois ficou vazia.`) // Estiliza a saída do console
      }
    }
  })
})

const PORT = process.env.PORT || 3000
server.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${chalk.green(PORT)}`) // Estiliza a saída do console
})
