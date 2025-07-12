// src/services/roomService.ts
import { FirebaseRooms } from '../types/FirebaseRooms'
import { db } from './firebaseAdmin'

export async function getExistingRooms(): Promise<
  (FirebaseRooms & { docId: string })[]
> {
  const snapshot = await db.collection('rooms').get()
  const rooms = snapshot.docs.map(doc => ({
    ...(doc.data() as FirebaseRooms),
    docId: doc.id,
  }))
  return rooms
}
