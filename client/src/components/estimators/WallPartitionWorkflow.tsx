import { useState, useEffect, useMemo } from "react";
import Step1WallType from "@/components/estimators/Step1WallType";
import Step2SubOptions from "@/components/estimators/Step2SubOptions";
import Step3Dimensions from "@/components/estimators/Step3Dimensions";
import Step4Materials from "@/components/estimators/Step4Materials";
import Step4MaterialShopSelection from "@/components/estimators/Step4MaterialShopSelection";
import Step5RequiredMaterialsComparison from "@/components/estimators/Step5RequiredMaterialsComparison";
import Step5Summary from "@/components/estimators/Step5Summary";
import Step6BOQSummary from "@/components/estimators/Step6BOQSummary";

import { WallType, subOptionsMap } from "@/components/estimators/constants";
import computeRequired from "@/components/estimators/computeRequired";
import { getMaterialsWithLowestRates } from "@/components/estimators/shopMaterials";
import { v4 as uuidv4 } from "uuid";
import { Button } from "@/components/ui/button";

interface MaterialSelection {
  type: string;
  unit: string;
  quantity: number;
  rate?: number;
  shop_name?: string;
}

interface Props {
  onAddItem: (item: any) => void;
}

export function WallPartitionWorkflow({ onAddItem }: Props) {
  const [step, setStep] = useState(1);
  const [wallType, setWallType] = useState<WallType | null>(null);
  const [subOption, setSubOption] = useState<string | null>(null);
  const [length, setLength] = useState<number | null>(null);
  const [height, setHeight] = useState<number | null>(null);
  const [glassLength, setGlassLength] = useState<number | null>(null);
  const [glassHeight, setGlassHeight] = useState<number | null>(null);
  const [materials, setMaterials] = useState<MaterialSelection[]>([]);
  const [selectedMaterials, setSelectedMaterials] = useState<MaterialSelection[]>([]);
  const [liveStatus, setLiveStatus] = useState<Record<string, { ok: boolean; message?: string }>>({});
  const [brickWastage, setBrickWastage] = useState(0);

  const [plywoodSelection, setPlywoodSelection] = useState<{
    plywoodType?: string;
    glazing?: string;
    glassType?: string;
    finish?: string;
    layering?: string;
    beading?: string;
    frame?: string;
  }>({});

  // Get available materials for shop selection (only for civil walls)
  const availableMaterials = useMemo(() => {
    return wallType === "civil" ? getMaterialsWithLowestRates() : [];
  }, [wallType]);

  // ============ NAVIGATION ============
  const handleNext = () => setStep((s) => s + 1);
  const handleBack = () => setStep((s) => s - 1);

  // ============ SUBMIT FUNCTIONS ============
  const handleSubmitFinal = () => {
    if (wallType === "civil") {
      // For civil walls, go to step 4 (material shop selection)
      setStep(4);
    } else {
      // For other wall types, jump to summary
      setStep(5);
    }
  };

  const handleValidatedSubmitFinal = () => {
    if (!length || !height || (wallType === "plywood-glass" && !glassHeight)) {
      alert("Please enter all dimensions before viewing the summary.");
      return;
    }
    handleSubmitFinal();
  };

  const handleMaterialSelect = (selected: MaterialSelection[]) => {
    setSelectedMaterials(selected);
  };

  const handleMaterialUpdate = (updated: MaterialSelection[]) => {
    setSelectedMaterials(updated);
  };

  const handleSubmit = () => {
    if (!wallType || !length || !height || (wallType === "plywood-glass" && !glassHeight)) {
      alert("Please fill all required fields");
      return;
    }

    const materialsToUse = wallType === "civil" ? selectedMaterials : materials;
    const cost = materialsToUse.reduce((sum, m) => sum + m.quantity * (m.rate || 0), 0);

    const newItem = {
      id: uuidv4(),
      componentType: "wall-partition",
      wallType,
      subOption:
        wallType === "plywood" || wallType === "plywood-glass"
          ? `${plywoodSelection.plywoodType} - ${plywoodSelection.glazing}`
          : subOption,
      length,
      height,
      materials: materialsToUse,
      brickWastage,
      cost,
    };

    onAddItem(newItem);

    // Reset workflow
    resetWorkflow();
  };

  const resetWorkflow = () => {
    setStep(1);
    setWallType(null);
    setSubOption(null);
    setLength(null);
    setHeight(null);
    setGlassHeight(null);
    setGlassLength(null);
    setMaterials([]);
    setSelectedMaterials([]);
    setLiveStatus({});
    setBrickWastage(0);
    setPlywoodSelection({});
  };

  // Auto-skip Step 2 if no subOptions (Civil / Gypsum)
  useEffect(() => {
    if (step === 2 && wallType && !subOptionsMap[wallType]?.length) handleNext();
  }, [step, wallType]);

  // ============ PLYWOOD-GLASS MATERIALS MEMO ============
  const req = useMemo(() => {
    if (
      wallType === "gypsum-glass" &&
      length != null &&
      height != null &&
      glassHeight != null &&
      glassLength != null
    ) {
      return computeRequired(
        "gypsum-glass",
        length,
        height,
        undefined,
        subOption ?? "Single Layer",
        brickWastage,
        undefined,
        glassHeight,
        glassLength,
        undefined
      );
    }

    if (
      wallType === "plywood-glass" &&
      length != null &&
      height != null &&
      glassHeight != null &&
      plywoodSelection.plywoodType
    ) {
      return computeRequired(
        "plywood-glass",
        length,
        height,
        undefined,
        plywoodSelection.glazing ?? "Single Glazing",
        undefined,
        plywoodSelection.plywoodType,
        glassHeight,
        glassLength,
        plywoodSelection.layering ?? "Single"
      );
    }

    return null;
  }, [wallType, length, height, glassHeight, glassLength, plywoodSelection, subOption, brickWastage]);

  // ============ RENDER ============
  return (
    <div className="bg-black text-white p-6 rounded-lg space-y-6">
      <h2 className="text-2xl font-bold text-cyan-400">Wall Partition Estimator</h2>

      {/* Step 1: Wall Type */}
      {step === 1 && (
        <Step1WallType wallType={wallType} setWallType={setWallType} handleNext={handleNext} />
      )}

      {/* Step 2: Sub Options */}
      {step === 2 &&
        (wallType === "plywood-glass" ? (
          <div className="space-y-4 p-4 bg-gray-700 rounded">
            <h3 className="font-semibold text-white">Select Plywood + Glass Options</h3>
            {/* Plywood/Glass selection UI - abbreviated for brevity */}
            <div className="flex gap-2 mt-4">
              <Button onClick={handleBack} className="bg-gray-500 text-black">
                Back
              </Button>
              <Button onClick={handleNext} className="bg-cyan-500 text-black">
                Next
              </Button>
            </div>
          </div>
        ) : (
          wallType && (
            <Step2SubOptions
              wallType={wallType}
              subOption={subOption}
              setSubOption={setSubOption}
              plywoodSelection={plywoodSelection}
              setPlywoodSelection={setPlywoodSelection}
              setMaterials={setMaterials}
              handleNext={handleNext}
              handleBack={handleBack}
            />
          )
        ))}

      {/* Step 3: Dimensions */}
      {step === 3 && (
        <Step3Dimensions
          wallType={wallType}
          length={length}
          height={height}
          setLength={setLength}
          setHeight={setHeight}
          glassHeight={glassHeight}
          setGlassHeight={setGlassHeight}
          glassLength={glassLength}
          setGlassLength={setGlassLength}
          handleNext={handleNext}
          handleBack={handleBack}
        />
      )}

      {/* Step 4 (Civil Only): Material Shop Selection */}
      {step === 4 && wallType === "civil" && (
        <Step4MaterialShopSelection
          materials={availableMaterials}
          handleNext={handleNext}
          handleBack={handleBack}
          onMaterialSelect={handleMaterialSelect}
        />
      )}

      {/* Step 5 (Civil Only): Required Materials Comparison */}
      {step === 5 && wallType === "civil" && (
        <Step5RequiredMaterialsComparison
          wallType={wallType}
          subOption={subOption}
          length={length}
          height={height}
          selectedMaterials={selectedMaterials}
          brickWastage={brickWastage}
          handleBack={handleBack}
          handleNext={handleNext}
          onMaterialUpdate={handleMaterialUpdate}
        />
      )}

      {/* Step 6 (Civil Only): BOQ Summary */}
      {step === 6 && wallType === "civil" && (
        <Step6BOQSummary
          wallType={wallType}
          subOption={subOption}
          length={length}
          height={height}
          materials={selectedMaterials}
          brickWastage={brickWastage}
          handleBack={handleBack}
          handleSubmit={handleSubmit}
        />
      )}

      {/* Step 4 (Non-Civil): Materials */}
      {step === 4 && wallType !== "civil" && (
        <Step4Materials
          wallType={wallType}
          subOption={wallType === "plywood" ? plywoodSelection.glazing ?? null : subOption}
          length={length}
          height={height}
          glassHeight={glassHeight}
          glassLength={glassLength}
          materials={materials}
          setMaterials={setMaterials}
          brickWastage={brickWastage}
          setBrickWastage={setBrickWastage}
          liveStatus={liveStatus}
          setLiveStatus={setLiveStatus}
          handleBack={handleBack}
          handleSubmitFinal={handleValidatedSubmitFinal}
          handleSubmit={handleSubmit}
          plywoodSelection={plywoodSelection}
        />
      )}

      {/* Step 5 (Non-Civil): Summary */}
      {step === 5 && wallType !== "civil" && (
        <Step5Summary
          wallType={wallType}
          subOption={wallType === "plywood" ? `${plywoodSelection.plywoodType} - ${plywoodSelection.glazing}` : subOption}
          length={length}
          height={height}
          materials={materials}
          liveStatus={liveStatus}
          handleBack={() => setStep(4)}
          handleSubmit={handleSubmit}
          brickWastage={brickWastage}
          handleUpdateMaterials={setMaterials}
          plywoodSelection={plywoodSelection}
          req={req}
        />
      )}
    </div>
  );
}
