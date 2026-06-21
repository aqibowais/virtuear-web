import { useRef, useState, useCallback, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Canvas } from '@react-three/fiber';
import {
  createXRStore,
  XR,
  useXRHitTest,
  useXRInputSourceEvent,
  useXRPlanes,
  useXRPlaneGeometry,
} from '@react-three/xr';
import * as THREE from 'three';
import useSceneStore from '../store/useSceneStore.js';
import PlacedModel from './PlacedModel.jsx';
import ArHud from '../components/ArHud.jsx';
import ModelDock from '../components/ModelDock.jsx';

const matrixHelper = new THREE.Matrix4();
const positionHelper = new THREE.Vector3();

// Pre-create the DOM overlay element
const arOverlayElement = document.createElement('div');
arOverlayElement.id = 'ar-dom-overlay';
arOverlayElement.style.cssText =
  'position:fixed;top:0;left:0;right:0;bottom:0;pointer-events:none;z-index:9999;overflow:hidden;';

function DetectedPlane({ plane }) {
  const geometry = useXRPlaneGeometry(plane);

  return (
    <mesh geometry={geometry} position={plane.planeSpace ? undefined : [0, 0, 0]}>
      <meshBasicMaterial
        color="#00E5FF"
        transparent
        opacity={0.15}
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  );
}

function PlaneVisualizer() {
  const showPlanes = useSceneStore((s) => s.showPlanes);
  const planes = useXRPlanes();

  if (!showPlanes || planes.length === 0) return null;

  return (
    <group>
      {planes.map((plane, i) => (
        <group key={i}>
          <DetectedPlane plane={plane} />
        </group>
      ))}
    </group>
  );
}

function HitTestIndicator() {
  const reticleRef = useRef();
  const hasHitRef = useRef(false);
  const posRef = useRef(new THREE.Vector3());
  const lastPlaceTime = useRef(0);
  const placeObject = useSceneStore((s) => s.placeObject);

  useXRHitTest((results, getWorldMatrix) => {
    if (results.length === 0) {
      hasHitRef.current = false;
      if (reticleRef.current) reticleRef.current.visible = false;
      return;
    }
    getWorldMatrix(matrixHelper, results[0]);
    positionHelper.setFromMatrixPosition(matrixHelper);
    posRef.current.copy(positionHelper);
    hasHitRef.current = true;
    if (reticleRef.current) {
      reticleRef.current.position.copy(positionHelper);
      reticleRef.current.visible = true;
    }
  }, 'viewer');

  // Handle tap via select event with cooldown to prevent rapid-fire placement
  useXRInputSourceEvent('all', 'select', () => {
    const now = Date.now();
    if (hasHitRef.current && now - lastPlaceTime.current > 800) {
      lastPlaceTime.current = now;
      const p = posRef.current;
      placeObject([p.x, p.y, p.z]);
    }
  }, [placeObject]);

  return (
    <group ref={reticleRef} visible={false}>
      {/* Outer ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.08, 0.1, 32]} />
        <meshBasicMaterial color="#00E5FF" transparent opacity={0.9} side={THREE.DoubleSide} />
      </mesh>
      {/* Inner dot */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.015, 16]} />
        <meshBasicMaterial color="#00E5FF" side={THREE.DoubleSide} />
      </mesh>
      {/* Pulsing outer indicator */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.12, 0.125, 32]} />
        <meshBasicMaterial color="#00E5FF" transparent opacity={0.4} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

function XRSceneContent() {
  const placedObjects = useSceneStore((s) => s.placedObjects);

  return (
    <>
      <ambientLight intensity={1.2} />
      <directionalLight position={[2, 8, 4]} intensity={1.5} />
      <directionalLight position={[-3, 4, -2]} intensity={0.5} />

      <PlaneVisualizer />
      <HitTestIndicator />

      {placedObjects.map((obj) => (
        <PlacedModel key={obj.id} object={obj} />
      ))}
    </>
  );
}

function RotationGestureLayer() {
  const gestureRef = useRef(null);
  const updateObjectRotation = useSceneStore((s) => s.updateObjectRotation);

  useEffect(() => {
    const el = gestureRef.current;
    if (!el) return;

    let lastAngle = null;

    const getAngle = (touches) => {
      const dx = touches[1].clientX - touches[0].clientX;
      const dy = touches[1].clientY - touches[0].clientY;
      return Math.atan2(dy, dx);
    };

    const onTouchStart = (e) => {
      if (e.touches.length === 2) {
        lastAngle = getAngle(e.touches);
      }
    };

    const onTouchMove = (e) => {
      if (e.touches.length === 2 && lastAngle !== null) {
        const currentAngle = getAngle(e.touches);
        const delta = currentAngle - lastAngle;
        lastAngle = currentAngle;

        const state = useSceneStore.getState();
        const obj = state.placedObjects.find((o) => o.id === state.selectedObjectId);
        if (obj) {
          const newRotY = obj.rotation[1] + delta;
          updateObjectRotation(obj.id, [obj.rotation[0], newRotY, obj.rotation[2]]);
        }
      }
    };

    const onTouchEnd = () => {
      lastAngle = null;
    };

    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchmove', onTouchMove, { passive: true });
    el.addEventListener('touchend', onTouchEnd);

    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
      el.removeEventListener('touchend', onTouchEnd);
    };
  }, [updateObjectRotation]);

  return (
    <div
      ref={gestureRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: 'auto',
        zIndex: 1,
      }}
    />
  );
}

export default function WebXrSession() {
  const [sessionActive, setSessionActive] = useState(false);
  const [error, setError] = useState(null);

  const xrStore = useMemo(
    () =>
      createXRStore({
        hand: false,
        controller: false,
        screenInput: true,
        foveation: 0,
        hitTest: true,
        planeDetection: true,
        domOverlay: arOverlayElement,
      }),
    []
  );

  const handleEnterAr = useCallback(async () => {
    try {
      setError(null);
      await xrStore.enterAR();
      setSessionActive(true);
    } catch (err) {
      console.error('Failed to start AR session:', err);
      setError(err.message || 'Failed to start AR');
    }
  }, [xrStore]);

  const handleBack = useCallback(() => {
    const state = xrStore.getState();
    if (state.session) {
      state.session.end();
    }
    setSessionActive(false);
    window.location.href = '/';
  }, [xrStore]);

  return (
    <div className="absolute inset-0">
      <Canvas
        gl={{ antialias: true, alpha: true }}
        camera={{ position: [0, 1.6, 0], fov: 70 }}
        onCreated={({ gl }) => {
          gl.setClearColor('#0A0E14', 1);
        }}
      >
        <XR store={xrStore}>
          <XRSceneContent />
        </XR>
      </Canvas>

      {/* Portal HUD/Dock into the DOM overlay for AR visibility */}
      {sessionActive &&
        createPortal(
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              pointerEvents: 'none',
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              color: 'white',
            }}
          >
            <RotationGestureLayer />
            <ArHud isArMode={true} onBack={handleBack} />
            <ModelDock />
          </div>,
          arOverlayElement
        )}

      {/* AR entry screen */}
      {!sessionActive && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/95 z-40 px-6">
          <div className="w-16 h-16 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center mb-6">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-accent" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
              <circle cx="12" cy="13" r="3" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-white mb-2">Ready for AR</h2>
          <p className="text-[13px] text-white-60 text-center max-w-xs mb-6">
            Point at a flat surface (table or floor), then tap the screen to place 3D models.
          </p>
          <button
            onClick={handleEnterAr}
            className="w-full max-w-xs h-[52px] rounded-2xl bg-accent text-background font-semibold text-[15px] flex items-center justify-center gap-2 active:scale-[0.97] transition-transform cursor-pointer"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
              <circle cx="12" cy="13" r="3" />
            </svg>
            Start AR Camera
          </button>
          {error && (
            <p className="mt-4 text-[12px] text-danger text-center max-w-xs">{error}</p>
          )}
          <p className="mt-4 text-[11px] text-white-24 text-center">
            Camera and motion sensor access will be requested
          </p>
        </div>
      )}
    </div>
  );
}
