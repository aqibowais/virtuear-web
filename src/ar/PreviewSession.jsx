import { useCallback, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import useSceneStore from '../store/useSceneStore.js';
import PlacedModel from './PlacedModel.jsx';
import SceneGrid from './SceneGrid.jsx';

function GroundPlane() {
  const placeObject = useSceneStore((s) => s.placeObject);
  const selectedObjectId = useSceneStore((s) => s.selectedObjectId);
  const placeMode = useSceneStore((s) => s.placeMode);
  const isDragging = useSceneStore((s) => s.isDragging);
  const updateObjectPosition = useSceneStore((s) => s.updateObjectPosition);
  const setDragging = useSceneStore((s) => s.setDragging);

  const handleClick = useCallback(
    (e) => {
      if (isDragging) return;
      e.stopPropagation();
      const point = [e.point.x, 0, e.point.z];
      if (selectedObjectId && !placeMode) {
        updateObjectPosition(selectedObjectId, point);
        return;
      }
      placeObject(point);
    },
    [placeObject, selectedObjectId, placeMode, updateObjectPosition, isDragging]
  );

  const handlePointerMove = useCallback(
    (e) => {
      if (!isDragging || !selectedObjectId) return;
      e.stopPropagation();
      updateObjectPosition(selectedObjectId, [e.point.x, 0, e.point.z]);
    },
    [isDragging, selectedObjectId, updateObjectPosition]
  );

  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, -0.001, 0]}
      onClick={handleClick}
      onPointerMove={handlePointerMove}
      onPointerUp={() => isDragging && setDragging(false)}
      receiveShadow
    >
      <planeGeometry args={[50, 50]} />
      <meshStandardMaterial
        color="#0c1118"
        roughness={0.95}
        metalness={0.05}
      />
    </mesh>
  );
}

function FloorGrid() {
  return (
    <gridHelper
      args={[30, 60, '#1a2a3a', '#0f1a24']}
      position={[0, 0.001, 0]}
    />
  );
}

function ModelLoadFallback() {
  return (
    <mesh position={[0, 0.5, 0]}>
      <boxGeometry args={[0.3, 0.3, 0.3]} />
      <meshStandardMaterial color="#FF6B1A" wireframe />
    </mesh>
  );
}

function SceneContent() {
  const placedObjects = useSceneStore((s) => s.placedObjects);
  const isDragging = useSceneStore((s) => s.isDragging);

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight
        position={[5, 10, 5]}
        intensity={1.2}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <directionalLight position={[-3, 5, -5]} intensity={0.3} />
      <hemisphereLight groundColor="#0A0E14" color="#1a2a3a" intensity={0.4} />

      <GroundPlane />
      <FloorGrid />
      <SceneGrid />

      <ContactShadows
        position={[0, 0, 0]}
        opacity={0.4}
        scale={20}
        blur={2}
        far={4}
        color="#000000"
      />

      <Suspense fallback={<ModelLoadFallback />}>
        {placedObjects.map((obj) => (
          <PlacedModel key={obj.id} object={obj} />
        ))}
      </Suspense>

      <OrbitControls
        makeDefault
        enabled={!isDragging}
        maxPolarAngle={Math.PI / 2.05}
        minPolarAngle={0.2}
        minDistance={1}
        maxDistance={20}
        target={[0, 0, 0]}
        enableDamping
        dampingFactor={0.1}
      />
    </>
  );
}

export default function PreviewSession() {
  return (
    <div className="absolute inset-0">
      <Canvas
        shadows
        camera={{ position: [2.5, 3, 4], fov: 50, near: 0.1, far: 100 }}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.2,
        }}
        onCreated={({ gl }) => {
          gl.setClearColor('#080c12', 1);
        }}
      >
        <SceneContent />
      </Canvas>
    </div>
  );
}
