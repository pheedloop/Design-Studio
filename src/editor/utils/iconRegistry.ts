import type { IconType } from "react-icons";
import {
  PiToilet, PiWheelchair, PiElevator, PiStairs, PiCar, PiDoor,
  PiFirstAid, PiFireExtinguisher, PiWarning, PiShield,
  PiInfo, PiCamera, PiForkKnife, PiCoffee, PiWifiHigh, PiPlug, PiMicrophone,
  PiArrowRight, PiMapPin, PiStar, PiFlag, PiSignpost,
  PiSquare, PiCircle, PiTriangle, PiHeart, PiDiamond,
  PiTicket, PiGift, PiPhone, PiEnvelope, PiPrinter,
  PiTrash, PiRecycle, PiTree, PiFlower, PiDog,
  PiLock, PiKey, PiClock, PiCalendar, PiBell,
  PiLightning, PiCarBattery, PiThermometer, PiDrop,
  PiMusicNote, PiSpeakerHigh, PiMonitor, PiPresentation,
  // Additional icons
  PiBaby, PiBicycle, PiBus, PiTaxi, PiTrain, PiAirplaneTakeoff,
  PiHouse, PiBuildings, PiTent, PiPark,
  PiSun, PiMoon, PiCloudRain, PiSnowflake, PiWind,
  PiHandshake, PiUsers, PiUserCircle, PiMegaphone,
  PiShoppingCart, PiTShirt, PiBackpack, PiSuitcase,
  PiGameController, PiBalloon, PiConfetti, PiCrown,
  PiRocket, PiAlien, PiGhost, PiSkull, PiCat,
  PiHamburger, PiPizza, PiBeerBottle, PiWine, PiCookingPot,
  PiScissors, PiPaintBrush, PiPencil, PiNotebook,
  PiMedal, PiTrophy, PiTarget, PiSoccerBall,
  PiGlobe, PiCompass, PiBinoculars, PiMountains,
} from "react-icons/pi";

export type IconCategory =
  | "facilities"
  | "safety"
  | "services"
  | "navigation"
  | "nature"
  | "techAv"
  | "general"
  | "transport"
  | "venues"
  | "weather"
  | "people"
  | "shopping"
  | "fun"
  | "foodDrink"
  | "creative"
  | "sports"
  | "exploration";

export interface IconEntry {
  id: string;
  /** Grouping id, not display text — see iconLabels.ts. */
  category: IconCategory;
  /** English search synonyms. Not UI: a search index, deliberately untranslated. */
  keywords: string[];
  component: IconType;
}

/** Category display order in the picker. */
export const ICON_CATEGORIES: IconCategory[] = [
  "facilities",
  "safety",
  "services",
  "navigation",
  "nature",
  "techAv",
  "general",
  "transport",
  "venues",
  "weather",
  "people",
  "shopping",
  "fun",
  "foodDrink",
  "creative",
  "sports",
  "exploration",
];

export const iconRegistry: IconEntry[] = [

  // Facilities
  { id: "PiToilet", category: "facilities", keywords: ["restroom", "bathroom", "wc", "washroom"], component: PiToilet },
  { id: "PiWheelchair", category: "facilities", keywords: ["accessible", "disability", "handicap"], component: PiWheelchair },
  { id: "PiElevator", category: "facilities", keywords: ["lift"], component: PiElevator },
  { id: "PiStairs", category: "facilities", keywords: ["steps", "staircase"], component: PiStairs },
  { id: "PiCar", category: "facilities", keywords: ["car", "vehicle", "garage"], component: PiCar },
  { id: "PiDoor", category: "facilities", keywords: ["entrance", "exit", "entry"], component: PiDoor },
  { id: "PiTrash", category: "facilities", keywords: ["garbage", "waste", "bin"], component: PiTrash },
  { id: "PiRecycle", category: "facilities", keywords: ["recycling", "green"], component: PiRecycle },

  // Safety
  { id: "PiFirstAid", category: "safety", keywords: ["medical", "health", "cross", "emergency"], component: PiFirstAid },
  { id: "PiFireExtinguisher", category: "safety", keywords: ["fire", "safety", "emergency"], component: PiFireExtinguisher },
  { id: "PiWarning", category: "safety", keywords: ["caution", "danger", "alert"], component: PiWarning },
  { id: "PiShield", category: "safety", keywords: ["security", "protection", "guard"], component: PiShield },

  // Services
  { id: "PiInfo", category: "services", keywords: ["info", "help", "desk"], component: PiInfo },
  { id: "PiCamera", category: "services", keywords: ["photo", "photography"], component: PiCamera },
  { id: "PiForkKnife", category: "services", keywords: ["restaurant", "dining", "eat", "meal"], component: PiForkKnife },
  { id: "PiCoffee", category: "services", keywords: ["cafe", "beverage", "drink", "tea"], component: PiCoffee },
  { id: "PiWifiHigh", category: "services", keywords: ["internet", "wireless", "network"], component: PiWifiHigh },
  { id: "PiPlug", category: "services", keywords: ["electric", "charging", "outlet", "socket"], component: PiPlug },
  { id: "PiMicrophone", category: "services", keywords: ["mic", "audio", "speaker", "stage"], component: PiMicrophone },
  { id: "PiPhone", category: "services", keywords: ["telephone", "call", "contact"], component: PiPhone },
  { id: "PiEnvelope", category: "services", keywords: ["email", "letter", "post"], component: PiEnvelope },
  { id: "PiPrinter", category: "services", keywords: ["print", "copy"], component: PiPrinter },
  { id: "PiTicket", category: "services", keywords: ["registration", "pass", "admission"], component: PiTicket },
  { id: "PiGift", category: "services", keywords: ["prize", "present", "swag"], component: PiGift },

  // Navigation
  { id: "PiArrowRight", category: "navigation", keywords: ["direction", "pointer", "right"], component: PiArrowRight },
  { id: "PiMapPin", category: "navigation", keywords: ["location", "marker", "pin", "place"], component: PiMapPin },
  { id: "PiStar", category: "navigation", keywords: ["favorite", "featured", "important"], component: PiStar },
  { id: "PiFlag", category: "navigation", keywords: ["marker", "checkpoint", "milestone"], component: PiFlag },
  { id: "PiSignpost", category: "navigation", keywords: ["direction", "signpost", "wayfinding"], component: PiSignpost },

  // Nature
  { id: "PiTree", category: "nature", keywords: ["outdoor", "garden", "plant", "park"], component: PiTree },
  { id: "PiFlower", category: "nature", keywords: ["garden", "plant", "floral"], component: PiFlower },
  { id: "PiDog", category: "nature", keywords: ["pet", "animal", "dog", "cat"], component: PiDog },
  { id: "PiDrop", category: "nature", keywords: ["drop", "fountain", "hydration"], component: PiDrop },

  // Tech & AV
  { id: "PiMusicNote", category: "techAv", keywords: ["audio", "sound", "concert"], component: PiMusicNote },
  { id: "PiSpeakerHigh", category: "techAv", keywords: ["audio", "sound", "volume"], component: PiSpeakerHigh },
  { id: "PiMonitor", category: "techAv", keywords: ["screen", "display", "tv"], component: PiMonitor },
  { id: "PiPresentation", category: "techAv", keywords: ["presentation", "screen", "display"], component: PiPresentation },
  { id: "PiLightning", category: "techAv", keywords: ["power", "electric", "energy"], component: PiLightning },
  { id: "PiCarBattery", category: "techAv", keywords: ["power", "charge", "energy"], component: PiCarBattery },
  { id: "PiThermometer", category: "techAv", keywords: ["temperature", "climate", "hvac"], component: PiThermometer },

  // General
  { id: "PiSquare", category: "general", keywords: ["shape", "box"], component: PiSquare },
  { id: "PiCircle", category: "general", keywords: ["shape", "round"], component: PiCircle },
  { id: "PiTriangle", category: "general", keywords: ["shape"], component: PiTriangle },
  { id: "PiHeart", category: "general", keywords: ["love", "favorite", "like"], component: PiHeart },
  { id: "PiDiamond", category: "general", keywords: ["shape", "gem"], component: PiDiamond },
  { id: "PiLock", category: "general", keywords: ["security", "private", "restricted"], component: PiLock },
  { id: "PiKey", category: "general", keywords: ["access", "unlock"], component: PiKey },
  { id: "PiClock", category: "general", keywords: ["time", "schedule", "hours"], component: PiClock },
  { id: "PiCalendar", category: "general", keywords: ["date", "schedule", "event"], component: PiCalendar },
  { id: "PiBell", category: "general", keywords: ["notification", "alert", "ring"], component: PiBell },

  // Transport
  { id: "PiBicycle", category: "transport", keywords: ["bike", "cycling", "ride"], component: PiBicycle },
  { id: "PiBus", category: "transport", keywords: ["shuttle", "transit", "public"], component: PiBus },
  { id: "PiTaxi", category: "transport", keywords: ["cab", "rideshare", "uber"], component: PiTaxi },
  { id: "PiTrain", category: "transport", keywords: ["rail", "subway", "metro"], component: PiTrain },
  { id: "PiAirplaneTakeoff", category: "transport", keywords: ["flight", "airport", "travel"], component: PiAirplaneTakeoff },

  // Venues
  { id: "PiHouse", category: "venues", keywords: ["home", "building", "residence"], component: PiHouse },
  { id: "PiBuildings", category: "venues", keywords: ["city", "office", "downtown"], component: PiBuildings },
  { id: "PiTent", category: "venues", keywords: ["camping", "outdoor", "festival"], component: PiTent },
  { id: "PiPark", category: "venues", keywords: ["outdoor", "garden", "bench"], component: PiPark },

  // Weather
  { id: "PiSun", category: "weather", keywords: ["sunny", "bright", "outdoor"], component: PiSun },
  { id: "PiMoon", category: "weather", keywords: ["night", "evening"], component: PiMoon },
  { id: "PiCloudRain", category: "weather", keywords: ["weather", "wet", "umbrella"], component: PiCloudRain },
  { id: "PiSnowflake", category: "weather", keywords: ["cold", "winter", "ice"], component: PiSnowflake },
  { id: "PiWind", category: "weather", keywords: ["breeze", "air", "ventilation"], component: PiWind },

  // People
  { id: "PiBaby", category: "people", keywords: ["child", "infant", "family", "changing"], component: PiBaby },
  { id: "PiHandshake", category: "people", keywords: ["meeting", "partnership", "deal"], component: PiHandshake },
  { id: "PiUsers", category: "people", keywords: ["team", "people", "crowd", "networking"], component: PiUsers },
  { id: "PiUserCircle", category: "people", keywords: ["user", "profile", "attendee"], component: PiUserCircle },
  { id: "PiMegaphone", category: "people", keywords: ["announcement", "speaker", "broadcast"], component: PiMegaphone },

  // Shopping
  { id: "PiShoppingCart", category: "shopping", keywords: ["buy", "store", "retail", "merch"], component: PiShoppingCart },
  { id: "PiTShirt", category: "shopping", keywords: ["clothing", "merch", "apparel", "swag"], component: PiTShirt },
  { id: "PiBackpack", category: "shopping", keywords: ["bag", "storage", "coat check"], component: PiBackpack },
  { id: "PiSuitcase", category: "shopping", keywords: ["luggage", "travel", "baggage"], component: PiSuitcase },

  // Fun
  { id: "PiGameController", category: "fun", keywords: ["gaming", "play", "arcade", "entertainment"], component: PiGameController },
  { id: "PiBalloon", category: "fun", keywords: ["party", "celebration", "festival"], component: PiBalloon },
  { id: "PiConfetti", category: "fun", keywords: ["party", "celebration", "win"], component: PiConfetti },
  { id: "PiCrown", category: "fun", keywords: ["vip", "royalty", "premium", "king"], component: PiCrown },
  { id: "PiRocket", category: "fun", keywords: ["launch", "startup", "space"], component: PiRocket },
  { id: "PiAlien", category: "fun", keywords: ["space", "extraterrestrial", "ufo"], component: PiAlien },
  { id: "PiGhost", category: "fun", keywords: ["spooky", "halloween", "haunted"], component: PiGhost },
  { id: "PiSkull", category: "fun", keywords: ["danger", "pirate", "halloween"], component: PiSkull },
  { id: "PiCat", category: "fun", keywords: ["pet", "animal", "feline"], component: PiCat },

  // Food & Drink
  { id: "PiHamburger", category: "foodDrink", keywords: ["burger", "fast food", "meal"], component: PiHamburger },
  { id: "PiPizza", category: "foodDrink", keywords: ["food", "slice", "italian"], component: PiPizza },
  { id: "PiBeerBottle", category: "foodDrink", keywords: ["alcohol", "pub", "bar", "drink"], component: PiBeerBottle },
  { id: "PiWine", category: "foodDrink", keywords: ["alcohol", "glass", "bar", "drink"], component: PiWine },
  { id: "PiCookingPot", category: "foodDrink", keywords: ["kitchen", "catering", "chef"], component: PiCookingPot },

  // Creative
  { id: "PiScissors", category: "creative", keywords: ["cut", "craft", "workshop"], component: PiScissors },
  { id: "PiPaintBrush", category: "creative", keywords: ["art", "painting", "design"], component: PiPaintBrush },
  { id: "PiPencil", category: "creative", keywords: ["write", "draw", "edit"], component: PiPencil },
  { id: "PiNotebook", category: "creative", keywords: ["notes", "journal", "writing"], component: PiNotebook },

  // Sports
  { id: "PiMedal", category: "sports", keywords: ["award", "winner", "achievement"], component: PiMedal },
  { id: "PiTrophy", category: "sports", keywords: ["award", "winner", "champion", "cup"], component: PiTrophy },
  { id: "PiTarget", category: "sports", keywords: ["goal", "aim", "bullseye"], component: PiTarget },
  { id: "PiSoccerBall", category: "sports", keywords: ["football", "sport", "game"], component: PiSoccerBall },

  // Exploration
  { id: "PiGlobe", category: "exploration", keywords: ["world", "earth", "international"], component: PiGlobe },
  { id: "PiCompass", category: "exploration", keywords: ["direction", "navigation", "orient"], component: PiCompass },
  { id: "PiBinoculars", category: "exploration", keywords: ["view", "observe", "lookout"], component: PiBinoculars },
  { id: "PiMountains", category: "exploration", keywords: ["outdoor", "hiking", "landscape"], component: PiMountains },
];

// Lookup by id
const iconMap = new Map(iconRegistry.map((entry) => [entry.id, entry]));

export function getIconEntry(id: string): IconEntry | undefined {
  return iconMap.get(id);
}
