import React from 'react';
import FadeInOnScroll from './FadeInOnScroll';
import '../css/AboutUs.css'; // Импортируем CSS для стилизации

import mIcon1 from '../images/mission.jpg';
import mIcon2 from '../images/myplan.jpg';
import mIcon3 from '../images/vision.jpg';

const cards = [
  {
    title: 'Наша Миссия',
    text: 'Разработать инновационную платформу с использованием искусственного интеллекта для предоставления высококачественных медицинских консультаций и улучшения доступности медицинской помощи для каждого пользователя.',
    image: mIcon1,
  },
  {
    title: 'Наш План',
    text: 'Стратегически разрабатывать и внедрять решения на основе ИИ для оптимизации медицинского обслуживания, улучшая взаимодействие между пациентами и врачами через платформу с возможностью онлайн-консультаций.',
    image: mIcon2,
  },
  {
    title: 'Наше Видение',
    text: 'Создать будущее, в котором доступ к качественной медицинской помощи и технологиям ИИ будет доступен каждому пользователю, независимо от его местоположения или времени.',
    image: mIcon3,
  },
];

const MissionSection = () => {
  return (
    <section className="mission-section">
      <div className="mission-container">
        {cards.map((card, index) => (
          <FadeInOnScroll key={index}>
            <div className="mission-card">
              <div className="mission-card-header">
                <div className="mission-icon-wrapper">
                  <img src={card.image} alt={card.title} className="mission-icon" />
                </div>
                <h5 className="mission-title">{card.title}</h5>
              </div>
              <p className="mission-text">{card.text}</p>
            </div>
          </FadeInOnScroll>
        ))}
      </div>
    </section>
  );
};

export default MissionSection;
