import React, { useState, useEffect, useRef, ChangeEvent, KeyboardEvent } from 'react';
import { useNavigate } from 'react-router-dom';

import PeopleIcon from '@mui/icons-material/People';

interface Room {
  id: number;
  name: string;
  created_at?: string;
  users_amount?: number; // Number of joined users in this room
  created_by?: string;
}

interface Message {
  id: number;
  room: number;
  user: string;
  content: string;
  message: string;
  timestamp: string;
}

const API_BASE_URL = "http://127.0.0.1:8000/api";

const Chat: React.FC = () => {
  const navigate = useNavigate();
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState<string>('');
  const [newRoomName, setNewRoomName] = useState<string>('');
  const [joinedRooms, setJoinedRooms] = useState<Room[]>([]);
  const [availableRooms, setAvailableRooms] = useState<Room[]>([]);
  const wsRef = useRef<WebSocket | null>(null);

  // Load joined and available rooms on mount
  useEffect(() => {
    const token = sessionStorage.getItem('accessToken');
    if (!token) {
      navigate('/login');
      return;
    }
    refreshRoomLists();
  }, [navigate]);

  // Refresh room lists
  const refreshRoomLists = async () => {
    const joined = await fetchJoinedRooms();
    const available = await fetchAvailableRooms();
    setJoinedRooms(joined);
    setAvailableRooms(available);
  };

  // On currentRoom change, setup websocket and load messages
  useEffect(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    if (currentRoom) {
      setMessages([]);
      connectToRoom(currentRoom.name);
      fetchMessages(currentRoom.id);
    }
  }, [currentRoom]);

  const fetchJoinedRooms = async (): Promise<Room[]> => {
    const token = sessionStorage.getItem('accessToken');
    try {
      const response = await fetch(`${API_BASE_URL}/rooms/joined/`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        return await response.json();
      } else {
        console.error('Failed to fetch joined rooms');
      }
    } catch (error) {
      console.error("Error fetching joined rooms:", error);
    }
    return [];
  };

  const fetchAvailableRooms = async (): Promise<Room[]> => {
    const token = sessionStorage.getItem('accessToken');
    try {
      const response = await fetch(`${API_BASE_URL}/rooms/`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        const allRooms: Room[] = await response.json();
        const joined = await fetchJoinedRooms();
        const joinedIds = joined.map(room => room.id);
        return allRooms.filter(room => !joinedIds.includes(room.id));
      } else {
        console.error('Failed to fetch available rooms');
      }
    } catch (error) {
      console.error("Error fetching available rooms:", error);
    }
    return [];
  };

  const fetchMessages = async (roomId: number): Promise<void> => {
    const token = sessionStorage.getItem('accessToken');
    try {
      const response = await fetch(`${API_BASE_URL}/messages/?room=${roomId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        const formatted: Message[] = data.map((item: any) => ({
          ...item,
          message: item.content,
          user: item.username || item.user,
        }));
        setMessages(formatted);
      } else {
        console.error('Failed to fetch messages');
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const connectToRoom = (roomName: string): void => {
    const token = sessionStorage.getItem('accessToken');
    const ws = new WebSocket(`ws://127.0.0.1:8000/ws/chat/${roomName}/?token=${token}`);
    ws.onopen = () => {
      console.log(`Connected to room: ${roomName}`);
    };
    ws.onmessage = (event: MessageEvent) => {
      const data: Message = JSON.parse(event.data);
      // Validate timestamp; if it's invalid, use the current date.
      const parsedTime = new Date(data.timestamp);
      const validTimestamp = isNaN(parsedTime.getTime())
        ? new Date().toISOString()
        : data.timestamp;
      const formattedMessage: Message = {
        ...data,
        timestamp: validTimestamp,
      };
      setMessages(prev => [...prev, formattedMessage]);
    };
    ws.onerror = (error: Event) => {
      console.error("WebSocket error:", error);
    };
    wsRef.current = ws;
  };

  const handleRoomClick = (room: Room): void => {
    setCurrentRoom(room);
  };

  const handleJoinRoom = async (room: Room): Promise<void> => {
    const token = sessionStorage.getItem('accessToken');
    try {
      const response = await fetch(`${API_BASE_URL}/rooms/${room.id}/join/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        await refreshRoomLists();
        setCurrentRoom(room); // Allow sending messages once joined.
      } else {
        console.error("Failed to join room");
      }
    } catch (error) {
      console.error("Error joining room:", error);
    }
  };

  const handleLeaveRoom = async (room: Room): Promise<void> => {
    const token = sessionStorage.getItem('accessToken');
    try {
      const response = await fetch(`${API_BASE_URL}/rooms/${room.id}/leave/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        // If user leaves the room that is currently active, deselect it.
        if (currentRoom && currentRoom.id === room.id) {
          setCurrentRoom(null);
          setMessages([]);
        }
        await refreshRoomLists();
      } else {
        console.error("Failed to leave room");
      }
    } catch (error) {
      console.error("Error leaving room:", error);
    }
  };

  const handleSendMessage = (): void => {
    if (newMessage.trim() && wsRef.current) {
      wsRef.current.send(JSON.stringify({
        message: newMessage,
        room: currentRoom?.name,
      }));
      setNewMessage('');
    }
  };

  const handleCreateRoom = async (): Promise<void> => {
    if (!newRoomName.trim()) return;
    const token = sessionStorage.getItem('accessToken');
    try {
      const response = await fetch(`${API_BASE_URL}/rooms/`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ name: newRoomName })
      });
      if (response.ok) {
        const createdRoom: Room = await response.json();
        // Creator is automatically joined
        await refreshRoomLists();
        setNewRoomName('');
      } else {
        console.error("Failed to create room");
      }
    } catch (error) {
      console.error("Error creating room:", error);
    }
  };

  const groupMessagesByDate = (messages: Message[]): { [key: string]: Message[] } => {
    const groups: { [key: string]: Message[] } = {};
    messages.forEach(msg => {
      const msgDate = new Date(msg.timestamp);
      const today = new Date();
      const msgDateStr = msgDate.toDateString();
      const todayStr = today.toDateString();
      let label = '';
      if (msgDateStr === todayStr) {
        label = "Today";
      } else {
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        if (msgDate.toDateString() === yesterday.toDateString()) {
          label = "Yesterday";
        } else {
          label = msgDate.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
        }
      }
      if (!groups[label]) {
        groups[label] = [];
      }
      groups[label].push(msg);
    });
    return groups;
  };

  const groupedMessages = groupMessagesByDate(messages);
  // Determine if currentRoom is joined (allowing sending messages)
  const isJoined = currentRoom ? joinedRooms.some(room => room.id === currentRoom.id) : false;

  return (
    <div className="container-fluid mt-4">
      <div className="row">
        {/* Sidebar for room lists and creation */}
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
              <div className="list-group">
                {joinedRooms.map(room => (
                  <div key={room.id} className="list-group-item d-flex justify-content-between align-items-center">
                    <button
                      className={`btn btn-link p-0 flex-grow-1 text-start ${currentRoom && currentRoom.id === room.id ? 'active' : ''}`}
                      onClick={() => handleRoomClick(room)}
                    >
                      {room.name}
                      {room.users_amount ? (
                        <span className="ms-2" style={{ display: 'inline-flex', alignItems: 'center' }}>
                          <PeopleIcon fontSize="small" style={{ verticalAlign: 'middle' }} />
                          <span style={{ fontWeight: 'bold', marginLeft: 4 }}>{room.users_amount}</span>
                        </span>
                      ) : ""}
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleLeaveRoom(room)}
                    >
                      Leave
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Available Rooms</h5>
            </div>
            <div className="card-body">
              <div className="list-group">
                {availableRooms.map(room => (
                  <div key={room.id} className="list-group-item d-flex justify-content-between align-items-center">
                    <button
                      className="btn btn-link p-0 flex-grow-1 text-start"
                      onClick={() => handleRoomClick(room)}
                    >
                      {room.name}
                      {room.users_amount ? (
                        <span className="ms-2" style={{ display: 'inline-flex', alignItems: 'center' }}>
                          <PeopleIcon fontSize="small" style={{ verticalAlign: 'middle' }} />
                          <span style={{ fontWeight: 'bold', marginLeft: 4 }}>{room.users_amount}</span>
                        </span>
                      ) : ""}
                    </button>
                    <button
                      className="btn btn-sm btn-success"
                      onClick={() => handleJoinRoom(room)}
                    >
                      Join
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        {/* Chat Window */}
        <div className="col-md-9">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">{currentRoom ? currentRoom.name : 'Select a room'}</h5>
            </div>
            <div className="card-body" style={{ height: '500px', overflowY: 'auto' }}>
              <div className="chat-container">
                {Object.keys(groupedMessages).map((groupKey, idx) => (
                  <div key={idx}>
                    <hr />
                    <div className="group-header" style={{ textAlign: 'center', fontWeight: 'bold' }}>
                      {groupKey}
                    </div>
                    {groupedMessages[groupKey].map((msg, index) => (
                      <div key={index} className="mb-2">
                        <strong>{msg.user}:</strong> {msg.message}
                        <span className="text-muted" style={{ fontSize: '0.8rem', marginLeft: '8px' }}>
                          {new Date(msg.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
            <div className="card-footer">
              <div className="input-group">
                <input
                  type="text"
                  className="form-control"
                  placeholder={isJoined ? "Type your message..." : "Preview only - join to chat"}
                  value={newMessage}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setNewMessage(e.target.value)}
                  onKeyPress={(e: KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && handleSendMessage()}
                  disabled={!currentRoom || !isJoined}
                />
                <button className="btn btn-primary" onClick={handleSendMessage} disabled={!currentRoom || !isJoined}>
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;