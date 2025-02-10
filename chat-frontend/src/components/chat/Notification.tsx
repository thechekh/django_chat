import React from 'react';

interface NotificationProps {
  message: string;
  onNotificationClick: () => void;
  onClose: () => void;
}

const Notification: React.FC<NotificationProps> = ({ message, onNotificationClick, onClose }) => {
  return (
    <div
      style={{
        position: 'fixed',
        bottom: '20px',
        left: '20px',
        backgroundColor: '#323232',
        color: '#fff',
        padding: '8px 16px',
        borderRadius: '12px',
        zIndex: 1000,
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
        maxWidth: '250px',
        fontSize: '0.9rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        cursor: 'pointer'
      }}
      onClick={onNotificationClick}
    >
      <span>{message || 'New notification'}</span>
      <span
        onClick={(e) => { 
          e.stopPropagation();
          onClose();
        }}
        style={{
          marginLeft: '8px',
          fontWeight: 'bold',
          cursor: 'pointer'
        }}
      >
        ×
      </span>
    </div>
  );
};

export default Notification;