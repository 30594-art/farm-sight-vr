import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Droplets, Wind, CloudRain, Fan, Sun, Leaf, Zap, Home, Users, Cloud, Cpu } from 'lucide-react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import greenhouseBlueprints from '@/assets/greenhouse-blueprints.png';

// =====================================================================
// TOGGLE SWITCH
// =====================================================================
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

// =====================================================================
// STATUS BADGE
// =====================================================================
function StatusBadge({ active, activeText = 'Active', inactiveText = 'Standby' }: { active: boolean; activeText?: string; inactiveText?: string }) {
  return (
    <div className={`status-badge ${active ? 'status-active' : 'status-inactive'}`}>
      <div className={`w-2 h-2 rounded-full ${active ? 'bg-green-600 pulse-glow-anim' : 'bg-muted-foreground'}`} />
      <span>{active ? activeText : inactiveText}</span>
    </div>
  );
}

// =====================================================================
// GAUGE WIDGET
// =====================================================================
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

// =====================================================================
// FEATURES SECTION
// =====================================================================
const features = [
  { icon: Home, title: 'Smart Greenhouse Structure', description: 'To tackle the increasing challenges of agricultural production', side: 'left' as const },
  { icon: Cloud, title: 'Smart Farming and Frost Intelligent Control', description: 'Remote communication used for the monitoring and control of agro-climate croplands', side: 'left' as const },
  { icon: Leaf, title: 'My Agricultural production is awesome', description: 'Agricultural production is either smaller or greater than the one planned', side: 'left' as const },
  { icon: Users, title: 'Farm Management in controller', description: 'Farmers can choose to remotely control, either manually or automatically', side: 'right' as const },
  { icon: Cpu, title: 'My internet of things systems and Resource data', description: 'Data is added in a wireless cloud system, and farmers can access it to analysis on your farm', side: 'right' as const },
  { icon: Zap, title: 'Focus on Reduce Electric Energy Source', description: 'The Solar energy model is alternative for using electric power instead of normal electrical in Greenhouse', side: 'right' as const },
];

function FeaturesSection() {
  const left = features.filter((f) => f.side === 'left');
  const right = features.filter((f) => f.side === 'right');

  return (
    <section className="premium-card mb-8 anim-in delay-2">
      <div className="text-center mb-8">
        <h2 className="text-lg font-bold mb-2">Smart Farm Features</h2>
        <p className="text-sm text-muted-foreground">Complete IoT-powered greenhouse management system</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
        <div className="flex flex-col gap-8">
          {left.map((f, i) => (
            <div key={i} className="text-center lg:text-right">
              <div className="flex justify-center lg:justify-end mb-3">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center icon-box-green">
                  <f.icon className="w-6 h-6 text-neon-green" />
                </div>
              </div>
              <h3 className="font-bold text-sm mb-1">{f.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
        <div className="flex justify-center">
          <img src={greenhouseBlueprints} alt="Greenhouse blueprint diagrams showing top, side, front and 3D views" className="max-w-full h-auto rounded-lg opacity-90" />
        </div>
        <div className="flex flex-col gap-8">
          {right.map((f, i) => (
            <div key={i} className="text-center lg:text-left">
              <div className="flex justify-center lg:justify-start mb-3">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center icon-box-green">
                  <f.icon className="w-6 h-6 text-neon-green" />
                </div>
              </div>
              <h3 className="font-bold text-sm mb-1">{f.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// =====================================================================
// 3D GREENHOUSE COMPONENTS
// =====================================================================

function Ground() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
      <planeGeometry args={[40, 40]} />
      <meshStandardMaterial color="#c5d4a0" roughness={0.9} />
    </mesh>
  );
}

function GreenhouseFrame() {
  const width = 6;
  const length = 12;
  const wallHeight = 2.5;
  const roofPeak = 4.3;

  const roofShape = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(-width / 2 - 0.1, wallHeight);
    shape.lineTo(0, roofPeak);
    shape.lineTo(width / 2 + 0.1, wallHeight);
    return shape;
  }, []);

  const extrudeSettings = useMemo(() => ({ steps: 1, depth: length, bevelEnabled: false }), []);

  return (
    <group>
      {[-width / 2, width / 2].map((x) =>
        [0, length * 0.25, length * 0.5, length * 0.75, length].map((z, i) => (
          <mesh key={`post-${x}-${i}`} position={[x, wallHeight / 2, z - length / 2]} castShadow>
            <boxGeometry args={[0.08, wallHeight, 0.08]} />
            <meshStandardMaterial color="#888888" metalness={0.8} roughness={0.3} />
          </mesh>
        ))
      )}
      {[-width / 2, width / 2].map((x, idx) => (
        <mesh key={`wall-${idx}`} position={[x, wallHeight / 2, 0]} castShadow>
          <boxGeometry args={[0.05, wallHeight, length]} />
          <meshStandardMaterial color="#b0d4f1" transparent opacity={0.25} roughness={0.1} />
        </mesh>
      ))}
      {[-length / 2, length / 2].map((z, idx) => (
        <mesh key={`endwall-${idx}`} position={[0, wallHeight / 2, z]} castShadow>
          <boxGeometry args={[width, wallHeight, 0.05]} />
          <meshStandardMaterial color="#b0d4f1" transparent opacity={0.2} roughness={0.1} />
        </mesh>
      ))}
      <mesh position={[0, 0, -length / 2]} castShadow>
        <extrudeGeometry args={[roofShape, extrudeSettings]} />
        <meshStandardMaterial color="#e8f4fd" transparent opacity={0.35} roughness={0.1} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, roofPeak, 0]} castShadow>
        <boxGeometry args={[0.06, 0.06, length]} />
        <meshStandardMaterial color="#666666" metalness={0.8} roughness={0.3} />
      </mesh>
      {Array.from({ length: 6 }).map((_, i) => {
        const z = -length / 2 + (i + 0.5) * (length / 6);
        return (
          <group key={`rafter-${i}`}>
            <mesh position={[-width / 4, (wallHeight + roofPeak) / 2 + 0.15, z]} rotation={[0, 0, Math.atan2(roofPeak - wallHeight, width / 2)]}>
              <boxGeometry args={[0.04, 0.04, width / 2 + 0.3]} />
              <meshStandardMaterial color="#777" metalness={0.7} roughness={0.3} />
            </mesh>
            <mesh position={[width / 4, (wallHeight + roofPeak) / 2 + 0.15, z]} rotation={[0, 0, -Math.atan2(roofPeak - wallHeight, width / 2)]}>
              <boxGeometry args={[0.04, 0.04, width / 2 + 0.3]} />
              <meshStandardMaterial color="#777" metalness={0.7} roughness={0.3} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

function Plants() {
  const plants = useMemo(() => {
    const arr: { x: number; z: number; scale: number }[] = [];
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 10; col++) {
        arr.push({ x: -1.8 + row * 1.2, z: -5 + col * 1.1, scale: 0.6 + Math.random() * 0.4 });
      }
    }
    return arr;
  }, []);

  return (
    <group>
      {[-1.8, -0.6, 0.6, 1.8].map((x, i) => (
        <mesh key={`bed-${i}`} position={[x, 0.15, 0]} receiveShadow>
          <boxGeometry args={[0.8, 0.3, 10.5]} />
          <meshStandardMaterial color="#5a3825" roughness={0.9} />
        </mesh>
      ))}
      {plants.map((p, i) => (
        <group key={`plant-${i}`} position={[p.x, 0.3, p.z]}>
          <mesh position={[0, p.scale * 0.3, 0]}>
            <cylinderGeometry args={[0.02, 0.03, p.scale * 0.6, 6]} />
            <meshStandardMaterial color="#3d7a3a" />
          </mesh>
          <mesh position={[0, p.scale * 0.55, 0]}>
            <sphereGeometry args={[p.scale * 0.2, 6, 6]} />
            <meshStandardMaterial color="#4ade80" roughness={0.8} />
          </mesh>
          <mesh position={[0.08, p.scale * 0.45, 0.05]}>
            <sphereGeometry args={[p.scale * 0.14, 5, 5]} />
            <meshStandardMaterial color="#22c55e" roughness={0.8} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function WaterDroplet({ position, delay }: { position: [number, number, number]; delay: number }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = ((clock.getElapsedTime() + delay) % 1.5) / 1.5;
    ref.current.position.y = position[1] - t * 1.8;
    ref.current.scale.setScalar(1 - t * 0.6);
    (ref.current.material as THREE.MeshStandardMaterial).opacity = 1 - t;
  });
  return (
    <mesh ref={ref} position={position}>
      <sphereGeometry args={[0.05, 8, 8]} />
      <meshStandardMaterial color="#38bdf8" transparent opacity={0.8} />
    </mesh>
  );
}

function DripSystem({ active }: { active: boolean }) {
  return (
    <group position={[0, 2.3, 0]}>
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.05, 0.05, 11, 8]} />
        <meshStandardMaterial color={active ? '#0284c7' : '#94a3b8'} metalness={0.6} />
      </mesh>
      {[-1.8, -0.6, 0.6, 1.8].map((x, ri) => (
        <group key={`branch-${ri}`}>
          <mesh position={[x, -0.15, 0]}>
            <cylinderGeometry args={[0.02, 0.02, 0.3, 6]} />
            <meshStandardMaterial color={active ? '#0ea5e9' : '#94a3b8'} />
          </mesh>
          {Array.from({ length: 8 }).map((_, ci) => (
            <group key={`emitter-${ri}-${ci}`} position={[x, -0.3, -4 + ci * 1.1]}>
              <mesh>
                <cylinderGeometry args={[0.015, 0.015, 0.15, 6]} />
                <meshStandardMaterial color={active ? '#0ea5e9' : '#94a3b8'} />
              </mesh>
              {active && <WaterDroplet position={[0, -0.1, 0]} delay={ri * 0.3 + ci * 0.15} />}
            </group>
          ))}
        </group>
      ))}
      {active && <pointLight position={[0, -0.5, 0]} intensity={0.2} color="#00b4ff" distance={5} />}
    </group>
  );
}

function FogParticle({ basePos, delay }: { basePos: [number, number, number]; delay: number }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = ((clock.getElapsedTime() * 0.5 + delay) % 3) / 3;
    ref.current.position.y = basePos[1] + t * 2;
    ref.current.position.x = basePos[0] + Math.sin(clock.getElapsedTime() + delay) * 0.5;
    ref.current.position.z = basePos[2] + Math.cos(clock.getElapsedTime() * 0.7 + delay) * 0.3;
    ref.current.scale.setScalar(0.3 + t * 1.2);
    (ref.current.material as THREE.MeshStandardMaterial).opacity = 0.25 * (1 - t);
  });
  return (
    <mesh ref={ref} position={basePos}>
      <sphereGeometry args={[0.3, 8, 8]} />
      <meshStandardMaterial color="#c8e6ff" transparent opacity={0.2} depthWrite={false} />
    </mesh>
  );
}

function FogSystem({ active }: { active: boolean }) {
  const fogPositions = useMemo(() => {
    const arr: [number, number, number][] = [];
    for (let i = 0; i < 12; i++) {
      arr.push([(Math.random() - 0.5) * 5, 1.5 + Math.random() * 1, (Math.random() - 0.5) * 10]);
    }
    return arr;
  }, []);

  return (
    <group>
      {[-2, 0, 2].map((x, i) => (
        <group key={`nozzle-${i}`} position={[x, 3.8, 0]}>
          <mesh>
            <cylinderGeometry args={[0.06, 0.04, 0.2, 8]} />
            <meshStandardMaterial color={active ? '#0ea5e9' : '#777'} metalness={0.6} />
          </mesh>
        </group>
      ))}
      {active && fogPositions.map((pos, i) => <FogParticle key={i} basePos={pos} delay={i * 0.5} />)}
      {active && <pointLight position={[0, 2.5, 0]} intensity={0.15} color="#87ceeb" distance={8} />}
    </group>
  );
}

function SprayParticle({ origin, angle, delay }: { origin: [number, number, number]; angle: number; delay: number }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = ((clock.getElapsedTime() * 2 + delay) % 1);
    const radius = t * 2;
    const height = t * 1.5 - t * t * 2;
    ref.current.position.x = origin[0] + Math.cos(angle + clock.getElapsedTime()) * radius;
    ref.current.position.y = origin[1] + Math.max(0, height);
    ref.current.position.z = origin[2] + Math.sin(angle + clock.getElapsedTime()) * radius;
    ref.current.scale.setScalar(0.5 + (1 - t) * 0.5);
    (ref.current.material as THREE.MeshStandardMaterial).opacity = 0.6 * (1 - t);
  });
  return (
    <mesh ref={ref} position={origin}>
      <sphereGeometry args={[0.04, 6, 6]} />
      <meshStandardMaterial color="#60a5fa" transparent opacity={0.5} />
    </mesh>
  );
}

function SpinningHead({ position }: { position: [number, number, number] }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => { if (ref.current) ref.current.rotation.y += delta * 4; });
  return (
    <mesh ref={ref} position={position}>
      <boxGeometry args={[0.2, 0.02, 0.02]} />
      <meshStandardMaterial color="#38bdf8" />
    </mesh>
  );
}

function SprinklerSystem({ active }: { active: boolean }) {
  const positions: [number, number, number][] = [[-2, 0.5, -3], [0, 0.5, 0], [2, 0.5, 3]];
  return (
    <group>
      {positions.map((pos, si) => (
        <group key={`sprinkler-${si}`} position={pos}>
          <mesh position={[0, -0.15, 0]}>
            <cylinderGeometry args={[0.03, 0.04, 0.5, 8]} />
            <meshStandardMaterial color={active ? '#0284c7' : '#64748b'} metalness={0.5} />
          </mesh>
          <mesh position={[0, 0.1, 0]}>
            <sphereGeometry args={[0.1, 8, 8]} />
            <meshStandardMaterial color={active ? '#0ea5e9' : '#94a3b8'} metalness={0.5} />
          </mesh>
          {active && <SpinningHead position={[0, 0.15, 0]} />}
          {active && Array.from({ length: 8 }).map((_, pi) => (
            <SprayParticle key={pi} origin={[0, 0.2, 0]} angle={(pi / 8) * Math.PI * 2} delay={si * 0.3 + pi * 0.12} />
          ))}
        </group>
      ))}
    </group>
  );
}

function FanSystem({ active }: { active: boolean }) {
  const blades1Ref = useRef<THREE.Group>(null);
  const blades2Ref = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (active) {
      if (blades1Ref.current) blades1Ref.current.rotation.z += delta * 10;
      if (blades2Ref.current) blades2Ref.current.rotation.z += delta * 8;
    }
  });

  return (
    <group>
      {[{ x: -1.5, ref: blades1Ref }, { x: 1.5, ref: blades2Ref }].map(({ x, ref }, idx) => (
        <group key={idx} position={[x, 3.2, -5.9]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.55, 0.06, 8, 24]} />
            <meshStandardMaterial color="#555" metalness={0.7} roughness={0.3} />
          </mesh>
          <mesh position={[0, 0, 0.05]}>
            <cylinderGeometry args={[0.1, 0.1, 0.1, 12]} />
            <meshStandardMaterial color={active ? '#16a34a' : '#777'} metalness={0.6} />
          </mesh>
          <group ref={ref} rotation={[Math.PI / 2, 0, 0]}>
            {[0, 1, 2, 3, 4].map((b) => (
              <mesh key={b} rotation={[0, 0, (b * Math.PI * 2) / 5]} position={[0, 0, 0.02]}>
                <boxGeometry args={[0.8, 0.12, 0.02]} />
                <meshStandardMaterial color={active ? '#22c55e' : '#94a3b8'} metalness={0.4} />
              </mesh>
            ))}
          </group>
          {active && <pointLight position={[0, 0, 0.3]} intensity={0.15} color="#22c55e" distance={3} />}
        </group>
      ))}
    </group>
  );
}

function WaterTank({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.75, 0]} castShadow>
        <cylinderGeometry args={[0.5, 0.5, 1.5, 16]} />
        <meshStandardMaterial color="#1e40af" roughness={0.4} metalness={0.3} />
      </mesh>
      <mesh position={[0, -0.1, 0]}>
        <boxGeometry args={[0.8, 0.2, 0.8]} />
        <meshStandardMaterial color="#555" metalness={0.7} />
      </mesh>
      <mesh position={[0.52, 0.6, 0]}>
        <boxGeometry args={[0.04, 1, 0.04]} />
        <meshStandardMaterial color="#38bdf8" transparent opacity={0.6} />
      </mesh>
    </group>
  );
}

function SolarPanel() {
  return (
    <group position={[-4, 2.8, -5]}>
      <mesh rotation={[0.5, 0, 0]} castShadow>
        <boxGeometry args={[2.5, 0.05, 1.5]} />
        <meshStandardMaterial color="#1a237e" metalness={0.8} roughness={0.2} />
      </mesh>
      {Array.from({ length: 4 }).map((_, i) => (
        <mesh key={i} rotation={[0.5, 0, 0]} position={[-0.8 + i * 0.55, 0.03, 0]}>
          <boxGeometry args={[0.02, 0.001, 1.4]} />
          <meshStandardMaterial color="#334155" />
        </mesh>
      ))}
      <mesh rotation={[0.5, 0, 0]} position={[0, 0.03, 0]}>
        <boxGeometry args={[2.6, 0.02, 1.6]} />
        <meshStandardMaterial color="#aaa" metalness={0.9} roughness={0.2} />
      </mesh>
      <mesh position={[0, 1.2, -0.3]}>
        <cylinderGeometry args={[0.05, 0.05, 2.4, 8]} />
        <meshStandardMaterial color="#777" metalness={0.8} />
      </mesh>
    </group>
  );
}

function IoTBox() {
  const screenRef = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!screenRef.current) return;
    (screenRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.3 + Math.sin(clock.getElapsedTime() * 2) * 0.15;
  });
  return (
    <group position={[4.5, 1, 5]}>
      <mesh castShadow>
        <boxGeometry args={[0.6, 0.8, 0.3]} />
        <meshStandardMaterial color="#f5f5f5" roughness={0.5} />
      </mesh>
      <mesh ref={screenRef} position={[0, 0.05, 0.16]}>
        <boxGeometry args={[0.4, 0.3, 0.01]} />
        <meshStandardMaterial color="#00ff88" emissive="#00ff88" emissiveIntensity={0.3} />
      </mesh>
      {[-0.15, -0.05, 0.05, 0.15].map((x, i) => (
        <mesh key={i} position={[x, -0.2, 0.16]}>
          <sphereGeometry args={[0.02, 6, 6]} />
          <meshStandardMaterial color={i % 2 === 0 ? '#00ff88' : '#00b4ff'} emissive={i % 2 === 0 ? '#00ff88' : '#00b4ff'} emissiveIntensity={0.5} />
        </mesh>
      ))}
      <mesh position={[0, -0.6, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 0.4, 8]} />
        <meshStandardMaterial color="#555" metalness={0.7} />
      </mesh>
    </group>
  );
}

function IPCamera() {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => { if (ref.current) ref.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.3) * 0.5; });
  return (
    <group position={[2.8, 4, 5.5]}>
      <mesh position={[0, 0.2, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 0.4, 8]} />
        <meshStandardMaterial color="#555" metalness={0.7} />
      </mesh>
      <group ref={ref}>
        <mesh>
          <boxGeometry args={[0.2, 0.15, 0.3]} />
          <meshStandardMaterial color="#333" metalness={0.6} />
        </mesh>
        <mesh position={[0, 0, 0.16]}>
          <cylinderGeometry args={[0.05, 0.04, 0.05, 12]} />
          <meshStandardMaterial color="#111" metalness={0.8} />
        </mesh>
        <mesh position={[0.06, 0.04, 0.15]}>
          <sphereGeometry args={[0.015, 6, 6]} />
          <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={0.3} />
        </mesh>
      </group>
    </group>
  );
}

function ShadeCurtain({ level }: { level: number }) {
  const targetY = useRef(4.2);
  const currentYRef = useRef(4.2);
  const meshRef = useRef<THREE.Mesh>(null);
  const deployedY = 2.5;
  const retractedY = 4.2;
  targetY.current = retractedY - (level / 100) * (retractedY - deployedY);

  useFrame(() => {
    if (!meshRef.current) return;
    currentYRef.current += (targetY.current - currentYRef.current) * 0.05;
    meshRef.current.position.y = currentYRef.current;
    meshRef.current.scale.y = 0.05 + (level / 100) * 1.8;
    (meshRef.current.material as THREE.MeshStandardMaterial).opacity = 0.1 + (level / 100) * 0.5;
  });

  return (
    <mesh ref={meshRef} position={[0, retractedY, 0]}>
      <boxGeometry args={[5.6, 1, 11.5]} />
      <meshStandardMaterial color="#fbbf24" transparent opacity={0.1} roughness={0.6} side={THREE.DoubleSide} />
    </mesh>
  );
}

function Scene3D({ systems }: { systems: { drip: boolean; fog: boolean; sprinkler: boolean; fan: boolean; shadeLevel: number } }) {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 15, 8]} intensity={0.8} castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048} />
      <pointLight position={[0, 3, 0]} intensity={0.2} color="#00ff88" />
      <hemisphereLight intensity={0.3} color="#87ceeb" groundColor="#c5d4a0" />
      <Ground />
      <GreenhouseFrame />
      <Plants />
      <DripSystem active={systems.drip} />
      <FogSystem active={systems.fog} />
      <SprinklerSystem active={systems.sprinkler} />
      <FanSystem active={systems.fan} />
      <ShadeCurtain level={systems.shadeLevel} />
      <WaterTank position={[-4.5, 0, 5]} />
      <WaterTank position={[4.5, 0, -5]} />
      <SolarPanel />
      <IoTBox />
      <IPCamera />
    </>
  );
}

function Greenhouse3D({ systems }: { systems: { drip: boolean; fog: boolean; sprinkler: boolean; fan: boolean; shadeLevel: number } }) {
  return (
    <div className="w-full h-[500px] rounded-xl overflow-hidden" style={{ boxShadow: '0 16px 40px rgba(0, 255, 136, 0.15)' }}>
      <Canvas shadows>
        <PerspectiveCamera makeDefault position={[10, 8, 14]} fov={50} />
        <OrbitControls enablePan enableZoom enableRotate minDistance={5} maxDistance={40} target={[0, 2, 0]} />
        <Scene3D systems={systems} />
      </Canvas>
    </div>
  );
}

// =====================================================================
// MAIN PAGE
// =====================================================================
export default function Index() {
  const [clock, setClock] = useState('00:00:00');
  const [systems, setSystems] = useState({ drip: true, fog: false, sprinkler: false, fan: true, autoShade: true });
  const [shadeLevel, setShadeLevel] = useState(45);
  const [sensorData, setSensorData] = useState({ temp: 26.3, humidity: 68, lux: 42800, dripFlow: 2.4, fogPressure: 0, sprinklerCoverage: 0, fanRpm: 1240 });

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setClock(`${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

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

      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
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

        <FeaturesSection />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-7">
          {/* IRRIGATION */}
          <section className="anim-in delay-2">
            <div className="section-header">
              <div className="w-2.5 h-2.5 rounded-full bg-neon-blue pulse-dot-anim" />
              <h2 className="text-base font-bold tracking-tight">Irrigation Control</h2>
            </div>
            <div className="premium-card-blue mb-5">
              <div className="flex items-start justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="icon-box icon-box-blue"><Droplets className="w-5 h-5 text-secondary" /></div>
                  <div><p className="data-label">Water Drip</p><StatusBadge active={systems.drip} /></div>
                </div>
                <ToggleSwitch active={systems.drip} onToggle={() => toggle('drip')} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><p className="data-label">Flow Rate</p><p className="data-value">{sensorData.dripFlow}</p><p className="data-unit">L/min</p></div>
                <div><p className="data-label">Active Zone</p><p className="data-value text-3xl">A-3</p><p className="data-unit">Zone</p></div>
              </div>
            </div>
            <div className="premium-card mb-5">
              <div className="flex items-start justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="icon-box" style={{ background: 'rgba(100,116,139,0.15)' }}><CloudRain className="w-5 h-5 text-muted-foreground" /></div>
                  <div><p className="data-label">Fogging System</p><StatusBadge active={systems.fog} /></div>
                </div>
                <ToggleSwitch active={systems.fog} onToggle={() => toggle('fog')} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><p className="data-label">Pressure</p><p className="data-value text-3xl">{sensorData.fogPressure}</p><p className="data-unit">Bar</p></div>
                <div><p className="data-label">Humidity</p><p className="data-value text-3xl">{systems.fog ? sensorData.humidity : '--'}</p><p className="data-unit">%</p></div>
              </div>
            </div>
            <div className="premium-card">
              <div className="flex items-start justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="icon-box" style={{ background: 'rgba(100,116,139,0.15)' }}><Wind className="w-5 h-5 text-muted-foreground" /></div>
                  <div><p className="data-label">Sprinkler</p><StatusBadge active={systems.sprinkler} activeText="Active" inactiveText="Off" /></div>
                </div>
                <ToggleSwitch active={systems.sprinkler} onToggle={() => toggle('sprinkler')} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><p className="data-label">Coverage</p><p className="data-value text-3xl">{sensorData.sprinklerCoverage}</p><p className="data-unit">%</p></div>
                <div><p className="data-label">Next Cycle</p><p className="data-value text-2xl">14:00</p><p className="data-unit">Scheduled</p></div>
              </div>
            </div>
          </section>

          {/* CLIMATE */}
          <section className="anim-in delay-3">
            <div className="section-header">
              <div className="w-2.5 h-2.5 rounded-full bg-neon-green pulse-dot-anim" />
              <h2 className="text-base font-bold tracking-tight">Climate Monitoring</h2>
            </div>
            <div className="premium-card-green mb-5">
              <p className="data-label mb-4">Temperature</p>
              <GaugeWidget value={sensorData.temp} max={45} unit="°C" variant="green" />
              <div className="flex justify-between text-xs text-muted-foreground px-2">
                <span>Min: <span className="font-fira font-semibold text-foreground">22.1°</span></span>
                <span>Max: <span className="font-fira font-semibold text-foreground">31.8°</span></span>
              </div>
            </div>
            <div className="premium-card-blue mb-5">
              <p className="data-label mb-4">Humidity Level</p>
              <GaugeWidget value={sensorData.humidity} max={100} unit="% RH" variant="blue" />
              <div className="flex justify-between items-center text-xs px-2">
                <span className="text-muted-foreground">Target: <span className="font-fira font-semibold">65–75%</span></span>
                <StatusBadge active={sensorData.humidity >= 60 && sensorData.humidity <= 80} activeText="Optimal" inactiveText="Warning" />
              </div>
            </div>
            <div className="premium-card">
              <div className="flex items-start justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="icon-box icon-box-green"><Fan className="w-5 h-5 text-green-600" /></div>
                  <div><p className="data-label">Evap Fan</p><StatusBadge active={systems.fan} activeText="Running" inactiveText="Stopped" /></div>
                </div>
                <ToggleSwitch active={systems.fan} onToggle={() => toggle('fan')} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><p className="data-label">Fan Speed</p><p className="data-value text-3xl">{sensorData.fanRpm}</p><p className="data-unit">RPM</p></div>
                <div><p className="data-label">Power</p><p className="data-value text-2xl">24.8</p><p className="data-unit">W</p></div>
              </div>
            </div>
          </section>

          {/* SHADING */}
          <section className="anim-in delay-4">
            <div className="section-header">
              <Sun className="w-4 h-4 grad-text" />
              <h2 className="text-base font-bold tracking-tight">Smart Shading System</h2>
            </div>
            <div className="premium-card-green mb-5">
              <div className="flex items-center justify-between mb-3">
                <p className="data-label">Light Intensity</p>
                <span className="font-fira text-sm font-bold">{sensorData.lux.toLocaleString()}</span>
              </div>
              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${luxPercent}%` }} />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground mb-5 mt-2">
                <span>0 lux</span><span>63,000 lux</span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="stat-mini-box"><p className="data-label text-[10px]">UV</p><p className="font-fira font-bold text-sm">6.2</p><p className="text-[10px] text-muted-foreground">idx</p></div>
                <div className="stat-mini-box"><p className="data-label text-[10px]">PAR</p><p className="font-fira font-bold text-sm">820</p><p className="text-[10px] text-muted-foreground">µmol</p></div>
                <div className="stat-mini-box"><p className="data-label text-[10px]">DLI</p><p className="font-fira font-bold text-sm">28.4</p><p className="text-[10px] text-muted-foreground">mol</p></div>
              </div>
            </div>
            <div className="premium-card mb-5">
              <div className="flex items-center justify-between mb-4">
                <p className="data-label">Shade Deployment</p>
                <span className="font-fira text-lg font-bold text-secondary">{shadeLevel}%</span>
              </div>
              <input type="range" min={0} max={100} value={shadeLevel} onChange={(e) => setShadeLevel(Number(e.target.value))} className="w-full h-2 rounded-full appearance-none cursor-pointer bg-muted accent-secondary" />
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>0% Open</span><span>100% Closed</span>
              </div>
            </div>
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
