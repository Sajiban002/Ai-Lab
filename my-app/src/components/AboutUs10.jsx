import React, { useEffect } from 'react';
import '../css/AboutUs.css'; // Импортируем CSS для стилизации
import aboutImage from '../images/image1.jpg'; // Импортируем изображение

const AboutSection2 = () => {
  useEffect(() => {
    const animateButton = (e) => {
      e.preventDefault();
      e.target.classList.remove('animate');
      e.target.classList.add('animate');
      setTimeout(() => {
        e.target.classList.remove('animate');
      }, 700);
    };

    const bubblyButtons = document.getElementsByClassName("bubbly-button");
    for (let i = 0; i < bubblyButtons.length; i++) {
      bubblyButtons[i].addEventListener('click', animateButton, false);
    }

    return () => {
      for (let i = 0; i < bubblyButtons.length; i++) {
        bubblyButtons[i].removeEventListener('click', animateButton, false);
      }
    };
  }, []);

  return (
    <div className="about-section">
      <div className="background-circle circle1"></div>
      <div className="background-circle circle2"></div>
      <div className="grid-container">
        <div className="image-container">
          <img src={aboutImage} alt="About" className="about-image" />
        </div>
        <div className="content-container">
          <h1 className="main-heading">Врач рядом, даже если вы дома</h1>
          <p className="description">
            Наша платформа позволяет получить медицинскую консультацию быстро, удобно и безопасно — где бы вы ни находились. Вы можете обсудить симптомы, задать вопросы врачу, прикрепить фото и получить профессиональные рекомендации без визита в клинику.
          </p>
          <div className="services">
            <div className="service">
              <div className="service-icon">&#x2714;</div>
              <h5 className="service-title">Квалифицированные врачи по разным направлениям</h5>
            </div>
            <div className="service">
              <div className="service-icon">&#x2714;</div>
              <h5 className="service-title">Быстрый отклик</h5>
            </div>
            <div className="service">
              <div className="service-icon">&#x2714;</div>
              <h5 className="service-title">Гибкое расписание</h5>
            </div>
            <div className="service">
              <div className="service-icon">&#x2714;</div>
              <h5 className="service-title">Удобный чат-формат</h5>
            </div>
          </div>
          <button className="bubbly-button">Узнать больше</button>
        </div>
      </div>
    </div>
  );
};

export default AboutSection2;
