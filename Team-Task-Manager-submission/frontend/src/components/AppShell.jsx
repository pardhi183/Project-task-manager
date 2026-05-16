import { Bell, CloudSun, FolderKanban, LayoutDashboard, LogOut, Send, UserRound } from 'lucide-react';
import { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { apiRequest } from '../api/client.js';
import { useAuth } from '../state/AuthContext.jsx';

const AppShell = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [weather, setWeather] = useState({ temp: '--', label: 'Weather' });
  const [notifications, setNotifications] = useState([]);
  const [noticeForm, setNoticeForm] = useState({ title: '', message: '' });

  const weatherLabel = (code) => {
    if ([0, 1].includes(code)) return 'Clear';
    if ([2, 3].includes(code)) return 'Cloudy';
    if ([45, 48].includes(code)) return 'Fog';
    if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) return 'Rain';
    if ([95, 96, 99].includes(code)) return 'Storm';
    return 'Forecast';
  };

  const loadWeather = async (coords = { latitude: 28.6139, longitude: 77.209 }) => {
    const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${coords.latitude}&longitude=${coords.longitude}&current=temperature_2m,weather_code`);
    const data = await response.json();
    setWeather({
      temp: Math.round(data.current?.temperature_2m ?? 0),
      label: weatherLabel(data.current?.weather_code)
    });
  };

  const loadNotifications = async () => {
    const data = await apiRequest('/notifications');
    setNotifications(data.notifications || []);
  };

  useEffect(() => {
    loadNotifications().catch(() => {});
    const noticeTimer = window.setInterval(() => loadNotifications().catch(() => {}), 20000);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => loadWeather(position.coords).catch(() => {}),
        () => loadWeather().catch(() => {}),
        { timeout: 3500 }
      );
    } else {
      loadWeather().catch(() => {});
    }

    const weatherTimer = window.setInterval(() => loadWeather().catch(() => {}), 10 * 60 * 1000);
    return () => {
      window.clearInterval(noticeTimer);
      window.clearInterval(weatherTimer);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const createNotification = async (event) => {
    event.preventDefault();
    if (!noticeForm.title.trim() || !noticeForm.message.trim()) return;

    await apiRequest('/notifications', {
      method: 'POST',
      body: noticeForm
    });
    setNoticeForm({ title: '', message: '' });
    await loadNotifications();
  };

  const readNotification = async (notificationId) => {
    await apiRequest(`/notifications/${notificationId}/read`, { method: 'PATCH' });
    await loadNotifications();
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-block">
          <div className="brand-mark">TT</div>
          <div>
            <h1>Team Task Manager</h1>
            <p>{user.role}</p>
          </div>
        </div>
        <nav className="nav-list" aria-label="Primary">
          <NavLink to="/profile">
            <UserRound size={18} />
            Profile
          </NavLink>
          <NavLink to="/" end>
            <LayoutDashboard size={18} />
            Dashboard
          </NavLink>
          <NavLink to="/projects">
            <FolderKanban size={18} />
            Projects
          </NavLink>
        </nav>
        <section className="weather-card">
          <CloudSun size={22} />
          <div>
            <strong>{weather.temp}°C</strong>
            <span>{weather.label}</span>
          </div>
        </section>
        <div className="user-card">
          <div>
            <strong>{user.name}</strong>
            <span>{user.email}</span>
          </div>
          <button className="logout-button" onClick={handleLogout} type="button">
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>
      <main className="main-content">
        <Outlet />
      </main>
      <aside className="notification-rail">
        <div className="notification-header">
          <Bell size={18} />
          <strong>Notifications</strong>
        </div>
        {user.role === 'Admin' && (
          <form className="notification-form" onSubmit={createNotification}>
            <input
              value={noticeForm.title}
              onChange={(event) => setNoticeForm((current) => ({ ...current, title: event.target.value }))}
              placeholder="Title"
              required
            />
            <textarea
              value={noticeForm.message}
              onChange={(event) => setNoticeForm((current) => ({ ...current, message: event.target.value }))}
              placeholder="Message"
              rows={2}
              required
            />
            <button className="primary-button">
              <Send size={16} />
              Send
            </button>
          </form>
        )}
        <div className="notification-marquee">
          <div className="notification-track">
            {notifications.length === 0 ? (
              <span className="muted">No notifications yet.</span>
            ) : notifications.map((notification) => (
              <button
                key={notification._id}
                type="button"
                className={`notification-item ${notification.isRead ? 'read' : ''}`}
                onClick={() => readNotification(notification._id)}
              >
                <strong>{notification.title}</strong>
                <span>{notification.message}</span>
              </button>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
};

export default AppShell;
