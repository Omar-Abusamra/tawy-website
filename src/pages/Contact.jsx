import React, { useState } from 'react';
import './Contact.css';

const Contact = () => {
  const [status, setStatus] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    setIsSending(true);
    setStatus('');

    try {
      const formData = new FormData(form);

      const response = await fetch('https://formsubmit.co/ajax/tawy.co@gmail.com', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Unable to send message');
      }

      form.reset();
      setStatus('Your message has been sent.');
    } catch (error) {
      console.error('Error sending contact message:', error);
      setStatus('Message could not be sent. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <main className="contact">
      <h1 className="bigmark">TAWY</h1>
      <p className="eyebrow">Say Hello</p>
      <p className="contact__intro">
        For orders, collaborations, or a word about the work - we read every message.
      </p>

      <form className="form contact__form" onSubmit={handleSubmit}>
        <input type="hidden" name="_subject" value="New TAWY contact message" />
        <input type="hidden" name="_captcha" value="false" />
        <input type="hidden" name="_template" value="table" />

        <div className="form__field">
          <label htmlFor="contact-name">Name</label>
          <input id="contact-name" name="name" type="text" placeholder="Your name" required />
        </div>

        <div className="form__field">
          <label htmlFor="contact-email">Email</label>
          <input id="contact-email" name="email" type="email" placeholder="you@example.com" required />
        </div>

        <div className="form__field">
          <label htmlFor="contact-message">Message</label>
          <textarea id="contact-message" name="message" placeholder="Tell us what you're looking for" required />
        </div>

        <button className="contact__button" type="submit" disabled={isSending}>
          {isSending ? 'Sending...' : 'Send Message'}
        </button>
      </form>

      {status && <p className="contact__status">{status}</p>}

      <nav className="contact__socials" aria-label="Social links">
        <a href="https://www.instagram.com/tawy_co?igsh=MW5uOWFxN2twMW4yMA%3D%3D&utm_source=qr" target="_blank" rel="noreferrer">Instagram</a>
        <a href="https://www.tiktok.com/@tawy_co?_r=1&_t=ZS-97EGhaLUOCe" target="_blank" rel="noreferrer">TikTok</a>
        
      </nav>
    </main>
  );
};

export default Contact; 