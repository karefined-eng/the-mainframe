import { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import type { BaseItem } from "../App";
import { getDb, domains } from "../App";
import { showToast } from "./Toast";

interface CalendarEvent {
  id: string; 
  title: string;
  start: string; 
  allDay: boolean;
  extendedProps: {
    domain: string;
    originalId: number;
    status: string;
  };
  backgroundColor?: string;
  borderColor?: string;
}

const domainColors: Record<string, string> = {
  certifications: "#3b82f6",
  build_ideas: "#f59e0b",
  acquisitions: "#10b981",
  goals: "#ef4444",
  ventures: "#8b5cf6",
  writing: "#ec4899",
  skills: "#14b8a6",
  experiences: "#6366f1",
  journal: "#64748b",
};

export default function CalendarView() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);

  useEffect(() => {
    async function loadEvents() {
      try {
        const db = await getDb();
        const allEvents: CalendarEvent[] = [];

        for (const d of domains) {
          const rows = await db.select<BaseItem[]>(
            `SELECT * FROM ${d.key} WHERE target_date IS NOT NULL`
          );
          
          for (const row of rows) {
            // FullCalendar wants YYYY-MM-DD or ISO string
            let start = row.target_date!;
            let allDay = true;
            
            if (row.target_time) {
              start = `${row.target_date}T${row.target_time}`;
              allDay = false;
            }
            
            allEvents.push({
              id: `${d.key}_${row.id}`,
              title: `[${d.label}] ${row.title}`,
              start,
              allDay,
              backgroundColor: domainColors[d.key] || "#94a3b8",
              borderColor: domainColors[d.key] || "#94a3b8",
              extendedProps: {
                domain: d.key,
                originalId: row.id,
                status: row.status,
              }
            });
          }
        }
        setEvents(allEvents);
      } catch (err) {
        showToast("Failed to load calendar events.", "error");
        console.error(err);
      }
    }
    loadEvents();
  }, []);

  const handleEventDrop = async (dropInfo: any) => {
    const { event } = dropInfo;
    const { domain, originalId } = event.extendedProps;
    
    if (!event.start) return;
    
    // Local time to avoid timezone shifts: 
    // FullCalendar provides dates in local timezone. We need to parse it cleanly.
    const startObj = event.start as Date;
    const pad = (n: number) => n.toString().padStart(2, "0");
    
    const newDate = `${startObj.getFullYear()}-${pad(startObj.getMonth() + 1)}-${pad(startObj.getDate())}`;
    
    let newTime = null;
    if (!event.allDay) {
      newTime = `${pad(startObj.getHours())}:${pad(startObj.getMinutes())}:00`;
    }
    
    try {
      const db = await getDb();
      await db.execute(
        `UPDATE ${domain} SET target_date = $1, target_time = $2, updated_at = datetime('now') WHERE id = $3`,
        [newDate, newTime, originalId]
      );
      showToast("Item rescheduled.", "success");
    } catch (err) {
      showToast("Failed to update item date.", "error");
      dropInfo.revert();
    }
  };

  return (
    <div className="bg-surface-alt rounded-2xl border border-border p-3 sm:p-5 flex flex-col overflow-hidden" style={{ minHeight: "80vh" }}>
      <style>{`
        .fc {
          --fc-page-bg-color: transparent;
          --fc-neutral-bg-color: var(--color-surface);
          --fc-neutral-text-color: var(--color-text);
          --fc-border-color: var(--color-border);
          --fc-button-text-color: var(--color-text);
          --fc-button-bg-color: var(--color-surface);
          --fc-button-border-color: var(--color-border);
          --fc-button-hover-bg-color: var(--color-surface-alt);
          --fc-button-hover-border-color: var(--color-accent);
          --fc-button-active-bg-color: var(--color-accent);
          --fc-button-active-border-color: var(--color-accent);
          --fc-button-active-text-color: var(--color-bg);
          --fc-event-bg-color: var(--color-accent);
          --fc-event-border-color: var(--color-accent);
          --fc-event-text-color: #fff;
          --fc-today-bg-color: rgba(255,255,255,0.05);
          font-family: inherit;
        }
        .fc-theme-standard td, .fc-theme-standard th {
          border-color: var(--color-border);
        }
        .fc-event {
          border-radius: 4px;
          padding: 2px 4px;
          font-size: 0.85em;
          border: none;
          box-shadow: 0 1px 2px rgba(0,0,0,0.2);
          cursor: pointer;
        }
        @media (max-width: 640px) {
          .fc-header-toolbar.fc-toolbar {
            flex-direction: column;
            gap: 12px;
          }
          .fc-toolbar-title {
            font-size: 1.25rem !important;
          }
          .fc-toolbar-chunk {
            display: flex;
            justify-content: center;
            width: 100%;
          }
        }
      `}</style>
      <div className="flex-1 w-full h-full">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay"
          }}
          editable={true} 
          droppable={false} 
          events={events}
          eventDrop={handleEventDrop}
          eventResize={handleEventDrop} 
          height="100%"
        />
      </div>
    </div>
  );
}
