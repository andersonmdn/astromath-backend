export interface FirebaseRooms {
  createdAt: string
  createdBy: string
  docId: string
  id: string
  name: string
  password: string
  players: string[]
  type: 'public' | 'private'
}
