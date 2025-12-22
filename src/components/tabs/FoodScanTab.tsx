import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Upload, X, Sparkles, Loader2, Car, Leaf, Coffee, Utensils } from "lucide-react";
import { GlassCard } from "../ui/GlassCard";
import { CarbonMeter } from "../ui/CarbonMeter";
import { Button } from "../ui/button";
import { toast } from "sonner";

interface FoodResult {
  name: string;
  ingredients: string[];
  kgCO2: number;
  label: "Low" | "Medium" | "High";
  comparison: string;
  tip: string;
  confidence: number;
}

// Simulated AI database for food carbon footprints
const foodDatabase: Record<string, FoodResult> = {
  burger: {
    name: "Beef Burger",
    ingredients: ["Beef patty", "Brioche bun", "Lettuce", "Tomato", "Cheese", "Pickles"],
    kgCO2: 6.8,
    label: "High",
    comparison: "Driving 28 miles in an average car",
    tip: "Try a plant-based patty next time to reduce emissions by up to 90%!",
    confidence: 96,
  },
  salad: {
    name: "Garden Salad",
    ingredients: ["Mixed greens", "Cherry tomatoes", "Cucumber", "Olive oil dressing"],
    kgCO2: 0.3,
    label: "Low",
    comparison: "Driving just 1.2 miles",
    tip: "Great choice! Fresh vegetables have minimal carbon impact.",
    confidence: 94,
  },
  chicken: {
    name: "Grilled Chicken Plate",
    ingredients: ["Chicken breast", "Rice", "Steamed vegetables", "Herbs"],
    kgCO2: 2.1,
    label: "Medium",
    comparison: "Driving 8.5 miles",
    tip: "Chicken has a lower footprint than beef. Consider reducing portion size further.",
    confidence: 92,
  },
  vegan: {
    name: "Vegan Buddha Bowl",
    ingredients: ["Quinoa", "Chickpeas", "Roasted vegetables", "Tahini", "Avocado"],
    kgCO2: 0.8,
    label: "Low",
    comparison: "Driving only 3.2 miles",
    tip: "Plant-based meals are among the most sustainable choices. Keep it up!",
    confidence: 97,
  },
  coffee: {
    name: "Latte with Oat Milk",
    ingredients: ["Espresso", "Oat milk", "Sugar (optional)"],
    kgCO2: 0.4,
    label: "Low",
    comparison: "Driving 1.6 miles",
    tip: "Oat milk has 80% less emissions than dairy. Great choice!",
    confidence: 95,
  },
  steak: {
    name: "Ribeye Steak Dinner",
    ingredients: ["Beef ribeye", "Mashed potatoes", "Asparagus", "Butter sauce"],
    kgCO2: 14.2,
    label: "High",
    comparison: "Driving 58 miles in an average car",
    tip: "Red meat has the highest carbon footprint. Save it for special occasions.",
    confidence: 98,
  },
  pizza: {
    name: "Margherita Pizza",
    ingredients: ["Pizza dough", "Tomato sauce", "Mozzarella", "Fresh basil", "Olive oil"],
    kgCO2: 1.8,
    label: "Medium",
    comparison: "Driving 7.3 miles",
    tip: "Vegetarian pizzas have lower impact than meat-topped ones.",
    confidence: 91,
  },
  smoothie: {
    name: "Berry Smoothie",
    ingredients: ["Mixed berries", "Banana", "Almond milk", "Honey"],
    kgCO2: 0.5,
    label: "Low",
    comparison: "Driving 2 miles",
    tip: "Fruit smoothies with plant milk are excellent low-carbon choices!",
    confidence: 93,
  },
};

export function FoodScanTab() {
  const [image, setImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<FoodResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCameraCapture = () => {
    // Create a file input specifically for camera
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.capture = "environment";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImage(reader.result as string);
          setResult(null);
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const analyzeImage = async () => {
    if (!image) return;

    setIsAnalyzing(true);

    // Simulate AI analysis delay
    await new Promise((resolve) => setTimeout(resolve, 2500));

    // Randomly select a food result to simulate AI detection
    const foodKeys = Object.keys(foodDatabase);
    const randomFood = foodKeys[Math.floor(Math.random() * foodKeys.length)];
    const detectedFood = foodDatabase[randomFood];

    // Only accept high confidence results
    if (detectedFood.confidence >= 90) {
      setResult(detectedFood);
      toast.success("Food analyzed successfully!", {
        description: `Detected: ${detectedFood.name} with ${detectedFood.confidence}% confidence`,
      });
    } else {
      toast.error("Could not identify food with high confidence", {
        description: "Please try a clearer image",
      });
    }

    setIsAnalyzing(false);
  };

  const clearImage = () => {
    setImage(null);
    setResult(null);
  };

  const getMeterValue = (label: "Low" | "Medium" | "High") => {
    if (label === "Low") return 25;
    if (label === "Medium") return 55;
    return 85;
  };

  return (
    <div className="space-y-4">
      {/* Upload Section */}
      <GlassCard delay={0.1}>
        <div className="text-center mb-4">
          <h2 className="font-heading text-xl font-semibold text-foreground">Scan Your Food</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Upload a photo or take a picture of your meal
          </p>
        </div>

        <AnimatePresence mode="wait">
          {!image ? (
            <motion.div
              key="upload"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              <div className="flex gap-3">
                <Button
                  onClick={handleCameraCapture}
                  className="flex-1 h-24 flex-col gap-2 gradient-primary hover:opacity-90 border-0"
                >
                  <Camera className="w-6 h-6" />
                  <span>Take Photo</span>
                </Button>

                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="secondary"
                  className="flex-1 h-24 flex-col gap-2"
                >
                  <Upload className="w-6 h-6" />
                  <span>Upload</span>
                </Button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </motion.div>
          ) : (
            <motion.div
              key="preview"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-4"
            >
              <div className="relative rounded-xl overflow-hidden">
                <img
                  src={image}
                  alt="Food preview"
                  className="w-full h-48 object-cover"
                />
                <button
                  onClick={clearImage}
                  className="absolute top-2 right-2 p-2 bg-foreground/80 text-background rounded-full hover:bg-foreground transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {!result && (
                <Button
                  onClick={analyzeImage}
                  disabled={isAnalyzing}
                  className="w-full h-12 gradient-primary hover:opacity-90 border-0 text-base"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Analyzing with AI...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      Analyze Carbon Impact
                    </>
                  )}
                </Button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </GlassCard>

      {/* Results Section */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
          >
            <GlassCard delay={0}>
              <div className="space-y-4">
                {/* Food Name & Confidence */}
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <Utensils className="w-5 h-5 text-primary" />
                      <h3 className="font-heading text-lg font-semibold">{result.name}</h3>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {result.ingredients.map((ing, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 bg-secondary text-secondary-foreground rounded-full text-xs"
                        >
                          {ing}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-muted-foreground">Confidence</span>
                    <p className="text-sm font-semibold text-primary">{result.confidence}%</p>
                  </div>
                </div>

                {/* Carbon Meter */}
                <CarbonMeter
                  value={getMeterValue(result.label)}
                  label={result.label}
                  kgCO2={result.kgCO2}
                />

                {/* Comparison */}
                <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-xl">
                  <div className="w-10 h-10 gradient-primary rounded-full flex items-center justify-center flex-shrink-0">
                    <Car className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <p className="text-sm">
                    <span className="text-muted-foreground">Equivalent to </span>
                    <span className="font-medium text-foreground">{result.comparison}</span>
                  </p>
                </div>

                {/* Tip */}
                <div className="flex items-start gap-3 p-3 bg-primary/5 border border-primary/20 rounded-xl">
                  <Leaf className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-foreground">{result.tip}</p>
                </div>
              </div>
            </GlassCard>

            {/* Scan Another */}
            <div className="mt-4">
              <Button
                variant="outline"
                onClick={clearImage}
                className="w-full"
              >
                Scan Another Meal
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick Examples */}
      {!image && (
        <GlassCard delay={0.2}>
          <h3 className="font-heading text-sm font-semibold text-muted-foreground mb-3">
            Common Food Carbon Footprints
          </h3>
          <div className="space-y-2">
            {[
              { icon: "🥩", name: "Beef Steak", co2: "14.2 kg", level: "high" },
              { icon: "🍔", name: "Burger", co2: "6.8 kg", level: "high" },
              { icon: "🍕", name: "Pizza", co2: "1.8 kg", level: "medium" },
              { icon: "🥗", name: "Salad", co2: "0.3 kg", level: "low" },
              { icon: "☕", name: "Oat Latte", co2: "0.4 kg", level: "low" },
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xl">{item.icon}</span>
                  <span className="text-sm font-medium">{item.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{item.co2} CO₂</span>
                  <span
                    className={`w-2 h-2 rounded-full ${
                      item.level === "low"
                        ? "bg-carbon-low"
                        : item.level === "medium"
                        ? "bg-carbon-medium"
                        : "bg-carbon-high"
                    }`}
                  />
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      )}
    </div>
  );
}
