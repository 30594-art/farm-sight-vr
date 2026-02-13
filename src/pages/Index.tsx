import { useState, useEffect, useCallback } from 'react';
import { Droplets, Wind, CloudRain, Fan, Sun, Leaf, Zap, Gauge } from 'lucide-react';
import Greenhouse3D from '@/components/Greenhouse3D';

// Toggle Switch Component
function ToggleSwitch({ active, onToggle }: { active: boolean; onToggle: () => void }) {
  return (
    <button
      className={`toggle-switch ${active ? 'active' : ''}`}
      onClick={onToggle}
      role="switch"
      aria-checked={active}
    >
      <span className="toggle-knob" />
    </button>
  );
}

// Status Badge
function StatusBadge({ active, activeText = 'Active', inactiveText = 'Standby' }: { active: boolean; activeText?: string; inactiveText?: string }) {
  return (
    <div className={`status-badge ${active ? 'status-active' : 'status-inactive'}`}>
      <div className={`w-2 h-2 rounded-full ${active ? 'bg-green-600 pulse-glow-anim' : 'bg-muted-foreground'}`} />
      <span>{active ? activeText : inactiveText}</span>
    </div>
  );
}

// Gauge Component
function GaugeWidget({ value, max, unit, variant = 'green' }: { value: number; max: number; unit: string; variant?: 'green' | 'blue' }) {
  const angle = 90 + (value / max) * 180;
  const color = variant === 'green' ? 'hsl(152, 100%, 50%)' : 'hsl(200, 100%, 50%)';

  return (
    <div className="gauge-widget">
      <div
        className="gauge-bg"
        style={{
          background: `conic-gradient(${color} 0deg, ${color} ${angle}deg, hsl(var(--muted)) ${angle}deg, hsl(var(--muted)) 360deg)`,
        }}
      />
      <div className="gauge-center">
        <p className="data-value text-3xl">{value}</p>
        <p className="data-unit">{unit}</p>
      </div>
    </div>
  );
}

export default function Index() {
  const [clock, setClock] = useState('00:00:00');
  const [systems, setSystems] = useState({
    drip: true,
    fog: false,
    sprinkler: false,
    fan: true,
    autoShade: true,
  });
  const [shadeLevel, setShadeLevel] = useState(45);

  // Simulated sensor data
  const [sensorData, setSensorData] = useState({
    temp: 26.3,
    humidity: 68,
    lux: 42800,
    dripFlow: 2.4,
    fogPressure: 0,
    sprinklerCoverage: 0,
    fanRpm: 1240,
  });

  // Clock
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setClock(
        `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`
      );
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Simulate sensor data
  useEffect(() => {
    const interval = setInterval(() => {
      setSensorData({
        temp: +(24 + Math.random() * 6).toFixed(1),
        humidity: Math.round(60 + Math.random() * 20),
        lux: Math.round(35000 + Math.random() * 20000),
        dripFlow: systems.drip ? +(2 + Math.random() * 0.8).toFixed(1) : 0,
        fogPressure: systems.fog ? +(2.8 + Math.random() * 0.6).toFixed(1) : 0,
        sprinklerCoverage: systems.sprinkler ? Math.round(75 + Math.random() * 20) : 0,
        fanRpm: systems.fan ? Math.round(1100 + Math.random() * 300) : 0,
      });
    }, 3000);
    return () => clearInterval(interval);
  }, [systems]);

  const toggle = useCallback((key: keyof typeof systems) => {
    setSystems((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const luxPercent = Math.min(100, (sensorData.lux / 63000) * 100);

  return (
    <div className="min-h-screen overflow-auto">
      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-xl border-b border-border" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, hsl(var(--neon-green)), hsl(var(--neon-blue)))', boxShadow: '0 4px 16px rgba(0, 255, 136, 0.3)' }}>
                <Leaf className="w-6 h-6 text-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Smart Greenhouse Dashboard 3D</h1>
                <p className="text-sm font-medium text-muted-foreground">Greenhouse Alpha</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold" style={{ background: 'rgba(0, 255, 136, 0.12)', color: '#00b347' }}>
                <div className="w-2 h-2 rounded-full bg-green-600 pulse-glow-anim" />
                System Online
              </div>
              <div className="font-fira text-sm font-bold tracking-wider px-4 py-2.5 rounded-[10px] border border-border" style={{ background: 'linear-gradient(135deg, rgba(0, 255, 136, 0.1), rgba(0, 180, 255, 0.1))' }}>
                {clock}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN */}
      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        {/* 3D Greenhouse */}
        <section className="premium-card-green mb-8 anim-in delay-1">
          <div className="text-center mb-6">
            <h2 className="text-lg font-bold mb-2">Live Greenhouse Environment (3D)</h2>
            <p className="text-sm text-muted-foreground">Interactive 3D model • Drag to rotate • Scroll to zoom</p>
          </div>
          <Greenhouse3D systems={{ ...systems, shadeLevel }} />
          <div className="mt-3 text-xs text-muted-foreground flex items-center gap-2">
            💡 Drag to rotate • Scroll to zoom • Reflects live system states
          </div>
        </section>

        {/* 3 Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-7">
          {/* IRRIGATION */}
          <section className="anim-in delay-2">
            <div className="section-header">
              <div className="w-2.5 h-2.5 rounded-full bg-neon-blue pulse-dot-anim" />
              <h2 className="text-base font-bold tracking-tight">Irrigation Control</h2>
            </div>

            {/* Drip */}
            <div className="premium-card-blue mb-5">
              <div className="flex items-start justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="icon-box icon-box-blue"><Droplets className="w-5 h-5 text-secondary" /></div>
                  <div>
                    <p className="data-label">Water Drip</p>
                    <StatusBadge active={systems.drip} />
                  </div>
                </div>
                <ToggleSwitch active={systems.drip} onToggle={() => toggle('drip')} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="data-label">Flow Rate</p>
                  <p className="data-value">{sensorData.dripFlow}</p>
                  <p className="data-unit">L/min</p>
                </div>
                <div>
                  <p className="data-label">Active Zone</p>
                  <p className="data-value text-3xl">A-3</p>
                  <p className="data-unit">Zone</p>
                </div>
              </div>
            </div>

            {/* Fog */}
            <div className="premium-card mb-5">
              <div className="flex items-start justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="icon-box" style={{ background: 'rgba(100,116,139,0.15)' }}><CloudRain className="w-5 h-5 text-muted-foreground" /></div>
                  <div>
                    <p className="data-label">Fogging System</p>
                    <StatusBadge active={systems.fog} />
                  </div>
                </div>
                <ToggleSwitch active={systems.fog} onToggle={() => toggle('fog')} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="data-label">Pressure</p>
                  <p className="data-value text-3xl">{sensorData.fogPressure}</p>
                  <p className="data-unit">Bar</p>
                </div>
                <div>
                  <p className="data-label">Humidity</p>
                  <p className="data-value text-3xl">{systems.fog ? sensorData.humidity : '--'}</p>
                  <p className="data-unit">%</p>
                </div>
              </div>
            </div>

            {/* Sprinkler */}
            <div className="premium-card">
              <div className="flex items-start justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="icon-box" style={{ background: 'rgba(100,116,139,0.15)' }}><Wind className="w-5 h-5 text-muted-foreground" /></div>
                  <div>
                    <p className="data-label">Sprinkler</p>
                    <StatusBadge active={systems.sprinkler} activeText="Active" inactiveText="Off" />
                  </div>
                </div>
                <ToggleSwitch active={systems.sprinkler} onToggle={() => toggle('sprinkler')} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="data-label">Coverage</p>
                  <p className="data-value text-3xl">{sensorData.sprinklerCoverage}</p>
                  <p className="data-unit">%</p>
                </div>
                <div>
                  <p className="data-label">Next Cycle</p>
                  <p className="data-value text-2xl">14:00</p>
                  <p className="data-unit">Scheduled</p>
                </div>
              </div>
            </div>
          </section>

          {/* CLIMATE */}
          <section className="anim-in delay-3">
            <div className="section-header">
              <div className="w-2.5 h-2.5 rounded-full bg-neon-green pulse-dot-anim" />
              <h2 className="text-base font-bold tracking-tight">Climate Monitoring</h2>
            </div>

            {/* Temp Gauge */}
            <div className="premium-card-green mb-5">
              <p className="data-label mb-4">Temperature</p>
              <GaugeWidget value={sensorData.temp} max={45} unit="°C" variant="green" />
              <div className="flex justify-between text-xs text-muted-foreground px-2">
                <span>Min: <span className="font-fira font-semibold text-foreground">22.1°</span></span>
                <span>Max: <span className="font-fira font-semibold text-foreground">31.8°</span></span>
              </div>
            </div>

            {/* Humidity Gauge */}
            <div className="premium-card-blue mb-5">
              <p className="data-label mb-4">Humidity Level</p>
              <GaugeWidget value={sensorData.humidity} max={100} unit="% RH" variant="blue" />
              <div className="flex justify-between items-center text-xs px-2">
                <span className="text-muted-foreground">Target: <span className="font-fira font-semibold">65–75%</span></span>
                <StatusBadge active={sensorData.humidity >= 60 && sensorData.humidity <= 80} activeText="Optimal" inactiveText="Warning" />
              </div>
            </div>

            {/* Evap Fan */}
            <div className="premium-card">
              <div className="flex items-start justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="icon-box icon-box-green"><Fan className="w-5 h-5 text-green-600" /></div>
                  <div>
                    <p className="data-label">Evap Fan</p>
                    <StatusBadge active={systems.fan} activeText="Running" inactiveText="Stopped" />
                  </div>
                </div>
                <ToggleSwitch active={systems.fan} onToggle={() => toggle('fan')} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="data-label">Fan Speed</p>
                  <p className="data-value text-3xl">{sensorData.fanRpm}</p>
                  <p className="data-unit">RPM</p>
                </div>
                <div>
                  <p className="data-label">Power</p>
                  <p className="data-value text-2xl">24.8</p>
                  <p className="data-unit">W</p>
                </div>
              </div>
            </div>
          </section>

          {/* SHADING */}
          <section className="anim-in delay-4">
            <div className="section-header">
              <Sun className="w-4 h-4 grad-text" />
              <h2 className="text-base font-bold tracking-tight">Smart Shading System</h2>
            </div>

            {/* Light Intensity */}
            <div className="premium-card-green mb-5">
              <div className="flex items-center justify-between mb-3">
                <p className="data-label">Light Intensity</p>
                <span className="font-fira text-sm font-bold">{sensorData.lux.toLocaleString()}</span>
              </div>
              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${luxPercent}%` }} />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground mb-5 mt-2">
                <span>0 lux</span>
                <span>63,000 lux</span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="stat-mini-box">
                  <p className="data-label text-[10px]">UV</p>
                  <p className="font-fira font-bold text-sm">6.2</p>
                  <p className="text-[10px] text-muted-foreground">idx</p>
                </div>
                <div className="stat-mini-box">
                  <p className="data-label text-[10px]">PAR</p>
                  <p className="font-fira font-bold text-sm">820</p>
                  <p className="text-[10px] text-muted-foreground">µmol</p>
                </div>
                <div className="stat-mini-box">
                  <p className="data-label text-[10px]">DLI</p>
                  <p className="font-fira font-bold text-sm">28.4</p>
                  <p className="text-[10px] text-muted-foreground">mol</p>
                </div>
              </div>
            </div>

            {/* Shade Slider */}
            <div className="premium-card mb-5">
              <div className="flex items-center justify-between mb-4">
                <p className="data-label">Shade Deployment</p>
                <span className="font-fira text-lg font-bold text-secondary">{shadeLevel}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={shadeLevel}
                onChange={(e) => setShadeLevel(Number(e.target.value))}
                className="w-full h-2 rounded-full appearance-none cursor-pointer bg-muted accent-secondary"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>0% Open</span>
                <span>100% Closed</span>
              </div>
            </div>

            {/* Auto Mode */}
            <div className="premium-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="data-label mb-2">Automation</p>
                  <p className="text-sm font-semibold">AI-Optimized Schedule</p>
                  <p className="text-xs text-muted-foreground mt-1">Dynamic adjustment based on sunlight</p>
                </div>
                <ToggleSwitch active={systems.autoShade} onToggle={() => toggle('autoShade')} />
              </div>
            </div>
          </section>
        </div>

        {/* FOOTER STATS */}
        <section className="premium-card mt-10 anim-in delay-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {[
              { label: 'Water Used Today', value: '847', unit: 'Liters', gradient: false },
              { label: 'Energy Saved', value: '12.4%', unit: 'vs. Standard', gradient: true },
              { label: 'CO₂ Level', value: '412', unit: 'ppm', gradient: false },
              { label: 'Soil Moisture', value: '73%', unit: 'Optimal', gradient: true },
            ].map((stat, i) => (
              <div key={i} className={`text-center py-5 ${i < 3 ? 'md:border-r md:border-border' : ''}`}>
                <p className="data-label mb-2">{stat.label}</p>
                <p className={`data-value ${stat.gradient ? 'grad-text' : ''}`}>{stat.value}</p>
                <p className="data-unit">{stat.unit}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
