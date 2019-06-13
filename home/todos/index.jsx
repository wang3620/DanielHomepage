import React, { Component } from "react";
import ReactDOM from "react-dom";
import { createStore, bindActionCreators} from 'redux';
import { Provider } from 'react-redux';
import connect from 'react-redux/es/connect/connect';
import rootReducer from './store/reducers';
import { Input } from 'antd';
import 'antd/dist/antd.css';
import { addTodo } from './store/actions';
// import  { MyInput } from "./component/MyInput";

const store = createStore(rootReducer, window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__());

class FormContainer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            title: ""
        };
    }
    render() {
        console.log(this.props);
        return (
            <Input placeholder="input with clear icon" allowClear onChange={() => this.props.handleOnSave()}/>
    );
    }
}

const mapDispatchToProps = (dispatch) => bindActionCreators({
    handleOnSave: addTodo,
}, dispatch);

const FormContainerWrapper = connect(null, mapDispatchToProps)(FormContainer);

const wrapper = document.getElementById("create-article-form");
wrapper ? ReactDOM.render(<Provider store={store}><FormContainerWrapper /></Provider>, wrapper) : false;