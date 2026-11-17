import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { pool } from '../db'; 

export const registerUser = async (req: Request, res: Response): Promise<void> => {
    try {
        // Hanya ambil email dan password dari Postman
        const { email, password } = req.body; 

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const newUuid = crypto.randomUUID();

        // Kueri INSERT tanpa id_mhs
        const insertQuery = `
            INSERT INTO users (uuid, email, password) 
            VALUES ($1, $2, $3) 
            RETURNING *
        `;
        const result = await pool.query(insertQuery, [newUuid, email, hashedPassword]);
        
        const newUser = result.rows[0];
        const secretKey = process.env.JWT_SECRET || 'rahasia_default';
        
        const token = jwt.sign(
            { uuid: newUser.uuid, email: newUser.email }, 
            secretKey,
            { expiresIn: '1d' }
        );

        res.status(201).json({
            message: "User berhasil ditambahkan ke database",
            token: token,
            user: newUser 
        });
    } catch (error) {
        console.error("Error register:", error);
        res.status(500).json({ error: "Terjadi kesalahan pada server" });
    }
};