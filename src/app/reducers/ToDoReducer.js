const todos = [{
    id: 1,
    task: "Task1",
    isCompleted: true
},
{
    id: 2,
    task: "Task2",
    isCompleted: true
},
{
    id: 3,
    task: "Task3",
    isCompleted: true
},
{
    id: 4,
    task: "Task4",
    isCompleted: true
}]
const ToDoReducer = (state = todos, action) => {
    switch (action.type) {
        case "ADD_TODO":
            state = [...state,
            action.payload];
            break;
        case "UPDATE_TODO": {
            [...state].map(todo => {
                if (todo.id === action.payload.id) {
                    todo.task = action.payload.updatedValue
                }
            })
            state = [...state];
        }
        case "REMOVE_TODO": {
            var temp=[...state].filter(function (task) {
                return task.id !== action.payload;
            })
            state = temp;
        }
            break;
        default: state;

    }
    return state;
};

export default ToDoReducer;