import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Cpu, HardDrive, Activity, Zap, Play, Square } from "lucide-react";
import { ContainerMetrics } from "./ContainerMetrics";
import { RenderVisualization } from "./RenderVisualization";
import { toast } from "sonner";

type ContainerMode = "single" | "distributed";
type DemoState = "idle" | "running" | "completed";

interface Container {
  id: string;
  name: string;
  task: string;
  progress: number;
  cpu: number;
  memory: number;
  status: "idle" | "processing" | "completed";
}

export const RayTracingDemo = () => {
  const [mode, setMode] = useState<ContainerMode>("single");
  const [state, setState] = useState<DemoState>("idle");
  const [overallProgress, setOverallProgress] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [containers, setContainers] = useState<Container[]>([]);

  // Initialize containers based on mode
  useEffect(() => {
    if (mode === "single") {
      setContainers([
        {
          id: "container-1",
          name: "Ray Tracer",
          task: "Full Scene Rendering",
          progress: 0,
          cpu: 0,
          memory: 0,
          status: "idle"
        }
      ]);
    } else {
      setContainers([
        {
          id: "container-1",
          name: "Geometry Engine",
          task: "Ray-Geometry Intersection",
          progress: 0,
          cpu: 0,
          memory: 0,
          status: "idle"
        },
        {
          id: "container-2",
          name: "Lighting Processor",
          task: "Illumination & Shadows",
          progress: 0,
          cpu: 0,
          memory: 0,
          status: "idle"
        },
        {
          id: "container-3",
          name: "Post Processor",
          task: "Anti-aliasing & Effects",
          progress: 0,
          cpu: 0,
          memory: 0,
          status: "idle"
        }
      ]);
    }
    setState("idle");
    setOverallProgress(0);
    setElapsedTime(0);
  }, [mode]);

  // Simulation logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (state === "running") {
      interval = setInterval(() => {
        setElapsedTime(prev => prev + 0.1);
        
        if (mode === "single") {
          // Single container: slower, sequential processing
          setContainers(prev => prev.map(container => {
            const newProgress = Math.min(container.progress + 0.4, 100);
            const cpu = newProgress < 100 ? 85 + Math.random() * 10 : 5;
            const memory = newProgress < 100 ? 70 + Math.random() * 20 : 10;
            
            return {
              ...container,
              progress: newProgress,
              cpu,
              memory,
              status: newProgress === 100 ? "completed" : "processing"
            };
          }));
          
          setOverallProgress(prev => Math.min(prev + 0.4, 100));
        } else {
          // Distributed: faster, parallel processing with some dependencies
          setContainers(prev => prev.map((container, index) => {
            let progressIncrement = 0;
            
            // Geometry engine starts immediately
            if (index === 0) {
              progressIncrement = 0.8;
            }
            // Lighting starts after geometry is 30% done
            else if (index === 1 && prev[0].progress > 30) {
              progressIncrement = 0.7;
            }
            // Post-processing starts after lighting is 50% done
            else if (index === 2 && prev[1].progress > 50) {
              progressIncrement = 0.9;
            }
            
            const newProgress = Math.min(container.progress + progressIncrement, 100);
            const isActive = progressIncrement > 0;
            
            return {
              ...container,
              progress: newProgress,
              cpu: isActive ? 80 + Math.random() * 15 : Math.random() * 5,
              memory: isActive ? 60 + Math.random() * 25 : 10 + Math.random() * 5,
              status: newProgress === 100 ? "completed" : (isActive ? "processing" : "idle")
            };
          }));
          
          // Overall progress is weighted average
          const avgProgress = containers.reduce((sum, c) => sum + c.progress, 0) / containers.length;
          setOverallProgress(avgProgress);
        }
      }, 100);
    }
    
    return () => clearInterval(interval);
  }, [state, mode, containers]);

  // Check if demo is completed
  useEffect(() => {
    if (overallProgress >= 100 && state === "running") {
      setState("completed");
      toast.success(`Ray tracing completed in ${elapsedTime.toFixed(1)}s using ${mode === "single" ? "1" : "3"} container${mode === "distributed" ? "s" : ""}!`);
    }
  }, [overallProgress, state, elapsedTime, mode]);

  const startDemo = () => {
    setState("running");
    setElapsedTime(0);
    setOverallProgress(0);
    setContainers(prev => prev.map(c => ({ ...c, progress: 0, status: "idle" })));
    toast.info(`Starting ${mode} container mode rendering...`);
  };

  const stopDemo = () => {
    setState("idle");
    setOverallProgress(0);
    setElapsedTime(0);
    setContainers(prev => prev.map(c => ({ 
      ...c, 
      progress: 0, 
      cpu: 0, 
      memory: 0, 
      status: "idle" 
    })));
  };

  const resetDemo = () => {
    setState("idle");
    setOverallProgress(0);
    setElapsedTime(0);
    setContainers(prev => prev.map(c => ({ 
      ...c, 
      progress: 0, 
      cpu: 0, 
      memory: 0, 
      status: "idle" 
    })));
  };

  return (
    <div className="min-h-screen p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-neon bg-clip-text text-transparent animate-pulse-neon">
          Distributed Ray Tracing Engine
        </h1>
        <p className="text-muted-foreground text-lg">
          Kubernetes Container Orchestration Demo
        </p>
      </div>

      {/* Mode Selection */}
      <Card className="p-6 glow-primary">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex gap-4">
            <Button
              variant={mode === "single" ? "default" : "secondary"}
              onClick={() => setMode("single")}
              disabled={state === "running"}
              className="flex items-center gap-2"
            >
              <Cpu className="w-4 h-4" />
              Single Container
            </Button>
            <Button
              variant={mode === "distributed" ? "default" : "secondary"}
              onClick={() => setMode("distributed")}
              disabled={state === "running"}
              className="flex items-center gap-2"
            >
              <Zap className="w-4 h-4" />
              Distributed Mode
            </Button>
          </div>
          
          <div className="flex gap-2">
            {state !== "running" ? (
              <Button onClick={startDemo} className="flex items-center gap-2">
                <Play className="w-4 h-4" />
                Start Rendering
              </Button>
            ) : (
              <Button onClick={stopDemo} variant="destructive" className="flex items-center gap-2">
                <Square className="w-4 h-4" />
                Stop
              </Button>
            )}
            
            {state === "completed" && (
              <Button onClick={resetDemo} variant="secondary">
                Reset
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Overall Progress */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Rendering Progress
            </h3>
            <div className="flex gap-4 text-sm">
              <Badge variant="secondary">
                Time: {elapsedTime.toFixed(1)}s
              </Badge>
              <Badge variant={state === "completed" ? "default" : "secondary"}>
                {overallProgress.toFixed(0)}%
              </Badge>
            </div>
          </div>
          
          <Progress 
            value={overallProgress} 
            className="h-3 glow-accent"
          />
        </div>
      </Card>

      {/* Container Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {containers.map((container) => (
          <ContainerMetrics key={container.id} container={container} />
        ))}
      </div>

      {/* Render Visualization */}
      <RenderVisualization 
        progress={overallProgress}
        mode={mode}
        containers={containers}
        isRunning={state === "running"}
      />
    </div>
  );
};