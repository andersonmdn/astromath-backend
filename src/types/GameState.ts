import Board from './Board'

interface GameState {
  turn: string
  playerBoards: Record<string, Board[]>
  scores: Record<string, number>
  players: Set<string>
  startedAt: number
}

export default GameState
