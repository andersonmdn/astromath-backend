// backend/src/GameManager.ts
import chalk from 'chalk'
import { Server, Socket } from 'socket.io'
import { activeRooms } from './roomManager'
import Board from './types/Board'
import GameState from './types/GameState'
import { Spaceship } from './types/Spaceship'

export type Position = { angle: number; ring: number }

const gameStates: Record<string, GameState> = {}

export function registerBoard(
  roomId: string,
  playerId: string,
  board: Board[],
  io: Server
) {
  const room = activeRooms[roomId]
  if (!room) {
    console.error(chalk.red(`[Erro] Sala ${roomId} não encontrada`))
    return
  }

  const game = gameStates[roomId] ?? {
    turn: '', // Definido após os dois jogadores estarem prontos
    playerBoards: {},
    scores: {},
    players: new Set(),
    startedAt: Date.now(),
  }
  //[{"circle":1,"angle":0,"x":553.5,"y":473,"occupant":null},{"circle":1,"angle":30,"x":540.1025403784439,"y":523,"occupant":null}]

  game.playerBoards[playerId] = board
  game.scores[playerId] = 0
  game.players.add(playerId)
  gameStates[roomId] = game

  console.log(chalk.cyan('[Tabuleiro Pronto]'), `Jogador: ${playerId}`)

  if (game.players.size === 2) {
    //startGame(io, roomId)
  }
}

export function landingSpaceship(
  roomId: string,
  playerId: string,
  coordinate: Board,
  spaceship: Spaceship,
  socket: Socket
): boolean {
  const game = gameStates[roomId]
  if (!game) {
    console.error(chalk.red(`[Erro] Jogo na sala ${roomId} não encontrado`))
    return false
  }

  if (!game.playerBoards[playerId]) {
    console.error(chalk.red(`[Erro] Jogador ${playerId} não registrado`))
    return false
  }

  const { angle, circle } = coordinate
  const existingCoordinate = game.playerBoards[playerId].find(
    b => b.angle === angle && b.circle === circle
  )

  existingCoordinate.occupant = spaceship

  console.log(
    chalk.green('[Posicionamento de Nave]'),
    `Jogador: ${playerId}, Coordenadas: circle=${circle}, angle=${angle}, ocupante=${JSON.stringify(
      spaceship
    )}`
  )

  socket.emit('LandingSpaceship', {
    coordinate,
    spaceship,
  })

  return true
}

// function startGame(io: Server, roomId: string) {
//   const room = activeRooms[roomId]
//   const game = gameStates[roomId]
//   if (!room || !game) return

//   const [p1, p2] = room.players
//   const first = Math.random() < 0.5 ? p1.playerId : p2.playerId

//   game.turn = first
//   room.status = 'playing'

//   io.to(roomId).emit('preparationComplete')
//   io.to(roomId).emit('gameStarted', { turn: first })

//   console.log(
//     chalk.green('[Início de Jogo]'),
//     `Sala: ${roomId}, Primeiro turno: ${first}`
//   )
// }

// export function handleAnswer(
//   io: Server,
//   socket: Socket,
//   roomId: string,
//   isCorrect: boolean,
//   position: Position
// ) {
//   const game = gameStates[roomId]
//   if (!game) return

//   const playerId = getPlayerIdFromSocket(roomId, socket.id)
//   if (!playerId || game.turn !== playerId) return

//   const opponentId = getOpponentId(roomId, playerId)
//   const enemyBoard = game.playerBoards[opponentId]

//   if (isCorrect) {
//     const hit = applyAttack(enemyBoard, position)

//     if (hit) {
//       game.scores[playerId] += 1
//       io.to(roomId).emit('attackResult', {
//         attacker: playerId,
//         position,
//         result: 'hit',
//         scores: game.scores,
//       })
//     } else {
//       io.to(roomId).emit('attackResult', {
//         attacker: playerId,
//         position,
//         result: 'miss',
//         scores: game.scores,
//       })
//       game.turn = opponentId
//     }
//   } else {
//     io.to(roomId).emit('attackResult', {
//       attacker: playerId,
//       position,
//       result: 'wrongAnswer',
//       scores: game.scores,
//     })
//     game.turn = opponentId
//   }

//   checkGameEnd(io, roomId)
// }

// function applyAttack(board: Board, { angle, ring }: Position): boolean {
//   const ringIndex = ringToIndex(ring)
//   const angleIndex = angleToIndex(angle)
//   if (board[ringIndex][angleIndex] === 'S') {
//     board[ringIndex][angleIndex] = 'X'
//     return true
//   }
//   return false
// }

// function checkGameEnd(io: Server, roomId: string) {
//   const game = gameStates[roomId]
//   if (!game) return

//   const totalHits = Object.values(game.scores).reduce(
//     (sum, val) => sum + val,
//     0
//   )
//   const maxHits = 5 + 4 + 3 + 4 // 16

//   if (totalHits >= maxHits) {
//     const winner = Object.entries(game.scores).sort((a, b) => b[1] - a[1])[0][0]
//     io.to(roomId).emit('gameOver', { winner })

//     console.log(
//       chalk.red('[Fim de Jogo]'),
//       `Sala ${roomId}, Vencedor: ${winner}`
//     )

//     delete gameStates[roomId]
//   }
// }

// function getPlayerIdFromSocket(
//   roomId: string,
//   socketId: string
// ): string | null {
//   const room = activeRooms[roomId]
//   const player = room?.players.find(p => p.socketId === socketId)
//   return player?.playerId || null
// }

// function getOpponentId(roomId: string, playerId: string): string {
//   const room = activeRooms[roomId]
//   const opponent = room?.players.find(p => p.playerId !== playerId)
//   return opponent?.playerId || ''
// }

// function ringToIndex(ring: number): number {
//   // Assumindo que os anéis são numerados de 1 a 6
//   return ring - 1
// }

// function angleToIndex(angle: number): number {
//   // Assumindo que os ângulos vão de 0 a 330 com passo de 30° => 0 = idx 0, 30 = idx 1, ..., 330 = idx 11
//   return angle / 30
// }

// export function handleDisconnect(socket: Socket, roomId: string) {
//   const playerId = getPlayerIdFromSocket(roomId, socket.id)
//   if (!playerId) return

//   const room = activeRooms[roomId]
//   const opponent = room.players.find(p => p.playerId !== playerId)
//   if (opponent) {
//     socket.to(roomId).emit('opponentDisconnected')
//   }

//   console.log(
//     chalk.yellow('[Desconexão]'),
//     `Jogador ${playerId} desconectado da sala ${roomId}`
//   )

//   delete gameStates[roomId]
// }
