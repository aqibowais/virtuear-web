import { useMemo, useEffect, useRef, Suspense } from 'react';
import { useGLTF, useAnimations } from '@react-three/drei';
import { SkeletonUtils } from 'three-stdlib';
import * as THREE from 'three';
import { getModelById, MODEL_CATALOG } from '../data/modelCatalog.js';
import useSceneStore from '../store/useSceneStore.js';

MODEL_CATALOG.forEach((model) => {
  useGLTF.preload(model.path);
});

const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
const hitPoint = new THREE.Vector3();

function resolveClip(actions, names, preferred) {
  if (!actions) return null;
  if (preferred && actions[preferred]) return preferred;
  if (names?.[0] && actions[names[0]]) return names[0];
  return Object.keys(actions).find((key) => actions[key]) ?? null;
}

function ModelMesh({ object }) {
  const model = getModelById(object.modelId);
  const selectedObjectId = useSceneStore((s) => s.selectedObjectId);
  const selectObject = useSceneStore((s) => s.selectObject);
  const updateObjectPosition = useSceneStore((s) => s.updateObjectPosition);
  const setDragging = useSceneStore((s) => s.setDragging);

  const isSelected = selectedObjectId === object.id;
  const effectiveScale = model.defaultScale * object.userScaleFactor;
  const dragging = useRef(false);

  const { scene, animations } = useGLTF(model.path);
  const clonedScene = useMemo(() => {
    const clone = SkeletonUtils.clone(scene);
    clone.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(clone);
    if (!model.animated && Number.isFinite(box.min.y)) {
      clone.position.y -= box.min.y;
    } else if (model.lift) {
      clone.position.y += model.lift;
    }
    return clone;
  }, [scene, model.animated, model.lift]);
  const { actions, names } = useAnimations(animations, clonedScene);

  useEffect(() => {
    if (!model.animated || !actions) return undefined;
    const clipName = resolveClip(actions, names, object.clip);
    if (!clipName) return undefined;

    Object.values(actions).forEach((action) => action?.stop());
    const action = actions[clipName];
    action.reset().fadeIn(0.15).play();
    action.paused = Boolean(object.paused);

    return () => {
      action.fadeOut(0.1);
      action.stop();
    };
  }, [actions, names, object.clip, model.animated]);

  useEffect(() => {
    if (!model.animated || !actions) return;
    const clipName = resolveClip(actions, names, object.clip);
    const action = actions[clipName];
    if (action) action.paused = Boolean(object.paused);
  }, [actions, names, object.clip, object.paused, model.animated]);

  const handlePointerDown = (e) => {
    e.stopPropagation();
    selectObject(object.id);
    dragging.current = true;
    setDragging(true);
    const canvas = e.nativeEvent?.target;
    if (canvas?.setPointerCapture && e.pointerId != null) {
      canvas.setPointerCapture(e.pointerId);
    }
  };

  const handlePointerMove = (e) => {
    if (!dragging.current) return;
    e.stopPropagation();
    if (e.ray.intersectPlane(groundPlane, hitPoint)) {
      updateObjectPosition(object.id, [hitPoint.x, 0, hitPoint.z]);
    }
  };

  const handlePointerUp = (e) => {
    if (!dragging.current) return;
    dragging.current = false;
    setDragging(false);
    const canvas = e.nativeEvent?.target;
    if (canvas?.releasePointerCapture && e.pointerId != null) {
      try {
        canvas.releasePointerCapture(e.pointerId);
      } catch {
        // already released
      }
    }
  };

  return (
    <group
      position={object.position}
      rotation={object.rotation}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      <group scale={[effectiveScale, effectiveScale, effectiveScale]}>
        <primitive object={clonedScene} />
      </group>
      {isSelected && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
          <ringGeometry args={[0.32, 0.4, 32]} />
          <meshBasicMaterial color="#FF6B1A" transparent opacity={0.9} />
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
