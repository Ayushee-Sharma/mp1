import React, { useEffect, useRef, useState } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import api from '../../services/api';
import {
  BACKEND_AVAILABLE_EVENT,
  BACKEND_UNAVAILABLE_EVENT,
} from '../../utils/backendEvents';

const CHECK_INTERVAL = 45000;
const SLOW_RESPONSE_MS = 1200;

const ConnectionStatus = () => {
  const [status, setStatus] = useState(() => (navigator.onLine ? 'checking' : 'offline'));
  const backendUnavailable = useRef(!navigator.onLine);
  const [installPrompt, setInstallPrompt] = useState(null);
  const [installError, setInstallError] = useState('');
  const {
    offlineReady: [offlineReady],
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW();

  useEffect(() => {
    let checking = false;
    let recheckRequested = false;
    let active = true;

    const markBackendUnavailable = () => {
      if (!backendUnavailable.current) {
        window.dispatchEvent(new Event(BACKEND_UNAVAILABLE_EVENT));
      }
      backendUnavailable.current = true;
    };

    const checkHealth = async () => {
      if (!navigator.onLine) {
        markBackendUnavailable();
        if (active) setStatus('offline');
        return;
      }
      if (checking) {
        recheckRequested = true;
        return;
      }

      checking = true;
      recheckRequested = false;
      if (active) setStatus('checking');
      const startedAt = performance.now();

      try {
        const response = await api.get('/health', { timeout: 5000 });
        if (active) {
          if (!navigator.onLine) {
            markBackendUnavailable();
            setStatus('offline');
          } else if (response.data?.status !== 'ok') {
            markBackendUnavailable();
            setStatus('unavailable');
          } else {
            if (backendUnavailable.current) {
              window.dispatchEvent(new Event(BACKEND_AVAILABLE_EVENT));
            }
            backendUnavailable.current = false;
            setStatus(performance.now() - startedAt >= SLOW_RESPONSE_MS ? 'slow' : 'good');
          }
        }
      } catch {
        markBackendUnavailable();
        if (active) setStatus(navigator.onLine ? 'unavailable' : 'offline');
      } finally {
        checking = false;
        if (active && recheckRequested && navigator.onLine) checkHealth();
      }
    };

    const handleOffline = () => {
      markBackendUnavailable();
      setStatus('offline');
    };
    const handleOnline = () => checkHealth();
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') checkHealth();
    };

    checkHealth();
    const healthTimer = window.setInterval(checkHealth, CHECK_INTERVAL);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      active = false;
      window.clearInterval(healthTimer);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  useEffect(() => {
    const handleInstallPrompt = (event) => {
      event.preventDefault();
      setInstallPrompt(event);
    };

    window.addEventListener('beforeinstallprompt', handleInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleInstallPrompt);
  }, []);

  const descriptions = {
    good: 'Good connection',
    slow: 'Slow connection',
    offline: 'Offline',
    unavailable: 'Backend unavailable',
    checking: 'Reconnecting/checking',
  };
  const colors = {
    good: 'text-emerald-700',
    slow: 'text-amber-700',
    offline: 'text-rose-700',
    unavailable: 'text-rose-700',
    checking: 'text-sky-700',
  };
  const signalBars = status === 'good' ? 4 : status === 'slow' ? 2 : status === 'checking' ? 1 : 0;

  const handleInstall = async () => {
    if (!installPrompt) return;
    setInstallError('');
    try {
      await installPrompt.prompt();
      const { outcome } = await installPrompt.userChoice;
      if (outcome === 'accepted') setInstallPrompt(null);
    } catch (error) {
      setInstallError(error.message || 'The app could not be installed from this browser.');
    }
  };

  return (
    <section
      aria-label="Connection and app status"
      className="border-b border-slate-200 bg-white px-4 py-2 text-xs"
    >
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-4 gap-y-2 sm:px-2 lg:px-4">
        <div className="flex min-w-0 items-center gap-2">
          <span
            aria-hidden="true"
            className={`flex h-4 items-end gap-0.5 ${colors[status]}`}
            title={`${descriptions[status]}; status is based on backend response time, not cellular signal strength`}
          >
            {[3, 5, 7, 9].map((height, index) => (
              <span
                key={height}
                className={`w-1 rounded-t-sm ${
                  index < signalBars ? 'bg-current' : 'bg-slate-300'
                }`}
                style={{ height: `${height}px` }}
              />
            ))}
          </span>
          <span role="status" aria-live="polite" className={`font-semibold ${colors[status]}`}>
            {descriptions[status]}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          {status === 'offline' && (
            <span className="text-slate-600">
              Login, appointment booking, prescription saving, and live data need a connection.
            </span>
          )}
          {status === 'unavailable' && (
            <span className="text-slate-600">
              Your browser is online, but the healthcare server did not respond.
            </span>
          )}
          {offlineReady && (
            <span className="text-slate-600">App shell ready for offline viewing.</span>
          )}
          {installPrompt && (
            <button
              type="button"
              onClick={handleInstall}
              className="font-semibold text-emerald-700 underline underline-offset-2"
            >
              Install app
            </button>
          )}
          {needRefresh && (
            <button
              type="button"
              onClick={() => updateServiceWorker(true)}
              className="font-semibold text-emerald-700 underline underline-offset-2"
            >
              Update app
            </button>
          )}
        </div>
      </div>
      {installError && (
        <p role="alert" className="mx-auto mt-1 max-w-7xl text-rose-700">
          {installError}
        </p>
      )}
      {needRefresh && (
        <p className="mx-auto mt-1 max-w-7xl text-slate-600">
          An update is ready. Choose Update app when convenient to apply it.
        </p>
      )}
    </section>
  );
};

export default ConnectionStatus;
