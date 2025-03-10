import { v4 as uuidv4 } from 'uuid'

const connectionMap = new Map<string, string>() // Mapeia socket.id para um UUID seguro

function generateSecureConnectionId(socketId: string): string {
  if (connectionMap.has(socketId)) {
    return connectionMap.get(socketId)! // Retorna o ID já gerado se existir
  }

  const connectionId = uuidv4() // Gera um UUID seguro
  connectionMap.set(socketId, connectionId) // Associa o socketId ao UUID

  return connectionId
}

export { generateSecureConnectionId }
