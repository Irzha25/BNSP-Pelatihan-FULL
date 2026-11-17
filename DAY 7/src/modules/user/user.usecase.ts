
import bcrypt from 'bcryptjs';

import type { IUserRepository } from './user.repository.js';

import type {
    User,
    RegisterUserInput,
    UpdateUserData
} from './user.model.js';

import type {
    PaginationParams,
    PaginatedResult
} from '../../shared/pagination/pagination.model.js';

import { createPaginationResult } from '../../shared/pagination/pagination.util.js';

import { AppError } from '../../shared/errors/app-error.js';

// REGISTER USER USE CASE
export class RegisterUserUseCase {

    constructor(
        private readonly userRepository: IUserRepository
    ) {}

    async execute(
        input: RegisterUserInput
    ): Promise<User> {

        const email = input.email.trim().toLowerCase();

        const existingUser =
            await this.userRepository.findByEmail(email);

        if (existingUser) {
            throw new AppError(
                'Email sudah terdaftar',
                409
            );
        }

        const passwordHash = await bcrypt.hash(
            input.password,
            12
        );

        const user = await this.userRepository.create({
            name: input.name.trim(),
            email,
            passwordHash
        });

        return user;
    }
}

// GET USER BY ID USE CASE
export class GetUserByIdUseCase {

    constructor(
        private readonly userRepository: IUserRepository
    ) {}

    async execute(
        id: string
    ): Promise<User> {

        const user = await this.userRepository.findById(id);

        if (!user) {
            throw new AppError(
                'User tidak ditemukan',
                404
            );
        }

        return user;
    }
}

// GET ALL USERS USE CASE
export class GetAllUsersUseCase {

    constructor(
        private readonly userRepository: IUserRepository
    ) {}

    async execute(
        params: PaginationParams
    ): Promise<PaginatedResult<User>> {

        const result =
            await this.userRepository.findAll(params);

        return createPaginationResult(
            result,
            params
        );
    }
}

// UPDATE USER USE CASE
export class UpdateUserUseCase {

    constructor(
        private readonly userRepository: IUserRepository
    ) {}

    async execute(
        id: string,
        input: UpdateUserData
    ): Promise<User> {

        // Check existing user
        const existingUser =
            await this.userRepository.findById(id);

        if (!existingUser) {
            throw new AppError(
                'User tidak ditemukan',
                404
            );
        }

        // Normalize input
        const data: UpdateUserData = {};

        if (input.name !== undefined) {
            data.name = input.name.trim();
        }

        if (input.email !== undefined) {
            data.email = input.email.trim().toLowerCase();
        }

        // Check duplicate email
        if (
            data.email &&
            data.email !== existingUser.email.toLowerCase()
        ) {
            const emailUser =
                await this.userRepository.findByEmail(data.email);

            if (emailUser && emailUser.id !== id) {
                throw new AppError(
                    'Email sudah digunakan oleh user lain',
                    409
                );
            }
        }

        // Update user
        const updatedUser =
            await this.userRepository.update(id, data);

        if (!updatedUser) {
            throw new AppError(
                'Gagal memperbarui user',
                500
            );
        }

        return updatedUser;
    }
}

// DELETE USER USE CASE
export class DeleteUserUseCase {

    constructor(
        private readonly userRepository: IUserRepository
    ) {}

    async execute(id: string): Promise<void> {

        const deleted =
            await this.userRepository.delete(id);

        if (!deleted) {
            throw new AppError(
                'User tidak ditemukan',
                404
            );
        }
    }
}
