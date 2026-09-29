import type { Shop } from "./types";

export const MOCK_SHOPS: Shop[] = [
  {
    id: "SH-001",
    name: "Makati Central",
    location: "Ayala Ave, Makati City",
    phone: "+63 2 8123 4567",
    about:
      "Flagship COFFECITO branch serving specialty espresso, cold brew, and pastries in the heart of Makati.",
    image:
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=300&fit=crop&auto=format",
    orders: 1142,
    revenue: 48520,
    status: "Active",
    since: "Jan 12, 2024",
    faqs: [
      { id: "f1", question: "Do the rewards expire?", answer: "No" },
      {
        id: "f2",
        question: "Is parking available?",
        answer: "Yes, basement parking validated.",
      },
    ],
    hours: [
      { id: "h1", day: "Monday", open: "8:00 AM", close: "9:00 PM" },
      { id: "h2", day: "Tuesday", open: "8:00 AM", close: "9:00 PM" },
      { id: "h3", day: "Wednesday", open: "8:00 AM", close: "9:00 PM" },
      { id: "h4", day: "Thursday", open: "8:00 AM", close: "9:00 PM" },
      { id: "h5", day: "Friday", open: "8:00 AM", close: "10:00 PM" },
      { id: "h6", day: "Saturday", open: "9:00 AM", close: "10:00 PM" },
      { id: "h7", day: "Sunday", open: "9:00 AM", close: "8:00 PM" },
    ],
  },
  {
    id: "SH-002",
    name: "SM North EDSA",
    location: "North Ave, Quezon City",
    phone: "+63 2 8987 1122",
    about: "Mall branch with quick-serve counter and seating for 40.",
    image:
      "https://images.unsplash.com/photo-1501339848182-8c5ad3518407?w=400&h=300&fit=crop&auto=format",
    orders: 980,
    revenue: 39200,
    status: "Active",
    since: "Mar 3, 2024",
    faqs: [
      { id: "f1", question: "Do you take reservations?", answer: "Walk-in only." },
    ],
    hours: [
      { id: "h1", day: "Monday", open: "10:00 AM", close: "9:00 PM" },
      { id: "h2", day: "Saturday", open: "10:00 AM", close: "10:00 PM" },
    ],
  },
  {
    id: "SH-003",
    name: "BGC Branch",
    location: "9th Ave, BGC Taguig",
    phone: "+63 2 8555 7788",
    about: "Modern cafe space popular with remote workers and teams.",
    image:
      "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400&h=300&fit=crop&auto=format",
    orders: 1320,
    revenue: 56100,
    status: "Active",
    since: "Feb 18, 2024",
    faqs: [
      { id: "f1", question: "Wi-Fi available?", answer: "Yes, free for customers." },
    ],
    hours: [
      { id: "h1", day: "Monday", open: "7:30 AM", close: "9:00 PM" },
      { id: "h2", day: "Friday", open: "7:30 AM", close: "10:00 PM" },
    ],
  },
  {
    id: "SH-004",
    name: "Ortigas Center",
    location: "Julia Vargas Ave, Pasig",
    phone: "+63 2 8333 2211",
    about: "Business-district cafe focused on morning rush and takeaway.",
    image:
      "https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=400&h=300&fit=crop&auto=format",
    orders: 760,
    revenue: 28400,
    status: "Active",
    since: "May 9, 2024",
    faqs: [],
    hours: [
      { id: "h1", day: "Monday", open: "7:00 AM", close: "8:00 PM" },
    ],
  },
  {
    id: "SH-005",
    name: "Alabang Town",
    location: "Alabang-Zapote Rd, Muntinlupa",
    phone: "+63 2 8777 4455",
    about: "Family-friendly branch with outdoor seating.",
    image:
      "https://images.unsplash.com/photo-1442518990835-d49d0d6b8d5e?w=400&h=300&fit=crop&auto=format",
    orders: 640,
    revenue: 22150,
    status: "Active",
    since: "Jun 21, 2024",
    faqs: [
      { id: "f1", question: "Pet friendly?", answer: "Outdoor area only." },
    ],
    hours: [
      { id: "h1", day: "Monday", open: "8:00 AM", close: "9:00 PM" },
      { id: "h2", day: "Sunday", open: "9:00 AM", close: "8:00 PM" },
    ],
  },
  {
    id: "SH-006",
    name: "Quezon Ave",
    location: "Quezon Ave, Quezon City",
    phone: "+63 2 8666 9900",
    about: "Temporarily limited service during renovation.",
    image:
      "https://images.unsplash.com/photo-1453614512568-c4024d13c247?w=400&h=300&fit=crop&auto=format",
    orders: 410,
    revenue: 14800,
    status: "Maintenance",
    since: "Aug 1, 2024",
    faqs: [],
    hours: [
      { id: "h1", day: "Monday", open: "9:00 AM", close: "6:00 PM" },
    ],
  },
  {
    id: "SH-007",
    name: "Eastwood City",
    location: "E Rodriguez Jr. Ave, QC",
    phone: "+63 2 8444 1100",
    about: "Currently closed pending lease renewal.",
    image:
      "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&h=300&fit=crop&auto=format",
    orders: 120,
    revenue: 4200,
    status: "Inactive",
    since: "Nov 15, 2023",
    faqs: [],
    hours: [],
  },
];
