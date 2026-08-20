import type { Exhibitor } from "../viewer/types";

import logoAcme from "./logos/acme-corp.svg";
import logoTechflow from "./logos/techflow.svg";
import logoGreenleaf from "./logos/greenleaf.svg";
import logoNexus from "./logos/nexus.svg";
import logoHorizon from "./logos/horizon.svg";
import logoCloudbridge from "./logos/cloudbridge.svg";
import logoSummit from "./logos/summit.svg";
import logoVanguard from "./logos/vanguard.svg";
import logoPulse from "./logos/pulse.svg";
import logoBrightpath from "./logos/brightpath.svg";

import logoHarbor from "./logos/harbor.svg";
import logoLantern from "./logos/lantern.svg";
import logoVortex from "./logos/vortex.svg";
import logoQuantum from "./logos/quantum.svg";
import logoLumina from "./logos/lumina.svg";
import logoCobalt from "./logos/cobalt.svg";
import logoEclipse from "./logos/eclipse.svg";
import logoParagon from "./logos/paragon.svg";
import logoMeridian from "./logos/meridian.svg";
import logoMosaic from "./logos/mosaic.svg";
import logoRelay from "./logos/relay.svg";
import logoApex from "./logos/apex.svg";
import logoKinetic from "./logos/kinetic.svg";
import logoZephyr from "./logos/zephyr.svg";
import logoPolaris from "./logos/polaris.svg";
import logoDrift from "./logos/drift.svg";
import logoForge from "./logos/forge.svg";
import logoCitadel from "./logos/citadel.svg";
import logoCascade from "./logos/cascade.svg";
import logoOrbit from "./logos/orbit.svg";
import logoPrism from "./logos/prism.svg";
import logoBeacon from "./logos/beacon.svg";
import logoPinnacle from "./logos/pinnacle.svg";
import logoIronclad from "./logos/ironclad.svg";
import logoVertex from "./logos/vertex.svg";
import logoSolstice from "./logos/solstice.svg";
import logoWaypoint from "./logos/waypoint.svg";
import logoHelix from "./logos/helix.svg";
import logoSentinel from "./logos/sentinel.svg";
import logoFlare from "./logos/flare.svg";
import logoLattice from "./logos/lattice.svg";
import logoStratum from "./logos/stratum.svg";
import logoMeridian2 from "./logos/meridian2.svg";
import logoSignal from "./logos/signal.svg";
import logoAxiom from "./logos/axiom.svg";

// ── Main Exhibition Hall (alpha codes, 10 exhibitors) ─────────────────────────
export const sampleExhibitors: Exhibitor[] = [
  {
    id: "exh-001",
    name: "Acme Corp",
    boothSlug: "EXHBOTNZNA02PFZ3HDXV",
    logo: logoAcme,
  },
  {
    id: "exh-002",
    name: "TechFlow Inc",
    boothSlug: "EXHBOTMQ742K5PAO67SP",
    logo: logoTechflow,
  },
  {
    id: "exh-003",
    name: "GreenLeaf Solutions",
    boothSlug: "EXHBOTZHX86RR9FBRI8T",
    logo: logoGreenleaf,
  },
  {
    id: "exh-004",
    name: "Nexus Digital",
    boothSlug: "EXHBOTCBKQSXFHJO2HM8",
    logo: logoNexus,
  },
  {
    id: "exh-005",
    name: "Horizon Events",
    boothSlug: "EXHBOTKLVAA0LIKKNM7O",
    logo: logoHorizon,
  },
  {
    id: "exh-006",
    name: "CloudBridge AI",
    boothSlug: "EXHBOTD9EH60FACRNNGF",
    logo: logoCloudbridge,
  },
  {
    id: "exh-007",
    name: "Summit Audio",
    boothSlug: "EXHBOT20F838RG8QS03X",
    logo: logoSummit,
  },
  {
    id: "exh-008",
    name: "Vanguard Media",
    boothSlug: "EXHBOT6YAPT4R5O1L0VH",
    logo: logoVanguard,
  },
  {
    id: "exh-009",
    name: "Pulse Analytics",
    boothSlug: "EXHBOTAFX4X7SKH5NB06",
    logo: logoPulse,
  },
  {
    id: "exh-010",
    name: "BrightPath Learning",
    boothSlug: "EXHBOTDL55EMVXITXUUB",
    logo: logoBrightpath,
  },
];

// ── Conference & Expo Hall 2026 (numeric codes, 100 exhibitors) ───────────────
// IDs are real PheedLoop-format slugs. boothSlug matches conferenceExpoBooths
// in sample-booths.ts. Unassigned booths have no exhibitor entry.
export const conferenceExpoExhibitors: Exhibitor[] = [
  {
    id: "EXHH5CSK30LVYLKFX",
    name: "Harbor Capital",
    boothSlug: "EXHBOTNZNA02PFZ3HDXV",
    logo: logoHarbor,
  },
  {
    id: "EXHS1K9YE9O2M71HS",
    name: "Lantern Advisory",
    boothSlug: "EXHBOTKWDZMHOVW9JRB6",
    logo: logoLantern,
  },
  {
    id: "EXHCMKTLZKJ49YD82",
    name: "Vortex Cybersecurity",
    boothSlug: "EXHBOTSLE3WZLMOFNM39",
    logo: logoVortex,
  },
  {
    id: "EXHP2U4DTBH55RBC7",
    name: "Tangent Engineering",
    boothSlug: "EXHBOT4KO9WHEMBO2UJ4",
    logo: logoForge,
  },
  {
    id: "EXH4N89QKNS832EJX",
    name: "Vertex Industries",
    boothSlug: "EXHBOTAFX4X7SKH5NB06",
    logo: logoVertex,
  },
  {
    id: "EXHY36DDFGS3JONOU",
    name: "Relay Communications",
    boothSlug: "EXHBOTDL55EMVXITXUUB",
    logo: logoRelay,
  },
  {
    id: "EXH3C9XQYM52XG8P6",
    name: "Lumina Technologies",
    boothSlug: "EXHBOTSL8ZADGUDJLC6I",
    logo: logoLumina,
  },
  {
    id: "EXHYN9382KKZMPJRH",
    name: "Sapphire Diagnostics",
    boothSlug: "EXHBOT5ZIO8PPC9BVIVU",
    logo: logoHelix,
  },
  {
    id: "EXHGYSPENGWYX9TRF",
    name: "Quantum Leap AI",
    boothSlug: "EXHBOT0FV8VXK8SU4PCO",
    logo: logoQuantum,
  },
  {
    id: "EXHTJ1GM25LEN606N",
    name: "Cobalt Manufacturing",
    boothSlug: "EXHBOTH55D07K5S5EVFV",
    logo: logoCobalt,
  },
  {
    id: "EXH1AT7O75RH8LX6D",
    name: "Umbra Defense",
    boothSlug: "EXHBOTFU259DQ70LQWW1",
    logo: logoSentinel,
  },
  {
    id: "EXHY8N1UTOXIE0RNU",
    name: "Solstice Media",
    boothSlug: "EXHBOT4SOFAFEV8PVGUY",
    logo: logoSolstice,
  },
  {
    id: "EXH9RR7S20CV3TLCX",
    name: "Eclipse Energy",
    boothSlug: "EXHBOTPFT5FGAMVT0RDB",
    logo: logoEclipse,
  },
  {
    id: "EXH9YO18PAJSSUUQO",
    name: "Keyframe Media",
    boothSlug: "EXHBOT1LPKSFIKPYF2RF",
    logo: logoPrism,
  },
  {
    id: "EXHJA2M0W10LBT3G2",
    name: "Paragon Software",
    boothSlug: "EXHBOTKFDOBR235J2FSE",
    logo: logoParagon,
  },
  {
    id: "EXH8O1BJ9RM7PYXDW",
    name: "Watershed Environmental",
    boothSlug: "EXHBOTGVKT7EOHPKZRQ7",
    logo: logoZephyr,
  },
  {
    id: "EXH6UB7L8V1ZOCFI4",
    name: "Uplift Social",
    boothSlug: "EXHBOTKALFO7JFRXIX4P",
    logo: logoSignal,
  },
  {
    id: "EXHW5WFCPKJCSLQC3",
    name: "Meridian Healthcare",
    boothSlug: "EXHBOT30BLLOHSS6GA6P",
    logo: logoMeridian,
  },
  {
    id: "EXH1RSRLA8S8HMBR5",
    name: "Jasper Therapeutics",
    boothSlug: "EXHBOT5363YEFJ4EQP7C",
    logo: logoHelix,
  },
  {
    id: "EXHVWVM4W3ZKWDEEK",
    name: "Pipeline Energy",
    boothSlug: "EXHBOTPS5W20F1ZOO69E",
    logo: logoEclipse,
  },
  {
    id: "EXH0WFOY4DD1VN8LF",
    name: "Deepwater Energy",
    boothSlug: "EXHBOTQ7RLH8MEYCOVNI",
    logo: logoHarbor,
  },
  {
    id: "EXHMUFM8ZOV7LN23Y",
    name: "NovaTech Systems",
    boothSlug: "EXHBOT60IEYV2P9IPUUB",
    logo: logoDrift,
  },
  {
    id: "EXHFHV1XG1R11Q7UW",
    name: "Apex Solutions",
    boothSlug: "EXHBOTFNERCWKRX75ASL",
    logo: logoApex,
  },
  {
    id: "EXHGFU8IOGXPBWHVN",
    name: "Northgate Medical",
    boothSlug: "EXHBOTEWZMULKJ55F27O",
    logo: logoMeridian2,
  },
  {
    id: "EXH3OEUVTYT8QZPKY",
    name: "Highpoint Analytics",
    boothSlug: "EXHBOT9JJWT8QOO06B6I",
    logo: logoStratum,
  },
  {
    id: "EXH6NOUHFJ7UPFLN4",
    name: "Navigate Financial",
    boothSlug: "EXHBOTOVJ9HFIKJ10YZ2",
    logo: logoCitadel,
  },
  {
    id: "EXHC54WSQT26Q3XLR",
    name: "Stellar Communications",
    boothSlug: "EXHBOTYU9XSVBQ241N99",
    logo: logoSignal,
  },
  {
    id: "EXH9N56NYXTXMGTT0",
    name: "Echo Analytics",
    boothSlug: "EXHBOTAGH4758R8ULTLA",
    logo: logoDrift,
  },
  {
    id: "EXH3P15AHDBVZB0OI",
    name: "Glacier Pharma",
    boothSlug: "EXHBOT1SD5MSS45ED1BB",
    logo: logoHelix,
  },
  {
    id: "EXHH6T1NTMJSRD9Q4",
    name: "Momentum Healthcare",
    boothSlug: "EXHBOT4WA6C4Z0F3GNM8",
    logo: logoWaypoint,
  },
  {
    id: "EXH795E5IZ31YRUJO",
    name: "Wavefront Imaging",
    boothSlug: "EXHBOTZFM2VFQN5DX0M9",
    logo: logoOrbit,
  },
  {
    id: "EXHQXMCTHPHJ3MUUR",
    name: "Yellowstone Environmental",
    boothSlug: "EXHBOTC5P5XFUM3KEYE6",
    logo: logoWaypoint,
  },
  {
    id: "EXH2ZCFZW0LDALMJE",
    name: "Crossroads Ventures",
    boothSlug: "EXHBOTWV4MG784B57UFR",
    logo: logoAxiom,
  },
  {
    id: "EXHBMC97C7BO119XP",
    name: "Drift Technologies",
    boothSlug: "EXHBOTUUI79LG34JYIJG",
    logo: logoDrift,
  },
  {
    id: "EXHIUI9KKHZLM72JE",
    name: "Radius Cybersecurity",
    boothSlug: "EXHBOT7Y5POHI8X5J2M2",
    logo: logoIronclad,
  },
  {
    id: "EXHNWYWRRATATJ9A3",
    name: "Quorum Data",
    boothSlug: "EXHBOTCSSS6Y6IRGZOJV",
    logo: logoLattice,
  },
  {
    id: "EXHSBELRQVSLWF90K",
    name: "Mosaic Creative",
    boothSlug: "EXHBOTQ9SG88WT9BTI0I",
    logo: logoMosaic,
  },
  {
    id: "EXH0UR5L8A78E9RIV",
    name: "Lattice Materials",
    boothSlug: "EXHBOTQSJUPVO1VZX9Z8",
    logo: logoLattice,
  },
  {
    id: "EXH1VSMADO8E7FLQH",
    name: "Landmark Real Estate",
    boothSlug: "EXHBOTXTHV3A3ZMF8MDD",
    logo: logoBeacon,
  },
  {
    id: "EXHCCPRHVLZ049ENU",
    name: "Halcyon Systems",
    boothSlug: "EXHBOT4V30T9NT3W5UZB",
    logo: logoSentinel,
  },
  {
    id: "EXHXQT4P501NOUHTC",
    name: "Keystone Engineering",
    boothSlug: "EXHBOTIKCIDKWNNHJ7XV",
    logo: logoCobalt,
  },
  {
    id: "EXH3N3BZT9D31K9QM",
    name: "Threadneedle Finance",
    boothSlug: "EXHBOTG0FN9XUY41IBLJ",
    logo: logoStratum,
  },
  {
    id: "EXHMABSI9NB74X2EK",
    name: "Atlas Consulting",
    boothSlug: "EXHBOT84AZYTJXEPQ85J",
    logo: logoAxiom,
  },
  {
    id: "EXHRXYJ38XRG2GZR7",
    name: "Onyx Defense",
    boothSlug: "EXHBOTA753LC58DRC11E",
    logo: logoIronclad,
  },
  {
    id: "EXHIAAKYTT3IMJ70E",
    name: "Forge Manufacturing",
    boothSlug: "EXHBOTRTJ5PHT0HL9XPS",
    logo: logoForge,
  },
  {
    id: "EXHLQJIDKNWI5FLUL",
    name: "Icefall Analytics",
    boothSlug: "EXHBOTHE7UR23GDPPQ0Y",
    logo: logoCascade,
  },
  {
    id: "EXHLQBMAE38SRYO4R",
    name: "Riviera Hospitality",
    boothSlug: "EXHBOTTB94874FRHOCN9",
    logo: logoSolstice,
  },
  {
    id: "EXH5TD44K1J6FP8HQ",
    name: "Prism Marketing",
    boothSlug: "EXHBOTJ2QP89UZFK8UT0",
    logo: logoPrism,
  },
  {
    id: "EXH0DL5E11E9FTAXP",
    name: "Clarity Analytics",
    boothSlug: "EXHBOTCVS4F8CGVYIE6I",
    logo: logoOrbit,
  },
  {
    id: "EXH3P91I3VMZWFFHH",
    name: "Upstream Biotech",
    boothSlug: "EXHBOTVWPVS7HZIOYKL1",
    logo: logoHelix,
  },
  {
    id: "EXHDS3QSQCQ30O30U",
    name: "Citadel Security",
    boothSlug: "EXHBOTCQ99CHJ755NF4Z",
    logo: logoCitadel,
  },
  {
    id: "EXHGQTOAMDVLNKND6",
    name: "Dynamo Systems",
    boothSlug: "EXHBOTW9XA3KX7EEDTJV",
    logo: logoKinetic,
  },
  {
    id: "EXHRRPZLK3E4XYF9I",
    name: "Milestone Capital",
    boothSlug: "EXHBOTZHWJR64DPJA1WJ",
    logo: logoPinnacle,
  },
  {
    id: "EXHXUX1OXRWK8R2YK",
    name: "Griffin Automation",
    boothSlug: "EXHBOT0TPAC56T4UFEL6",
    logo: logoKinetic,
  },
  {
    id: "EXH7YT2M6TWD1XMXB",
    name: "Jetstream Aviation",
    boothSlug: "EXHBOT246HID25OWF759",
    logo: logoPolaris,
  },
  {
    id: "EXH32ORWIXZ2C9ROS",
    name: "Interchange Logistics",
    boothSlug: "EXHBOTI3QK2IAGL58KXO",
    logo: logoBeacon,
  },
  {
    id: "EXHQW5DSK7N8LA100",
    name: "Xcelerate Performance",
    boothSlug: "EXHBOT9T7E8G8JDP0LVS",
    logo: logoApex,
  },
  {
    id: "EXHKTSG7FXZV4U3BB",
    name: "Emerald Sustainability",
    boothSlug: "EXHBOTNUJZA7TZ0YNCXL",
    logo: logoZephyr,
  },
  {
    id: "EXHZAREIYAZ39PECN",
    name: "Brightside Healthcare",
    boothSlug: "EXHBOTL4ZKLOOKEP7Y6W",
    logo: logoWaypoint,
  },
  {
    id: "EXHCB1KJTGQ01TEE1",
    name: "Scaffold Construction",
    boothSlug: "EXHBOTDSWM31YIHAIR4C",
    logo: logoForge,
  },
  {
    id: "EXHT7ZEWVIYTWBOZD",
    name: "Tempest Aviation",
    boothSlug: "EXHBOTOWGZRIXA11DPG8",
    logo: logoPolaris,
  },
  {
    id: "EXHFCD6MZSGIPPSFN",
    name: "Quantum Analytics",
    boothSlug: "EXHBOTSBI4Q2Y9V86WZS",
    logo: logoQuantum,
  },
  {
    id: "EXHHKC856WPR97Y2L",
    name: "Ignite Marketing",
    boothSlug: "EXHBOT3T60RJIW1SWJCK",
    logo: logoFlare,
  },
  {
    id: "EXH3FPOYIPK0QTL3Q",
    name: "Summit Financial",
    boothSlug: "EXHBOTHHPBMYOFQEWAOU",
    logo: logoPinnacle,
  },
  {
    id: "EXH9EL8HL88KZRUIN",
    name: "Groundwork Infrastructure",
    boothSlug: "EXHBOTUHZ1GV0E38DALY",
    logo: logoForge,
  },
  {
    id: "EXHO6L1F90S9BP4M1",
    name: "Vector Genomics",
    boothSlug: "EXHBOT8OZCYWD14VE92M",
    logo: logoHelix,
  },
  {
    id: "EXH4LMCT64Z7W2SEH",
    name: "Arcadia Healthcare",
    boothSlug: "EXHBOTPNSM43D8W3ZP08",
    logo: logoMeridian2,
  },
  {
    id: "EXHR821UZVGWW4FYB",
    name: "Olympus Capital",
    boothSlug: "EXHBOTJ3TRP0J43D5IQV",
    logo: logoHarbor,
  },
  {
    id: "EXHYCELOS6ZLE6KWH",
    name: "Zephyr Clean Energy",
    boothSlug: "EXHBOTNB4GH2M5ZJA8DZ",
    logo: logoZephyr,
  },
  {
    id: "EXH69UGNEKRCPPRCJ",
    name: "Element Life Sciences",
    boothSlug: "EXHBOT0LZJJEGET1GHR0",
    logo: logoHelix,
  },
  {
    id: "EXHIWVHDK8LW2LM34",
    name: "Foundry Partners",
    boothSlug: "EXHBOT9SKDGIGATJ9TZE",
    logo: logoLantern,
  },
  {
    id: "EXHKOMV2XCDYK0X65",
    name: "Pinnacle Engineering",
    boothSlug: "EXHBOTBFUK9E1V2ISQP4",
    logo: logoPinnacle,
  },
  {
    id: "EXHKBP2QD6VASIFPW",
    name: "Ironclad Security",
    boothSlug: "EXHBOT9KWV08HHXFGCAQ",
    logo: logoIronclad,
  },
  {
    id: "EXHN2Y8FV2BC2NNUV",
    name: "Vanguard Aerospace",
    boothSlug: "EXHBOTVKIZZQY72WX7PT",
    logo: logoPolaris,
  },
  {
    id: "EXHZH13CD5GLQJ5SX",
    name: "Origin Technology",
    boothSlug: "EXHBOTX63CFL0UKEYZ7S",
    logo: logoOrbit,
  },
  {
    id: "EXHEF0VOTQTXHI15C",
    name: "Acorn Biomedical",
    boothSlug: "EXHBOTRCBPLJD84U89YJ",
    logo: logoMeridian2,
  },
  {
    id: "EXHOFN1R4KZ36U8UE",
    name: "Junction Software",
    boothSlug: "EXHBOTB1QX6GVWRDMLY4",
    logo: logoParagon,
  },
  {
    id: "EXHQZCUCTSUFLSEHU",
    name: "Beacon Logistics",
    boothSlug: "EXHBOTLYK83TQLL8OS9X",
    logo: logoBeacon,
  },
  {
    id: "EXHEFQJG02U1G463S",
    name: "Xenith Medical",
    boothSlug: "EXHBOTTOGN1W1HT7PZE9",
    logo: logoHelix,
  },
  {
    id: "EXH9IY4X41DNTCAGR",
    name: "Sienna Agriculture",
    boothSlug: "EXHBOTJ49ITN7S55J2O7",
    logo: logoWaypoint,
  },
  {
    id: "EXHLXSLG6MM1ZXYVG",
    name: "Quasar Networks",
    boothSlug: "EXHBOTS3KKV9RFTMTTQL",
    logo: logoSignal,
  },
  {
    id: "EXHOLMLGSES6M033I",
    name: "TechVentures Inc.",
    boothSlug: "EXHBOTGZUI1B0Z3NX39R",
    logo: logoDrift,
  },
  {
    id: "EXHC4D145BM1ENF31",
    name: "Horizon Medical",
    boothSlug: "EXHBOTBSV55PSQ0OXFQ8",
    logo: logoMeridian,
  },
  {
    id: "EXH75AUD9K9TR74QG",
    name: "Wildfire Communications",
    boothSlug: "EXHBOTMYX444NLZ15BCW",
    logo: logoFlare,
  },
  {
    id: "EXHQZW3C1QKBHB7S9",
    name: "Redwood Pharmaceuticals",
    boothSlug: "EXHBOT790PDW5PY6B2KN",
    logo: logoMeridian2,
  },
  {
    id: "EXHLVPYMB5M9J98CW",
    name: "Polaris Logistics",
    boothSlug: "EXHBOTRIUU9K9XJUY0BV",
    logo: logoPolaris,
  },
  {
    id: "EXHE2ATN2TWDL9ZS1",
    name: "Titan Construction",
    boothSlug: "EXHBOTR6K2VMWWYZX4W6",
    logo: logoForge,
  },
  {
    id: "EXHIHX74D0GJYV5G1",
    name: "Kinetic Robotics",
    boothSlug: "EXHBOT3J3R30ME8F8409",
    logo: logoKinetic,
  },
  {
    id: "EXHMYBD2QE4PA8HYE",
    name: "Zeal Marketing",
    boothSlug: "EXHBOTD5EQY08P0FODRO",
    logo: logoFlare,
  },
  {
    id: "EXH3ZEZQACJ4T0SEK",
    name: "Nexus Biotech",
    boothSlug: "EXHBOT4QXXVA2IEUC1HH",
    logo: logoHelix,
  },
  {
    id: "EXHXF7JXJN6FOKZIX",
    name: "Archway Consulting",
    boothSlug: "EXHBOTILGB0S0R2SDS8B",
    logo: logoAxiom,
  },
  {
    id: "EXHDYGFLIJI18K0AX",
    name: "Yield Analytics",
    boothSlug: "EXHBOT25SQ8CROYR6CCV",
    logo: logoStratum,
  },
  {
    id: "EXHUT076G5G79OR78",
    name: "Valor Financial",
    boothSlug: "EXHBOTCJWTL9TQVDZ4X1",
    logo: logoCitadel,
  },
  {
    id: "EXHIOXD9CSS9TOQW9",
    name: "BlueSky Robotics",
    boothSlug: "EXHBOT3DD03UVULEMX15",
    logo: logoKinetic,
  },
  {
    id: "EXHM3TZK3NY9V20YA",
    name: "Nautilus Marine",
    boothSlug: "EXHBOTZ8VMUHXID4N1U3",
    logo: logoHarbor,
  },
  {
    id: "EXH30YSXPNNGH8RIE",
    name: "Cascade Digital",
    boothSlug: "EXHBOT493WXA73JGZLMA",
    logo: logoCascade,
  },
  {
    id: "EXHJJQ9K6RE4Q6QDY",
    name: "Zenith Instruments",
    boothSlug: "EXHBOTDBFWYJXRPJ1EPK",
    logo: logoParagon,
  },
  {
    id: "EXHBEFFLZM764JWTE",
    name: "Orbit Data",
    boothSlug: "EXHBOTYRYBOVAKHEJLA0",
    logo: logoOrbit,
  },
  {
    id: "EXH8DALFYO1750CEH",
    name: "Prestige Genomics",
    boothSlug: "EXHBOTGNZS43C5BA75UU",
    logo: logoHelix,
  },
  {
    id: "EXHTXCB48Y1O4IZAS",
    name: "Pathfinder Consulting",
    boothSlug: "EXHBOTZPEAL2W37D4IVS",
    logo: logoWaypoint,
  },
];
