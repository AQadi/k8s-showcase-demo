import { Canvas } from "@react-three/fiber";
import { OrbitControls, Sphere, Box, Torus, Environment, PerspectiveCamera } from "@react-three/drei";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Monitor, Cpu, Zap } from "lucide-react";
import * as THREE from "three";
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";

interface Container {
  id: string;
  name: string;
  task: string;
  progress: number;
  cpu: number;
  memory: number;
  status: "idle" | "processing" | "completed";
}

interface RenderVisualizationProps {
  progress: number;
  mode: "single" | "distributed";
  containers: Container[];
  isRunning: boolean;
}

// 3D Scene Components
const GeometryObjects = ({ progress, mode }: { progress: number; mode: string }) => {
  const meshRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.2;
    }
  });

  const objectCount = useMemo(() => {
    return mode === "distributed" ? Math.floor((progress / 100) * 15) : Math.floor((progress / 100) * 8);
  }, [progress, mode]);

  return (
    <group ref={meshRef}>
      {Array.from({ length: objectCount }).map((_, i) => {
        const angle = (i / objectCount) * Math.PI * 2;
        const radius = 2 + Math.sin(i * 0.5) * 0.5;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        const y = Math.sin(i * 0.8) * 0.5;
        
        if (i % 3 === 0) {
          return (
            <Box key={i} position={[x, y, z]} args={[0.3, 0.3, 0.3]}>
              <meshStandardMaterial color={`hsl(${i * 30}, 70%, 60%)`} />
            </Box>
          );
        } else if (i % 3 === 1) {
          return (
            <Sphere key={i} position={[x, y, z]} args={[0.2]}>
              <meshStandardMaterial color={`hsl(${i * 45}, 80%, 50%)`} />
            </Sphere>
          );
        } else {
          return (
            <Torus key={i} position={[x, y, z]} args={[0.15, 0.08, 8, 16]}>
              <meshStandardMaterial color={`hsl(${i * 60}, 60%, 70%)`} />
            </Torus>
          );
        }
      })}
    </group>
  );
};

const LightingSystem = ({ containers, mode }: { containers: any[]; mode: string }) => {
  const lightRef = useRef<THREE.DirectionalLight>(null);
  
  useFrame((state) => {
    if (lightRef.current) {
      lightRef.current.position.x = Math.cos(state.clock.elapsedTime) * 3;
      lightRef.current.position.z = Math.sin(state.clock.elapsedTime) * 3;
    }
  });

  const lightingActive = mode === "single" || containers[1]?.status !== "idle";
  const lightIntensity = lightingActive ? 1.5 : 0.3;

  return (
    <>
      <ambientLight intensity={0.2} />
      <directionalLight
        ref={lightRef}
        position={[3, 3, 3]}
        intensity={lightIntensity}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <pointLight position={[-3, 2, -3]} intensity={lightingActive ? 0.8 : 0.1} color="#ff6b6b" />
      <pointLight position={[3, -2, 3]} intensity={lightingActive ? 0.8 : 0.1} color="#4ecdc4" />
    </>
  );
};

const PostProcessingEffects = ({ containers, mode }: { containers: any[]; mode: string }) => {
  const postActive = mode === "single" || containers[2]?.status !== "idle";
  
  return (
    <>
      {postActive && <Environment preset="studio" />}
      <fog attach="fog" args={postActive ? ["#202020", 8, 15] : ["#000000", 5, 10]} />
    </>
  );
};

export const RenderVisualization = ({ progress, mode, containers, isRunning }: RenderVisualizationProps) => {
  const getStageDescription = () => {
    if (mode === "single") {
      if (progress < 25) return "Primary Ray Generation";
      if (progress < 50) return "Ray-Object Intersection";
      if (progress < 75) return "Lighting Calculation";
      return "Final Pixel Assembly";
    } else {
      const geometryDone = containers[0]?.status === "completed";
      const lightingDone = containers[1]?.status === "completed";
      const postDone = containers[2]?.status === "completed";
      
      if (!geometryDone) return "Geometry Processing Active";
      if (!lightingDone) return "Lighting & Shadows Processing";
      if (!postDone) return "Post-processing & Effects";
      return "Render Complete";
    }
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <Monitor className="w-5 h-5" />
            Real-Time Ray Traced Scene
          </h3>
          <Badge variant={progress === 100 ? "default" : "secondary"}>
            {getStageDescription()}
          </Badge>
        </div>
        
        {/* Real 3D Scene */}
        <div className="relative aspect-video rounded-lg overflow-hidden border bg-black">
          <Canvas
            shadows
            camera={{ position: [5, 5, 5], fov: 60 }}
            gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping }}
          >
            <PerspectiveCamera makeDefault position={[5, 5, 5]} />
            <OrbitControls
              enablePan={true}
              enableZoom={true}
              enableRotate={true}
              autoRotate={!isRunning}
              autoRotateSpeed={0.5}
            />
            
            <GeometryObjects progress={progress} mode={mode} />
            <LightingSystem containers={containers} mode={mode} />
            <PostProcessingEffects containers={containers} mode={mode} />
          </Canvas>
          
          {/* Processing overlay */}
          {isRunning && progress < 100 && (
            <div className="absolute top-4 left-4">
              <Badge variant="secondary" className="animate-pulse bg-black/50 text-white">
                Ray Tracing: {progress.toFixed(0)}%
              </Badge>
            </div>
          )}
        </div>
        
        {/* Render stats */}
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Resolution: 1920x1080</span>
          <span>Objects: {mode === "distributed" ? Math.floor((progress / 100) * 15) : Math.floor((progress / 100) * 8)}</span>
          <span>Quality: {mode === "distributed" ? "High (GPU Accelerated)" : "Standard (CPU)"}</span>
        </div>
      </div>
    </Card>
  );
};