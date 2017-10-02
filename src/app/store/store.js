import { createStore, applyMiddleware, combineReducers } from "redux"
import ToDoReducer from "../reducers/ToDoReducer"
import logger from "redux-logger";

const myLogger = (store) => (next) => (action) => {
    console.log("LoggedAction", action);
    next(action);
};


const store = createStore(combineReducers({ todo: ToDoReducer }), {}, applyMiddleware(logger));

store.subscribe(() => {
    console.log("Store updated", store.getState());
})
export default store;