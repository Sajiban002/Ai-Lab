import React from 'react';
import FadeInOnScroll from './FadeInOnScroll';  // Make sure to import FadeInOnScroll
import '../css/AboutUs.css';

// Placeholder images (replace these with actual image imports or URLs)
import step1Image from '../images/registr.jpg';
import step2Image from '../images/doctor.jpg';
import step3Image from '../images/chat.jpg';
import step4Image from '../images/quation.jpg';

const HowWeWork = () => {
  const steps = [
    {
      number: '01',
      title: 'Регистрация',
      description: ' ',
      image: step1Image,
    },
    {
      number: '02',
      title: 'Выбери доктора',
      description: '',
      image: step2Image,
    },
    {
      number: '03',
      title: 'Создай чат',
      description: '',
      image: step3Image,
    },
    {
      number: '04',
      title: 'Объясни что беспокоит',
      description: '',
      image: step4Image,
    },
  ];

  return (
    <section className="how-we-work">
      <div className="section-header">
        {/* Add any additional header content if needed */}
      </div>
      <div className="steps-container">
        {steps.map((step, index) => (
          <FadeInOnScroll key={index} direction="up">
            <div className="step">
              <div className="step-image-wrapper">
                <img src={step.image} alt={step.title} className="step-image" />
                <span className="step-number">{step.number}</span>
              </div>
              <h3 className="step-title">{step.title}</h3>
              <p className="step-description">{step.description}</p>
            </div>
          </FadeInOnScroll>
        ))}
      </div>
    </section>
  );
};

export default HowWeWork;
