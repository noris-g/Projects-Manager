import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

export default function CalendarPage() {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());

  const [selectedDate, setSelectedDate] = useState(null);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);

  const [selectedEvent, setSelectedEvent] = useState(null);

  // New event form state
  const [newTitle, setNewTitle] = useState("");
  const [newTimeFrom, setNewTimeFrom] = useState("");
  const [newTimeTo, setNewTimeTo] = useState("");
  const [newRoles, setNewRoles] = useState("Everyone");
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [rolesDropdownOpen, setRolesDropdownOpen] = useState(false);


  // Example events
  const [events, setEvents] = useState([
    {
      id: 1,
      title: "Team Meeting",
      date: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
      roles: ["Managers", "HR"],
      timeFrom: "10:00",
      timeTo: "11:00",
    },
    {
      id: 2,
      title: "Safety Training",
      date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2),
      roles: ["Everyone"],
      timeFrom: "13:00",
      timeTo: "15:00",
    },
  ]);

  const monthNames = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December"
  ];

  const ROLE_OPTIONS = [
  "Everyone",
  "Managers",
  "HR",
  "PR",
  "Team Leads",
  "Supervisors",
  "Finance",
  "IT Department",
];

  const getDaysInMonth = (year, month) =>
    new Date(year, month + 1, 0).getDate();

  const firstDayOfMonth =
    (new Date(currentYear, currentMonth, 1).getDay() + 6) % 7;

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const handleDayClick = (day) => {
    setSelectedDate(new Date(currentYear, currentMonth, day));
    setNewTitle("");
    setNewTimeFrom("");
    setNewTimeTo("");
    setNewRoles("Everyone");
    setShowAddModal(true);
  };

  const handleEventClick = (event) => {
    setSelectedEvent(event);
    setShowEventModal(true);
  };

  const getEventsForDay = (day) => {
    return events.filter(
      (e) =>
        e.date.getFullYear() === currentYear &&
        e.date.getMonth() === currentMonth &&
        e.date.getDate() === day
    );
  };

  const addEvent = () => {
    if (!newTitle) return;

    const newEvent = {
      id: Date.now(),
      title: newTitle,
      date: selectedDate,
      roles: selectedRoles,
      timeFrom: newTimeFrom,
      timeTo: newTimeTo,
    };

    setEvents([...events, newEvent]);
    setShowAddModal(false);
  };

  const generateCalendarDays = () => {
    const days = [];

    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`}></div>);
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const isToday =
        d === today.getDate() &&
        currentMonth === today.getMonth() &&
        currentYear === today.getFullYear();

      const eventsToday = getEventsForDay(d);

      days.push(
        <motion.div
          key={d}
          whileHover={{ scale: 1.05 }}
          onClick={() => handleDayClick(d)}  // ← NOW THE ENTIRE CELL OPENS THE POPUP
          className={`rounded-xl p-2 shadow bg-white flex flex-col cursor-pointer relative
            ${isToday ? "bg-blue-200 font-bold" : ""}`}
        >
          <div className="text-center mb-1 select-none">
            {d}
          </div>

          <div className="flex flex-col gap-1">
            {eventsToday.map((event) => (
              <div
                key={event.id}
                onClick={(e) => {
                  e.stopPropagation(); // ← prevents opening add popup
                  handleEventClick(event);
                }}
                className="bg-blue-100 text-blue-800 text-xs rounded px-2 py-1 truncate cursor-pointer"
              >
                {event.title}
              </div>
            ))}
          </div>
        </motion.div>
      );
    }

    return days;
  };

  return (
    <div className="w-full h-full p-6">
      <Card className="rounded-2xl shadow-lg h-full">
        <CardContent className="p-6 flex flex-col h-full">
          <div className="flex justify-between items-center mb-6">
            <Button variant="ghost" onClick={prevMonth}>
              <ChevronLeft />
            </Button>
            <h2 className="text-4xl font-semibold">
              {monthNames[currentMonth]} {currentYear}
            </h2>
            <Button variant="ghost" onClick={nextMonth}>
              <ChevronRight />
            </Button>
          </div>

          <div className="grid grid-cols-7 gap-2 text-center font-medium mb-4">
            {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map((day) => (
              <div key={day} className="text-gray-600">{day}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2 flex-grow-20">
            {generateCalendarDays()}
          </div>

          {/* ADD EVENT MODAL */}
{showAddModal && (
  <div className="fixed inset-0 flex items-center justify-center bg-black/40">
    <div className="bg-white p-6 rounded-2xl shadow-xl w-80">
      <h3 className="text-xl font-semibold mb-4">Add Event</h3>
      <p className="mb-2">{selectedDate?.toDateString()}</p>

      {/* Title */}
      <input
        type="text"
        value={newTitle}
        onChange={(e) => setNewTitle(e.target.value)}
        placeholder="Event title"
        className="w-full p-2 border rounded mb-4"
      />

      {/* Time From / To */}
      <div className="flex gap-2 mb-4">
        <input
          type="time"
          value={newTimeFrom}
          onChange={(e) => setNewTimeFrom(e.target.value)}
          className="w-1/2 p-2 border rounded"
        />
        <input
          type="time"
          value={newTimeTo}
          onChange={(e) => setNewTimeTo(e.target.value)}
          className="w-1/2 p-2 border rounded"
        />
      </div>

      {/* Roles Multi-select */}
<div className="mb-4">
  <label className="block text-sm mb-1">Role access</label>

  {/* Selected roles pills */}
  <div className="flex flex-wrap gap-2 mb-2">
    {selectedRoles.map((role) => (
      <button
        key={role}
        onClick={() =>
          setSelectedRoles(selectedRoles.filter((r) => r !== role))
        }
        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm hover:bg-blue-200 transition"
      >
        {role} ✕
      </button>
    ))}

    {selectedRoles.length === 0 && (
      <p className="text-gray-500 text-sm">No roles selected</p>
    )}
  </div>

  {/* Dropdown */}
  <div className="relative">
    <div
      onClick={() => setRolesDropdownOpen(!rolesDropdownOpen)}
      className="w-full p-2 border rounded bg-white cursor-pointer"
    >
      <span className="text-gray-600">Select role…</span>
    </div>

    {rolesDropdownOpen && (
      <div className="absolute left-0 right-0 mt-1 bg-white border rounded shadow-lg z-50 max-h-48 overflow-y-auto">
        {ROLE_OPTIONS.filter((r) => !selectedRoles.includes(r)).map((role) => (
          <div
            key={role}
            className="p-2 hover:bg-gray-100 cursor-pointer"
            onClick={() => {
              setSelectedRoles([...selectedRoles, role]);
              setRolesDropdownOpen(false);
            }}
          >
            {role}
          </div>
        ))}

        {ROLE_OPTIONS.filter((r) => !selectedRoles.includes(r)).length === 0 && (
          <div className="p-2 text-gray-400">No roles left</div>
        )}
      </div>
    )}
  </div>
</div>


      {/* Buttons */}
      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={() => setShowAddModal(false)}>
          Cancel
        </Button>
        <Button onClick={addEvent}>
          Save
        </Button>
      </div>
    </div>
  </div>
)}

          {/* EVENT DETAILS MODAL */}
          {showEventModal && selectedEvent && (
            <div className="fixed inset-0 flex items-center justify-center bg-black/40">
              <div className="bg-white p-6 rounded-2xl shadow-xl w-96">
                <h3 className="text-2xl font-semibold mb-4">
                  {selectedEvent.title}
                </h3>

                <p className="mb-2 font-medium">
                  Date: {selectedEvent.date.toDateString()}
                </p>

                <p className="mb-2">
                  <strong>Time:</strong> {selectedEvent.timeFrom} – {selectedEvent.timeTo}
                </p>

                <p className="mb-4">
                  <strong>Roles:</strong> {selectedEvent.roles.join(", ")}
                </p>

                <div className="flex justify-end">
                  <Button onClick={() => setShowEventModal(false)}>Close</Button>
                </div>
              </div>
            </div>
          )}

        </CardContent>
      </Card>
    </div>
  );
}
