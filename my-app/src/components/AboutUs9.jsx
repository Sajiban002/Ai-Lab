import React from 'react';
import FadeInOnScroll from './FadeInOnScroll';
import '../css/AboutUs.css';
import counterImage from '../images/ava2.jpg';
const MedicalAchievements = () => {
  return (
    <div className="medical-wrapper">
      <section className="medical-section">
        <div className="medical-container">
          <div className="medical-left">
            <FadeInOnScroll direction="left">
              <div className="image-wrapper">
                <img src={counterImage} alt="Medical Illustration" draggable="false" />
              </div>
            </FadeInOnScroll>
          </div>

          <div className="medical-right">
            <FadeInOnScroll direction="right">
              <h2 className="medical-title">
                Пользователи  <br /> Диагностика
              </h2>
            </FadeInOnScroll>

            <div className="medical-stats">
              <FadeInOnScroll direction="up">
                <div className="stat-block">
                  <div className="stat-number">100+</div>
                  <div className="stat-line" />
                  <div className="stat-text">диагнозов которые  ИИ способен точно распознать </div>
                </div>
              </FadeInOnScroll>
              <FadeInOnScroll direction="up">
                <div className="stat-block">
                  <div className="stat-number">90% </div>
                  <div className="stat-line" />
                  <div className="stat-text">пользователей удовлетворены консультациями</div>
                </div>
              </FadeInOnScroll>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default MedicalAchievements;
