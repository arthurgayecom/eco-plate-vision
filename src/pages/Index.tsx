import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AppHeader } from "@/components/layout/AppHeader";
import { TabNavigation } from "@/components/layout/TabNavigation";
import { FoodScanTab } from "@/components/tabs/FoodScanTab";
import { GlobalPlanTab } from "@/components/tabs/GlobalPlanTab";
import { WhyItWorksTab } from "@/components/tabs/WhyItWorksTab";

type TabId = "scan" | "global" | "why";

const Index = () => {
  const [activeTab, setActiveTab] = useState<TabId>("scan");

  const renderTab = () => {
    switch (activeTab) {
      case "scan":
        return <FoodScanTab />;
      case "global":
        return <GlobalPlanTab />;
      case "why":
        return <WhyItWorksTab />;
      default:
        return <FoodScanTab />;
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-x-hidden">
      {/* Background gradient glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-accent/5 rounded-full blur-3xl" />
      </div>

      {/* Main container - mobile first */}
      <div className="relative z-10 max-w-lg mx-auto min-h-screen flex flex-col">
        {/* Header */}
        <AppHeader />

        {/* Tab Navigation */}
        <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Tab Content */}
        <main className="flex-1 px-4 pb-8 overflow-y-auto scrollbar-hide">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {renderTab()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default Index;
