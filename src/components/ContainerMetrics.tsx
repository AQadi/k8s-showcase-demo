import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Cpu, HardDrive, Activity, CheckCircle } from "lucide-react";

interface Container {
  id: string;
  name: string;
  task: string;
  progress: number;
  cpu: number;
  memory: number;
  status: "idle" | "processing" | "completed";
}

interface ContainerMetricsProps {
  container: Container;
}

export const ContainerMetrics = ({ container }: ContainerMetricsProps) => {
  const getStatusColor = () => {
    switch (container.status) {
      case "processing": return "bg-primary/20 border-primary animate-pulse-neon";
      case "completed": return "bg-neon-green/20 border-neon-green";
      default: return "bg-muted/20 border-muted";
    }
  };

  const getStatusBadge = () => {
    switch (container.status) {
      case "processing": return <Badge className="bg-primary text-primary-foreground">Processing</Badge>;
      case "completed": return <Badge className="bg-neon-green text-background">Completed</Badge>;
      default: return <Badge variant="secondary">Idle</Badge>;
    }
  };

  return (
    <Card className={`p-6 transition-all duration-300 ${getStatusColor()}`}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h4 className="font-semibold text-lg">{container.name}</h4>
            <p className="text-sm text-muted-foreground">{container.task}</p>
          </div>
          {getStatusBadge()}
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="flex items-center gap-1">
              <Activity className="w-3 h-3" />
              Progress
            </span>
            <span>{container.progress.toFixed(0)}%</span>
          </div>
          <Progress 
            value={container.progress} 
            className="h-2"
          />
        </div>

        {/* Resource Metrics */}
        <div className="grid grid-cols-2 gap-4">
          {/* CPU Usage */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Cpu className="w-4 h-4" />
              <span>CPU</span>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-mono">
                {container.cpu.toFixed(0)}%
              </div>
              <Progress 
                value={container.cpu} 
                className="h-1"
              />
            </div>
          </div>

          {/* Memory Usage */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <HardDrive className="w-4 h-4" />
              <span>Memory</span>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-mono">
                {container.memory.toFixed(0)}%
              </div>
              <Progress 
                value={container.memory} 
                className="h-1"
              />
            </div>
          </div>
        </div>

        {/* Status Indicator */}
        <div className="flex items-center gap-2 pt-2 border-t border-border">
          {container.status === "completed" && (
            <CheckCircle className="w-4 h-4 text-neon-green animate-pulse" />
          )}
          <span className="text-xs text-muted-foreground">
            Container ID: {container.id}
          </span>
        </div>
      </div>
    </Card>
  );
};