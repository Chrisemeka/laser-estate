export const BRAND = {
  name: "Laser Estate Services",
  short: "Laser Estate",
  tagline: "Real Estate Consultants",
  address: "Suite 93, Dolphin Plaza, Dolphin Estate, Ikoyi, Lagos",
  phones: ["08033042649", "08087928270"],
  email: "obi.anyanwu@yahoo.com",
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "2348033042649",
};

export const AREAS = [
  "Ikoyi",
  "Victoria Island",
  "Banana Island",
  "Lekki",
  "Ikeja GRA",
  "Magodo",
  "Yaba",
  "Surulere",
  "Ajah",
  "Other",
] as const;

export const PROPERTY_TYPES = [
  { value: "detached_house", label: "Detached House" },
  { value: "semi_detached", label: "Semi-Detached" },
  { value: "terrace", label: "Terrace" },
  { value: "duplex", label: "Duplex" },
  { value: "bungalow", label: "Bungalow" },
  { value: "apartment", label: "Apartment / Flat" },
  { value: "penthouse", label: "Penthouse" },
  { value: "serviced_apartment", label: "Serviced Apartment" },
  { value: "land", label: "Bare Land" },
  { value: "commercial", label: "Commercial / Office" },
  { value: "warehouse", label: "Warehouse" },
  { value: "filling_station", label: "Filling Station" },
  { value: "hotel", label: "Hotel" },
  { value: "event_center", label: "Event Center" },
  { value: "mixed_use", label: "Mixed Use" },
] as const;

export const LISTING_TYPES = [
  { value: "sale", label: "For Sale" },
  { value: "rent", label: "For Let" },
  { value: "lease", label: "For Lease" },
] as const;

export const STATUSES = [
  { value: "draft", label: "Draft" },
  { value: "available", label: "Available" },
  { value: "under_offer", label: "Under Offer" },
  { value: "sold", label: "Sold" },
  { value: "rented", label: "Rented" },
] as const;

export const COMMON_AMENITIES = [
  "Fitted kitchen",
  "BQ",
  "Swimming pool",
  "Gym",
  "24hr power",
  "Serviced estate",
  "CCTV",
  "Elevator",
  "Ocean view",
  "Concierge",
  "Parking",
  "C of O",
  "Governor's Consent",
  "Dry land",
  "Fenced",
];
