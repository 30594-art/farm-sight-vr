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

  // Create roof shape (triangular cross-section)
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
      {/* Metal frame posts */}
      {[-width / 2, width / 2].map((x) =>
        [0, length * 0.25, length * 0.5, length * 0.75, length].map((z, i) => (
          <mesh key={`post-${x}-${i}`} position={[x, wallHeight / 2, z - length / 2]} castShadow>
            <boxGeometry args={[0.08, wallHeight, 0.08]} />
            <meshStandardMaterial color="#888888" metalness={0.8} roughness={0.3} />
          </mesh>
        ))
      )}

      {/* Side walls - transparent plastic/glass */}
      {[-width / 2, width / 2].map((x, idx) => (
        <mesh key={`wall-${idx}`} position={[x, wallHeight / 2, 0]} castShadow>
          <boxGeometry args={[0.05, wallHeight, length]} />
          <meshStandardMaterial color="#b0d4f1" transparent opacity={0.25} roughness={0.1} />
        </mesh>
      ))}

      {/* End walls */}
      {[-length / 2, length / 2].map((z, idx) => (
        <mesh key={`endwall-${idx}`} position={[0, wallHeight / 2, z]} castShadow>
          <boxGeometry args={[width, wallHeight, 0.05]} />
          <meshStandardMaterial color="#b0d4f1" transparent opacity={0.2} roughness={0.1} />
        </mesh>
      ))}

      {/* Roof - extruded triangle */}
      <mesh position={[0, 0, -length / 2]} castShadow>
        <extrudeGeometry args={[roofShape, extrudeSettings]} />
        <meshStandardMaterial color="#e8f4fd" transparent opacity={0.35} roughness={0.1} side={THREE.DoubleSide} />
      </mesh>

      {/* Roof ridge beam */}
      <mesh position={[0, roofPeak, 0]} castShadow>
        <boxGeometry args={[0.06, 0.06, length]} />
        <meshStandardMaterial color="#666666" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* Roof cross beams */}
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
      {/* Raised beds */}
      {[-1.8, -0.6, 0.6, 1.8].map((x, i) => (
        <mesh key={`bed-${i}`} position={[x, 0.15, 0]} receiveShadow>
          <boxGeometry args={[0.8, 0.3, 10.5]} />
          <meshStandardMaterial color="#5a3825" roughness={0.9} />
        </mesh>
      ))}

      {/* Plant stems + leaves */}
      {plants.map((p, i) => (
        <group key={`plant-${i}`} position={[p.x, 0.3, p.z]}>
          {/* Stem */}
          <mesh position={[0, p.scale * 0.3, 0]}>
            <cylinderGeometry args={[0.02, 0.03, p.scale * 0.6, 6]} />
            <meshStandardMaterial color="#3d7a3a" />
          </mesh>
          {/* Leaves */}
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

function DripSystem({ active }: { active: boolean }) {
  const ref = useRef<THREE.Group>(null);

  return (
    <group ref={ref} position={[0, 2.3, 0]}>
      {/* Main pipe */}
      <mesh>
        <cylinderGeometry args={[0.04, 0.04, 11, 8]} />
        <meshStandardMaterial color={active ? '#0284c7' : '#94a3b8'} metalness={0.6} />
      </mesh>
      {/* Drip lines */}
      {Array.from({ length: 10 }).map((_, i) => (
        <group key={i} position={[0, 0, -5 + i * 1.1]}>
          <mesh position={[0, -0.15, 0]}>
            <cylinderGeometry args={[0.015, 0.015, 0.3, 6]} />
            <meshStandardMaterial color={active ? '#0ea5e9' : '#94a3b8'} />
          </mesh>
          {active && (
            <mesh position={[0, -0.35, 0]}>
              <sphereGeometry args={[0.04, 6, 6]} />
              <meshStandardMaterial color="#38bdf8" transparent opacity={0.7} />
            </mesh>
          )}
        </group>
      ))}
    </group>
  );
}

function FanSystem({ active }: { active: boolean }) {
  const bladesRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (bladesRef.current && active) {
      bladesRef.current.rotation.z += delta * 8;
    }
  });

  return (
    <group>
      {/* Two fans on one end wall */}
      {[-1.5, 1.5].map((x, idx) => (
        <group key={idx} position={[x, 3.2, -5.9]}>
          {/* Housing */}
          <mesh>
            <cylinderGeometry args={[0.6, 0.6, 0.15, 16]} />
            <meshStandardMaterial color="#555" metalness={0.7} roughness={0.3} />
          </mesh>
          {/* Blades */}
          <group ref={idx === 0 ? bladesRef : undefined} rotation={[Math.PI / 2, 0, 0]}>
            {[0, 1, 2, 3].map((b) => (
              <mesh key={b} rotation={[0, 0, (b * Math.PI) / 2]} position={[0, 0, 0.02]}>
                <boxGeometry args={[0.9, 0.15, 0.02]} />
                <meshStandardMaterial color={active ? '#22c55e' : '#94a3b8'} metalness={0.4} />
              </mesh>
            ))}
          </group>
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
      {/* Stand */}
      <mesh position={[0, -0.1, 0]}>
        <boxGeometry args={[0.8, 0.2, 0.8]} />
        <meshStandardMaterial color="#555" metalness={0.7} />
      </mesh>
    </group>
  );
}

function SolarPanel() {
  return (
    <group position={[-4, 2.8, -5]}>
      {/* Panel */}
      <mesh rotation={[0.5, 0, 0]} castShadow>
        <boxGeometry args={[2.5, 0.05, 1.5]} />
        <meshStandardMaterial color="#1a237e" metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Frame */}
      <mesh rotation={[0.5, 0, 0]} position={[0, 0.03, 0]}>
        <boxGeometry args={[2.6, 0.02, 1.6]} />
        <meshStandardMaterial color="#aaa" metalness={0.9} roughness={0.2} />
      </mesh>
      {/* Pole */}
      <mesh position={[0, 1.2, -0.3]}>
        <cylinderGeometry args={[0.05, 0.05, 2.4, 8]} />
        <meshStandardMaterial color="#777" metalness={0.8} />
      </mesh>
    </group>
  );
}

function IoTBox() {
  return (
    <group position={[4.5, 1, 5]}>
      <mesh castShadow>
        <boxGeometry args={[0.6, 0.8, 0.3]} />
        <meshStandardMaterial color="#f5f5f5" roughness={0.5} />
      </mesh>
      {/* Screen */}
      <mesh position={[0, 0.05, 0.16]}>
        <boxGeometry args={[0.4, 0.3, 0.01]} />
        <meshStandardMaterial color="#00ff88" emissive="#00ff88" emissiveIntensity={0.3} />
      </mesh>
      {/* Stand */}
      <mesh position={[0, -0.6, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 0.4, 8]} />
        <meshStandardMaterial color="#555" metalness={0.7} />
      </mesh>
    </group>
  );
}

function ShadeCurtain({ level }: { level: number }) {
  const deployedY = 3.8;
  const retractedY = 4.2;
  const currentY = retractedY - (level / 100) * (retractedY - (deployedY - 1.5));
  const scaleY = 0.1 + (level / 100) * 0.9;

  return (
    <mesh position={[0, currentY, 0]}>
      <boxGeometry args={[5.6, scaleY * 2, 11.5]} />
      <meshStandardMaterial
        color="#fbbf24"
        transparent
        opacity={0.15 + (level / 100) * 0.4}
        roughness={0.6}
      />
    </mesh>
  );
}

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
      <pointLight position={[0, 3, 0]} intensity={0.3} color="#00ff88" />

      <Ground />
      <GreenhouseFrame />
      <Plants />
      <DripSystem active={systems.drip} />
      <FanSystem active={systems.fan} />
      <ShadeCurtain level={systems.shadeLevel} />
      <WaterTank position={[-4.5, 0, 5]} />
      <WaterTank position={[4.5, 0, -5]} />
      <SolarPanel />
      <IoTBox />
    </>
  );
}

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
