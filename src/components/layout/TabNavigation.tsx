import { motion } from "framer-motion";
import { Camera, Globe, Lightbulb } from "lucide-react";

type TabId = "scan" | "global" | "why";

interface TabNavigationProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

const tabs = [
  { id: "scan" as TabId, label: "Food Scan", icon: Camera },
  { id: "global" as TabId, label: "Global Plan", icon: Globe },
  { id: "why" as TabId, label: "Why It Works", icon: Lightbulb },
];

export function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  return (
    <div className="w-full px-4 pt-4 pb-2">
      <div className="glass-card rounded-2xl p-1.5 flex gap-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`relative flex-1 flex items-center justify-center gap-2 py-3 px-2 rounded-xl font-medium text-sm transition-all duration-300 ${
                isActive ? "" : "tab-inactive"
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 gradient-primary rounded-xl shadow-lg shadow-primary/30"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span className={`relative z-10 flex items-center gap-1.5 ${isActive ? "text-primary-foreground" : ""}`}>
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.label.split(" ")[0]}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
