import { useState, useEffect, useCallback, useMemo } from 'react';
import { Calendar as BigCalendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay, startOfMonth, endOfMonth, startOfDay, endOfDay, endOfWeek, addDays, addMonths, addWeeks, subMonths, subWeeks, subDays, isSameDay } from 'date-fns';
import enUS from 'date-fns/locale/en-US';
import { company } from '../../api/client';
import { Plus, X, ChevronLeft, ChevronRight } from 'lucide-react';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales: { 'en-US': enUS },
});

const EVENT_COLORS = [
  '#2b52a5', // Primary Blue
  '#e4002b', // Primary Red
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#8b5cf6', // Violet
  '#ec4899', // Pink
  '#06b6d4', // Cyan
  '#f97316', // Orange
];

const getEventColor = (id) => EVENT_COLORS[id % EVENT_COLORS.length];

function getRangeForView(date, view) {
  let start, end;
  switch (view) {
    case 'month':
      start = startOfMonth(date);
      end = endOfMonth(date);
      break;
    case 'week':
      start = startOfWeek(date, { weekStartsOn: 0 });
      end = endOfWeek(date, { weekStartsOn: 0 });
      break;
    case 'day':
      start = startOfDay(date);
      end = endOfDay(date);
      break;
    case 'agenda':
      start = startOfDay(date);
      end = addDays(date, 30);
      break;
    default:
      start = startOfMonth(date);
      end = endOfMonth(date);
  }
  return { start, end };
}

const toCalendarEvent = (e) => ({
  id: e.id,
  title: e.title,
  start: new Date(e.start_at),
  end: new Date(e.end_at),
  resource: e,
});

export default function Calendar() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(() => new Date());
  const [view, setView] = useState('month');
  const [range, setRange] = useState({ start: null, end: null });
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    title: '',
    description: '',
    start_at: '',
    end_at: '',
  });

  const load = useCallback((start, end) => {
    if (!start || !end) return;
    setLoading(true);
    const startISO = start instanceof Date ? start.toISOString() : start;
    const endISO = end instanceof Date ? end.toISOString() : end;
    company.events.list({ start: startISO, end: endISO })
      .then((res) => {
        const data = res.data ?? res;
        setEvents(Array.isArray(data) ? data.map(toCalendarEvent) : []);
      })
      .catch(() => setEvents([]))
      .finally(() => setLoading(false));
  }, []);

  const rangeForCurrent = useMemo(() => getRangeForView(date, view), [date, view]);

  useEffect(() => {
    const { start, end } = rangeForCurrent;
    setRange({ start, end });
    load(start, end);
  }, [rangeForCurrent.start?.getTime(), rangeForCurrent.end?.getTime(), load]);

  const handleNavigate = useCallback((newDate) => {
    setDate(newDate);
  }, []);

  const handleViewChange = useCallback((newView) => {
    setView(newView);
  }, []);

  const handleRangeChange = useCallback((rangeArg) => {
    let start, end;
    if (Array.isArray(rangeArg) && rangeArg.length >= 2) {
      start = rangeArg[0];
      end = rangeArg[rangeArg.length - 1];
      if (end instanceof Date) end = new Date(end.getFullYear(), end.getMonth(), end.getDate(), 23, 59, 59, 999);
    } else if (rangeArg && typeof rangeArg === 'object' && rangeArg.start && rangeArg.end) {
      start = rangeArg.start;
      end = rangeArg.end;
    }
    if (start && end && (!range.start || start.getTime() !== range.start.getTime())) {
      setRange({ start, end });
      load(start, end);
    }
  }, [load, range.start]);

  const navigatePrev = () => {
    if (view === 'month') setDate(subMonths(date, 1));
    else if (view === 'week') setDate(subWeeks(date, 1));
    else setDate(subDays(date, 1));
  };

  const navigateNext = () => {
    if (view === 'month') setDate(addMonths(date, 1));
    else if (view === 'week') setDate(addWeeks(date, 1));
    else setDate(addDays(date, 1));
  };

  const navigateToday = () => setDate(new Date());

  const openNew = useCallback((slot) => {
    setEditing(null);
    const start = (slot && slot.start) ? new Date(slot.start) : new Date();
    const end = (slot && slot.end) ? new Date(slot.end) : new Date(start.getTime() + 60 * 60 * 1000);
    setForm({
      title: '',
      description: '',
      start_at: format(start, "yyyy-MM-dd'T'HH:mm"),
      end_at: format(end, "yyyy-MM-dd'T'HH:mm"),
    });
    setShowModal(true);
  }, []);

  const openEdit = useCallback((event) => {
    if (!event || !event.resource) return;
    setEditing(event.resource);
    setForm({
      title: event.title || '',
      description: event.resource.description || '',
      start_at: format(new Date(event.start), "yyyy-MM-dd'T'HH:mm"),
      end_at: format(new Date(event.end), "yyyy-MM-dd'T'HH:mm"),
    });
    setShowModal(true);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description?.trim() || null,
        start_at: new Date(form.start_at).toISOString(),
        end_at: new Date(form.end_at).toISOString(),
      };
      if (editing) {
        await company.events.update(editing.id, payload);
      } else {
        await company.events.create(payload);
      }
      setShowModal(false);
      if (range.start && range.end) load(range.start, range.end);
    } catch (err) {
      const msg = err.response?.data?.errors
        ? Object.values(err.response.data.errors).flat().join(' ')
        : err.response?.data?.message || 'Failed to save';
      alert(msg);
    }
  };

  const handleDelete = () => {
    if (!editing || !confirm('Delete this event?')) return;
    company.events.delete(editing.id)
      .then(() => {
        setShowModal(false);
        if (range.start && range.end) load(range.start, range.end);
      })
      .catch((err) => alert(err.response?.data?.message || 'Failed to delete'));
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditing(null);
  };

  const DateCellWrapper = ({ value, children }) => {
    if (view !== 'month') return children;

    const dayEvents = events.filter(e => isSameDay(new Date(e.start), value));
    const isToday = isSameDay(value, new Date());
    const isOffRange = value.getMonth() !== date.getMonth();

    return (
      <div 
        className={`custom-month-cell ${isOffRange ? 'rbc-off-range' : ''}`}
        onClick={() => openNew({ start: value, end: value })}
      >
        <div className="custom-date-number-label">
          {isToday ? (
            <span className="today-circle-indicator">{format(value, 'd')}</span>
          ) : (
            format(value, 'd')
          )}
        </div>
        <div className="custom-event-bands-stack">
          {dayEvents.map(e => (
            <div
              key={e.id}
              className="custom-horizontal-band"
              style={{
                backgroundColor: getEventColor(e.id) + '33', // 20% opacity
                color: getEventColor(e.id)
              }}
              onClick={(ev) => {
                ev.stopPropagation();
                openEdit(e);
              }}
            >
              {e.title}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="page page-calendar-override">
      <style>{`
        .page-calendar-override {
          background: #fff !important;
          color: #0f172a !important;
          border: 1px solid #e2e8f0 !important;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08) !important;
          backdrop-filter: none !important;
          -webkit-backdrop-filter: none !important;
          padding: 1.5rem !important;
        }
        
        .calendar-custom-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }
        
        .calendar-title {
          margin: 0 !important;
          font-size: 2.25rem !important;
          font-weight: 800 !important;
          color: #0f172a !important;
          letter-spacing: -0.025em !important;
        }

        .calendar-subnav {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 1rem;
          border-bottom: 1px solid #e2e8f0;
          padding-bottom: 0.5rem;
        }

        .subnav-btn {
          background: transparent;
          border: none;
          padding: 0.5rem 1rem;
          font-size: 0.9375rem;
          font-weight: 500;
          color: #64748b;
          cursor: pointer;
          border-radius: 6px;
          transition: all 0.2s;
        }

        .subnav-btn:hover {
          color: #0f172a;
          background: #f1f5f9;
        }

        .subnav-btn.active {
          color: #2b52a5;
          background: #eff6ff;
          font-weight: 600;
        }

        .calendar-nav-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 0.75rem;
        }

        .calendar-current-label {
          font-size: 1.25rem;
          font-weight: 700;
          color: #0f172a;
          text-transform: capitalize;
        }

        .calendar-nav-controls {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .nav-arrow-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: 1px solid #e2e8f0;
          background: #fff;
          color: #0f172a;
          cursor: pointer;
          transition: all 0.2s;
        }

        .nav-arrow-btn:hover {
          background: #f1f5f9;
          border-color: #cbd5e1;
        }

        .nav-today-btn {
          padding: 0.4rem 1rem;
          border-radius: 6px;
          border: 1px solid #e2e8f0;
          background: #fff;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
        }

        .nav-today-btn:hover {
          background: #f1f5f9;
        }

        .calendar-wrap .rbc-calendar {
          background: #fff !important;
          color: #0f172a !important;
          padding: 0 !important;
        }
        
        .calendar-wrap .rbc-month-view {
          border: 1px solid #e2e8f0 !important;
          border-radius: 8px !important;
          overflow: hidden;
          background: #fff !important;
        }

        /* HIDE default layers in Month view to use our custom DateCellWrapper logic */
        .calendar-wrap.view-month .rbc-row-content {
          pointer-events: none !important;
        }
        .calendar-wrap.view-month .rbc-row-content .rbc-row:first-child {
          visibility: hidden !important; /* Hide standard date numbers */
        }
        .calendar-wrap.view-month .rbc-event,
        .calendar-wrap.view-month .rbc-show-more {
          display: none !important; /* Hide standard events */
        }

        /* CUSTOM CELL GRID FIXES */
        .custom-month-cell {
          height: 100%;
          width: 100%;
          display: flex;
          flex-direction: column;
          position: relative;
          background: #fff;
          cursor: pointer;
          pointer-events: auto !important;
          border-left: 1px solid #e2e8f0;
        }
        .custom-month-cell:first-child { border-left: none; }
        .custom-month-cell.rbc-off-range { background: #fcfcfc !important; }

        .custom-date-number-label {
          padding: 4px 8px;
          font-weight: 700;
          font-size: 0.95rem;
          color: #0f172a;
          position: absolute;
          top: 0;
          left: 0;
          z-index: 10;
          height: 32px;
          display: flex;
          align-items: center;
        }
        .custom-month-cell.rbc-off-range .custom-date-number-label {
          color: #94a3b8;
          opacity: 0.4;
        }
        .today-circle-indicator {
          display: inline-flex;
          width: 24px;
          height: 24px;
          background: #2b52a5;
          color: #fff;
          border-radius: 50%;
          align-items: center;
          justify-content: center;
        }

        .custom-event-bands-stack {
          flex: 1;
          display: flex;
          flex-direction: column;
          width: 100%;
          height: 100%;
          padding-top: 32px; /* Reserve space for the date number label */
        }
        .custom-horizontal-band {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          font-weight: 700;
          font-size: 0.85rem;
          padding: 0 8px;
          transition: filter 0.2s;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .custom-horizontal-band:hover {
          filter: brightness(0.95);
        }

        .calendar-wrap .rbc-header {
          color: #2b52a5 !important;
          background: #eff6ff !important;
          border-bottom: 1px solid #e2e8f0 !important;
          padding: 12px 0 !important;
          font-weight: 700 !important;
          font-size: 0.875rem !important;
          text-transform: uppercase;
        }

        .calendar-wrap .rbc-header + .rbc-header {
          border-left: 1px solid #e2e8f0 !important;
        }

        /* WEEK / DAY VIEW SPECIFIC FIXES */
        .calendar-wrap:not(.view-month) .rbc-event {
          border-radius: 4px !important;
          padding: 4px 8px !important;
          font-weight: 600 !important;
          font-size: 0.85rem !important;
          border: 1px solid rgba(0,0,0,0.05) !important;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05) !important;
        }

        /* Today's indicator for Week/Day views */
        .calendar-wrap .rbc-time-view .rbc-now .rbc-button-link {
          background: #2b52a5 !important;
          color: #fff !important;
          border-radius: 50% !important;
        }

        .btn-new-event {
          background-color: #e4002b !important;
          color: white !important;
          border: none !important;
          padding: 0.8rem 1.75rem !important;
          font-size: 1.1rem !important;
          font-weight: 700 !important;
          border-radius: 10px !important;
          display: flex;
          align-items: center;
          gap: 0.6rem;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 4px 12px rgba(228, 0, 43, 0.2) !important;
        }
        .btn-new-event:hover {
          background-color: #c00024 !important;
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(228, 0, 43, 0.3) !important;
        }
        .btn-new-event svg {
          width: 22px !important;
          height: 22px !important;
        }

        /* Modal Styles */
        .modal-dialog {
          background: #fff !important;
          border-radius: 12px !important;
          border: 1px solid #e2e8f0 !important;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1) !important;
        }
        .modal-header {
          background: #f8fafc !important;
          border-bottom: 1px solid #e2e8f0 !important;
          padding: 1.25rem 1.5rem !important;
        }
        .modal-actions {
          padding: 1.25rem 1.5rem !important;
          border-top: 1px solid #e2e8f0 !important;
          background: #f8fafc !important;
        }
        .modal-actions button[type="submit"] {
          background-color: #2b52a5 !important;
          color: #fff !important;
          border: none !important;
          padding: 0.65rem 1.5rem !important;
          font-weight: 600 !important;
          border-radius: 8px !important;
        }
      `}</style>

      <div className="calendar-custom-header">
        <h1 className="calendar-title">Event calendar</h1>
        <button type="button" className="btn-new-event" onClick={() => openNew()}>
          <Plus size={22} /> New event
        </button>
      </div>

      <div className="calendar-subnav">
        {['month', 'week', 'day', 'agenda'].map((v) => (
          <button
            key={v}
            type="button"
            className={`subnav-btn ${view === v ? 'active' : ''}`}
            onClick={() => setView(v)}
          >
            {v.charAt(0).toUpperCase() + v.slice(1)}
          </button>
        ))}
      </div>

      <div className="calendar-nav-row">
        <div className="calendar-current-label">
          {format(date, view === 'month' ? 'MMMM yyyy' : 'MMM d, yyyy')}
        </div>
        <div className="calendar-nav-controls">
          <button type="button" className="nav-arrow-btn" onClick={navigatePrev} title="Previous">
            <ChevronLeft size={20} />
          </button>
          <button type="button" className="nav-today-btn" onClick={navigateToday}>
            Today
          </button>
          <button type="button" className="nav-arrow-btn" onClick={navigateNext} title="Next">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div className={`calendar-wrap ${view === 'month' ? 'view-month' : ''}`}>
        <BigCalendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          titleAccessor="title"
          date={date}
          view={view}
          onNavigate={handleNavigate}
          onView={handleViewChange}
          onRangeChange={handleRangeChange}
          onSelectSlot={openNew}
          onSelectEvent={openEdit}
          selectable
          toolbar={false}
          style={{ minHeight: 500 }}
          views={['month', 'week', 'day', 'agenda']}
          formats={{
            dateFormat: 'd',
          }}
          components={{
            dateCellWrapper: DateCellWrapper
          }}
          eventPropGetter={(event) => ({
            style: {
              backgroundColor: view === 'month' ? 'transparent' : getEventColor(event.id),
              color: view === 'month' ? getEventColor(event.id) : '#fff',
            }
          })}
        />
      </div>

      {showModal && (
        <div className="modal-backdrop" onClick={handleCloseModal}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editing ? 'Edit event' : 'New event'}</h3>
              <button type="button" className="modal-close" onClick={handleCloseModal} aria-label="Close"><X /></button>
            </div>
            <form onSubmit={handleSubmit} className="form modal-body">
              <label>Title <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} required /></label>
              <label>Description <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={3} style={{ minHeight: 'auto' }} /></label>
              <label>Start <input type="datetime-local" value={form.start_at} onChange={(e) => setForm((f) => ({ ...f, start_at: e.target.value }))} required /></label>
              <label>End <input type="datetime-local" value={form.end_at} onChange={(e) => setForm((f) => ({ ...f, end_at: e.target.value }))} required /></label>
              <div className="form-actions modal-actions">
                {editing && (
                  <button type="button" className="btn btn-ghost" onClick={handleDelete} style={{ marginRight: 'auto' }}>Delete</button>
                )}
                <button type="button" onClick={handleCloseModal}>Cancel</button>
                <button type="submit">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
