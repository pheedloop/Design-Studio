import { PiFlag } from "react-icons/pi";
import type { IconComponent } from "@/icons/SvgIcon";
import {
  AnnouncementIcon,
  BatteryChargingIcon,
  CreativeBookIcon,
  CreativeBrushIcon,
  CreativeCutIcon,
  CreativePenIcon,
  DrinkBottleIcon,
  DrinkCocktailIcon,
  ExplorationCompassIcon,
  ExplorationGlobeIcon,
  ExplorationMountainIcon,
  ExplorationTelescopeIcon,
  FacilityBinIcon,
  FacilityCarIcon,
  FacilityDoorIcon,
  FacilityElevatorIcon,
  FacilityRecycleIcon,
  FacilityStairIcon,
  FacilityWashroomIcon,
  FacilityWheelchairIcon,
  FoodCookingIcon,
  FoodHamburgerIcon,
  FoodPizzaIcon,
  FunAlienIcon,
  FunBalloonIcon,
  FunCatIcon,
  FunConfettiIcon,
  FunCrownIcon,
  FunGamepadIcon,
  FunGhostIcon,
  FunRocketIcon,
  FunSkullIcon,
  GeneralBellIcon,
  GeneralCalendarIcon,
  GeneralCircleIcon,
  GeneralClockIcon,
  GeneralDiamondIcon,
  GeneralHeartIcon,
  GeneralKeyIcon,
  GeneralSquareIcon,
  GeneralTriangleIcon,
  LightningIcon,
  LockIcon,
  MusicIcon,
  NatureDogIcon,
  NatureFlowerIcon,
  NatureTreeIcon,
  NatureWaterIcon,
  NavigationArrowIcon,
  NavigationLocationIcon,
  NavigationSignIcon,
  NavigationStarIcon,
  PeopleBabyIcon,
  PeopleCircleProfileIcon,
  PeopleGroupIcon,
  PeopleHandshakeIcon,
  PresentationIcon,
  SafetyCautionIcon,
  SafetyFireExtinguisherIcon,
  SafetyMedicalIcon,
  SafetyShieldIcon,
  ServiceCameraIcon,
  ServiceCoffeeIcon,
  ServiceInfoIcon,
  ServiceMailIcon,
  ServiceMicIcon,
  ServicePhoneIcon,
  ServicePlugIcon,
  ServicePresentIcon,
  ServicePrinterIcon,
  ServiceTicketIcon,
  ServiceUtensilIcon,
  ServiceWifiIcon,
  ShoppingBackpackIcon,
  ShoppingCartIcon,
  ShoppingLuggageIcon,
  SportArcheryIcon,
  SportMedalIcon,
  SportSoccerIcon,
  SportTrophyIcon,
  TShirtIcon,
  TechandavDisplayIcon,
  ThermometerIcon,
  TransportBicycleIcon,
  TransportBusIcon,
  TransportPlaneIcon,
  TransportTaxiIcon,
  TransportTrainIcon,
  VenueBuildingIcon,
  VenueCampingIcon,
  VenueHouseIcon,
  VenueOutdoorIcon,
  VolumeIcon,
  WeatherMoonIcon,
  WeatherRainIcon,
  WeatherSnowIcon,
  WeatherSunIcon,
  WeatherWindIcon,
} from "@/icons/icons";

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
  component: IconComponent;
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
  {
    id: "PiToilet",
    category: "facilities",
    keywords: ["restroom", "bathroom", "wc", "washroom"],
    component: FacilityWashroomIcon,
  },
  {
    id: "PiWheelchair",
    category: "facilities",
    keywords: ["accessible", "disability", "handicap"],
    component: FacilityWheelchairIcon,
  },
  {
    id: "PiElevator",
    category: "facilities",
    keywords: ["lift"],
    component: FacilityElevatorIcon,
  },
  {
    id: "PiStairs",
    category: "facilities",
    keywords: ["steps", "staircase"],
    component: FacilityStairIcon,
  },
  {
    id: "PiCar",
    category: "facilities",
    keywords: ["car", "vehicle", "garage"],
    component: FacilityCarIcon,
  },
  {
    id: "PiDoor",
    category: "facilities",
    keywords: ["entrance", "exit", "entry"],
    component: FacilityDoorIcon,
  },
  {
    id: "PiTrash",
    category: "facilities",
    keywords: ["garbage", "waste", "bin"],
    component: FacilityBinIcon,
  },
  {
    id: "PiRecycle",
    category: "facilities",
    keywords: ["recycling", "green"],
    component: FacilityRecycleIcon,
  },

  // Safety
  {
    id: "PiFirstAid",
    category: "safety",
    keywords: ["medical", "health", "cross", "emergency"],
    component: SafetyMedicalIcon,
  },
  {
    id: "PiFireExtinguisher",
    category: "safety",
    keywords: ["fire", "safety", "emergency"],
    component: SafetyFireExtinguisherIcon,
  },
  {
    id: "PiWarning",
    category: "safety",
    keywords: ["caution", "danger", "alert"],
    component: SafetyCautionIcon,
  },
  {
    id: "PiShield",
    category: "safety",
    keywords: ["security", "protection", "guard"],
    component: SafetyShieldIcon,
  },

  // Services
  {
    id: "PiInfo",
    category: "services",
    keywords: ["info", "help", "desk"],
    component: ServiceInfoIcon,
  },
  {
    id: "PiCamera",
    category: "services",
    keywords: ["photo", "photography"],
    component: ServiceCameraIcon,
  },
  {
    id: "PiForkKnife",
    category: "services",
    keywords: ["restaurant", "dining", "eat", "meal"],
    component: ServiceUtensilIcon,
  },
  {
    id: "PiCoffee",
    category: "services",
    keywords: ["cafe", "beverage", "drink", "tea"],
    component: ServiceCoffeeIcon,
  },
  {
    id: "PiWifiHigh",
    category: "services",
    keywords: ["internet", "wireless", "network"],
    component: ServiceWifiIcon,
  },
  {
    id: "PiPlug",
    category: "services",
    keywords: ["electric", "charging", "outlet", "socket"],
    component: ServicePlugIcon,
  },
  {
    id: "PiMicrophone",
    category: "services",
    keywords: ["mic", "audio", "speaker", "stage"],
    component: ServiceMicIcon,
  },
  {
    id: "PiPhone",
    category: "services",
    keywords: ["telephone", "call", "contact"],
    component: ServicePhoneIcon,
  },
  {
    id: "PiEnvelope",
    category: "services",
    keywords: ["email", "letter", "post"],
    component: ServiceMailIcon,
  },
  {
    id: "PiPrinter",
    category: "services",
    keywords: ["print", "copy"],
    component: ServicePrinterIcon,
  },
  {
    id: "PiTicket",
    category: "services",
    keywords: ["registration", "pass", "admission"],
    component: ServiceTicketIcon,
  },
  {
    id: "PiGift",
    category: "services",
    keywords: ["prize", "present", "swag"],
    component: ServicePresentIcon,
  },

  // Navigation
  {
    id: "PiArrowRight",
    category: "navigation",
    keywords: ["direction", "pointer", "right"],
    component: NavigationArrowIcon,
  },
  {
    id: "PiMapPin",
    category: "navigation",
    keywords: ["location", "marker", "pin", "place"],
    component: NavigationLocationIcon,
  },
  {
    id: "PiStar",
    category: "navigation",
    keywords: ["favorite", "featured", "important"],
    component: NavigationStarIcon,
  },
  {
    id: "PiFlag",
    category: "navigation",
    keywords: ["marker", "checkpoint", "milestone"],
    component: PiFlag,
  },
  {
    id: "PiSignpost",
    category: "navigation",
    keywords: ["direction", "signpost", "wayfinding"],
    component: NavigationSignIcon,
  },

  // Nature
  {
    id: "PiTree",
    category: "nature",
    keywords: ["outdoor", "garden", "plant", "park"],
    component: NatureTreeIcon,
  },
  {
    id: "PiFlower",
    category: "nature",
    keywords: ["garden", "plant", "floral"],
    component: NatureFlowerIcon,
  },
  {
    id: "PiDog",
    category: "nature",
    keywords: ["pet", "animal", "dog", "cat"],
    component: NatureDogIcon,
  },
  {
    id: "PiDrop",
    category: "nature",
    keywords: ["drop", "fountain", "hydration"],
    component: NatureWaterIcon,
  },

  // Tech & AV
  {
    id: "PiMusicNote",
    category: "techAv",
    keywords: ["audio", "sound", "concert"],
    component: MusicIcon,
  },
  {
    id: "PiSpeakerHigh",
    category: "techAv",
    keywords: ["audio", "sound", "volume"],
    component: VolumeIcon,
  },
  {
    id: "PiMonitor",
    category: "techAv",
    keywords: ["screen", "display", "tv"],
    component: TechandavDisplayIcon,
  },
  {
    id: "PiPresentation",
    category: "techAv",
    keywords: ["presentation", "screen", "display"],
    component: PresentationIcon,
  },
  {
    id: "PiLightning",
    category: "techAv",
    keywords: ["power", "electric", "energy"],
    component: LightningIcon,
  },
  {
    id: "PiCarBattery",
    category: "techAv",
    keywords: ["power", "charge", "energy"],
    component: BatteryChargingIcon,
  },
  {
    id: "PiThermometer",
    category: "techAv",
    keywords: ["temperature", "climate", "hvac"],
    component: ThermometerIcon,
  },

  // General
  {
    id: "PiSquare",
    category: "general",
    keywords: ["shape", "box"],
    component: GeneralSquareIcon,
  },
  {
    id: "PiCircle",
    category: "general",
    keywords: ["shape", "round"],
    component: GeneralCircleIcon,
  },
  {
    id: "PiTriangle",
    category: "general",
    keywords: ["shape"],
    component: GeneralTriangleIcon,
  },
  {
    id: "PiHeart",
    category: "general",
    keywords: ["love", "favorite", "like"],
    component: GeneralHeartIcon,
  },
  {
    id: "PiDiamond",
    category: "general",
    keywords: ["shape", "gem"],
    component: GeneralDiamondIcon,
  },
  {
    id: "PiLock",
    category: "general",
    keywords: ["security", "private", "restricted"],
    component: LockIcon,
  },
  {
    id: "PiKey",
    category: "general",
    keywords: ["access", "unlock"],
    component: GeneralKeyIcon,
  },
  {
    id: "PiClock",
    category: "general",
    keywords: ["time", "schedule", "hours"],
    component: GeneralClockIcon,
  },
  {
    id: "PiCalendar",
    category: "general",
    keywords: ["date", "schedule", "event"],
    component: GeneralCalendarIcon,
  },
  {
    id: "PiBell",
    category: "general",
    keywords: ["notification", "alert", "ring"],
    component: GeneralBellIcon,
  },

  // Transport
  {
    id: "PiBicycle",
    category: "transport",
    keywords: ["bike", "cycling", "ride"],
    component: TransportBicycleIcon,
  },
  {
    id: "PiBus",
    category: "transport",
    keywords: ["shuttle", "transit", "public"],
    component: TransportBusIcon,
  },
  {
    id: "PiTaxi",
    category: "transport",
    keywords: ["cab", "rideshare", "uber"],
    component: TransportTaxiIcon,
  },
  {
    id: "PiTrain",
    category: "transport",
    keywords: ["rail", "subway", "metro"],
    component: TransportTrainIcon,
  },
  {
    id: "PiAirplaneTakeoff",
    category: "transport",
    keywords: ["flight", "airport", "travel"],
    component: TransportPlaneIcon,
  },

  // Venues
  {
    id: "PiHouse",
    category: "venues",
    keywords: ["home", "building", "residence"],
    component: VenueHouseIcon,
  },
  {
    id: "PiBuildings",
    category: "venues",
    keywords: ["city", "office", "downtown"],
    component: VenueBuildingIcon,
  },
  {
    id: "PiTent",
    category: "venues",
    keywords: ["camping", "outdoor", "festival"],
    component: VenueCampingIcon,
  },
  {
    id: "PiPark",
    category: "venues",
    keywords: ["outdoor", "garden", "bench"],
    component: VenueOutdoorIcon,
  },

  // Weather
  {
    id: "PiSun",
    category: "weather",
    keywords: ["sunny", "bright", "outdoor"],
    component: WeatherSunIcon,
  },
  {
    id: "PiMoon",
    category: "weather",
    keywords: ["night", "evening"],
    component: WeatherMoonIcon,
  },
  {
    id: "PiCloudRain",
    category: "weather",
    keywords: ["weather", "wet", "umbrella"],
    component: WeatherRainIcon,
  },
  {
    id: "PiSnowflake",
    category: "weather",
    keywords: ["cold", "winter", "ice"],
    component: WeatherSnowIcon,
  },
  {
    id: "PiWind",
    category: "weather",
    keywords: ["breeze", "air", "ventilation"],
    component: WeatherWindIcon,
  },

  // People
  {
    id: "PiBaby",
    category: "people",
    keywords: ["child", "infant", "family", "changing"],
    component: PeopleBabyIcon,
  },
  {
    id: "PiHandshake",
    category: "people",
    keywords: ["meeting", "partnership", "deal"],
    component: PeopleHandshakeIcon,
  },
  {
    id: "PiUsers",
    category: "people",
    keywords: ["team", "people", "crowd", "networking"],
    component: PeopleGroupIcon,
  },
  {
    id: "PiUserCircle",
    category: "people",
    keywords: ["user", "profile", "attendee"],
    component: PeopleCircleProfileIcon,
  },
  {
    id: "PiMegaphone",
    category: "people",
    keywords: ["announcement", "speaker", "broadcast"],
    component: AnnouncementIcon,
  },

  // Shopping
  {
    id: "PiShoppingCart",
    category: "shopping",
    keywords: ["buy", "store", "retail", "merch"],
    component: ShoppingCartIcon,
  },
  {
    id: "PiTShirt",
    category: "shopping",
    keywords: ["clothing", "merch", "apparel", "swag"],
    component: TShirtIcon,
  },
  {
    id: "PiBackpack",
    category: "shopping",
    keywords: ["bag", "storage", "coat check"],
    component: ShoppingBackpackIcon,
  },
  {
    id: "PiSuitcase",
    category: "shopping",
    keywords: ["luggage", "travel", "baggage"],
    component: ShoppingLuggageIcon,
  },

  // Fun
  {
    id: "PiGameController",
    category: "fun",
    keywords: ["gaming", "play", "arcade", "entertainment"],
    component: FunGamepadIcon,
  },
  {
    id: "PiBalloon",
    category: "fun",
    keywords: ["party", "celebration", "festival"],
    component: FunBalloonIcon,
  },
  {
    id: "PiConfetti",
    category: "fun",
    keywords: ["party", "celebration", "win"],
    component: FunConfettiIcon,
  },
  {
    id: "PiCrown",
    category: "fun",
    keywords: ["vip", "royalty", "premium", "king"],
    component: FunCrownIcon,
  },
  {
    id: "PiRocket",
    category: "fun",
    keywords: ["launch", "startup", "space"],
    component: FunRocketIcon,
  },
  {
    id: "PiAlien",
    category: "fun",
    keywords: ["space", "extraterrestrial", "ufo"],
    component: FunAlienIcon,
  },
  {
    id: "PiGhost",
    category: "fun",
    keywords: ["spooky", "halloween", "haunted"],
    component: FunGhostIcon,
  },
  {
    id: "PiSkull",
    category: "fun",
    keywords: ["danger", "pirate", "halloween"],
    component: FunSkullIcon,
  },
  {
    id: "PiCat",
    category: "fun",
    keywords: ["pet", "animal", "feline"],
    component: FunCatIcon,
  },

  // Food & Drink
  {
    id: "PiHamburger",
    category: "foodDrink",
    keywords: ["burger", "fast food", "meal"],
    component: FoodHamburgerIcon,
  },
  {
    id: "PiPizza",
    category: "foodDrink",
    keywords: ["food", "slice", "italian"],
    component: FoodPizzaIcon,
  },
  {
    id: "PiBeerBottle",
    category: "foodDrink",
    keywords: ["alcohol", "pub", "bar", "drink"],
    component: DrinkBottleIcon,
  },
  {
    id: "PiWine",
    category: "foodDrink",
    keywords: ["alcohol", "glass", "bar", "drink"],
    component: DrinkCocktailIcon,
  },
  {
    id: "PiCookingPot",
    category: "foodDrink",
    keywords: ["kitchen", "catering", "chef"],
    component: FoodCookingIcon,
  },

  // Creative
  {
    id: "PiScissors",
    category: "creative",
    keywords: ["cut", "craft", "workshop"],
    component: CreativeCutIcon,
  },
  {
    id: "PiPaintBrush",
    category: "creative",
    keywords: ["art", "painting", "design"],
    component: CreativeBrushIcon,
  },
  {
    id: "PiPencil",
    category: "creative",
    keywords: ["write", "draw", "edit"],
    component: CreativePenIcon,
  },
  {
    id: "PiNotebook",
    category: "creative",
    keywords: ["notes", "journal", "writing"],
    component: CreativeBookIcon,
  },

  // Sports
  {
    id: "PiMedal",
    category: "sports",
    keywords: ["award", "winner", "achievement"],
    component: SportMedalIcon,
  },
  {
    id: "PiTrophy",
    category: "sports",
    keywords: ["award", "winner", "champion", "cup"],
    component: SportTrophyIcon,
  },
  {
    id: "PiTarget",
    category: "sports",
    keywords: ["goal", "aim", "bullseye"],
    component: SportArcheryIcon,
  },
  {
    id: "PiSoccerBall",
    category: "sports",
    keywords: ["football", "sport", "game"],
    component: SportSoccerIcon,
  },

  // Exploration
  {
    id: "PiGlobe",
    category: "exploration",
    keywords: ["world", "earth", "international"],
    component: ExplorationGlobeIcon,
  },
  {
    id: "PiCompass",
    category: "exploration",
    keywords: ["direction", "navigation", "orient"],
    component: ExplorationCompassIcon,
  },
  {
    id: "PiBinoculars",
    category: "exploration",
    keywords: ["view", "observe", "lookout"],
    component: ExplorationTelescopeIcon,
  },
  {
    id: "PiMountains",
    category: "exploration",
    keywords: ["outdoor", "hiking", "landscape"],
    component: ExplorationMountainIcon,
  },
];

// Lookup by id
const iconMap = new Map(iconRegistry.map(entry => [entry.id, entry]));

export function getIconEntry(id: string): IconEntry | undefined {
  return iconMap.get(id);
}
