export const menuItems = [
  {
    id: "My Workspaces",
    label: "My Workspaces",
    path: "/mywork",
    icon: "bookopen",
  },
  {
    id: "Dashboard",
    label: "Dashboard",
    path: "/dashboard",
    icon: "dashboard",
  },
  {
    id: "All Kuarter",
    label: "Quarter",
    path: "/Kuarter",
    icon: "folderkanban",
  },
  {
    id: "major-task",
    label: "Major Tasks",
    path: "/major-task",
    icon: "ListTodo",
  },
  {
    id: "Reports",
    label: "Reports",
    path: "/reports",
    icon: "reports",
  },
  {
    id: "User Management",
    label: "User Management",
    path: "/user-management",
    icon: "users",
    requireAdmin: true,
  },
];

export const menuBooking = [
  {
    id: "booking-room-meeting",
    label: "Booking Room Meeting",
    path: "/booking-room",
    icon: "Warehouse",
  },
  {
    id: "schedule-meeting",
    label: "Schedule Meeting",
    path: "/schedule-meeting",
    icon: "Calendar",
  },
  {
    id: "meeting-recap",
    label: "Meeting Recap",
    path: "/meeting-recap",
    icon: "ListCheck",
  },
  {
    id: "master-data",
    label: "Master Data",
    icon: "Database",
    //  akses control
    accessControl: {
      allowedDivisions: [/^it$/i], // Regex untuk case insensitive
      allowedUserIds: [
        "6a20de5c50ad9c30e06b9641", // hadi
        "6a1f97c04cf5cd6b3c82a2f4", // mia
      ],
    },
    children: [
      {
        id: "facilities",
        label: "Facilities",
        path: "/master-data/facilities",
        icon: "Building",
      },
      {
        id: "rooms",
        label: "Rooms",
        path: "/master-data/rooms",
        icon: "House",
      },
    ],
  },
];
