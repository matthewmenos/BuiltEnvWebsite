import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin } from 'lucide-react';
import { IEvent } from 'shared/schema';
import { usePublicList } from '../hooks/usePublicResource';
import { CardGridSkeleton } from '../components/Skeleton';

const Events: React.FC = () => {
  const { items: events, loading, error } = usePublicList<IEvent>(
    '/api/admin/events',
    100
  );

  return (
    <div>
      <h1 className="page-title">Events</h1>
      <p className="page-description">
        Upcoming events, conferences, and seminars from the Department of Built Environment.
      </p>

      {loading ? (
        <CardGridSkeleton cards={6} />
      ) : error ? (
        <div className="login-error">{error}</div>
      ) : events.length === 0 ? (
        <div className="empty-state">
          No events have been scheduled yet. Please check back soon.
        </div>
      ) : (
      <div className="events-grid">
        {events.map((event: IEvent) => (
          <Link to={`/events/${event.id}`} className="card event-card" key={event.id}>
            <div className="event-image">
              <img src={event.image} alt={event.title} />
            </div>
            <div className="event-content">
              <span className="badge badge-primary">{event.category}</span>
              <h3 className="event-title">{event.title}</h3>
              <p className="event-location meta-item">
                <MapPin size={14} aria-hidden="true" /> {event.location}
              </p>
              <p className="event-date meta-item">
                <Calendar size={14} aria-hidden="true" />{' '}
                {new Date(event.startTime).toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
              <div className="event-actions">
                <Link to={`/events/${event.id}`} className="btn btn-sm btn-primary">
                  View Details
                </Link>
              </div>
            </div>
          </Link>
        ))}
      </div>
      )}
    </div>
  );
};

export default Events;
