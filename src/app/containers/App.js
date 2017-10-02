import React from 'react'
import { connect } from "react-redux";
import Header from "../components/ToDoHeader"
import CreateTask from "./CreateTask"
import ToDoListItem from "../components/ToDoListItem"

class App extends React.Component {
    addtask(id, newTask) {
        const otherTask = {
            id: id,
            task: newTask,
            isCompleted: true
        }
        this.props.addTodo(otherTask);
    }
    render() {
        return (
            <div>
                <Header />
                <h4>Redux ToDo App</h4>
                <CreateTask tasks={this.props.todos} addtask={this.addtask.bind(this)} />
                <ul>
                    {this.props.todos.map((todo) =>
                        <ToDoListItem key={todo.id} tasks={todo} />
                    )}
                </ul>
            </div>
        )
    }
}

const mapStateToProps = (state) => {
    return {
        todos: state.todo
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        addTodo: todo => {
            dispatch({
                type: "ADD_TODO",
                payload: todo
            });
        }
    };
};


export default connect(mapStateToProps, mapDispatchToProps)(App);