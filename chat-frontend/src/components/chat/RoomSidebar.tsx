import React, { useState, ChangeEvent } from 'react';
import PeopleIcon from '@mui/icons-material/People';
import { Room } from '../../pages/Chat';

interface RoomSidebarProps {
    joinedRooms: Room[];
    availableRooms: Room[];
    onRoomClick: (room: Room) => void;
    onJoinRoom: (room: Room) => void;
    onLeaveRoom: (room: Room) => void;
    onCreateRoom: (newRoomName: string) => Promise<void>;
}

const RoomSidebar: React.FC<RoomSidebarProps> = ({
    joinedRooms,
    availableRooms,
    onRoomClick,
    onJoinRoom,
    onLeaveRoom,
    onCreateRoom,
}) => {
    const [newRoomName, setNewRoomName] = useState<string>('');

    const handleCreateRoom = async () => {
        await onCreateRoom(newRoomName);
        setNewRoomName('');
    };

    return (
        <div className="col-md-3">
            <div className="card mb-3">
                <div className="card-header">
                    <h5 className="mb-0">Create Room</h5>
                </div>
                <div className="card-body">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Room name..."
                        value={newRoomName}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setNewRoomName(e.target.value)}
                    />
                    <button className="btn btn-primary mt-2 w-100" onClick={handleCreateRoom}>
                        Create Room
                    </button>
                </div>
            </div>
            <div className="card mb-3">
                <div className="card-header">
                    <h5 className="mb-0">Joined Rooms</h5>
                </div>
                <div className="card-body">
                    {joinedRooms.map(room => (
                        <div key={room.id} className="list-group-item d-flex justify-content-between align-items-center">
                            <button
                                className={`btn btn-link p-0 flex-grow-1 text-start`}
                                onClick={() => onRoomClick(room)}
                            >
                                {room.name}
                                {room.users_amount ? (
                                    <span className="ms-2" style={{ display: 'inline-flex', alignItems: 'center' }}>
                                        <PeopleIcon fontSize="small" style={{ verticalAlign: 'middle' }} />
                                        <span style={{ fontWeight: 'bold', marginLeft: 4 }}>{room.users_amount}</span>
                                    </span>
                                ) : null}
                            </button>
                            <button className="btn btn-sm btn-danger" onClick={() => onLeaveRoom(room)}>
                                Leave
                            </button>
                        </div>
                    ))}
                </div>
            </div>
            <div className="card">
                <div className="card-header">
                    <h5 className="mb-0">Available Rooms</h5>
                </div>
                <div className="card-body">
                    {availableRooms.map(room => (
                        <div key={room.id} className="list-group-item d-flex justify-content-between align-items-center">
                            <button
                                className="btn btn-link p-0 flex-grow-1 text-start"
                                onClick={() => onRoomClick(room)}
                            >
                                {room.name}
                                {room.users_amount ? (
                                    <span className="ms-2" style={{ display: 'inline-flex', alignItems: 'center' }}>
                                        <PeopleIcon fontSize="small" style={{ verticalAlign: 'middle' }} />
                                        <span style={{ fontWeight: 'bold', marginLeft: 4 }}>{room.users_amount}</span>
                                    </span>
                                ) : null}
                            </button>
                            <button className="btn btn-sm btn-success" onClick={() => onJoinRoom(room)}>
                                Join
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default RoomSidebar;