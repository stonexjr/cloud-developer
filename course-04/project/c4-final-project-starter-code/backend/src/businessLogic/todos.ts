import * as uuid from 'uuid'
import {TodoAccess} from "../dataLayer/todoAccess";
import {TodoItem} from "../models/TodoItem";
import {CreateTodoRequest} from "../requests/CreateTodoRequest";
import {getUserIdFromAuth} from "../lambda/utils";
import {createLogger} from "../utils/logger";
const logger = createLogger('createTodo.ts');

const todoAccess = new TodoAccess();

export async function getTODOByUser(userId: string): Promise<TodoItem[]> {
    return todoAccess.getTODOPerUser(userId);
}

export async function createTODO(
    newTodoReq: CreateTodoRequest,
    jwtToken: string): Promise<TodoItem> {

    const todoId = uuid.v4();
    //extract userId from JWT authorization token string
    let userId = getUserIdFromAuth(jwtToken); //bearer xdi1kjsldsl1

    logger.info(`User ${userId} is creating new todo.`);

    const timestamp = new Date();
    const newItem = {
        todoId: todoId,
        ...newTodoReq,
        createdAt: timestamp.toISOString(),
        done: false,
        userId: userId
    };

    return await todoAccess.createTODO(newItem);
}

export async function queryTODO(userId: string, todoId: string): Promise<any>{
    return await todoAccess.queryTODO(userId, todoId);
}

export async function updateTODO(newItem: TodoItem): Promise<void>{
    await todoAccess.updateTODO(newItem);
}

export async function deleteTODO(userId: string, todoId: string): Promise<void>{
    await todoAccess.deleteTODO(userId, todoId);
}

export async function TODOExist(userId: string, todoId: string): Promise<boolean>{
    return await todoAccess.todoIdExists(userId, todoId);
}
export function getUploadUrl(key: string): string{
    return todoAccess.getS3UploadUrl(key);
}