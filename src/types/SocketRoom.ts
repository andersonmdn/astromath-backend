import { Player } from './Player'

export interface SocketRoom {
  id: string
  players: Player[]
  status: 'waiting' | 'playing'
  turn?: string
}
