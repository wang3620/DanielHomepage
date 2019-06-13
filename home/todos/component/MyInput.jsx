import React from 'react';
import {connect} from "react-redux";

export const MyInput = () => {
    return (<Input placeholder="input with clear icon" allowClear onChange={() => console.log('Danielhahaha')}/>);
};

// export MyInput;