import React from 'react';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
    return (
        <div className="container mt-5 text-center">
            <h1>Django Auth App with DRF</h1>
            <div className="option-buttons">
                <Link to="/login" className="btn-option">Login</Link>
                <Link to="/signup" className="btn-option">Sign Up</Link>
            </div>
        </div>
    );
};

export default Home;