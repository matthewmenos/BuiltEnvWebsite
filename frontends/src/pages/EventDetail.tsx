import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { IEvent } from 'shared/schema';
import { events as eventsData } from '../data/events';

const EventDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const event = eventsData.find((e: IEvent) => e.id === id);

  if (!event) {
    return (
      <div className="error-state">
        <h2>Event not found</h2>
        <Link to="/events" className="btn btn-primary">
          Back to events
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="page-title">{event.title}</h1>
      <p className="page-description">{event.description}</p>

      <div className="event-detail">
        <div className="event-detail-image">
          <img src={event.image} alt={event.title} />
        </div>
        <div className="event-detail-content">
          <div className="event-detail-meta">
            <span className="badge badge-primary">{event.category}</span>
            <span className="event-location">📍 {event.location}</span>
            <span className="event-date">
              📅{' '}
              {new Date(event.startTime).toLocaleDateString('en-GB', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </span>
            <span className="event-time">
              🕒 {new Date(event.startTime).toLocaleTimeString('en-GB', {
                hour: '2-digit',
                minute: '2-digit',
              })} -{' '}
              {new Date(event.endTime).toLocaleTimeString('en-GB', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
          <p>{event.description}</p>
          <div className="event-detail-actions">
            <Link to="/events" className="btn btn-outline">
              Back to events
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetail;
