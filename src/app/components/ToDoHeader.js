import React from 'react';
import FilterLink from '../containers/FilterLink'
import { Link } from 'react-router'

const Header = () => {
    return (
        <div>
            <nav className="navbar navbar-expand-lg navbar-light bg-light">
                <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav">
                        <li className="nav-item active">
                            <Link className="nav-link" to="/">Redux CRUD <span className="sr-only">(current)</span></Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link" to="/webService">WebService</Link>
                        </li>
                        <li className="nav-item">
                            <a className="nav-link" href="#">Form Based CRUD</a>
                        </li>
                        <li className="nav-item">
                            <a className="nav-link disabled" href="#">Others</a>
                        </li>
                    </ul>
                </div>
            </nav>
        </div>
    )
};

export default Header;