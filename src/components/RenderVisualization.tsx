import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Monitor, Layers, Sparkles } from "lucide-react";

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

export const RenderVisualization = ({ 
  progress, 
  mode, 
  containers, 
  isRunning 
}: RenderVisualizationProps) => {
  
  // Generate render preview based on progress
  const renderBlocks = Array.from({ length: 16 }, (_, i) => {
    const blockProgress = Math.max(0, Math.min(100, (progress - (i * 6.25))));
    return blockProgress;
  });

  return (
    <Card className="p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <Monitor className="w-5 h-5" />
            Render Output
          </h3>
          <Badge variant={mode === "distributed" ? "default" : "secondary"}>
            {mode === "single" ? "Sequential Processing" : "Parallel Processing"}
          </Badge>
        </div>

        {/* Render Grid */}
        <div className="relative">
          <div className="grid grid-cols-4 gap-2 aspect-square max-w-md mx-auto">
            {renderBlocks.map((blockProgress, i) => (
              <div
                key={i}
                className="aspect-square rounded-lg border-2 border-border overflow-hidden relative"
              >
                {/* Base dark background */}
                <div className="absolute inset-0 bg-secondary"></div>
                
                {/* Render progress fill */}
                <div 
                  className="absolute inset-0 bg-gradient-primary transition-all duration-300"
                  style={{
                    opacity: blockProgress / 100,
                    transform: `scaleY(${blockProgress / 100})`,
                    transformOrigin: 'bottom'
                  }}
                ></div>
                
                {/* Scanning effect for active blocks */}
                {isRunning && blockProgress > 0 && blockProgress < 100 && (
                  <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute w-full h-0.5 bg-primary animate-scan opacity-80"></div>
                  </div>
                )}
                
                {/* Completion sparkle */}
                {blockProgress >= 100 && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-neon-green animate-pulse" />
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {/* Progress overlay */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center space-y-2">
              {progress > 0 && (
                <>
                  <div className="text-4xl font-bold text-primary animate-pulse-neon">
                    {progress.toFixed(0)}%
                  </div>
                  {isRunning && (
                    <div className="text-sm text-muted-foreground">
                      Rendering...
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Processing Pipeline */}
        <div className="space-y-4">
          <h4 className="font-semibold flex items-center gap-2">
            <Layers className="w-4 h-4" />
            Processing Pipeline
          </h4>
          
          <div className="flex flex-wrap gap-4 justify-center">
            {containers.map((container, index) => (
              <div key={container.id} className="flex items-center gap-2">
                {/* Container node */}
                <div className={`
                  w-12 h-12 rounded-lg border-2 flex items-center justify-center text-xs font-mono
                  transition-all duration-300
                  ${container.status === "processing" ? "border-primary bg-primary/20 animate-pulse-neon" :
                    container.status === "completed" ? "border-neon-green bg-neon-green/20" :
                    "border-muted bg-muted/20"}
                `}>
                  {container.progress.toFixed(0)}%
                </div>
                
                {/* Flow arrow */}
                {index < containers.length - 1 && mode === "distributed" && (
                  <div className="flex items-center">
                    <div className={`
                      w-8 h-0.5 transition-all duration-300
                      ${container.progress > 30 ? "bg-primary animate-data-flow" : "bg-muted"}
                    `}></div>
                    <div className={`
                      w-0 h-0 border-l-4 border-y-2 border-transparent transition-all duration-300
                      ${container.progress > 30 ? "border-l-primary" : "border-l-muted"}
                    `}></div>
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {/* Performance comparison */}
          <div className="text-center text-sm text-muted-foreground">
            {mode === "single" ? (
              "Sequential processing: Each stage waits for the previous to complete"
            ) : (
              "Parallel processing: Multiple stages execute simultaneously with minimal dependencies"
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};