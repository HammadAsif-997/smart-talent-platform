import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

// 1. REGISTER USER
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, fullName, title } = req.body;

    if (!email || !password || !fullName) {
      res.status(400).json({ error: 'Missing required fields: email, password, fullName' });
      return;
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(400).json({ error: 'A user with this email already exists' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);

    // Create user and profile simultaneously inside a transaction
    const newUser = await prisma.user.create({
      data: {
        email,
        passwordHash,
        profile: {
          create: {
            fullName,
            title,
          },
        },
      },
      include: { profile: true },
    });

    res.status(201).json({
      message: 'User registered successfully',
      userId: newUser.id,
      email: newUser.email,
    });
  } catch (error) {
    res.status(500).json({ error: 'Registration failed internal server error' });
  }
};

// 2. LOGIN USER
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(200).json({
      message: 'Login successful',
      token,
      role: user.role,
    });
  } catch (error) {
    res.status(500).json({ error: 'Login failed internal server error' });
  }
};