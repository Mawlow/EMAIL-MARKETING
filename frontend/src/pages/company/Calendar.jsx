import { useState, useEffect, useCallback, useMemo } from 'react';
import { Calendar as BigCalendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay, startOfMonth, endOfMonth, startOfDay, endOfDay, endOfWeek, addDays } from 'date-fns';
import enUS from 'date-fns/locale/en-US';
import { company } from '../../api/client';
import { Plus, X } from 'lucide-react';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales: { 'en-US': enUS },
});

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

  return (
    <div className="page">
      <div className="toolbar" style={{ flexWrap: 'wrap', alignItems: 'center', gap: '0.75rem' }}>
        <h1 style={{ margin: 0 }}>Event calendar</h1>
        <button type="button" className="btn btn-primary" onClick={() => openNew()}>
          <Plus size={18} /> New event
        </button>
      </div>
      <div className="calendar-wrap">
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
          style={{ minHeight: 520 }}
          views={['month', 'week', 'day', 'agenda']}
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
                  <button type="button" className="btn btn-ghost" onClick={handleDelete} style={{ marginRight: 'auto', color: '#b91c1c' }}>Delete</button>
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
