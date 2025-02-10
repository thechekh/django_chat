import React, { useState, useEffect, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';

interface ProfileFields {
    location: string;
    age: string;
    interests: string;
}

interface UserData extends ProfileFields {
    username: string;
}

const Profile: React.FC = () => {
    const navigate = useNavigate();
    const defaultProfileFields: ProfileFields = {
        location: '',
        age: '',
        interests: ''
    };

    const [userData, setUserData] = useState<UserData>({
        username: '',
        ...defaultProfileFields
    });

    const [formData, setFormData] = useState<ProfileFields>({
        ...defaultProfileFields
    });

    useEffect(() => {
        fetchUserProfile();
    }, []);

    const fetchUserProfile = async () => {
        const accessToken = sessionStorage.getItem('accessToken');
        if (!accessToken) {
            alert('You must be logged in to view the profile!');
            navigate('/');
            return;
        }

        try {
            const response = await fetch('http://127.0.0.1:8000/api/profile/', {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                },
            });
            const data = await response.json();

            if (data.username) {
                setUserData(data);
                setFormData({
                    location: data.location || '',
                    age: data.age || '',
                    interests: data.interests || ''
                });
            } else {
                alert('Error fetching profile data.');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred while fetching the profile.');
        }
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async () => {
        const accessToken = sessionStorage.getItem('accessToken');
        if (!accessToken) {
            alert('You must be logged in to update your profile!');
            return;
        }

        try {
            const response = await fetch('http://localhost:8000/api/profile/', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();
            if (data.message) {
                alert('Profile updated successfully!');
                fetchUserProfile();
            } else {
                alert('Error updating profile: ' + (data.error || 'Unknown error'));
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred while updating the profile.');
        }
    };

    return (
        <div className="container mt-5">
            <div className="row">
                <div className="col-md-4">
                    <div className="card">
                        <div className="card-body text-center">
                            <img
                                className="rounded-circle mb-3"
                                style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                                src="/images/image_placeholder.png"
                                alt="Profile"
                            />
                            <h3>{userData.username}</h3>
                            <p className="text-muted">{userData.location}</p>
                        </div>
                    </div>
                </div>

                <div className="col-md-8">
                    <div className="card">
                        <div className="card-body">
                            <h4>Edit Profile</h4>
                            <form onSubmit={(e) => e.preventDefault()}>
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
                                    <label htmlFor="age" className="form-label">Age</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        name="age"
                                        value={formData.age}
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
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={handleSubmit}
                                >
                                    Update Profile
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;