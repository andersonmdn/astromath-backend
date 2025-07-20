import { Meteor } from './Meteor'
import { Spaceship } from './Spaceship'

interface Board {
  circle: number
  angle: number
  x: number
  y: number
  occupant: Spaceship | Meteor | null
}

export default Board
