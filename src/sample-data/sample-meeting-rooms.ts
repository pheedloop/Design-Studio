import type { MeetingRoom } from "@/viewer/types";

/**
 * Sample MeetingRoom records.
 * Note: no dedicated MeetingRoom model currently exists in pikachu — these
 * are forward-looking records for use once the backend model is implemented.
 * IDs are consistent across maps and with the sample floor plans' element
 * `meetingRoomId` references (see e.g. Exhibition Hall.json).
 */
export const sampleMeetingRooms: MeetingRoom[] = [
  { id: "1", name: "Board Room", capacity: 16 },
  { id: "2", name: "Meeting Room A", capacity: 10 },
  { id: "3", name: "Meeting Room B", capacity: 10 },
  { id: "4", name: "VIP Lounge", capacity: 20 },
  { id: "5", name: "Meeting Room C", capacity: 10 },
  { id: "6", name: "Meeting Room D", capacity: 10 },
  { id: "7", name: "Executive Suite", capacity: 8 },
  { id: "8", name: "Innovation Hub", capacity: 25 },
  { id: "9", name: "Collaboration Room", capacity: 12 },
  { id: "10", name: "Training Room", capacity: 30 },
  { id: "11", name: "Huddle Room 1", capacity: 6 },
  { id: "12", name: "Huddle Room 2", capacity: 6 },
  { id: "13", name: "Huddle Room 3", capacity: 6 },
  { id: "14", name: "Press Room", capacity: 15 },
  { id: "15", name: "Speaker Ready Room", capacity: 10 },
  { id: "16", name: "Green Room", capacity: 8 },
  { id: "17", name: "Sponsor Suite A", capacity: 20 },
  { id: "18", name: "Sponsor Suite B", capacity: 20 },
  { id: "19", name: "Quiet Room", capacity: 4 },
  { id: "20", name: "Operations Centre", capacity: 12 },
];
