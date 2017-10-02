import React from 'react'
import { connect } from "react-redux"

export default class CreateTask extends React.Component {
    handleClick() {
        var id = this.props.tasks[this.props.tasks.length - 1].id + 1
        var newTask = this.refs.createTaskRef.value;
        this.props.addtask(id, newTask);
        this.refs.createTaskRef.value = "";
    }
    render() {
        return (
            <div>
                <input type="text" ref="createTaskRef" />
                <button onClick={this.handleClick.bind(this)}>Add Task</button>
            </div>
        )
    }
}
