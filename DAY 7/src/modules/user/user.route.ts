import { Router } from 'express';

import { UserHandler } from './user.handler.js';

import {
    registerUserSchema,
    userIdScheme,
    updateUserSchema
} from './user.validation.js';

import { paginationSchema } from '../../shared/pagination/pagination.validation.js';

import {
    validateBody,
    validateParams,
    validateQuery
} from '../../shared/middlewares/validate.js';

import { asyncHandler } from '../../shared/utils/async-handler.js';

export const createUserRoutes = (
    userHandler: UserHandler
) => {

    const router = Router();

    // REGISTER USER
    router.post(
        '/register',
        validateBody(registerUserSchema),
        asyncHandler(userHandler.register)
    );

    // GET ALL USERS (PAGINATION)
    router.get(
        '/',
        validateQuery(paginationSchema),
        asyncHandler(userHandler.getAll)
    );

    // GET USER BY ID
    router.get(
        '/:id',
        validateParams(userIdScheme),
        asyncHandler(userHandler.getUserById)
    );

    // UPDATE USER
    router.patch(
        '/:id',
        validateParams(userIdScheme),
        validateBody(updateUserSchema),
        asyncHandler(userHandler.update)
    );

    // DELETE USER
    router.delete(
        '/:id',
        validateParams(userIdScheme),
        asyncHandler(userHandler.delete)
    );

    return router;
};