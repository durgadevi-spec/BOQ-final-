// Mock data for materials and shops for civil wall estimator
export const CIVIL_MATERIALS_WITH_SHOPS = [
  {
    type: "Red Clay Brick",
    shops: [
      { shop_name: "BuildMart", rate: 8.5, availability: true },
      { shop_name: "ConstructPro", rate: 9.2, availability: true },
      { shop_name: "MasonHub", rate: 8.8, availability: true },
      { shop_name: "BrickWorld", rate: 9.5, availability: false },
    ],
  },
  {
    type: "Fly Ash Brick",
    shops: [
      { shop_name: "GreenBuild", rate: 7.8, availability: true },
      { shop_name: "EcoBrick", rate: 8.1, availability: true },
      { shop_name: "BuildMart", rate: 8.3, availability: true },
    ],
  },
  {
    type: "Argon Block",
    shops: [
      { shop_name: "BlockCorp", rate: 12.5, availability: true },
      { shop_name: "ConstructPro", rate: 13.0, availability: true },
    ],
  },
  {
    type: "Solid Block",
    shops: [
      { shop_name: "BuildMart", rate: 11.0, availability: true },
      { shop_name: "BlockCorp", rate: 11.5, availability: true },
      { shop_name: "MasonHub", rate: 10.8, availability: true },
    ],
  },
  {
    type: "Ordinary Portland Cement",
    shops: [
      { shop_name: "CementKing", rate: 450, availability: true },
      { shop_name: "ConstructPro", rate: 460, availability: true },
      { shop_name: "BuildMart", rate: 455, availability: true },
    ],
  },
  {
    type: "Pozzolana Cement",
    shops: [
      { shop_name: "EcoCement", rate: 420, availability: true },
      { shop_name: "CementKing", rate: 430, availability: true },
    ],
  },
  {
    type: "White Cement",
    shops: [
      { shop_name: "PremiumCement", rate: 650, availability: true },
      { shop_name: "CementKing", rate: 680, availability: true },
    ],
  },
  {
    type: "River Sand",
    shops: [
      { shop_name: "SandSupply", rate: 1200, availability: true },
      { shop_name: "BuildMart", rate: 1250, availability: true },
      { shop_name: "ConstructPro", rate: 1300, availability: true },
    ],
  },
  {
    type: "M-Sand",
    shops: [
      { shop_name: "MSandCo", rate: 800, availability: true },
      { shop_name: "BuildMart", rate: 850, availability: true },
      { shop_name: "SandSupply", rate: 900, availability: true },
    ],
  },
];

// Helper to get materials with lowest rates pre-selected
export const getMaterialsWithLowestRates = () => {
  return CIVIL_MATERIALS_WITH_SHOPS.map((mat) => {
    const lowestRate = Math.min(...mat.shops.map((s) => s.rate));
    return {
      ...mat,
      lowestRate,
      selectedRate: lowestRate,
      selectedQuantity: 0,
    };
  });
};
