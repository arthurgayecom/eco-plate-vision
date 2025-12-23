import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Upload, X, Sparkles, Loader2, Car, Leaf, Utensils, Droplets, MapPin, Zap, Trash2, Scale, Star, Heart, Apple, AlertTriangle, CheckCircle } from "lucide-react";
import { GlassCard } from "../ui/GlassCard";
import { CarbonMeter } from "../ui/CarbonMeter";
import { Button } from "../ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface ResourcesUsed {
  waterLiters: number;
  landSqMeters: number;
  energyKwh: number;
}

interface PotentialWaste {
  typicalWastePercent: number;
  potentialWastedKgCO2: number;
  potentialWaterWasted: number;
  preventionTip: string;
}

interface HealthAnalysis {
  healthScore: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sodium: number;
  sugar: number;
  vitamins: string[];
  healthLabel: "Healthy" | "Moderate" | "Unhealthy";
  benefits: string[];
  concerns: string[];
  healthTip: string;
}

interface FoodResult {
  name: string;
  ingredients: string[];
  estimatedWeightGrams: number;
  kgCO2: number;
  label: "Low" | "Medium" | "High";
  comparison: string;
  resourcesUsed: ResourcesUsed;
  potentialWaste: PotentialWaste;
  healthAnalysis: HealthAnalysis;
  qualityScore: number;
  qualityNotes: string;
  tip: string;
  confidence: number;
}

interface WasteResult {
  wastedItems: string[];
  estimatedWasteGrams: number;
  wastePercentage: number;
  wastedKgCO2: number;
  wasteCategory: "Low" | "Medium" | "High";
  resourcesLost: ResourcesUsed;
  wasteComparison: string;
  wasteTip: string;
  confidence: number;
}

type AnalysisStep = "initial" | "food-analyzed" | "waste-analyzed";

export function FoodScanTab() {
  const [beforeImage, setBeforeImage] = useState<string | null>(null);
  const [afterImage, setAfterImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState<AnalysisStep>("initial");
  const [foodResult, setFoodResult] = useState<FoodResult | null>(null);
  const [wasteResult, setWasteResult] = useState<WasteResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const afterFileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: "before" | "after") => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === "before") {
          setBeforeImage(reader.result as string);
          setFoodResult(null);
          setAnalysisStep("initial");
        } else {
          setAfterImage(reader.result as string);
          setWasteResult(null);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCameraCapture = (type: "before" | "after") => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.capture = "environment";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (type === "before") {
            setBeforeImage(reader.result as string);
            setFoodResult(null);
            setAnalysisStep("initial");
          } else {
            setAfterImage(reader.result as string);
            setWasteResult(null);
          }
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const analyzeFood = async () => {
    if (!beforeImage) return;
    setIsAnalyzing(true);

    try {
      const { data, error } = await supabase.functions.invoke("analyze-food", {
        body: { imageBase64: beforeImage, analysisType: "food" },
      });

      if (error) {
        console.error("Error analyzing food:", error);
        toast.error("Failed to analyze food", {
          description: error.message || "Please try again with a clearer image",
        });
        setIsAnalyzing(false);
        return;
      }

      if (data?.error) {
        toast.error("Analysis failed", { description: data.error });
        setIsAnalyzing(false);
        return;
      }

      if (data?.result) {
        const result = data.result as FoodResult;
        if (result.confidence >= 85) {
          setFoodResult(result);
          setAnalysisStep("food-analyzed");
          toast.success("Food analyzed successfully!", {
            description: `Detected: ${result.name} (${result.estimatedWeightGrams}g)`,
          });
        } else {
          toast.error("Could not identify food with high confidence", {
            description: `Only ${result.confidence}% confident. Please try a clearer image.`,
          });
        }
      }
    } catch (err) {
      console.error("Error:", err);
      toast.error("Something went wrong", { description: "Please try again" });
    }
    setIsAnalyzing(false);
  };

  const analyzeWaste = async () => {
    if (!afterImage) return;
    setIsAnalyzing(true);

    try {
      const { data, error } = await supabase.functions.invoke("analyze-food", {
        body: { imageBase64: afterImage, analysisType: "waste" },
      });

      if (error) {
        console.error("Error analyzing waste:", error);
        toast.error("Failed to analyze waste", {
          description: error.message || "Please try again with a clearer image",
        });
        setIsAnalyzing(false);
        return;
      }

      if (data?.error) {
        toast.error("Analysis failed", { description: data.error });
        setIsAnalyzing(false);
        return;
      }

      if (data?.result) {
        const result = data.result as WasteResult;
        if (result.confidence >= 75) {
          setWasteResult(result);
          setAnalysisStep("waste-analyzed");
          toast.success("Waste analyzed!", {
            description: `${result.wastePercentage}% of your meal was wasted`,
          });
        } else {
          toast.error("Could not analyze waste with confidence", {
            description: "Please try a clearer image of the leftovers.",
          });
        }
      }
    } catch (err) {
      console.error("Error:", err);
      toast.error("Something went wrong", { description: "Please try again" });
    }
    setIsAnalyzing(false);
  };

  const clearAll = () => {
    setBeforeImage(null);
    setAfterImage(null);
    setFoodResult(null);
    setWasteResult(null);
    setAnalysisStep("initial");
  };

  const getMeterValue = (label: "Low" | "Medium" | "High") => {
    if (label === "Low") return 25;
    if (label === "Medium") return 55;
    return 85;
  };

  return (
    <div className="space-y-4">
      {/* Before Meal Upload */}
      <GlassCard delay={0.1}>
        <div className="text-center mb-4">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Utensils className="w-5 h-5 text-primary" />
            <h2 className="font-heading text-xl font-semibold text-foreground">Before Eating</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Upload a photo of your meal before eating
          </p>
        </div>

        <AnimatePresence mode="wait">
          {!beforeImage ? (
            <motion.div
              key="upload-before"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              <div className="flex gap-3">
                <Button
                  onClick={() => handleCameraCapture("before")}
                  className="flex-1 h-20 flex-col gap-2 gradient-primary hover:opacity-90 border-0"
                >
                  <Camera className="w-5 h-5" />
                  <span className="text-sm">Take Photo</span>
                </Button>
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="secondary"
                  className="flex-1 h-20 flex-col gap-2"
                >
                  <Upload className="w-5 h-5" />
                  <span className="text-sm">Upload</span>
                </Button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(e, "before")}
                className="hidden"
              />
            </motion.div>
          ) : (
            <motion.div
              key="preview-before"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-3"
            >
              <div className="relative rounded-xl overflow-hidden">
                <img src={beforeImage} alt="Food before" className="w-full h-40 object-cover" />
                <button
                  onClick={clearAll}
                  className="absolute top-2 right-2 p-2 bg-foreground/80 text-background rounded-full hover:bg-foreground transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {analysisStep === "initial" && (
                <Button
                  onClick={analyzeFood}
                  disabled={isAnalyzing}
                  className="w-full h-11 gradient-primary hover:opacity-90 border-0"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Analyze Meal
                    </>
                  )}
                </Button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </GlassCard>

      {/* Food Analysis Results */}
      <AnimatePresence>
        {foodResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
          >
            <GlassCard delay={0}>
              <div className="space-y-4">
                {/* Food Name & Weight */}
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-heading text-lg font-semibold">{foodResult.name}</h3>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {foodResult.ingredients.map((ing, i) => (
                        <span key={i} className="px-2 py-0.5 bg-secondary text-secondary-foreground rounded-full text-xs">
                          {ing}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-muted-foreground text-xs">
                      <Scale className="w-3 h-3" />
                      <span>Weight</span>
                    </div>
                    <p className="font-semibold text-primary">{foodResult.estimatedWeightGrams}g</p>
                  </div>
                </div>

                {/* Quality Score */}
                <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-xl">
                  <div className="w-10 h-10 bg-amber-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <Star className="w-5 h-5 text-amber-500" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-muted-foreground">Food Quality</span>
                      <span className="text-sm font-semibold">{foodResult.qualityScore}/100</span>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">{foodResult.qualityNotes}</p>
                  </div>
                </div>

                {/* Health Analysis Section - Good for Body */}
                {foodResult.healthAnalysis && (
                  <div className="p-4 bg-gradient-to-br from-pink-500/10 to-red-500/10 border border-pink-500/20 rounded-xl space-y-4">
                    <div className="flex items-center gap-2">
                      <Heart className="w-5 h-5 text-pink-500" />
                      <span className="font-semibold text-foreground">Health for Your Body</span>
                      <span className={`ml-auto px-2 py-0.5 text-xs font-medium rounded-full ${
                        foodResult.healthAnalysis.healthLabel === "Healthy" 
                          ? "bg-green-500/20 text-green-600"
                          : foodResult.healthAnalysis.healthLabel === "Moderate"
                          ? "bg-yellow-500/20 text-yellow-600"
                          : "bg-red-500/20 text-red-600"
                      }`}>
                        {foodResult.healthAnalysis.healthLabel}
                      </span>
                    </div>

                    {/* Health Score */}
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <div className="h-3 bg-secondary rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${foodResult.healthAnalysis.healthScore}%` }}
                            transition={{ duration: 1 }}
                            className={`h-full ${
                              foodResult.healthAnalysis.healthScore >= 75 
                                ? "bg-green-500"
                                : foodResult.healthAnalysis.healthScore >= 50
                                ? "bg-yellow-500"
                                : "bg-red-500"
                            }`}
                          />
                        </div>
                      </div>
                      <span className="text-sm font-bold">{foodResult.healthAnalysis.healthScore}/100</span>
                    </div>

                    {/* Nutrition Grid */}
                    <div className="grid grid-cols-4 gap-2">
                      <div className="p-2 bg-background/50 rounded-lg text-center">
                        <p className="text-lg font-bold text-foreground">{foodResult.healthAnalysis.calories}</p>
                        <p className="text-xs text-muted-foreground">Calories</p>
                      </div>
                      <div className="p-2 bg-background/50 rounded-lg text-center">
                        <p className="text-lg font-bold text-blue-500">{foodResult.healthAnalysis.protein}g</p>
                        <p className="text-xs text-muted-foreground">Protein</p>
                      </div>
                      <div className="p-2 bg-background/50 rounded-lg text-center">
                        <p className="text-lg font-bold text-yellow-500">{foodResult.healthAnalysis.carbs}g</p>
                        <p className="text-xs text-muted-foreground">Carbs</p>
                      </div>
                      <div className="p-2 bg-background/50 rounded-lg text-center">
                        <p className="text-lg font-bold text-orange-500">{foodResult.healthAnalysis.fat}g</p>
                        <p className="text-xs text-muted-foreground">Fat</p>
                      </div>
                    </div>

                    {/* Additional Nutrients */}
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="flex items-center justify-between px-2 py-1 bg-background/30 rounded">
                        <span className="text-muted-foreground">Fiber</span>
                        <span className="font-medium">{foodResult.healthAnalysis.fiber}g</span>
                      </div>
                      <div className="flex items-center justify-between px-2 py-1 bg-background/30 rounded">
                        <span className="text-muted-foreground">Sugar</span>
                        <span className="font-medium">{foodResult.healthAnalysis.sugar}g</span>
                      </div>
                      <div className="flex items-center justify-between px-2 py-1 bg-background/30 rounded">
                        <span className="text-muted-foreground">Sodium</span>
                        <span className="font-medium">{foodResult.healthAnalysis.sodium}mg</span>
                      </div>
                    </div>

                    {/* Vitamins */}
                    {foodResult.healthAnalysis.vitamins.length > 0 && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1.5">Key Nutrients</p>
                        <div className="flex flex-wrap gap-1">
                          {foodResult.healthAnalysis.vitamins.map((vitamin, i) => (
                            <span key={i} className="px-2 py-0.5 bg-green-500/20 text-green-600 rounded-full text-xs">
                              {vitamin}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Benefits & Concerns */}
                    <div className="grid grid-cols-2 gap-3">
                      {foodResult.healthAnalysis.benefits.length > 0 && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-1.5 flex items-center gap-1">
                            <CheckCircle className="w-3 h-3 text-green-500" /> Benefits
                          </p>
                          <ul className="space-y-1">
                            {foodResult.healthAnalysis.benefits.slice(0, 3).map((benefit, i) => (
                              <li key={i} className="text-xs text-green-600">{benefit}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {foodResult.healthAnalysis.concerns.length > 0 && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-1.5 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3 text-orange-500" /> Concerns
                          </p>
                          <ul className="space-y-1">
                            {foodResult.healthAnalysis.concerns.slice(0, 3).map((concern, i) => (
                              <li key={i} className="text-xs text-orange-600">{concern}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    {/* Health Tip */}
                    <div className="flex items-start gap-2 p-2 bg-pink-500/10 rounded-lg">
                      <Apple className="w-4 h-4 text-pink-500 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-foreground">{foodResult.healthAnalysis.healthTip}</p>
                    </div>
                  </div>
                )}

                {/* Planet Impact Section Header */}
                <div className="flex items-center gap-2 pt-2">
                  <Leaf className="w-5 h-5 text-primary" />
                  <span className="font-semibold text-foreground">Impact on the Planet</span>
                </div>

                {/* Carbon Meter */}
                <CarbonMeter
                  value={getMeterValue(foodResult.label)}
                  label={foodResult.label}
                  kgCO2={foodResult.kgCO2}
                />

                {/* Resources Used */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="p-3 bg-blue-500/10 rounded-xl text-center">
                    <Droplets className="w-4 h-4 text-blue-500 mx-auto mb-1" />
                    <p className="text-xs text-muted-foreground">Water</p>
                    <p className="text-sm font-semibold">{foodResult.resourcesUsed.waterLiters}L</p>
                  </div>
                  <div className="p-3 bg-green-500/10 rounded-xl text-center">
                    <MapPin className="w-4 h-4 text-green-500 mx-auto mb-1" />
                    <p className="text-xs text-muted-foreground">Land</p>
                    <p className="text-sm font-semibold">{foodResult.resourcesUsed.landSqMeters}m²</p>
                  </div>
                  <div className="p-3 bg-yellow-500/10 rounded-xl text-center">
                    <Zap className="w-4 h-4 text-yellow-500 mx-auto mb-1" />
                    <p className="text-xs text-muted-foreground">Energy</p>
                    <p className="text-sm font-semibold">{foodResult.resourcesUsed.energyKwh}kWh</p>
                  </div>
                </div>

                {/* Comparison */}
                <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-xl">
                  <div className="w-10 h-10 gradient-primary rounded-full flex items-center justify-center flex-shrink-0">
                    <Car className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <p className="text-sm">
                    <span className="text-muted-foreground">Equivalent to </span>
                    <span className="font-medium text-foreground">{foodResult.comparison}</span>
                  </p>
                </div>

                {/* Potential Waste Warning */}
                <div className="p-3 bg-orange-500/10 border border-orange-500/20 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Trash2 className="w-4 h-4 text-orange-500" />
                    <span className="text-sm font-semibold text-orange-600">Potential Waste Impact</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mb-2">
                    <div>
                      <p className="text-xs text-muted-foreground">Typical waste</p>
                      <p className="text-sm font-semibold">{foodResult.potentialWaste.typicalWastePercent}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">CO₂ if wasted</p>
                      <p className="text-sm font-semibold">{foodResult.potentialWaste.potentialWastedKgCO2} kg</p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">{foodResult.potentialWaste.preventionTip}</p>
                </div>

                {/* Eco Tip */}
                <div className="flex items-start gap-3 p-3 bg-primary/5 border border-primary/20 rounded-xl">
                  <Leaf className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-foreground">{foodResult.tip}</p>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* After Meal Upload - Only show after food is analyzed */}
      {analysisStep === "food-analyzed" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <GlassCard delay={0.1}>
            <div className="text-center mb-4">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Trash2 className="w-5 h-5 text-orange-500" />
                <h2 className="font-heading text-xl font-semibold text-foreground">After Eating</h2>
              </div>
              <p className="text-sm text-muted-foreground">
                Upload a photo of your plate after eating to measure waste
              </p>
            </div>

            <AnimatePresence mode="wait">
              {!afterImage ? (
                <motion.div
                  key="upload-after"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-3"
                >
                  <div className="flex gap-3">
                    <Button
                      onClick={() => handleCameraCapture("after")}
                      className="flex-1 h-20 flex-col gap-2 bg-orange-500 hover:bg-orange-600 border-0"
                    >
                      <Camera className="w-5 h-5" />
                      <span className="text-sm">Take Photo</span>
                    </Button>
                    <Button
                      onClick={() => afterFileInputRef.current?.click()}
                      variant="secondary"
                      className="flex-1 h-20 flex-col gap-2"
                    >
                      <Upload className="w-5 h-5" />
                      <span className="text-sm">Upload</span>
                    </Button>
                  </div>
                  <input
                    ref={afterFileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, "after")}
                    className="hidden"
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="preview-after"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="space-y-3"
                >
                  <div className="relative rounded-xl overflow-hidden">
                    <img src={afterImage} alt="Food after" className="w-full h-40 object-cover" />
                    <button
                      onClick={() => setAfterImage(null)}
                      className="absolute top-2 right-2 p-2 bg-foreground/80 text-background rounded-full hover:bg-foreground transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {!wasteResult && (
                    <Button
                      onClick={analyzeWaste}
                      disabled={isAnalyzing}
                      className="w-full h-11 bg-orange-500 hover:bg-orange-600 border-0"
                    >
                      {isAnalyzing ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Analyzing Waste...
                        </>
                      ) : (
                        <>
                          <Trash2 className="w-4 h-4 mr-2" />
                          Measure Waste
                        </>
                      )}
                    </Button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </GlassCard>
        </motion.div>
      )}

      {/* Waste Analysis Results */}
      <AnimatePresence>
        {wasteResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
          >
            <GlassCard delay={0}>
              <div className="space-y-4">
                {/* Waste Summary */}
                <div className="text-center p-4 bg-secondary/50 rounded-xl">
                  <p className="text-xs text-muted-foreground mb-1">You wasted</p>
                  <p className="text-3xl font-heading font-bold text-orange-500">{wasteResult.wastePercentage}%</p>
                  <p className="text-sm text-muted-foreground mt-1">{wasteResult.estimatedWasteGrams}g of your meal</p>
                </div>

                {/* Wasted Items */}
                {wasteResult.wastedItems.length > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Wasted items</p>
                    <div className="flex flex-wrap gap-1.5">
                      {wasteResult.wastedItems.map((item, i) => (
                        <span key={i} className="px-2 py-0.5 bg-orange-500/20 text-orange-600 rounded-full text-xs">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Waste Carbon Meter */}
                <div className="p-3 bg-orange-500/10 border border-orange-500/20 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">CO₂ Wasted</span>
                    <span className="text-lg font-bold text-orange-500">{wasteResult.wastedKgCO2} kg</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(wasteResult.wastePercentage, 100)}%` }}
                      transition={{ duration: 1 }}
                      className="h-full bg-orange-500"
                    />
                  </div>
                </div>

                {/* Resources Lost */}
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Resources Lost</p>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="p-3 bg-red-500/10 rounded-xl text-center">
                      <Droplets className="w-4 h-4 text-red-500 mx-auto mb-1" />
                      <p className="text-xs text-muted-foreground">Water</p>
                      <p className="text-sm font-semibold text-red-500">{wasteResult.resourcesLost.waterLiters}L</p>
                    </div>
                    <div className="p-3 bg-red-500/10 rounded-xl text-center">
                      <MapPin className="w-4 h-4 text-red-500 mx-auto mb-1" />
                      <p className="text-xs text-muted-foreground">Land</p>
                      <p className="text-sm font-semibold text-red-500">{wasteResult.resourcesLost.landSqMeters}m²</p>
                    </div>
                    <div className="p-3 bg-red-500/10 rounded-xl text-center">
                      <Zap className="w-4 h-4 text-red-500 mx-auto mb-1" />
                      <p className="text-xs text-muted-foreground">Energy</p>
                      <p className="text-sm font-semibold text-red-500">{wasteResult.resourcesLost.energyKwh}kWh</p>
                    </div>
                  </div>
                </div>

                {/* Waste Comparison */}
                <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-xl">
                  <div className="w-10 h-10 bg-orange-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <Trash2 className="w-5 h-5 text-orange-500" />
                  </div>
                  <p className="text-sm">
                    <span className="text-muted-foreground">Your waste is </span>
                    <span className="font-medium text-foreground">{wasteResult.wasteComparison}</span>
                  </p>
                </div>

                {/* Waste Tip */}
                <div className="flex items-start gap-3 p-3 bg-primary/5 border border-primary/20 rounded-xl">
                  <Leaf className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-foreground">{wasteResult.wasteTip}</p>
                </div>
              </div>
            </GlassCard>

            {/* Scan Another */}
            <div className="mt-4">
              <Button variant="outline" onClick={clearAll} className="w-full">
                Scan Another Meal
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick Examples - Only show when nothing is uploaded */}
      {!beforeImage && (
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
