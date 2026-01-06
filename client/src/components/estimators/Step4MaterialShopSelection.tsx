import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

interface MaterialShop {
  shop_name: string;
  rate: number;
  availability: boolean;
}

interface MaterialWithShops {
  type: string;
  shops: MaterialShop[];
  lowestRate: number;
  selectedRate: number;
  selectedQuantity: number;
}

interface Props {
  materials: MaterialWithShops[];
  handleNext: () => void;
  handleBack: () => void;
  onMaterialSelect: (materials: any[]) => void;
}

export default function Step4MaterialShopSelection({
  materials,
  handleNext,
  handleBack,
  onMaterialSelect,
}: Props) {
  const [selectedMaterials, setSelectedMaterials] = useState<Record<string, any>>({});

  // Initialize with default lowest rates
  React.useEffect(() => {
    const defaults: Record<string, any> = {};
    materials.forEach((mat) => {
      const lowestShop = mat.shops.reduce((prev, current) =>
        current.rate < prev.rate ? current : prev
      );
      defaults[mat.type] = {
        type: mat.type,
        selected: false,
        quantity: 0,
        rate: lowestShop.rate,
        shop_name: lowestShop.shop_name,
      };
    });
    setSelectedMaterials(defaults);
  }, [materials]);

  const handleMaterialToggle = (materialType: string) => {
    setSelectedMaterials((prev) => ({
      ...prev,
      [materialType]: {
        ...prev[materialType],
        selected: !prev[materialType].selected,
      },
    }));
  };

  const handleQuantityChange = (materialType: string, qty: number) => {
    setSelectedMaterials((prev) => ({
      ...prev,
      [materialType]: {
        ...prev[materialType],
        quantity: qty,
      },
    }));
  };

  const handleRateChange = (materialType: string, newRate: number) => {
    setSelectedMaterials((prev) => ({
      ...prev,
      [materialType]: {
        ...prev[materialType],
        rate: newRate,
      },
    }));
  };

  const handleShopChange = (materialType: string, shopName: string) => {
    const material = materials.find((m) => m.type === materialType);
    if (!material) return;

    const selectedShop = material.shops.find((s) => s.shop_name === shopName);
    if (!selectedShop) return;

    setSelectedMaterials((prev) => ({
      ...prev,
      [materialType]: {
        ...prev[materialType],
        shop_name: shopName,
        rate: selectedShop.rate,
      },
    }));
  };

  const handleNextStep = () => {
    const selected = Object.values(selectedMaterials)
      .filter((m: any) => m.selected)
      .map((m: any) => ({
        type: m.type,
        quantity: m.quantity,
        rate: m.rate,
        shop_name: m.shop_name,
        unit: "pcs",
      }));

    onMaterialSelect(selected);
    handleNext();
  };

  return (
    <div className="space-y-4 p-4 bg-gray-700 rounded">
      <h3 className="font-semibold text-white text-lg">Select Materials & Shops</h3>
      <p className="text-sm text-gray-200">
        Choose available materials from different shops. Default lowest rate is pre-selected.
      </p>

      <div className="space-y-3 max-h-96 overflow-y-auto bg-white p-4 rounded">
        {materials.map((material) => (
          <div
            key={material.type}
            className="border rounded-md p-3 space-y-2 bg-gray-50"
          >
            {/* Material Header */}
            <div className="flex items-center gap-2">
              <Checkbox
                checked={selectedMaterials[material.type]?.selected || false}
                onCheckedChange={() => handleMaterialToggle(material.type)}
              />
              <span className="font-semibold text-black w-48">{material.type}</span>
            </div>

            {/* Shop Selection & Rate */}
            {selectedMaterials[material.type]?.selected && (
              <div className="ml-6 space-y-2 bg-white p-2 rounded border-l-2 border-cyan-500">
                <div className="grid grid-cols-2 gap-2">
                  {/* Shop Dropdown */}
                  <div>
                    <label className="text-xs text-gray-600">Shop:</label>
                    <select
                      value={selectedMaterials[material.type]?.shop_name || ""}
                      onChange={(e) =>
                        handleShopChange(material.type, e.target.value)
                      }
                      className="w-full text-sm bg-white border rounded px-2 py-1 text-black"
                    >
                      {material.shops.map((shop) => (
                        <option key={shop.shop_name} value={shop.shop_name}>
                          {shop.shop_name} (₹{shop.rate})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Quantity Input */}
                  <div>
                    <label className="text-xs text-gray-600">Qty:</label>
                    <Input
                      type="number"
                      min={0}
                      value={selectedMaterials[material.type]?.quantity || 0}
                      onChange={(e) =>
                        handleQuantityChange(
                          material.type,
                          Number(e.target.value || 0)
                        )
                      }
                      className="w-full text-black text-sm"
                      placeholder="Qty"
                    />
                  </div>
                </div>

                {/* Rate Input */}
                <div>
                  <label className="text-xs text-gray-600">Rate (₹):</label>
                  <Input
                    type="number"
                    min={0}
                    value={selectedMaterials[material.type]?.rate || 0}
                    onChange={(e) =>
                      handleRateChange(
                        material.type,
                        Number(e.target.value || 0)
                      )
                    }
                    className="w-full text-black text-sm"
                    placeholder="Rate"
                  />
                </div>

                {/* Cost Summary */}
                <div className="text-right text-sm font-semibold text-cyan-600">
                  Cost: ₹
                  {(
                    (selectedMaterials[material.type]?.quantity || 0) *
                    (selectedMaterials[material.type]?.rate || 0)
                  ).toFixed(2)}
                </div>
              </div>
            )}

            {/* Available Shops List */}
            {!selectedMaterials[material.type]?.selected && (
              <div className="ml-6 text-xs text-gray-600">
                {material.shops.slice(0, 2).map((shop) => (
                  <div key={shop.shop_name}>
                    {shop.shop_name}: ₹{shop.rate}
                  </div>
                ))}
                {material.shops.length > 2 && (
                  <div className="text-gray-500">
                    +{material.shops.length - 2} more shops
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Navigation */}
      <div className="flex gap-2 mt-4">
        <Button onClick={handleBack} className="bg-gray-500 text-black w-1/2">
          Back
        </Button>
        <Button onClick={handleNextStep} className="bg-cyan-500 text-black w-1/2">
          Next: Review Required Materials
        </Button>
      </div>
    </div>
  );
}
