// Realistic demo data for NER Logistics Analytics
// Cities and routes specific to North East India's 8 states

// ─── Monthly Trends (last 12 months) ───────────────────────────────────────────
export const monthlyTrends = [
  { month: 'Oct',  trips: 42,  distance: 12600, avgRisk: 3.2 },
  { month: 'Nov',  trips: 56,  distance: 16800, avgRisk: 3.5 },
  { month: 'Dec',  trips: 38,  distance: 11400, avgRisk: 4.1 },
  { month: 'Jan',  trips: 31,  distance: 9300,  avgRisk: 4.8 },
  { month: 'Feb',  trips: 45,  distance: 13500, avgRisk: 3.9 },
  { month: 'Mar',  trips: 62,  distance: 18600, avgRisk: 3.1 },
  { month: 'Apr',  trips: 71,  distance: 21300, avgRisk: 2.8 },
  { month: 'May',  trips: 58,  distance: 17400, avgRisk: 3.3 },
  { month: 'Jun',  trips: 44,  distance: 13200, avgRisk: 5.2 },
  { month: 'Jul',  trips: 36,  distance: 10800, avgRisk: 6.1 },
  { month: 'Aug',  trips: 52,  distance: 15600, avgRisk: 4.4 },
  { month: 'Sep',  trips: 67,  distance: 20100, avgRisk: 3.0 },
]

// ─── Risk Distribution ─────────────────────────────────────────────────────────
export const riskDistribution = [
  { name: 'Low Risk',    value: 312, color: '#22c55e' },
  { name: 'Medium Risk', value: 186, color: '#f59e0b' },
  { name: 'High Risk',   value: 104, color: '#ef4444' },
]

// ─── State-wise Trips ──────────────────────────────────────────────────────────
export const stateTrips = [
  { state: 'Assam',      trips: 186, fill: '#6366f1' },
  { state: 'Meghalaya',  trips: 98,  fill: '#14b8a6' },
  { state: 'Manipur',    trips: 74,  fill: '#f59e0b' },
  { state: 'Nagaland',   trips: 62,  fill: '#22c55e' },
  { state: 'Tripura',    trips: 58,  fill: '#ef4444' },
  { state: 'Mizoram',    trips: 45,  fill: '#8b5cf6' },
  { state: 'Arunachal',  trips: 42,  fill: '#ec4899' },
  { state: 'Sikkim',     trips: 37,  fill: '#06b6d4' },
]

// ─── Route Performance (distance vs time) ──────────────────────────────────────
export const routePerformance = [
  { trip: 1,  distance: 180, time: 5.2,  risk: 2.1 },
  { trip: 2,  distance: 320, time: 9.5,  risk: 4.8 },
  { trip: 3,  distance: 95,  time: 3.1,  risk: 1.5 },
  { trip: 4,  distance: 410, time: 12.8, risk: 6.2 },
  { trip: 5,  distance: 220, time: 6.4,  risk: 3.3 },
  { trip: 6,  distance: 150, time: 4.8,  risk: 2.7 },
  { trip: 7,  distance: 530, time: 16.2, risk: 7.1 },
  { trip: 8,  distance: 280, time: 8.1,  risk: 3.9 },
  { trip: 9,  distance: 175, time: 5.6,  risk: 4.2 },
  { trip: 10, distance: 360, time: 10.4, risk: 5.5 },
  { trip: 11, distance: 120, time: 3.8,  risk: 1.8 },
  { trip: 12, distance: 440, time: 13.6, risk: 5.9 },
  { trip: 13, distance: 200, time: 6.0,  risk: 2.4 },
  { trip: 14, distance: 310, time: 9.2,  risk: 4.1 },
  { trip: 15, distance: 265, time: 7.8,  risk: 3.6 },
]

// ─── Recent Trips ──────────────────────────────────────────────────────────────
export const recentTrips = [
  { id: 'NER-0601', origin: 'Guwahati',  destination: 'Shillong',   date: '2026-09-05', distance: 98,  risk: 2.1, riskLabel: 'Low',    duration: '3h 12m', status: 'Delivered' },
  { id: 'NER-0600', origin: 'Imphal',    destination: 'Kohima',     date: '2026-09-04', distance: 138, risk: 4.5, riskLabel: 'Medium', duration: '5h 40m', status: 'Delivered' },
  { id: 'NER-0599', origin: 'Guwahati',  destination: 'Itanagar',   date: '2026-09-04', distance: 380, risk: 6.8, riskLabel: 'High',   duration: '12h 15m',status: 'Delivered' },
  { id: 'NER-0598', origin: 'Agartala',  destination: 'Silchar',    date: '2026-09-03', distance: 186, risk: 3.2, riskLabel: 'Low',    duration: '6h 30m', status: 'Delivered' },
  { id: 'NER-0597', origin: 'Dimapur',   destination: 'Mokokchung', date: '2026-09-03', distance: 155, risk: 5.7, riskLabel: 'Medium', duration: '5h 50m', status: 'Delivered' },
  { id: 'NER-0596', origin: 'Gangtok',   destination: 'Namchi',     date: '2026-09-02', distance: 80,  risk: 3.9, riskLabel: 'Medium', duration: '3h 05m', status: 'Delivered' },
  { id: 'NER-0595', origin: 'Aizawl',    destination: 'Lunglei',    date: '2026-09-02', distance: 175, risk: 7.2, riskLabel: 'High',   duration: '7h 40m', status: 'Delayed' },
  { id: 'NER-0594', origin: 'Shillong',  destination: 'Tura',       date: '2026-09-01', distance: 310, risk: 4.8, riskLabel: 'Medium', duration: '10h 20m',status: 'Delivered' },
  { id: 'NER-0593', origin: 'Tezpur',    destination: 'Tawang',     date: '2026-09-01', distance: 320, risk: 8.1, riskLabel: 'High',   duration: '13h 45m',status: 'Delayed' },
  { id: 'NER-0592', origin: 'Guwahati',  destination: 'Dibrugarh',  date: '2026-08-31', distance: 440, risk: 2.8, riskLabel: 'Low',    duration: '9h 15m', status: 'Delivered' },
]

// ─── Top Corridors ─────────────────────────────────────────────────────────────
export const topCorridors = [
  { corridor: 'Guwahati \u2192 Shillong',    trips: 89,  avgTime: '3h 15m', avgRisk: 2.3 },
  { corridor: 'Guwahati \u2192 Dibrugarh',   trips: 72,  avgTime: '9h 20m', avgRisk: 2.8 },
  { corridor: 'Imphal \u2192 Kohima',        trips: 54,  avgTime: '5h 45m', avgRisk: 4.6 },
  { corridor: 'Guwahati \u2192 Itanagar',    trips: 41,  avgTime: '12h 30m',avgRisk: 6.2 },
  { corridor: 'Agartala \u2192 Silchar',     trips: 38,  avgTime: '6h 25m', avgRisk: 3.5 },
  { corridor: 'Shillong \u2192 Tura',        trips: 34,  avgTime: '10h 10m',avgRisk: 4.9 },
  { corridor: 'Aizawl \u2192 Lunglei',       trips: 28,  avgTime: '7h 35m', avgRisk: 6.8 },
  { corridor: 'Gangtok \u2192 Namchi',       trips: 25,  avgTime: '3h 10m', avgRisk: 3.7 },
]

// ─── KPI Summaries ─────────────────────────────────────────────────────────────
export const kpiData = {
  totalTrips:      { value: 602,       change: +12.4, label: 'Total Trips' },
  avgRisk:         { value: 3.8,       change: -8.2,  label: 'Avg Risk Score' },
  totalDistance:   { value: '180,600', change: +15.1, label: 'Total Distance (km)' },
  avgDeliveryTime: { value: '7.2',     change: -5.6,  label: 'Avg Delivery Time (hrs)' },
}
