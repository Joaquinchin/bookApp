// src/lib/mongoose.ts
import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI!

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable')
}

// Interfaz para el cache
interface MongooseCache {
  conn: typeof mongoose | null   // La conexión actual (o null si no hay)
  promise: Promise<typeof mongoose> | null // La promesa de conexión (o null)
}

// Extender el tipo global
declare global {
  var mongoose: MongooseCache | undefined
}

// Usar el cache global o crear uno nuevo
let cached: MongooseCache = global.mongoose || { conn: null, promise: null }

// Asignar al global si no existe
if (!global.mongoose) {
  global.mongoose = cached
}

async function dbConnect(): Promise<typeof mongoose> {
  // Si ya hay conexión, devolverla
  if (cached.conn) {
    return cached.conn
  }

  // Si no hay promesa de conexión, crearla
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    })
  }

  try {
    // Esperar a que se resuelva la conexión
    cached.conn = await cached.promise
    console.log(' MongoDB conectado exitosamente')
  } catch (error) {
    // Si falla, resetear la promesa
    cached.promise = null
    console.error(' Error conectando a MongoDB:', error)
    throw error
  }

  return cached.conn
}

export default dbConnect