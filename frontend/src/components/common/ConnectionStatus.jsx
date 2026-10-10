import React, { useEffect, useState } from 'react';

const ConnectionStatus = () => {
  const [online, setOnline] = useState(() => navigator.onLine);
  const [justReconnected, setJustReconnected] = useState(false);

  useEffect(() => {
    let reconnectTimer;

    const handleOffline = () => {
      clearTimeout(reconnectTimer);
      setOnline(false);
      setJustReconnected(false);
    };

    const handleOnline = () => {
      setOnline(true);
      setJustReconnected(true);
      clearTimeout(reconnectTimer);
      reconnectTimer = setTimeout(() => setJustReconnected(false), 6000);
    };

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    return () => {
      clearTimeout(reconnectTimer);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  if (online && !justReconnected) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={`sticky top-16 z-30 px-4 py-2 text-center text-xs font-medium ${
        online ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-100 text-amber-900'
      }`}
    >
      {online
        ? 'Your connection is back. The server may still be unavailable; retry any failed request.'
        : 'You are offline. Login, appointments, prescriptions, and live listings need an internet connection.'}
    </div>
  );
};

export default ConnectionStatus;
