#!/bin/bash
#sls invoke local --function GetTodos --data '{"key": "value}'
#sls invoke local --function GetTodos --data '{"headers":{"Authorization": "123"}'
#sls invoke local --function GetTodos --data '{"headers":{"Authorization": "123"}' --context '{"key": "value"}'
sls invoke local --function UpdateTodo --data '{"pathParameters": {"todoId": "0f0c282a-09d5-4883-a8cd-91d94d4de689"}, "body":"{ \"name\": \"Buy milk in Trader Joes\", \"dueDate\": \"2019-12-11\", \"done\": \"true\" }"}'
