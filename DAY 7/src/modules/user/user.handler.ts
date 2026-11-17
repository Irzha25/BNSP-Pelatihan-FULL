
import type {
    Request,
    Response
} from 'express';

import type {
    RegisterUserInput,
    UpdateUserData
} from './user.model.js';

import {
    GetUserByIdUseCase,
    RegisterUserUseCase,
    UpdateUserUseCase,
    DeleteUserUseCase,
    GetAllUsersUseCase
} from './user.usecase.js';

import type {
    PaginationQuery
} from '../../shared/pagination/pagination.validation.js';

import {
    getPaginationParams
} from '../../shared/pagination/pagination.util.js';

export class UserHandler {

    constructor(
        private readonly registerUserUseCase: RegisterUserUseCase,
        private readonly getUserByIdUseCase: GetUserByIdUseCase,
        private readonly updateUserUseCase: UpdateUserUseCase,
        private readonly deleteUserUseCase: DeleteUserUseCase,
        private readonly getAllUsersUseCase: GetAllUsersUseCase
    ) {}

    // REGISTER USER
    register = async (
        req: Request,
        res: Response
    ): Promise<void> => {

        const input = req.body as RegisterUserInput;

        const user = await this.registerUserUseCase.execute(
            input
        );

        res.status(201).json({
            success: true,
            message: 'Registrasi berhasil',
            data: user
        });
    };

    // GET USER BY ID
    getUserById = async (
        req: Request,
        res: Response
    ): Promise<void> => {

        const id = req.params.id;

        if (typeof id !== 'string') {
            throw new Error('Invalid user ID');
        }

        const user = await this.getUserByIdUseCase.execute(id);

        res.status(200).json({
            success: true,
            message: 'Data user berhasil ditemukan',
            data: user
        });
    };

    // GET ALL USERS WITH PAGINATION
   // GET ALL USERS
getAll = async (
    req: Request,
    res: Response
): Promise<void> => {

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 5;

    if (
        !Number.isInteger(page) ||
        !Number.isInteger(limit) ||
        page < 1 ||
        limit < 1 ||
        limit > 100
    ) {
        res.status(400).json({
            success: false,
            message: 'Page harus >= 1 dan limit harus 1-100'
        });
        return;
    }

    const params = {
        page,
        limit,
        offset: (page - 1) * limit
    };

    const result =
        await this.getAllUsersUseCase.execute(params);

    res.status(200).json({
        success: true,
        message: 'Data users berhasil ditemukan',
        data: result.data,
        pagination: result.pagination
    });
};

    // UPDATE USER
    update = async (
        req: Request,
        res: Response
    ): Promise<void> => {

        const id = req.params.id;

        if (typeof id !== 'string') {
            throw new Error('Invalid user ID');
        }

        const input = req.body as UpdateUserData;

        const user = await this.updateUserUseCase.execute(
            id,
            input
        );

        res.status(200).json({
            success: true,
            message: 'User berhasil diperbarui',
            data: user
        });
    };

    // DELETE USER
    delete = async (
        req: Request,
        res: Response
    ): Promise<void> => {

        const id = req.params.id;

        if (typeof id !== 'string') {
            throw new Error('Invalid user ID');
        }

        await this.deleteUserUseCase.execute(id);

        res.status(200).json({
            success: true,
            message: 'User berhasil dihapus'
        });
    };
}
