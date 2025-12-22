import { Leaf } from "lucide-react";
import { motion } from "framer-motion";

export function AppHeader() {
  return (
    <header className="w-full px-4 pt-6 pb-2">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-center gap-2"
      >
        <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center shadow-glow">
          <Leaf className="w-5 h-5 text-primary-foreground" />
        </div>
        <h1 className="font-heading text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          CarbonBite
        </h1>
      </motion.div>
    </header>
  );
}
