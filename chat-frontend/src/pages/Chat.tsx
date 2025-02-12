import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import RoomSidebar from '../components/chat/RoomSidebar';
import ChatWindow from '../components/chat/ChatWindow';
import Notification from '../components/chat/Notification';
import { getCurrentUsername } from '../utils/auth';

export interface Room {
  id: number;
  name: string;
  created_at?: string;
  users_amount?: number;
  created_by?: string;
}

export interface Message {
  id: number;
  room: number;
  user: string;
  content: string;
  message: string;
  timestamp: string;
  reactions?: { [key: string]: number };
  read_by?: string[];
}

const API_BASE_URL = "http://127.0.0.1:8000/api";

interface NotificationData {
  message: string;
  room: string;
}

const Chat: React.FC = () => {
  const navigate = useNavigate();
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [joinedRooms, setJoinedRooms] = useState<Room[]>([]);
  const [availableRooms, setAvailableRooms] = useState<Room[]>([]);
  const [notification, setNotification] = useState<NotificationData | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const notifWsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const token = sessionStorage.getItem('accessToken');
    if (!token) {
      navigate('/login');
      return;
    }
    refreshRoomLists();
  }, [navigate]);

  // Notifications WebSocket
  useEffect(() => {
    const token = sessionStorage.getItem('accessToken');
    if (!token) return;
    const ws = new WebSocket(`ws://127.0.0.1:8000/ws/notifications/?token=${token}`);
    ws.onmessage = (event: MessageEvent) => {
      const data = JSON.parse(event.data);
      // Expecting payload: { room, sender, message }
      if (!currentRoom || currentRoom.name !== data.room) {
        setNotification({
          message: `New message from ${data.sender} in ${data.room}`,
          room: data.room,
        });
        setTimeout(() => setNotification(null), 5000);
      }
    };
    notifWsRef.current = ws;
    return () => {
      ws.close();
    };
  }, [currentRoom]);

  // Chat room WebSocket
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

  const refreshRoomLists = async () => {
    const joined = await fetchJoinedRooms();
    const available = await fetchAvailableRooms();
    setJoinedRooms(joined);
    setAvailableRooms(available);
  };

  const fetchJoinedRooms = async (): Promise<Room[]> => {
    const token = sessionStorage.getItem('accessToken');
    try {
      const response = await fetch(`${API_BASE_URL}/rooms/joined/`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) return await response.json();
      console.error('Failed to fetch joined rooms');
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
        const joinedIds = joined.map(r => r.id);
        return allRooms.filter(r => !joinedIds.includes(r.id));
      } else console.error('Failed to fetch available rooms');
    } catch (error) {
      console.error("Error fetching available rooms:", error);
    }
    return [];
  };

  const fetchMessages = async (roomId: number): Promise<void> => {
    const token = sessionStorage.getItem('accessToken');
    try {
      const response = await fetch(`${API_BASE_URL}/messages/?room=${roomId}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        const formatted: Message[] = data.map((item: any) => ({
          ...item,
          message: item.content,
          user: item.username || item.user,
          reactions: item.reactions || {},
          read_by: item.read_by || []
        }));
        setMessages(formatted);
      } else console.error('Failed to fetch messages');
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
      const data = JSON.parse(event.data);
      if (data.type === "chat_message") {
        const parsedTime = new Date(data.timestamp);
        const validTimestamp = isNaN(parsedTime.getTime())
          ? new Date().toISOString()
          : data.timestamp;
        const formattedMessage: Message = {
          ...data,
          timestamp: validTimestamp,
          reactions: data.reactions || {},
          read_by: data.read_by || []
        };
        // Make sure the message has a valid id before updating state.
        if (formattedMessage.id) {
          setMessages(prev => [...prev, formattedMessage]);
        } else {
          // If no id yet, trigger a refresh of messages.
          if (currentRoom) {
            fetchMessages(currentRoom.id);
          }
        }
      } else if (data.type === "message_read") {
        setMessages(prevMessages =>
          prevMessages.map(m => {
            if (m.id === data.message_id) {
              const readers = m.read_by ? [...m.read_by] : [];
              if (!readers.includes(data.reader)) {
                readers.push(data.reader);
              }
              return { ...m, read_by: readers };
            }
            return m;
          })
        );
      }
    };
    ws.onerror = (error: Event) => {
      console.error("WebSocket error:", error);
    };
    wsRef.current = ws;
  };

  // Instead of adding an optimistic message, wait for the backend to emit the valid chat_message event.
  // Also, refresh messages shortly after sending to update the message id.
  const handleSendMessage = (newMessage: string): void => {
    if (newMessage.trim() && wsRef.current && currentRoom) {
      wsRef.current.send(
        JSON.stringify({ message: newMessage, room: currentRoom.name })
      );
      // Delay a refresh so that backend has time to assign an id to the new message.
      setTimeout(() => {
        fetchMessages(currentRoom.id);
      }, 500);
    }
  };

  const handleReact = async (messageId: number, reaction: string): Promise<void> => {
    if (!messageId) {
      console.error("Message id is invalid, cannot add reaction.");
      return;
    }
    const token = sessionStorage.getItem('accessToken');
    try {
      const response = await fetch(`${API_BASE_URL}/messages/${messageId}/react/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ reaction })
      });
      if (response.ok && currentRoom) {
        // Refresh messages to update reaction counts.
        fetchMessages(currentRoom.id);
      } else {
        console.error("Failed to add reaction");
      }
    } catch (error) {
      console.error("Error adding reaction:", error);
    }
  };

  const handleJoinRoom = async (room: Room): Promise<void> => {
    const token = sessionStorage.getItem('accessToken');
    try {
      const response = await fetch(`${API_BASE_URL}/rooms/${room.id}/join/`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        await refreshRoomLists();
        setCurrentRoom(room);
      } else console.error("Failed to join room");
    } catch (error) {
      console.error("Error joining room:", error);
    }
  };

  const handleLeaveRoom = async (room: Room): Promise<void> => {
    const token = sessionStorage.getItem('accessToken');
    try {
      const response = await fetch(`${API_BASE_URL}/rooms/${room.id}/leave/`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        if (currentRoom && currentRoom.id === room.id) {
          setCurrentRoom(null);
          setMessages([]);
        }
        await refreshRoomLists();
      } else console.error("Failed to leave room");
    } catch (error) {
      console.error("Error leaving room:", error);
    }
  };

  const handleCreateRoom = async (newRoomName: string): Promise<void> => {
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
      if (response.ok) await refreshRoomLists();
      else console.error("Error creating room:", response.statusText);
    } catch (error) {
      console.error("Error creating room:", error);
    }
  };

  // Optimistic update for marking a message as read (this does not depend on the message id for reactions).
  const markMessageAsRead = (msgId: number) => {
    const currentUser = getCurrentUsername();
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ action: "read", message_id: msgId }));
      setMessages(prevMessages =>
        prevMessages.map(m => {
          if (m.id === msgId && (!m.read_by || !m.read_by.includes(currentUser))) {
            return { ...m, read_by: m.read_by ? [...m.read_by, currentUser] : [currentUser] };
          }
          return m;
        })
      );
    } else {
      console.warn("WebSocket not open, cannot send read event.");
    }
  };

  return (
    <div className="container-fluid mt-4">
      <div className="row">
        <RoomSidebar
          joinedRooms={joinedRooms}
          availableRooms={availableRooms}
          onRoomClick={setCurrentRoom}
          onJoinRoom={handleJoinRoom}
          onLeaveRoom={handleLeaveRoom}
          onCreateRoom={handleCreateRoom}
        />
        <ChatWindow
          currentRoom={currentRoom}
          messages={messages}
          onSendMessage={handleSendMessage}
          onReact={handleReact}
          joinedRooms={joinedRooms}
          onMarkAsRead={markMessageAsRead}
        />
        {notification && (
          <Notification
            message={notification.message}
            onNotificationClick={() => {
              const targetRoom = joinedRooms.find(r => r.name === notification.room);
              if (targetRoom) {
                setCurrentRoom(targetRoom);
                setTimeout(() => {
                  const chatEnd = document.getElementById("chat-end");
                  if (chatEnd) {
                    chatEnd.scrollIntoView({ behavior: "smooth" });
                  }
                }, 600);
              }
              setNotification(null);
            }}
            onClose={() => setNotification(null)}
          />
        )}
      </div>
    </div>
  );
};

export default Chat;