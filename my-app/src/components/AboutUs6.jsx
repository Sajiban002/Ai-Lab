import React from 'react';
import "../css/AboutUs.css";

import img1 from '../images/plan.jpg';
import img2 from '../images/laptop.jpg';
import img3 from '../images/teamproject.jpg';

const ImageLayout = () => {
  return (
    <section className="image-layout">
      <div className="image-layout__container">
        <div className="image-layout__text">
          <h1 className="image-layout__title">Наша команда</h1>
          <p className="image-layout__description">
            Профессиональная медицинская помощь с заботой о каждом пациенте. Мы используем передовые технологии и индивидуальный подход.
          </p>
        </div>
        <div className="image-layout__images">
          <img src={img1} alt="План" className="image-layout__image image-layout__image--top" />
          <img src={img2} alt="Лаптоп" className="image-layout__image image-layout__image--left" />
          <img src={img3} alt="Командный проект" className="image-layout__image image-layout__image--right" />
        </div>
      </div>
    </section>
  );
};

export default ImageLayout;
