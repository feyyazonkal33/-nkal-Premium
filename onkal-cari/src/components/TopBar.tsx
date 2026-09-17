import { useState, useEffect } from 'react';
import axios from 'axios';
import { Cloud, Sun } from 'lucide-react';

export default function TopBar() {
  const [time, setTime] = useState(new Date());
  const [weather, setWeather] = useState<{ temp: number, isDay: boolean } | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Simple fetch using Open-Meteo for a default location (Istanbul) if geolocation fails
    const fetchWeather = async (lat = 41.0082, lon = 28.9784) => {
      try {
        const res = await axios.get(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`);
        setWeather({
          temp: Math.round(res.data.current_weather.temperature),
          isDay: res.data.current_weather.is_day === 1
        });
      } catch (e) {
        console.error('Weather fetch error', e);
      }
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => fetchWeather(pos.coords.latitude, pos.coords.longitude),
        () => fetchWeather()
      );
    } else {
      fetchWeather();
    }
  }, []);

  const formatDate = (d: Date) => {
    return d.toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric' });
  };
  const formatTime = (d: Date) => {
    return d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="w-full bg-dark px-4 py-3 border-b border-gold/30">
      <div className="flex items-center gap-3">
        {/* Small Top Logo */}
        <div className="w-8 h-8 rounded-full border border-gold overflow-hidden shrink-0">
          <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" />
        </div>
        <h1 className="text-gold font-bold text-lg leading-none tracking-wide">Önkal Premium Cari</h1>
      </div>

      {/* Info Bar */}
      <div className="flex justify-between items-center mt-3 text-xs text-gray-400">
        <div>{formatDate(time)} {formatTime(time)}</div>
        <div className="flex items-center gap-1">
          <span>İzmir:</span>
          {weather ? (
            <>
              {weather.isDay ? <Sun size={14} className="text-gold" /> : <Cloud size={14} />}
              <span>{weather.temp}°C</span>
            </>
          ) : (
            <>
              <Sun size={14} className="text-gold" />
              <span>--°C</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}