import * as React from 'react';
import { Canvas, useThree } from 'react-three-fiber';
import Controls from './Controls';
import InstancedPoints from './InstancedPoints';
import Effects from './Effects';
import * as THREE from 'three';

const SceneBackground = () => {
  const { scene } = useThree();
  React.useEffect(() => {
    scene.background = null; // Makes the scene background completely transparent
  }, [scene]);

  return null;
};

const ThreePointVis = ({ data, layout, selectedPoint, onSelectPoint }, ref) => {
  const controlsRef = React.useRef();
  React.useImperativeHandle(ref, () => ({
    resetCamera: () => {
      return controlsRef.current.resetCamera();
    },
  }));

  return (
    <Canvas camera={{ position: [0, -25, 20], far: 150 }}>
      <SceneBackground />
      <Controls ref={controlsRef} />
      <ambientLight color="#ffffff" intensity={0.1} />
      <hemisphereLight
        color="#ffffff"
        skyColor="#ffffbb"
        groundColor="#080820"
        intensity={1.75}
      />
      <InstancedPoints
        data={data}
        layout={layout}
        selectedPoint={selectedPoint}
        onSelectPoint={onSelectPoint}
      />
      <Effects />
    </Canvas>
  );
};

export default React.forwardRef(ThreePointVis);
