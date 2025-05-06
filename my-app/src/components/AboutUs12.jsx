import React, { useState } from 'react';
import '../css/AboutUs.css';
import FadeInOnScroll from './FadeInOnScroll';

import person1 from '../images/granny.jpg';
import person2 from '../images/woman.jpg';
import person3 from '../images/man.jpg';
import mainImage from '../images/happy.jpg';

const testimonials = [
  {
    id: 1,
    name: 'Наталья Ивановна',
    image: person1,
    text: `Коммерческое взаимодействие с совместными стратегиями роста. Беспроводные решения, оптимизированные для клиент-ориентированных веб-ресурсов.`,
  },
  {
    id: 2,
    name: 'Мария Петрова',
    image: person2,
    text: `Подходящее улучшение для бесшовных решений после командных встреч. Рост корпоративной готовности в веб-пространстве.`,
  },
  {
    id: 3,
    name: 'Алексей Смирнов',
    image: person3,
    text: `Инновационные платформы через вдохновленные команды. Заметное объединение бесшовных партнерств.`,
  },
];

const TestimonialSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  return (
    <div className="testimonial-container">
      <div className="testimonial-grid">
        <FadeInOnScroll>
          <div className="testimonial-left">
            <h1 className="testimonial-title">Наши пациенты</h1>
            <div className="carousel-container">
              <div className="carousel">
                <div
                  className="carousel-inner"
                  style={{ transform: `translateY(-${currentIndex * 100}%)` }}
                >
                  {testimonials.map((testimonial) => (
                    <div className="carousel-slide" key={testimonial.id}>
                      <div className="testimonial-content glass-effect">
                        <div className="testimonial-header">
                          <div className="testimonial-avatar">
                            <img src={testimonial.image} alt={testimonial.name} />
                          </div>
                          <div>
                            <h5 className="testimonial-name">{testimonial.name}</h5>
                            <p className="testimonial-role">{testimonial.role}</p>
                          </div>
                        </div>
                        <p className="testimonial-text">{testimonial.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="carousel-controls">
                <button className="carousel-prev" onClick={handlePrev}>▲</button>
                <div className="carousel-dots">
                  {testimonials.map((_, index) => (
                    <span
                      key={index}
                      className={`dot ${index === currentIndex ? 'active' : ''}`}
                      onClick={() => goToSlide(index)}
                    ></span>
                  ))}
                </div>
                <button className="carousel-next" onClick={handleNext}>▼</button>
              </div>
            </div>
          </div>
        </FadeInOnScroll>

        <FadeInOnScroll direction="right">
          <div className="testimonial-image">
            <img src={mainImage} alt="visual testimonial" />
          </div>
        </FadeInOnScroll>
      </div>
    </div>
  );
};

export default TestimonialSection;
