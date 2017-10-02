import React from 'react'
import { connect } from "react-redux"

class ToDoListItem extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isEditing: false
        }
    }
    handleEdit() {
        this.setState({
            isEditing: true
        });
    }

    handleDelete() {
        var id = this.props.tasks.id;
        this.props.removeTodo(id);
    }

    handleCancel() {
        this.setState({
            isEditing: false
        });
    }

    handleUpdate() {
        var id = this.props.tasks.id;
        var updatedValue = this.refs.updatedValue.value;
        var updatedTask = {
            id,
            updatedValue,
            isCompleted: true
        }
        this.props.updateTodo(updatedTask);
        this.setState({
            isEditing: false
        });
    }

    conditionalRenderingOnButtons = () => {
        if (this.state.isEditing) {
            return (
                <div>
                    <input type="text" defaultValue={this.props.tasks.task} ref="updatedValue" />
                    <button onClick={this.handleUpdate.bind(this)}>Save</button>
                    <button onClick={this.handleCancel.bind(this)}>Cancel</button>
                </div>
            )
        } else {
            return (
                <div>
                    <span>{this.props.tasks.task}</span>
                    <button onClick={this.handleEdit.bind(this)}>Edit</button>
                    <button onClick={this.handleDelete.bind(this)}>Delete</button>
                </div>
            )
        }
    };
    render(props) {
        return (
            <li>
                {this.conditionalRenderingOnButtons()}
            </li>
        )
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        updateTodo: (todo) => {
            dispatch({
                type: "UPDATE_TODO",
                payload: todo
            });
        },
        removeTodo: (id) => {
            dispatch({
                type: "REMOVE_TODO",
                payload: id
            });
        }
    };
};


export default connect(() => ({}), mapDispatchToProps)(ToDoListItem);