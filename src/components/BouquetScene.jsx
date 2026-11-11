import { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import data from '../data/builderData.json';

// ---------- Общие константы и геометрии (создаются один раз) ----------
const FOCUS = new THREE.Vector3(0, -1.3, 0); // точка, где сходятся все стебли
const UP = new THREE.Vector3(0, 1, 0);
const tmp = new THREE.Vector3();
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));

const sphereGeo = new THREE.SphereGeometry(1, 24, 18);
const coneGeo = new THREE.ConeGeometry(1, 1, 16);
const stemGeo = new THREE.CylinderGeometry(0.014, 0.014, 1, 6);

const shade = (color, factor) =>
  `#${new THREE.Color(color).multiplyScalar(factor).getHexString()}`;

// ---------- Раскладка цветов «куполом» (спираль подсолнуха) ----------
const slotPosition = (i) => {
  const r = 0.2 * Math.sqrt(i + 0.35);
  const angle = i * GOLDEN_ANGLE;
  return new THREE.Vector3(r * Math.cos(angle), 1.05 - 0.25 * r * r, r * Math.sin(angle));
};

// Цветы разных видов чередуются, чтобы букет выглядел «перемешанным»
const buildInstances = (selected) => {
  const kinds = data.flowers.filter((f) => selected[f.id]);
  const maxCount = Math.max(0, ...kinds.map((f) => selected[f.id]));
  const list = [];

  for (let k = 0; k < maxCount; k++) {
    for (const flower of kinds) {
      if (selected[flower.id] > k) list.push({ key: `${flower.id}-${k}`, flower });
    }
  }
  return list.map((item, i) => ({ ...item, target: slotPosition(i) }));
};

// ---------- Бутоны разных видов ----------
const Head = ({ kind, color }) => {
  switch (kind) {
    case 'rose':
      return (
        <group>
          <mesh geometry={sphereGeo} scale={[0.17, 0.16, 0.17]}>
            <meshStandardMaterial color={shade(color, 0.8)} roughness={0.55} />
          </mesh>
          {Array.from({ length: 6 }, (_, i) => {
            const a = (i / 6) * Math.PI * 2;
            return (
              <mesh
                key={i}
                geometry={sphereGeo}
                scale={[0.06, 0.15, 0.11]}
                position={[Math.cos(a) * 0.14, 0.03, Math.sin(a) * 0.14]}
                rotation={[0, -a, 0]}
              >
                <meshStandardMaterial color={color} roughness={0.5} />
              </mesh>
            );
          })}
          <mesh geometry={sphereGeo} scale={[0.09, 0.1, 0.09]} position={[0, 0.1, 0]}>
            <meshStandardMaterial color={shade(color, 0.6)} roughness={0.6} />
          </mesh>
        </group>
      );

    case 'tulip':
      return (
        <group>
          <mesh geometry={sphereGeo} scale={[0.13, 0.24, 0.13]} position={[0, 0.08, 0]}>
            <meshStandardMaterial color={color} roughness={0.5} />
          </mesh>
          <mesh geometry={coneGeo} scale={[0.09, 0.14, 0.09]} position={[0, 0.3, 0]}>
            <meshStandardMaterial color={shade(color, 0.93)} roughness={0.5} />
          </mesh>
        </group>
      );

    case 'peony':
      return (
        <group>
          {Array.from({ length: 6 }, (_, i) => {
            const a = (i / 6) * Math.PI * 2;
            return (
              <mesh key={i} geometry={sphereGeo} scale={0.13} position={[Math.cos(a) * 0.13, 0, Math.sin(a) * 0.13]}>
                <meshStandardMaterial color={color} roughness={0.65} />
              </mesh>
            );
          })}
          <mesh geometry={sphereGeo} scale={0.14} position={[0, 0.06, 0]}>
            <meshStandardMaterial color={shade(color, 0.9)} roughness={0.65} />
          </mesh>
          <mesh geometry={sphereGeo} scale={0.07} position={[0, 0.15, 0]}>
            <meshStandardMaterial color="#f7d36b" roughness={0.7} />
          </mesh>
        </group>
      );

    case 'leaf':
      return (
        <group>
          {Array.from({ length: 6 }, (_, i) => {
            const side = i % 2 ? 1 : -1;
            return (
              <mesh
                key={i}
                geometry={sphereGeo}
                scale={[0.11, 0.018, 0.07]}
                position={[side * 0.09, -0.05 + i * 0.07, 0]}
                rotation={[0, 0, -side * 0.5]}
              >
                <meshStandardMaterial color={color} roughness={0.8} />
              </mesh>
            );
          })}
          <mesh geometry={sphereGeo} scale={[0.04, 0.1, 0.02]} position={[0, 0.4, 0]}>
            <meshStandardMaterial color={color} roughness={0.8} />
          </mesh>
        </group>
      );

    default:
      return (
        <mesh geometry={sphereGeo} scale={0.15}>
          <meshStandardMaterial color={color} />
        </mesh>
      );
  }
};

// ---------- Один цветок: стебель + бутон, плавно «прилетает» на своё место ----------
const Flower = ({ flower, target }) => {
  const group = useRef();
  const stem = useRef();
  const head = useRef();
  const pos = useRef(new THREE.Vector3(0, FOCUS.y + 0.4, 0));
  const grow = useRef(0);

  useFrame((_, delta) => {
    const k = 1 - Math.exp(-delta * 8);
    pos.current.lerp(target, k);
    grow.current += (1 - grow.current) * k;

    tmp.copy(pos.current).sub(FOCUS);
    const len = tmp.length();
    tmp.normalize();

    group.current.quaternion.setFromUnitVectors(UP, tmp);
    stem.current.scale.y = len;
    stem.current.position.y = len / 2;
    head.current.position.y = len;
    head.current.scale.setScalar(grow.current);
  });

  return (
    <group ref={group} position={FOCUS}>
      <mesh ref={stem} geometry={stemGeo}>
        <meshStandardMaterial color={flower.kind === 'leaf' ? '#6f8f72' : '#4f7d3a'} roughness={0.8} />
      </mesh>
      <group ref={head}>
        <group scale={1.3}>
          <Head kind={flower.kind} color={flower.color} />
        </group>
      </group>
    </group>
  );
};

// ---------- Упаковка ----------
const Wrapper = ({ wrapper }) => {
  if (!wrapper) return null;
  const transparent = wrapper.opacity < 1;

  return (
    <group>
      {/* Конус-упаковка: от y = -1.3 до y = 0.35 */}
      <mesh position={[0, -0.475, 0]}>
        <cylinderGeometry args={[1.05, 0.1, 1.65, 56, 1, true]} />
        <meshStandardMaterial
          color={wrapper.color}
          side={THREE.DoubleSide}
          transparent={transparent}
          opacity={wrapper.opacity}
          depthWrite={!transparent}
          roughness={0.85}
        />
      </mesh>
      {/* Кромка */}
      <mesh position={[0, 0.35, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.05, 0.025, 8, 72]} />
        <meshStandardMaterial color={shade(wrapper.color, 0.8)} roughness={0.8} />
      </mesh>
      {/* Лента и бант */}
      <mesh position={[0, -0.8, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.4, 0.045, 10, 40]} />
        <meshStandardMaterial color={wrapper.ribbon} roughness={0.5} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} geometry={sphereGeo} scale={[0.15, 0.08, 0.05]} position={[s * 0.12, -0.8, 0.42]} rotation={[0, 0, s * 0.5]}>
          <meshStandardMaterial color={wrapper.ribbon} roughness={0.5} />
        </mesh>
      ))}
    </group>
  );
};

// ---------- Сцена ----------
export default function BouquetScene({ wrapper, selectedFlowers }) {
  const instances = useMemo(() => buildInstances(selectedFlowers), [selectedFlowers]);

  return (
    <Canvas camera={{ position: [0, 1.0, 5.4], fov: 38 }} dpr={[1, 2]}>
      <ambientLight intensity={0.8} />
      <hemisphereLight args={['#ffffff', '#f3d6dc', 0.6]} />
      <directionalLight position={[3, 5, 4]} intensity={1.8} />

      <Wrapper wrapper={wrapper} />
      {instances.map(({ key, flower, target }) => (
        <Flower key={key} flower={flower} target={target} />
      ))}

      <ContactShadows position={[0, -1.35, 0]} opacity={0.35} scale={4.5} blur={2.5} far={3} />
      <OrbitControls
        target={[0, 0, 0]}
        enablePan={false}
        minDistance={3.5}
        maxDistance={8}
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={Math.PI / 1.9}
        autoRotate
        autoRotateSpeed={1.2}
      />
    </Canvas>
  );
}