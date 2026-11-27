// OWNER: Person A
const MOVIES = [
  { title: "Dune: Part Three", showtimes: ["4:30 PM", "7:00 PM", "9:45 PM"] },
  { title: "The Quiet Harbour", showtimes: ["5:15 PM", "8:00 PM"] },
  { title: "Robot Bakery",      showtimes: ["1:00 PM", "3:30 PM", "6:00 PM"] },
];
const SEAT_AREAS = ["front", "middle", "back", "aisle"];
const MAX_TICKETS = 8;

const SEAT_ROWS = ["A", "B", "C", "D", "E"];
const SEATS_PER_ROW = 8;
const TAKEN_SEATS = ["A2", "A7", "B1", "B6", "C5", "D4", "E3", "E8"];
const AREA_ROWS = { front: ["A", "B"], middle: ["C", "D"], back: ["E"] };