import React, { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Printer, Download } from "lucide-react";

interface Material {
  type: string;
  quantity: number;
  rate: number;
  shop_name?: string;
  unit?: string;
}

interface Props {
  wallType: string;
  subOption: string | null;
  length: number | null;
  height: number | null;
  materials: Material[];
  brickWastage: number;
  handleBack: () => void;
  handleSubmit: () => void;
}

export default function Step6BOQSummary({
  wallType,
  subOption,
  length,
  height,
  materials,
  brickWastage,
  handleBack,
  handleSubmit,
}: Props) {
  // Group materials by category
  const groupedMaterials = useMemo(() => {
    const brickMaterials = materials.filter((m) =>
      ["Red Clay Brick", "Fly Ash Brick", "Argon Block", "Solid Block"].includes(
        m.type
      )
    );
    const cementMaterials = materials.filter((m) =>
      ["Ordinary Portland Cement", "Pozzolana Cement", "White Cement"].includes(
        m.type
      )
    );
    const sandMaterials = materials.filter((m) =>
      ["River Sand", "M-Sand"].includes(m.type)
    );
    const additionalCharges = materials.filter((m) =>
      ["Hardware", "Loading & Unloading", "Transport", "Labour Charges"].includes(
        m.type
      )
    );

    return {
      bricks: brickMaterials,
      cement: cementMaterials,
      sand: sandMaterials,
      additionalCharges,
    };
  }, [materials]);

  // Calculate totals
  const totals = useMemo(() => {
    const materialCost = materials.reduce(
      (sum, m) => sum + m.quantity * m.rate,
      0
    );
    const chargesCost = groupedMaterials.additionalCharges.reduce(
      (sum, m) => sum + m.quantity * m.rate,
      0
    );
    const totalCost = materialCost + chargesCost;

    return {
      materialCost,
      chargesCost,
      totalCost,
      materialCount: materials.length,
    };
  }, [materials, groupedMaterials]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    // This would integrate with a PDF library like jsPDF
    alert("PDF download feature coming soon!");
  };

  return (
    <div className="space-y-4 p-6 bg-gray-700 rounded">
      <h3 className="font-semibold text-white text-2xl">Bill of Quantities (BOQ)</h3>

      {/* Project Summary */}
      <div className="bg-white p-4 rounded space-y-2">
        <h4 className="font-semibold text-black text-lg">Project Summary</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Wall Type:</span>
            <p className="font-semibold text-black">{wallType}</p>
          </div>
          <div>
            <span className="text-gray-600">Wall Thickness:</span>
            <p className="font-semibold text-black">{subOption}</p>
          </div>
          <div>
            <span className="text-gray-600">Dimensions:</span>
            <p className="font-semibold text-black">
              {length} ft × {height} ft
            </p>
          </div>
          <div>
            <span className="text-gray-600">Area:</span>
            <p className="font-semibold text-black">
              {length && height ? (length * height).toFixed(2) : 0} ft²
            </p>
          </div>
          <div>
            <span className="text-gray-600">Brick Wastage:</span>
            <p className="font-semibold text-black">{brickWastage}%</p>
          </div>
        </div>
      </div>

      {/* Materials Breakdown */}
      <div className="space-y-4">
        {/* Bricks Section */}
        {groupedMaterials.bricks.length > 0 && (
          <div className="bg-white p-4 rounded">
            <h4 className="font-semibold text-black mb-3 border-b pb-2">
              Bricks
            </h4>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-100">
                  <th className="text-left px-2 py-1">Material</th>
                  <th className="text-center px-2 py-1">Qty</th>
                  <th className="text-center px-2 py-1">Unit</th>
                  <th className="text-center px-2 py-1">Rate (₹)</th>
                  <th className="text-right px-2 py-1">Amount (₹)</th>
                </tr>
              </thead>
              <tbody>
                {groupedMaterials.bricks.map((m) => (
                  <tr key={`${m.type}-${m.shop_name}`} className="border-b">
                    <td className="px-2 py-2 text-gray-700">
                      {m.type}
                      {m.shop_name && (
                        <div className="text-xs text-gray-500">
                          (from {m.shop_name})
                        </div>
                      )}
                    </td>
                    <td className="text-center px-2 py-2 font-semibold text-black">
                      {m.quantity.toFixed(2)}
                    </td>
                    <td className="text-center px-2 py-2 text-gray-700">
                      {m.unit || "pcs"}
                    </td>
                    <td className="text-center px-2 py-2 text-black">
                      {m.rate.toFixed(2)}
                    </td>
                    <td className="text-right px-2 py-2 font-semibold text-cyan-600">
                      {(m.quantity * m.rate).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Cement Section */}
        {groupedMaterials.cement.length > 0 && (
          <div className="bg-white p-4 rounded">
            <h4 className="font-semibold text-black mb-3 border-b pb-2">Cement</h4>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-100">
                  <th className="text-left px-2 py-1">Material</th>
                  <th className="text-center px-2 py-1">Qty</th>
                  <th className="text-center px-2 py-1">Unit</th>
                  <th className="text-center px-2 py-1">Rate (₹)</th>
                  <th className="text-right px-2 py-1">Amount (₹)</th>
                </tr>
              </thead>
              <tbody>
                {groupedMaterials.cement.map((m) => (
                  <tr key={`${m.type}-${m.shop_name}`} className="border-b">
                    <td className="px-2 py-2 text-gray-700">
                      {m.type}
                      {m.shop_name && (
                        <div className="text-xs text-gray-500">
                          (from {m.shop_name})
                        </div>
                      )}
                    </td>
                    <td className="text-center px-2 py-2 font-semibold text-black">
                      {m.quantity.toFixed(2)}
                    </td>
                    <td className="text-center px-2 py-2 text-gray-700">
                      {m.unit || "bags"}
                    </td>
                    <td className="text-center px-2 py-2 text-black">
                      {m.rate.toFixed(2)}
                    </td>
                    <td className="text-right px-2 py-2 font-semibold text-cyan-600">
                      {(m.quantity * m.rate).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Sand Section */}
        {groupedMaterials.sand.length > 0 && (
          <div className="bg-white p-4 rounded">
            <h4 className="font-semibold text-black mb-3 border-b pb-2">Sand</h4>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-100">
                  <th className="text-left px-2 py-1">Material</th>
                  <th className="text-center px-2 py-1">Qty</th>
                  <th className="text-center px-2 py-1">Unit</th>
                  <th className="text-center px-2 py-1">Rate (₹)</th>
                  <th className="text-right px-2 py-1">Amount (₹)</th>
                </tr>
              </thead>
              <tbody>
                {groupedMaterials.sand.map((m) => (
                  <tr key={`${m.type}-${m.shop_name}`} className="border-b">
                    <td className="px-2 py-2 text-gray-700">
                      {m.type}
                      {m.shop_name && (
                        <div className="text-xs text-gray-500">
                          (from {m.shop_name})
                        </div>
                      )}
                    </td>
                    <td className="text-center px-2 py-2 font-semibold text-black">
                      {m.quantity.toFixed(2)}
                    </td>
                    <td className="text-center px-2 py-2 text-gray-700">
                      {m.unit || "ft³"}
                    </td>
                    <td className="text-center px-2 py-2 text-black">
                      {m.rate.toFixed(2)}
                    </td>
                    <td className="text-right px-2 py-2 font-semibold text-cyan-600">
                      {(m.quantity * m.rate).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Additional Charges */}
        {groupedMaterials.additionalCharges.length > 0 && (
          <div className="bg-white p-4 rounded">
            <h4 className="font-semibold text-black mb-3 border-b pb-2">
              Additional Charges
            </h4>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-100">
                  <th className="text-left px-2 py-1">Charge</th>
                  <th className="text-center px-2 py-1">Qty</th>
                  <th className="text-center px-2 py-1">Unit</th>
                  <th className="text-center px-2 py-1">Rate (₹)</th>
                  <th className="text-right px-2 py-1">Amount (₹)</th>
                </tr>
              </thead>
              <tbody>
                {groupedMaterials.additionalCharges.map((m) => (
                  <tr key={m.type} className="border-b">
                    <td className="px-2 py-2 text-gray-700">{m.type}</td>
                    <td className="text-center px-2 py-2 font-semibold text-black">
                      {m.quantity.toFixed(2)}
                    </td>
                    <td className="text-center px-2 py-2 text-gray-700">
                      {m.unit || "pcs"}
                    </td>
                    <td className="text-center px-2 py-2 text-black">
                      {m.rate.toFixed(2)}
                    </td>
                    <td className="text-right px-2 py-2 font-semibold text-cyan-600">
                      {(m.quantity * m.rate).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Cost Summary */}
      <div className="bg-gradient-to-r from-cyan-500 to-blue-600 p-6 rounded space-y-2">
        <div className="flex justify-between text-white">
          <span className="text-lg">Material Cost:</span>
          <span className="font-bold text-xl">
            ₹{totals.materialCost.toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between text-white">
          <span className="text-lg">Additional Charges:</span>
          <span className="font-bold text-xl">
            ₹{totals.chargesCost.toFixed(2)}
          </span>
        </div>
        <div className="border-t border-white pt-2 flex justify-between">
          <span className="text-xl font-bold text-white">Total Cost:</span>
          <span className="text-3xl font-bold text-yellow-300">
            ₹{totals.totalCost.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 mt-6">
        <Button onClick={handleBack} className="bg-gray-500 text-black w-1/3">
          Back
        </Button>
        <Button
          onClick={handlePrint}
          className="bg-blue-500 text-white w-1/3 flex items-center justify-center gap-2"
        >
          <Printer className="w-4 h-4" /> Print
        </Button>
        <Button
          onClick={handleDownloadPDF}
          className="bg-green-500 text-white w-1/3 flex items-center justify-center gap-2"
        >
          <Download className="w-4 h-4" /> PDF
        </Button>
      </div>

      <Button
        onClick={handleSubmit}
        className="w-full bg-cyan-500 text-black py-3 text-lg font-bold mt-2"
      >
        Save & Complete
      </Button>
    </div>
  );
}
