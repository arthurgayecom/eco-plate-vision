import { motion } from "framer-motion";
import { GlassCard } from "../ui/GlassCard";
import { Thermometer, Factory, TreeDeciduous, Droplets, Fish, Users, ArrowDown, ArrowRight } from "lucide-react";

const impactData = [
  {
    icon: Thermometer,
    title: "Global Temperature Rise",
    current: { value: "+3.0°C to +3.5°C", label: "Current Path" },
    improved: { value: "+2.0°C to +2.2°C", label: "With Diversified Diet" },
    reduction: "~1.0°C reduction",
    color: "bg-carbon-high",
    improvedColor: "bg-carbon-low",
  },
  {
    icon: Factory,
    title: "CO₂ Emissions (Food Sector)",
    current: { value: "22 billion", label: "tons/year" },
    improved: { value: "11 billion", label: "tons/year" },
    reduction: "50% reduction",
    color: "bg-carbon-high",
    improvedColor: "bg-carbon-low",
  },
  {
    icon: TreeDeciduous,
    title: "Land Use",
    current: { value: "Deforestation", label: "Accelerating" },
    improved: { value: "Regeneration", label: "Forest Recovery" },
    reduction: "Net positive by 2060",
    color: "bg-carbon-high",
    improvedColor: "bg-carbon-low",
  },
  {
    icon: Droplets,
    title: "Water Consumption",
    current: { value: "High Stress", label: "Aquifer Depletion" },
    improved: { value: "Sustainable", label: "Balanced Usage" },
    reduction: "40% reduction",
    color: "bg-carbon-medium",
    improvedColor: "bg-carbon-low",
  },
  {
    icon: Fish,
    title: "Ecosystem Health",
    current: { value: "Dead Zones", label: "Runoff & Pollution" },
    improved: { value: "Recovery", label: "Ecosystem Healing" },
    reduction: "Marine life rebounds",
    color: "bg-carbon-high",
    improvedColor: "bg-carbon-low",
  },
];

const dietBreakdown = [
  { label: "Meat Eaters", percentage: 5, color: "bg-carbon-high" },
  { label: "Flexitarian", percentage: 60, color: "bg-carbon-medium" },
  { label: "Vegetarian", percentage: 15, color: "bg-carbon-low" },
  { label: "Vegan", percentage: 20, color: "bg-primary" },
];

export function GlobalPlanTab() {
  return (
    <div className="space-y-4">
      {/* Hero Section */}
      <GlassCard delay={0.1}>
        <div className="text-center space-y-3">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.3 }}
            className="w-16 h-16 gradient-primary rounded-2xl mx-auto flex items-center justify-center shadow-glow"
          >
            <Users className="w-8 h-8 text-primary-foreground" />
          </motion.div>
          <h2 className="font-heading text-xl font-bold">The 75-Year Forecast</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            What happens when the world shifts to a diversified diet model?
          </p>
        </div>
      </GlassCard>

      {/* Diet Model Breakdown */}
      <GlassCard delay={0.2}>
        <h3 className="font-heading text-lg font-semibold mb-4">The 5–60–15–20 Model</h3>
        <p className="text-sm text-muted-foreground mb-4">
          A realistic, achievable global diet distribution
        </p>

        <div className="space-y-3">
          {dietBreakdown.map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.1 }}
              className="space-y-1.5"
            >
              <div className="flex justify-between text-sm">
                <span className="font-medium">{item.label}</span>
                <span className="text-muted-foreground">{item.percentage}%</span>
              </div>
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${item.percentage}%` }}
                  transition={{ duration: 0.8, delay: 0.5 + i * 0.1 }}
                  className={`h-full rounded-full ${item.color}`}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </GlassCard>

      {/* Impact Cards */}
      <div className="space-y-3">
        <h3 className="font-heading text-lg font-semibold px-1">Projected Impacts</h3>

        {impactData.map((item, i) => {
          const Icon = item.icon;
          return (
            <GlassCard key={item.title} delay={0.2 + i * 0.1}>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-heading font-semibold text-sm mb-3">{item.title}</h4>

                  <div className="grid grid-cols-[1fr,auto,1fr] gap-2 items-center">
                    {/* Current */}
                    <div className="p-2 rounded-lg bg-carbon-high/10 text-center">
                      <p className="text-xs text-muted-foreground mb-0.5">{item.current.label}</p>
                      <p className="font-semibold text-sm text-carbon-high">{item.current.value}</p>
                    </div>

                    {/* Arrow */}
                    <ArrowRight className="w-5 h-5 text-muted-foreground" />

                    {/* Improved */}
                    <div className="p-2 rounded-lg bg-carbon-low/10 text-center">
                      <p className="text-xs text-muted-foreground mb-0.5">{item.improved.label}</p>
                      <p className="font-semibold text-sm text-carbon-low">{item.improved.value}</p>
                    </div>
                  </div>

                  {/* Reduction badge */}
                  <div className="mt-2 flex items-center justify-center gap-1">
                    <ArrowDown className="w-3 h-3 text-primary" />
                    <span className="text-xs font-medium text-primary">{item.reduction}</span>
                  </div>
                </div>
              </div>
            </GlassCard>
          );
        })}
      </div>

      {/* Summary */}
      <GlassCard delay={0.7} className="border-2 border-primary/30">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 gradient-primary rounded-full mx-auto flex items-center justify-center shadow-glow">
            <ArrowDown className="w-6 h-6 text-primary-foreground" />
          </div>
          <h3 className="font-heading text-lg font-bold">The Bottom Line</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Small individual changes in food choices scale into{" "}
            <span className="text-primary font-semibold">massive global impact</span>. Food is one
            of the fastest climate levers we have — and it's in our hands every day.
          </p>
        </div>
      </GlassCard>
    </div>
  );
}
