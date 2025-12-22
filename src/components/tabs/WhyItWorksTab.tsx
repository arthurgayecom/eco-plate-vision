import { motion } from "framer-motion";
import { GlassCard } from "../ui/GlassCard";
import { Eye, Calendar, Users, Scale, CheckCircle2, Sparkles } from "lucide-react";

const sections = [
  {
    icon: Eye,
    title: "Visibility Creates Change",
    points: [
      "People vastly underestimate food emissions — most have no idea their steak equals a 60-mile drive",
      "Visual feedback (photos → carbon scores) makes the abstract impact tangible and real",
      "When you see the numbers, behavior naturally shifts toward awareness",
    ],
    highlight: "Seeing is believing",
  },
  {
    icon: Calendar,
    title: "Food Is a Daily Decision",
    points: [
      "Unlike energy or transport choices, food decisions happen 3+ times per day",
      "Small reductions compound quickly — 1 less meat meal per week = 200 kg CO₂/year saved",
      "No major lifestyle change required — just informed choices at each meal",
    ],
    highlight: "3 opportunities every day",
  },
  {
    icon: Users,
    title: "Collective Action Scales",
    points: [
      "One person switching diets has minimal global impact — that's true",
      "But 1 million people making small shifts creates measurable change",
      "8 billion people slightly adjusting = planetary transformation",
    ],
    highlight: "Together, we're unstoppable",
  },
  {
    icon: Scale,
    title: "The 5–60–15–20 Model Works",
    points: [
      "Not everyone needs to become vegan — that's unrealistic and unnecessary",
      "The majority (60%) simply reduces meat consumption slightly",
      "System-level change without forcing extremes on anyone",
    ],
    highlight: "Realistic, not radical",
  },
];

const keyFacts = [
  { stat: "14.5%", label: "of global emissions come from livestock" },
  { stat: "70%", label: "of farmland is used for animal agriculture" },
  { stat: "100x", label: "less land needed for plant vs beef protein" },
  { stat: "2,500L", label: "water saved per skipped beef burger" },
];

export function WhyItWorksTab() {
  return (
    <div className="space-y-4">
      {/* Hero */}
      <GlassCard delay={0.1}>
        <div className="text-center space-y-3">
          <motion.div
            initial={{ rotate: -180, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 100, delay: 0.2 }}
            className="w-16 h-16 gradient-primary rounded-2xl mx-auto flex items-center justify-center shadow-glow"
          >
            <Sparkles className="w-8 h-8 text-primary-foreground" />
          </motion.div>
          <h2 className="font-heading text-xl font-bold">Why This Actually Works</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            The science, logic, and behavioral psychology behind food-based climate action
          </p>
        </div>
      </GlassCard>

      {/* Key Facts Grid */}
      <div className="grid grid-cols-2 gap-3">
        {keyFacts.map((fact, i) => (
          <motion.div
            key={fact.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.1 }}
            className="glass-card rounded-xl p-4 text-center"
          >
            <p className="font-heading text-2xl font-bold text-primary">{fact.stat}</p>
            <p className="text-xs text-muted-foreground mt-1 leading-tight">{fact.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Explanation Sections */}
      <div className="space-y-3">
        {sections.map((section, i) => {
          const Icon = section.icon;
          return (
            <GlassCard key={section.title} delay={0.3 + i * 0.1}>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-heading font-semibold">{section.title}</h3>
                </div>

                <ul className="space-y-2">
                  {section.points.map((point, j) => (
                    <motion.li
                      key={j}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + i * 0.1 + j * 0.05 }}
                      className="flex items-start gap-2 text-sm text-muted-foreground"
                    >
                      <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                      <span>{point}</span>
                    </motion.li>
                  ))}
                </ul>

                <div className="pt-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary text-xs font-medium rounded-full">
                    <Sparkles className="w-3 h-3" />
                    {section.highlight}
                  </span>
                </div>
              </div>
            </GlassCard>
          );
        })}
      </div>

      {/* Final CTA */}
      <GlassCard delay={0.8} className="border-2 border-primary/30">
        <div className="text-center space-y-4">
          <h3 className="font-heading text-lg font-bold">You're Part of the Solution</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Every scan, every informed choice, every slightly-smaller carbon footprint adds up.
            You're not just eating — you're voting for the future with every bite.
          </p>
          <div className="flex justify-center gap-2">
            <span className="px-3 py-1 bg-carbon-low/15 text-carbon-low text-xs font-medium rounded-full">
              Informed
            </span>
            <span className="px-3 py-1 bg-primary/15 text-primary text-xs font-medium rounded-full">
              Empowered
            </span>
            <span className="px-3 py-1 bg-accent/15 text-accent text-xs font-medium rounded-full">
              Impactful
            </span>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
