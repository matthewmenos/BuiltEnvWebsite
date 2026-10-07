import React from 'react';
import { useState } from 'react';

const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');

    await new Promise((resolve) => setTimeout(resolve, 1000));

    setStatus('sent');
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <div>
      <h1 className="page-title">Contact Us</h1>
      <p className="page-description">
        Have a question about our programmes, research, or admissions? Get in
        touch — we'd love to hear from you.
      </p>

      <div className="contact-grid">
        <div className="contact-info">
          <div className="card">
            <h2>Visit Us</h2>
            <div className="contact-item">
              <span className="contact-icon">📍</span>
              <div>
                <strong>Address:</strong>
                <p>Built Environment Building, University Walk, Bristol, BS8 1TR</p>
              </div>
            </div>
            <div className="contact-item">
              <span className="contact-icon">📞</span>
              <div>
                <strong>Telephone:</strong>
                <p>+44 (0)117 331 2000</p>
              </div>
            </div>
            <div className="contact-item">
              <span className="contact-icon">✉️</span>
              <div>
                <strong>Email:</strong>
                <p>info@builtenv.ac.uk</p>
              </div>
            </div>
            <div className="contact-item">
              <span className="contact-icon">🕐</span>
              <div>
                <strong>Office Hours:</strong>
                <p>Monday - Friday: 9:00 AM - 5:00 PM</p>
              </div>
            </div>
          </div>

          <div className="card">
            <h2>Find Us</h2>
            <div className="map-wrapper">
              <iframe
                title="Department location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3370.451899585166!2d-2.593246184726376!3d51.45567937967245!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNTFCMDAxJzIxLjgiTcKwNzE!5e0!3m2!1sen!2suk!4v1690000000000"
                allowFullScreen
                loading="lazy"
              />
            </div>
          </div>
        </div>

        <div className="contact-form-container">
          <form className="card" onSubmit={handleSubmit}>
            <h2>Send Us a Message</h2>
            <div className="form-group">
              <label htmlFor="name">Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="subject">Subject</label>
              <select
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
              >
                <option value="">Select a subject</option>
                <option value="enquiries">Programme Enquiries</option>
                <option value="admissions">Admissions</option>
                <option value="research">Research</option>
                <option value="partnership">Industry Partnership</option>
                <option value="media">Media</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="message">Message *</label>
              <textarea
                id="message"
                name="message"
                rows={8}
                value={formData.message}
                onChange={handleChange}
                required
              ></textarea>
            </div>
            <button type="submit" className="btn btn-primary" disabled={status === 'sending'}>
              {status === 'sending' ? 'Sending...' : 'Send Message'}
            </button>
            {status === 'sent' && (
              <p className="form-success">Your message has been sent successfully!</p>
            )}
            {status === 'error' && (
              <p className="form-error">There was an error sending your message. Please try again.</p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default Contact;
