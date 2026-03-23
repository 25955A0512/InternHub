import { useState, useEffect } from 'react';
import { getNotifications, markNotificationRead, markAllNotificationsRead, deleteNotification } from '../utils/api';

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadNotifications = async () => {
    try {
      const res = await getNotifications();
      setNotifications(res.data.notifications);
      setUnreadCount(res.data.unreadCount);
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await markNotificationRead(id);
      loadNotifications();
    } catch (err) { console.error(err); }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead();
      loadNotifications();
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id) => {
    try {
      await deleteNotification(id);
      loadNotifications();
    } catch (err) { console.error(err); }
  };

  const getTypeColor = (type) => {
    switch(type) {
      case 'success': return { bg: '#d1fae5', color: '#065f46', border: '#a7f3d0' };
      case 'warning': return { bg: '#fef3c7', color: '#92400e', border: '#fde68a' };
      case 'error': return { bg: '#fee2e2', color: '#991b1b', border: '#fecaca' };
      default: return { bg: '#dbeafe', color: '#1e40af', border: '#bfdbfe' };
    }
  };

  const getTypeIcon = (type) => {
    switch(type) {
      case 'success': return '✅';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      default: return 'ℹ️';
    }
  };

  // Detect mobile
  const isMobile = window.innerWidth <= 768;

  return (
    <div style={{ position: 'relative' }}>

      {/* Bell Button */}
      <button
        onClick={() => setOpen(!open)}
        style={{ position: 'relative', background: 'rgba(255,255,255,0.08)', border: 'none', width: '40px', height: '40px', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', transition: 'all 0.2s' }}
      >
        🔔
        {unreadCount > 0 && (
          <div style={{ position: 'absolute', top: '-4px', right: '-4px', background: '#ef4444', color: 'white', borderRadius: '50%', width: '18px', height: '18px', fontSize: '11px', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </div>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div style={{
          position: 'fixed',
          top: isMobile ? '60px' : '80px',
          left: isMobile ? '8px' : '270px',
          right: isMobile ? '8px' : 'auto',
          width: isMobile ? 'auto' : '360px',
          background: 'white',
          borderRadius: '16px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.16)',
          border: '1px solid #f1f5f9',
          zIndex: 9999,
          overflow: 'hidden'
        }}>

          {/* Header */}
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#0f172a', marginBottom: '2px' }}>Notifications</h3>
              {unreadCount > 0 && (
                <p style={{ fontSize: '12px', color: '#64748b' }}>{unreadCount} unread</p>
              )}
            </div>
            {unreadCount > 0 && (
              <button onClick={handleMarkAllRead}
                style={{ background: 'none', border: 'none', color: '#3b82f6', fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: 'Outfit, sans-serif' }}>
                Mark all read
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div style={{ maxHeight: isMobile ? '60vh' : '400px', overflowY: 'auto' }}>
            {notifications.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
                <div style={{ fontSize: '40px', marginBottom: '8px' }}>🔔</div>
                <p style={{ fontSize: '14px', fontWeight: '500' }}>No notifications yet</p>
              </div>
            ) : (
              notifications.map(notif => {
                const colors = getTypeColor(notif.type);
                return (
                  <div key={notif.id}
                    style={{ padding: '14px 20px', borderBottom: '1px solid #f8fafc', background: notif.is_read ? 'white' : '#f8faff', transition: 'background 0.2s', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: colors.bg, border: `1px solid ${colors.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', flexShrink: 0 }}>
                      {getTypeIcon(notif.type)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2px' }}>
                        <p style={{ fontSize: '13px', fontWeight: notif.is_read ? '500' : '700', color: '#0f172a', marginRight: '8px' }}>{notif.title}</p>
                        {!notif.is_read && (
                          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3b82f6', flexShrink: 0, marginTop: '4px' }}></div>
                        )}
                      </div>
                      <p style={{ fontSize: '12px', color: '#64748b', lineHeight: '1.5', marginBottom: '6px' }}>{notif.message}</p>
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                          {new Date(notif.created_at).toLocaleDateString()}
                        </span>
                        {!notif.is_read && (
                          <button onClick={() => handleMarkRead(notif.id)}
                            style={{ background: 'none', border: 'none', color: '#3b82f6', fontSize: '11px', fontWeight: '600', cursor: 'pointer', fontFamily: 'Outfit, sans-serif' }}>
                            Mark read
                          </button>
                        )}
                        <button onClick={() => handleDelete(notif.id)}
                          style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '11px', fontWeight: '600', cursor: 'pointer', fontFamily: 'Outfit, sans-serif' }}>
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Backdrop */}
      {open && (
        <div onClick={() => setOpen(false)}
          style={{ position: 'fixed', inset: 0, zIndex: 999 }}
        />
      )}
    </div>
  );
};

export default NotificationBell;