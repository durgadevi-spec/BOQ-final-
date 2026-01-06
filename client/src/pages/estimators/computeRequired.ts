import { WallType } from "@/lib/constants";

// Constants for calculations
export const BRICK_FACE_AREA_FT2 = 0.08; // 1 brick = ~0.08 sq ft
export const BAG_VOLUME_FT3 = 1.25; // 1 bag cement = 1.25 cu ft
export const ROCKWOOL_BAG_COVER_SQFT = 70;
export const ROCKWOOL_KG_PER_SHEET = 10;

export interface ComputedMaterials {
  // Civil materials
  roundedBricks?: number;
  roundedCementBags?: number;
  roundedSandCubicFt?: number;
  
  // Gypsum materials
  boards?: number;
  rockwoolSheets?: number;
  rockwoolBags?: number;
  floorChannel?: number;
  ceilingChannel?: number;
  studs?: number;
  jointTape?: number;
  jointCompound?: number;
  screwsGypsum?: number;
  
  // Plywood materials
  boardsPlywood?: number;
  aluminiumChannels?: number;
  laminateSheets?: number;
  screwsPlywood?: number;
  rockwoolKg?: number;
  
  // Gypsum + Plywood materials (Hybrid)
  boardsGypsum?: number;
  boardsPlywoodHybrid?: number;
  studsGypsum?: number;
  verticalStuds?: number;
  
  // Glass partition materials
  glassArea?: number;
  glassChannels?: number;
  glassLength?: number;
  glassHeight?: number;
  
  area?: number;
  glazingType?: string;
}

export const computeRequired = (
  wallType: WallType | null,
  length: number | null,
  height: number | null,
  subOption: string | null,
  brickWastagePercent: number = 0
): ComputedMaterials => {
  if (!wallType || !length || !height) return {};

  const area = length * height;
  const wastageFactor = 1 + (brickWastagePercent / 100);

  // ============= CIVIL WALL =============
  if (wallType === "civil") {
    const brickFaceArea = BRICK_FACE_AREA_FT2;
    const baseBricks = area / brickFaceArea;

    let brickMultiplier = 1;
    if (subOption === "9 inch") {
      brickMultiplier = 2;
    }

    const bricks = baseBricks * brickMultiplier;
    const bricksWithWastage = bricks * wastageFactor;

    let thicknessFt = 0.75; // default 9 inch
    if (subOption === "4.5 inch") {
      thicknessFt = 0.375;
    }

    const cementVolumeFt3 = area * thicknessFt * (1 / 5);
    const sandVolumeFt3 = area * thicknessFt * (4 / 5);

    return {
      roundedBricks: Math.ceil(bricksWithWastage),
      roundedCementBags: Math.ceil(cementVolumeFt3 / BAG_VOLUME_FT3),
      roundedSandCubicFt: Math.ceil(sandVolumeFt3),
      area,
    };
  }

  // ============= GYPSUM ONLY =============
  if (wallType === "gypsum") {
    const isDouble = subOption === "Double Layer" || /double/i.test(subOption || "");
    const areaOneFace = area;
    const BOARD_AREA_SQFT = 24;
    const faces = 2;
    const layers = isDouble ? 2 : 1;

    const gypsumArea = areaOneFace * faces * layers;
    const boards = gypsumArea / BOARD_AREA_SQFT;
    const rockwoolSheets = (areaOneFace) / ROCKWOOL_BAG_COVER_SQFT;

    const CHANNEL_PIECE_FT = 4.5;
    const floorChannel = (length || 0) / CHANNEL_PIECE_FT;
    const ceilingChannel = (length || 0) / CHANNEL_PIECE_FT;

    const studsPerSide = (length || 0) / 2 + 1;
    const studs = studsPerSide * 2;

    const jointTape = gypsumArea / 216;
    const jointCompound = gypsumArea / 432;
    const screwsGypsum = boards * 40;

    return {
      boards,
      rockwoolSheets,
      floorChannel,
      ceilingChannel,
      studs,
      jointTape,
      jointCompound,
      screwsGypsum,
      glazingType: isDouble ? "Double Layer" : "Single Layer",
      area: areaOneFace,
    };
  }

  // ============= PLYWOOD ONLY =============
  if (wallType === "plywood") {
    const L = length ?? 0;
    const H = height ?? 0;
    const A = L * H;

    const BOARD_AREA_SQFT = 32;
    const isDouble = (subOption || "").toLowerCase() === "double" || /double/i.test(subOption || "");
    const faces = 2;
    const layers = isDouble ? 2 : 1;

    const totalPlywoodArea = A * faces * layers;
    const boardsPlywood = totalPlywoodArea / BOARD_AREA_SQFT;
    const laminateSheets = boardsPlywood;
    const screwsPlywood = boardsPlywood * 40;

    const channelLength = 10;
    const tracksPieces = (L * 2) / channelLength;
    const studsPerRun = L / 2 + 1;
    const studPiecesPerLine = H / channelLength;
    const totalStudPieces = studsPerRun * studPiecesPerLine;
    const aluminiumChannels = tracksPieces + totalStudPieces;

    const ROCKWOOL_BAG_COVER_SQFT = 70;
    const rockwoolBags = A / ROCKWOOL_BAG_COVER_SQFT;

    return {
      boardsPlywood,
      laminateSheets,
      screwsPlywood,
      aluminiumChannels,
      rockwoolBags,
      glazingType: isDouble ? "Double Layer" : "Single Layer",
      area: A,
    };
  }

  // ============= GYPSUM + GLASS =============
  if (wallType === "gypsum-glass") {
    const length_val = length || 0;
    const height_val = height || 0;
    const glassHeightVal = 0; // Default, should be passed from UI
    const gHeight = height_val - glassHeightVal;

    const isDouble = subOption === "Double Glazing";
    const baseBoards = (gHeight * length_val * 2) / 24;
    const boards = isDouble ? baseBoards * 2 : baseBoards;

    const rockwoolBags = (gHeight * length_val * 2) / 70;
    const floorChannel = length_val / 2;
    const ceilingChannel = length_val / 2;
    const studs = length_val / 5;

    const jointTape = (gHeight * length_val * 2) / 216;
    const jointCompound = (gHeight * length_val * 2) / 432;

    // Glass channels calculation
    const channelPieceLengthFt = 10;
    const verticalPieces = (glassHeightVal || 0) / channelPieceLengthFt;
    const horizontalPieces = (length_val || 0) / channelPieceLengthFt;
    const glassChannels = verticalPieces * 2 + horizontalPieces * 2;

    return {
      boards,
      rockwoolBags,
      floorChannel,
      ceilingChannel,
      studs,
      jointTape,
      jointCompound,
      glassChannels,
      glassArea: glassHeightVal * length_val,
      glazingType: isDouble ? "Double Layer" : "Single Layer",
      area: gHeight * length_val,
    };
  }

  // ============= PLYWOOD + GLASS =============
  if (wallType === "plywood-glass") {
    const baseBoards = area / 24;
    const isDouble = subOption === "Double Glazing";
    const boards = isDouble ? baseBoards * 2 : baseBoards;

    const laminateSheets = baseBoards;
    const aluminiumChannels = (length || 0) / 2;
    const rockwoolBags = area / 70;
    const rockwoolKg = rockwoolBags * 20;

    // Glass channels calculation
    const channelPieceLengthFt = 10;
    const verticalPieces = (0) / channelPieceLengthFt; // glassHeight should be passed
    const horizontalPieces = (length || 0) / channelPieceLengthFt;
    const glassChannels = verticalPieces * 2 + horizontalPieces * 2;

    return {
      boardsPlywood: boards,
      laminateSheets,
      aluminiumChannels,
      rockwoolBags,
      rockwoolKg,
      glassChannels,
      glassArea: 0, // Should be calculated from glassHeight
      glazingType: isDouble ? "Double Layer" : "Single Layer",
      area,
    };
  }

  // ============= GYPSUM + PLYWOOD (HYBRID) =============
  if (wallType === "gypsum-plywood") {
    const area_val = (length || 0) * (height || 0);

    // Gypsum Side
    let boardsGypsum = area_val / 24;
    const jointTape = 1;
    const JOINT_COMPOUND_COVERAGE = 120;
    const jointCompound = area_val / JOINT_COMPOUND_COVERAGE;

    // Rockwool in Bags
    const ROCKWOOL_SQFT_PER_BAG = 70;
    const rockwoolBags = area_val / ROCKWOOL_SQFT_PER_BAG;

    // Plywood Side
    let boardsPlywood = area_val / 32;
    const aluminiumChannels = (length || 0) * 1.2;
    const laminateSheets = boardsPlywood;

    // Double layer rule
    if (/double/i.test(subOption || "")) {
      boardsGypsum *= 2;
      boardsPlywood *= 2;
    }

    return {
      boardsGypsum,
      jointTape,
      jointCompound,
      boardsPlywoodHybrid: boardsPlywood,
      aluminiumChannels,
      laminateSheets,
      rockwoolBags,
      glazingType: /double/i.test(subOption || "") ? "Double Layer" : "Single Layer",
      area: area_val,
    };
  }

  return {};
};
