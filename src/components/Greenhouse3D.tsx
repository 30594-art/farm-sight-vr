import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';

interface GreenhouseProps {
  systems: {
    drip: boolean;
    fog: boolean;
    sprinkler: boolean;
    fan: boolean;
    shadeLevel: number;
  };
}

/* ========== GROUND ========== */
function Ground() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
      <planeGeometry args={[40, 40]} />
      <meshStandardMaterial color="#c5d4a0" roughness={0.9} />
    </mesh>
  );
}

/* ========== GREENHOUSE FRAME ========== */
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

  const extrudeSettings = useMemo(() => ({
    steps: 1,
    depth: length,
    bevelEnabled: false,
  }), []);

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

/* ========== PLANTS ========== */
function Plants() {
  const plants = useMemo(() => {
    const arr: { x: number; z: number; scale: number }[] = [];
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 10; col++) {
        arr.push({
          x: -1.8 + row * 1.2,
          z: -5 + col * 1.1,
          scale: 0.6 + Math.random() * 0.4,
        });
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

/* ========== DRIP SYSTEM — animated water droplets ========== */
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
      {/* Main pipe along greenhouse length */}
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.05, 0.05, 11, 8]} />
        <meshStandardMaterial color={active ? '#0284c7' : '#94a3b8'} metalness={0.6} />
      </mesh>

      {/* Branch pipes to each row */}
      {[-1.8, -0.6, 0.6, 1.8].map((x, ri) => (
        <group key={`branch-${ri}`}>
          <mesh position={[x, -0.15, 0]}>
            <cylinderGeometry args={[0.02, 0.02, 0.3, 6]} />
            <meshStandardMaterial color={active ? '#0ea5e9' : '#94a3b8'} />
          </mesh>
          {/* Drip emitters along each row */}
          {Array.from({ length: 8 }).map((_, ci) => (
            <group key={`emitter-${ri}-${ci}`} position={[x, -0.3, -4 + ci * 1.1]}>
              <mesh>
                <cylinderGeometry args={[0.015, 0.015, 0.15, 6]} />
                <meshStandardMaterial color={active ? '#0ea5e9' : '#94a3b8'} />
              </mesh>
              {/* Animated water drops */}
              {active && (
                <WaterDroplet
                  position={[0, -0.1, 0]}
                  delay={ri * 0.3 + ci * 0.15}
                />
              )}
            </group>
          ))}
        </group>
      ))}

      {/* Glow indicator when active */}
      {active && (
        <pointLight position={[0, -0.5, 0]} intensity={0.2} color="#00b4ff" distance={5} />
      )}
    </group>
  );
}

/* ========== FOG SYSTEM — animated fog particles ========== */
function FogParticle({ basePos, delay }: { basePos: [number, number, number]; delay: number }) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = ((clock.getElapsedTime() * 0.5 + delay) % 3) / 3;
    ref.current.position.y = basePos[1] + t * 2;
    ref.current.position.x = basePos[0] + Math.sin(clock.getElapsedTime() + delay) * 0.5;
    ref.current.position.z = basePos[2] + Math.cos(clock.getElapsedTime() * 0.7 + delay) * 0.3;
    const scale = 0.3 + t * 1.2;
    ref.current.scale.setScalar(scale);
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
      arr.push([
        (Math.random() - 0.5) * 5,
        1.5 + Math.random() * 1,
        (Math.random() - 0.5) * 10,
      ]);
    }
    return arr;
  }, []);

  return (
    <group>
      {/* Fog nozzles on roof */}
      {[-2, 0, 2].map((x, i) => (
        <group key={`nozzle-${i}`} position={[x, 3.8, 0]}>
          <mesh>
            <cylinderGeometry args={[0.06, 0.04, 0.2, 8]} />
            <meshStandardMaterial color={active ? '#0ea5e9' : '#777'} metalness={0.6} />
          </mesh>
        </group>
      ))}

      {/* Animated fog cloud */}
      {active && fogPositions.map((pos, i) => (
        <FogParticle key={i} basePos={pos} delay={i * 0.5} />
      ))}

      {/* Fog ambient glow */}
      {active && (
        <pointLight position={[0, 2.5, 0]} intensity={0.15} color="#87ceeb" distance={8} />
      )}
    </group>
  );
}

/* ========== SPRINKLER SYSTEM — animated water spray ========== */
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

function SprinklerSystem({ active }: { active: boolean }) {
  const sprinklerPositions: [number, number, number][] = [
    [-2, 0.5, -3],
    [0, 0.5, 0],
    [2, 0.5, 3],
  ];

  return (
    <group>
      {sprinklerPositions.map((pos, si) => (
        <group key={`sprinkler-${si}`} position={pos}>
          {/* Sprinkler post */}
          <mesh position={[0, -0.15, 0]}>
            <cylinderGeometry args={[0.03, 0.04, 0.5, 8]} />
            <meshStandardMaterial color={active ? '#0284c7' : '#64748b'} metalness={0.5} />
          </mesh>
          {/* Sprinkler head */}
          <mesh position={[0, 0.1, 0]}>
            <sphereGeometry args={[0.1, 8, 8]} />
            <meshStandardMaterial color={active ? '#0ea5e9' : '#94a3b8'} metalness={0.5} />
          </mesh>
          {/* Rotating head indicator */}
          {active && (
            <SpinningHead position={[0, 0.15, 0]} />
          )}
          {/* Spray particles */}
          {active && Array.from({ length: 8 }).map((_, pi) => (
            <SprayParticle
              key={pi}
              origin={[0, 0.2, 0]}
              angle={(pi / 8) * Math.PI * 2}
              delay={si * 0.3 + pi * 0.12}
            />
          ))}
        </group>
      ))}
    </group>
  );
}

function SpinningHead({ position }: { position: [number, number, number] }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 4;
  });
  return (
    <mesh ref={ref} position={position}>
      <boxGeometry args={[0.2, 0.02, 0.02]} />
      <meshStandardMaterial color="#38bdf8" />
    </mesh>
  );
}

/* ========== FAN SYSTEM — dual fans with spinning blades ========== */
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
      {[
        { x: -1.5, ref: blades1Ref },
        { x: 1.5, ref: blades2Ref },
      ].map(({ x, ref }, idx) => (
        <group key={idx} position={[x, 3.2, -5.9]}>
          {/* Housing ring */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.55, 0.06, 8, 24]} />
            <meshStandardMaterial color="#555" metalness={0.7} roughness={0.3} />
          </mesh>
          {/* Center hub */}
          <mesh position={[0, 0, 0.05]}>
            <cylinderGeometry args={[0.1, 0.1, 0.1, 12]} />
            <meshStandardMaterial color={active ? '#16a34a' : '#777'} metalness={0.6} />
          </mesh>
          {/* Blades */}
          <group ref={ref} rotation={[Math.PI / 2, 0, 0]}>
            {[0, 1, 2, 3, 4].map((b) => (
              <mesh key={b} rotation={[0, 0, (b * Math.PI * 2) / 5]} position={[0, 0, 0.02]}>
                <boxGeometry args={[0.8, 0.12, 0.02]} />
                <meshStandardMaterial
                  color={active ? '#22c55e' : '#94a3b8'}
                  metalness={0.4}
                />
              </mesh>
            ))}
          </group>
          {/* Active glow */}
          {active && (
            <pointLight position={[0, 0, 0.3]} intensity={0.15} color="#22c55e" distance={3} />
          )}
        </group>
      ))}
    </group>
  );
}

/* ========== WATER TANKS ========== */
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
      {/* Water level indicator */}
      <mesh position={[0.52, 0.6, 0]}>
        <boxGeometry args={[0.04, 1, 0.04]} />
        <meshStandardMaterial color="#38bdf8" transparent opacity={0.6} />
      </mesh>
    </group>
  );
}

/* ========== SOLAR PANEL ========== */
function SolarPanel() {
  return (
    <group position={[-4, 2.8, -5]}>
      <mesh rotation={[0.5, 0, 0]} castShadow>
        <boxGeometry args={[2.5, 0.05, 1.5]} />
        <meshStandardMaterial color="#1a237e" metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Grid lines on panel */}
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

/* ========== IoT CONTROL BOX ========== */
function IoTBox() {
  const screenRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!screenRef.current) return;
    const mat = screenRef.current.material as THREE.MeshStandardMaterial;
    mat.emissiveIntensity = 0.3 + Math.sin(clock.getElapsedTime() * 2) * 0.15;
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
      {/* LEDs */}
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

/* ========== IP CAMERA ========== */
function IPCamera() {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.3) * 0.5;
    }
  });

  return (
    <group position={[2.8, 4, 5.5]}>
      {/* Mount */}
      <mesh position={[0, 0.2, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 0.4, 8]} />
        <meshStandardMaterial color="#555" metalness={0.7} />
      </mesh>
      {/* Camera body — panning */}
      <group ref={ref}>
        <mesh>
          <boxGeometry args={[0.2, 0.15, 0.3]} />
          <meshStandardMaterial color="#333" metalness={0.6} />
        </mesh>
        {/* Lens */}
        <mesh position={[0, 0, 0.16]}>
          <cylinderGeometry args={[0.05, 0.04, 0.05, 12]} />
          <meshStandardMaterial color="#111" metalness={0.8} />
        </mesh>
        {/* IR LED */}
        <mesh position={[0.06, 0.04, 0.15]}>
          <sphereGeometry args={[0.015, 6, 6]} />
          <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={0.3} />
        </mesh>
      </group>
    </group>
  );
}

/* ========== SHADE CURTAIN ========== */
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
    const scaleY = 0.05 + (level / 100) * 1.8;
    meshRef.current.scale.y = scaleY;
    const mat = meshRef.current.material as THREE.MeshStandardMaterial;
    mat.opacity = 0.1 + (level / 100) * 0.5;
  });

  return (
    <mesh ref={meshRef} position={[0, retractedY, 0]}>
      <boxGeometry args={[5.6, 1, 11.5]} />
      <meshStandardMaterial
        color="#fbbf24"
        transparent
        opacity={0.1}
        roughness={0.6}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

/* ========== SCENE ========== */
function Scene({ systems }: GreenhouseProps) {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight
        position={[10, 15, 8]}
        intensity={0.8}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
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

/* ========== MAIN EXPORT ========== */
export default function Greenhouse3D({ systems }: GreenhouseProps) {
  return (
    <div className="w-full h-[500px] rounded-xl overflow-hidden" style={{ boxShadow: '0 16px 40px rgba(0, 255, 136, 0.15)' }}>
      <Canvas shadows>
        <PerspectiveCamera makeDefault position={[10, 8, 14]} fov={50} />
        <OrbitControls
          enablePan
          enableZoom
          enableRotate
          minDistance={5}
          maxDistance={40}
          target={[0, 2, 0]}
        />
        <Scene systems={systems} />
      </Canvas>
    </div>
  );
}
