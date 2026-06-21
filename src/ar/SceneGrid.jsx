import { Grid } from '@react-three/drei';
import useSceneStore from '../store/useSceneStore.js';

export default function SceneGrid() {
  const showPlanes = useSceneStore((s) => s.showPlanes);

  if (!showPlanes) return null;

  return (
    <Grid
      position={[0, 0.001, 0]}
      args={[20, 20]}
      cellSize={0.5}
      cellThickness={0.5}
      cellColor="#007A8A"
      sectionSize={2}
      sectionThickness={1}
      sectionColor="#00E5FF"
      fadeDistance={12}
      fadeStrength={1.5}
      infiniteGrid
    />
  );
}
