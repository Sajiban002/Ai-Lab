


import React, { useEffect } from 'react';
import '../css/AboutUs.css';
import aboutImage from '../images/AI.jpg';

const AboutSection3 = () => {
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
    <div className="about-section-2">
      <div className="background-circle circle2"></div>
      <div className="background-circle circle1"></div>
      <div className="grid-container-2">
        <div className="content-container-2">
          <h1 className="main-heading-2">Искусственный интеллект на службе здоровья</h1>
          <p className="description-2">
            Наша интеллектуальная система использует ИИ для анализа ваших симптомов и предоставления предварительных рекомендаций...
          </p>
          <button className="bubbly-button">Узнать больше</button>
        </div>
        <div className="image-container-2">
          <img src={aboutImage} alt="Mission" className="about-image-2" />
        </div>
      </div>
    </div>
  );
};

export default AboutSection3;
