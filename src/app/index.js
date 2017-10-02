import { render } from 'react-dom'
import React from 'react'
import { Provider } from 'react-redux'
import store from './store/store'
import App from "./containers/App"
import WebService from "./containers/WebService"
import { Router, Route, browserHistory } from 'react-router'

const Root = ({ store }) => (
    <Provider store={store}>
        <Router history={browserHistory}>
            <Route path="/" component={App} />
            <Route path="webService" component={WebService} />
        </Router>
    </Provider>
)

render(
    <Root store={store} />,
    document.getElementById('app')
)




