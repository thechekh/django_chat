import React, { useState, ChangeEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface SignUpFormData {
    username: string;
    email: string;
    password: string;
    age: number;
    location: string;
    interests: string;
}

const SignUp: React.FC = () => {
    const navigate = useNavigate();
    const { setIsAuthenticated } = useAuth();
    const [formData, setFormData] = useState<SignUpFormData>({
        username: '',
        email: '',
        password: '',
        age: 0,
        location: '',
        interests: '',
    });

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async () => {
        try {
            const submissionData = {
                ...formData,
            };

            const response = await fetch('http://127.0.0.1:8000/api/register/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(submissionData),
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || 'Unknown error');
            }

            if (data.accessToken && data.refreshToken) {
                sessionStorage.setItem('accessToken', data.accessToken);
                sessionStorage.setItem('refreshToken', data.refreshToken);
                setIsAuthenticated(true);
                alert('Signup successful!');
                navigate('/profile');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred during signup.');
        }
    };

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-8">
                    <div className="card">
                        <div className="card-body">
                            <h2 className="text-center mb-4">Sign Up</h2>
                            <form onSubmit={(e) => e.preventDefault()}>
                                <div className="row">
                                    <div className="col-md-6">
                                        <div className="mb-3">
                                            <label htmlFor="username" className="form-label">Username</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                name="username"
                                                value={formData.username}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>
                                        <div className="mb-3">
                                            <label htmlFor="email" className="form-label">Email</label>
                                            <input
                                                type="email"
                                                className="form-control"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>
                                        <div className="mb-3">
                                            <label htmlFor="password" className="form-label">Password</label>
                                            <input
                                                type="password"
                                                className="form-control"
                                                name="password"
                                                value={formData.password}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="mb-3">
                                            <label htmlFor="age" className="form-label">Age</label>
                                            <input
                                                type="number"
                                                className="form-control"
                                                name="age"
                                                value={formData.age}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>
                                        <div className="mb-3">
                                            <label htmlFor="location" className="form-label">Location</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                name="location"
                                                value={formData.location}
                                                onChange={handleChange}
                                            />
                                        </div>
                                        <div className="mb-3">
                                            <label htmlFor="interests" className="form-label">Interests</label>
                                            <textarea
                                                className="form-control"
                                                name="interests"
                                                value={formData.interests}
                                                onChange={handleChange}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    className="btn btn-primary w-100 mt-3"
                                    onClick={handleSubmit}
                                >
                                    Sign Up
                                </button>
                            </form>
                            <div className="mt-3 text-center">
                                <small>Already have an account? <Link to="/login">Login</Link></small>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SignUp;