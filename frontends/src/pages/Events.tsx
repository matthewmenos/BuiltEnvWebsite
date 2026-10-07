import React from 'react';
import { Link } from 'react-router-dom';
import { IEvent } from 'shared/schema';
import { events as eventsData } from '../data/events';

const Events: React.FC = () => {
  return (
    <div>
      <h1 className="page-title">Events</h1>
      <p className="page-description">
        Upcoming events, conferences, and seminars from the Department of Built Environment.
      </p>

      <div className="events-grid">
        {eventsData.map((event: IEvent) => (
          <Link to={`/events/${event.id}`} className="card event-card" key={event.id}>
            <div className="event-image">
              <img src={event.image} alt={event.title} />
            </div>
            <div className="event-content">
              <span className="badge badge-primary">{event.category}</span>
              <h3 className="event-title">{event.title}</h3>
              <p className="event-location">📍 {event.location}</p>
              <p className="event-date">
                📅{' '}
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
    </div>
  );
};

export default Events;
