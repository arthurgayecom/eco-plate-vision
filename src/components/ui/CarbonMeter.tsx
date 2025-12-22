import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface CarbonMeterProps {
  value: number; // 0-100
  label: "Low" | "Medium" | "High";
  kgCO2: number;
}

export function CarbonMeter({ value, label, kgCO2 }: CarbonMeterProps) {
  const getColorClass = () => {
    if (label === "Low") return "bg-carbon-low";
    if (label === "Medium") return "bg-carbon-medium";
    return "bg-carbon-high";
  };

  const getLabelClass = () => {
    if (label === "Low") return "text-carbon-low";
    if (label === "Medium") return "text-carbon-medium";
    return "text-carbon-high";
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-end">
        <div>
          <p className="text-sm text-muted-foreground">Carbon Impact</p>
          <p className={cn("text-3xl font-heading font-bold", getLabelClass())}>
            {kgCO2.toFixed(2)} <span className="text-lg">kg CO₂</span>
          </p>
        </div>
        <span
          className={cn(
            "px-3 py-1 rounded-full text-sm font-medium",
            label === "Low" && "bg-carbon-low/15 text-carbon-low",
            label === "Medium" && "bg-carbon-medium/15 text-carbon-medium",
            label === "High" && "bg-carbon-high/15 text-carbon-high"
          )}
        >
          {label} Impact
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-3 bg-muted rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
          className={cn("h-full rounded-full", getColorClass())}
        />
      </div>

      {/* Scale labels */}
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Low</span>
        <span>Medium</span>
        <span>High</span>
      </div>
    </div>
  );
}
