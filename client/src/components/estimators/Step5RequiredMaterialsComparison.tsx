import React, { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertCircle, CheckCircle2, AlertTriangle } from "lucide-react";
import computeRequired from "../estimators/computeRequired";

interface SelectedMaterial {
  type: string;
  quantity: number;
  rate: number;
  shop_name: string;
  unit: string;
}

interface Props {
  wallType: string;
  subOption: string | null;
  length: number | null;
  height: number | null;
  selectedMaterials: SelectedMaterial[];
  brickWastage: number;
  handleBack: () => void;
  handleNext: () => void;
  onMaterialUpdate: (materials: SelectedMaterial[]) => void;
}

export default function Step5RequiredMaterialsComparison({
  wallType,
  subOption,
  length,
  height,
  selectedMaterials,
  brickWastage,
  handleBack,
  handleNext,
  onMaterialUpdate,
}: Props) {
  // Compute required materials
  const required = useMemo(() => {
    if (!wallType || !length || !height) return null;
    return computeRequired(
      wallType as any,
      length,
      height,
      undefined,
      subOption,
      brickWastage
    );
  }, [wallType, length, height, subOption, brickWastage]);

  // Build required materials list
  const requiredMaterials = useMemo(() => {
    if (!required || wallType !== "civil") return [];

    return [
      {
        type: "Bricks",
        required: required.roundedBricks ?? 0,
        unit: "pcs",
        validTypes: [
          "Red Clay Brick",
          "Fly Ash Brick",
          "Argon Block",
          "Solid Block",
        ],
      },
      {
        type: "Cement",
        required: required.roundedCementBags ?? 0,
        unit: "bags",
        validTypes: [
          "Ordinary Portland Cement",
          "Pozzolana Cement",
          "White Cement",
        ],
      },
      {
        type: "Sand",
        required: required.roundedSandCubicFt ?? 0,
        unit: "ft³",
        validTypes: ["River Sand", "M-Sand"],
      },
    ];
  }, [required, wallType]);

  // Check status: missing, insufficient, extra, or ok
  const getMaterialStatus = (
    reqType: string,
    requiredQty: number,
    validTypes: string[]
  ) => {
    const selected = selectedMaterials.filter((m) =>
      validTypes.includes(m.type)
    );
    const totalQty = selected.reduce((sum, m) => sum + m.quantity, 0);

    if (requiredQty <= 0) return { status: "ok", message: "Not required" };
    if (selected.length === 0)
      return {
        status: "missing",
        message: `Missing — required ${requiredQty.toFixed(2)} ${validTypes[0]}`,
      };
    if (totalQty < requiredQty)
      return {
        status: "insufficient",
        message: `Insufficient — required ${requiredQty.toFixed(2)}, provided ${totalQty.toFixed(2)}`,
      };
    if (totalQty > requiredQty)
      return {
        status: "extra",
        message: `Extra — required ${requiredQty.toFixed(2)}, provided ${totalQty.toFixed(2)}`,
      };
    return { status: "ok", message: "OK" };
  };

  const allOk = requiredMaterials.every(({ type, required: req, validTypes }) => {
    const { status } = getMaterialStatus(type, req, validTypes);
    return status === "ok" || status === "extra";
  });

  return (
    <div className="space-y-4 p-4 bg-gray-700 rounded">
      <h3 className="font-semibold text-white text-lg">
        Review Required Materials
      </h3>
      <p className="text-sm text-gray-200">
        Compare selected materials with required quantities. Red = missing,
        Orange = insufficient, Green = adequate, Blue = extra.
      </p>

      <div className="space-y-3 max-h-96 overflow-y-auto bg-white p-4 rounded">
        {requiredMaterials.map(({ type, required: reqQty, unit, validTypes }) => {
          const { status, message } = getMaterialStatus(
            type,
            reqQty,
            validTypes
          );
          const selected = selectedMaterials.filter((m) =>
            validTypes.includes(m.type)
          );

          const statusColors: Record<string, string> = {
            ok: "border-green-500 bg-green-50",
            extra: "border-blue-500 bg-blue-50",
            insufficient: "border-orange-500 bg-orange-50",
            missing: "border-red-500 bg-red-50",
          };

          const statusIcons: Record<string, JSX.Element> = {
            ok: <CheckCircle2 className="w-4 h-4 text-green-600" />,
            extra: <AlertCircle className="w-4 h-4 text-blue-600" />,
            insufficient: <AlertTriangle className="w-4 h-4 text-orange-600" />,
            missing: <AlertCircle className="w-4 h-4 text-red-600" />,
          };

          return (
            <div
              key={type}
              className={`border-2 rounded-md p-3 space-y-2 ${statusColors[status]}`}
            >
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {statusIcons[status]}
                  <span className="font-semibold text-black">{type}</span>
                </div>
                <span className="text-sm font-semibold text-gray-700">
                  Required: {reqQty.toFixed(2)} {unit}
                </span>
              </div>

              {/* Status Message */}
              <p className="text-sm text-gray-700">{message}</p>

              {/* Selected Materials List */}
              {selected.length > 0 && (
                <div className="ml-4 space-y-2 border-t pt-2">
                  <p className="text-xs font-semibold text-gray-600">
                    Selected from:
                  </p>
                  {selected.map((mat) => (
                    <div
                      key={`${mat.type}-${mat.shop_name}`}
                      className="text-sm text-gray-700 flex justify-between"
                    >
                      <span>
                        {mat.type} ({mat.shop_name})
                      </span>
                      <span>
                        {mat.quantity} {mat.unit} @ ₹{mat.rate} = ₹
                        {(mat.quantity * mat.rate).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Additional Charges Section */}
      <div className="bg-white p-4 rounded space-y-2">
        <p className="font-semibold text-black text-sm">Additional Charges:</p>
        {["Hardware", "Loading & Unloading", "Transport", "Labour Charges"].map(
          (charge) => {
            const selected = selectedMaterials.find((m) => m.type === charge);
            return (
              <div key={charge} className="flex items-center gap-2 text-sm">
                <span className="text-gray-700 w-40">{charge}</span>
                <span className="text-gray-700">
                  {selected
                    ? `${selected.quantity} × ₹${selected.rate} = ₹${(selected.quantity * selected.rate).toFixed(2)}`
                    : "Not added"}
                </span>
              </div>
            );
          }
        )}
      </div>

      {/* Navigation */}
      <div className="flex gap-2 mt-4">
        <Button onClick={handleBack} className="bg-gray-500 text-black w-1/2">
          Back
        </Button>
        <Button
          onClick={handleNext}
          className={`text-black w-1/2 ${
            allOk ? "bg-cyan-500" : "bg-orange-500"
          }`}
          disabled={!allOk && requiredMaterials.some((m) => m.required > 0)}
        >
          {allOk ? "Next: Generate BOQ" : "Review & Continue"}
        </Button>
      </div>
    </div>
  );
}
