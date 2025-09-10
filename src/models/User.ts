// src/models/User.ts
import mongoose, { Document, Schema } from 'mongoose'
import bcrypt from 'bcryptjs'

export interface IUser extends Document {
  _id: string
  email: string
  password: string
  name: string
  createdAt: Date
  updatedAt: Date
  comparePassword(candidatePassword: string): Promise<boolean>
}

const UserSchema = new Schema<IUser>({
  email: { // Validación básica de email
    type: String,
    required: [true, 'Email es requerido'], // 
    unique: true, // no puede repetirse
    lowercase: true, // se guarda en minúsculas
    trim: true, // elimina espacios al inicio y final
    match: [/^\S+@\S+\.\S+$/, 'Email inválido'] // regex simple para validar formato de email
  },
  password: {
    type: String,
    required: [true, 'Password es requerido'],
    minlength: [6, 'Password debe tener al menos 6 caracteres'],
  },
  name: {
    type: String,
    required: [true, 'Nombre es requerido'],
    trim: true,
    minlength: [2, 'Nombre debe tener al menos 2 caracteres'],
    maxlength: [53, 'Nombre no puede exceder 53 caracteres']
  },
}, {
  timestamps: true, // Agrega createdAt y updatedAt automáticamente
})

// MIDDLEWARE: Hash del password pre guardarlo estos middleware no los hacemos nosotros sino que vienen con mongoose
UserSchema.pre('save', async function (next) {
  // Solo hashear si el password es nuevo o ha sido modificado
  if (!this.isModified('password')) return next()
  
  try {
    console.log('Hasheando password...')
    const salt = await bcrypt.genSalt(12)
    this.password = await bcrypt.hash(this.password, salt)
    next()
  } catch (error) {
    next(error as Error)
  }
})

// MÉTODO: Comparar passwords (para login)
UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password)
}

// Evitar re-compilar el modelo en development (hot reloads)
export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema)