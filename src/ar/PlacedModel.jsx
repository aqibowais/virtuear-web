import { useMemo, Suspense } from 'react';
import { useGLTF } from '@react-three/drei';
import { getModelById } from '../data/modelCatalog.js';
import { MODEL_CATALOG } from '../data/modelCatalog.js';
import useSceneStore from '../store/useSceneStore.js';

// Preload all models at module level so they're cached before placement
MODEL_CATALOG.forEach((model) => {
  useGLTF.preload(model.path);
});

function ModelMesh({ object }) {
  const model = getModelById(object.modelId);
  const selectedObjectId = useSceneStore((s) => s.selectedObjectId);
  const selectObject = useSceneStore((s) => s.selectObject);

  const isSelected = selectedObjectId === object.id;
  const effectiveScale = model.defaultScale * object.userScaleFactor;

  const { scene } = useGLTF(model.path);
  const clonedScene = useMemo(() => scene.clone(true), [scene]);

  const handleClick = (e) => {
    e.stopPropagation();
    selectObject(object.id);
  };

  return (
    <group
      position={object.position}
      rotation={object.rotation}
      scale={[effectiveScale, effectiveScale, effectiveScale]}
      onClick={handleClick}
    >
      <primitive object={clonedScene} />
      {isSelected && (
        <mesh>
          <sphereGeometry args={[2, 12, 12]} />
          <meshBasicMaterial color="#FF6B1A" transparent opacity={0.06} wireframe />
        </mesh>
      )}
    </group>
  );
}

export default function PlacedModel({ object }) {
  return (
    <Suspense fallback={<PlaceholderBox position={object.position} />}>
      <ModelMesh object={object} />
    </Suspense>
  );
}

function PlaceholderBox({ position }) {
  return (
    <mesh position={position}>
      <boxGeometry args={[0.1, 0.1, 0.1]} />
      <meshBasicMaterial color="#FF6B1A" wireframe transparent opacity={0.5} />
    </mesh>
  );
}
