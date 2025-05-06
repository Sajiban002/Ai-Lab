import React from 'react';
import '../css/AboutUs.css';

import mainLeftImg from '../images/doc.JPG';
import mainRightImg from '../images/image3.jpg';

import FadeInOnScroll from './FadeInOnScroll'; // убедись, что путь корректный

const MainSection = () => {
  return (
    <div className="main-screen">
      {/* Левая колонка */}
      <div className="column-main">
        <FadeInOnScroll direction="up">
          <h2 className="column-header">О нас</h2>
        </FadeInOnScroll>

        <FadeInOnScroll direction="up">
          <div className="text-block step-1"> Наша клиника — это команда опытных врачей и индивидуальный подход к каждому пациенту.</div>
        </FadeInOnScroll>

        <FadeInOnScroll direction="up">
          <div className="text-block step-2">Мы используем современные методы диагностики и лечения, чтобы заботиться о вашем здоровье.</div>
        </FadeInOnScroll>

        <FadeInOnScroll direction="up">
          <div className="text-block step-3">Забота, доверие и профессионализм — основа нашей работы.</div>
        </FadeInOnScroll>

        <FadeInOnScroll direction="up">
          <img src={mainLeftImg} alt="Left" className="bottom-image" />
        </FadeInOnScroll>
      </div>

      {/* Правая колонка */}
      <div className="column-main column-main_2">
        <FadeInOnScroll direction="up">
          <div className="text-block step-1"> Команда профессионалов, которым можно доверять.</div>
        </FadeInOnScroll>

        <FadeInOnScroll direction="up">
          <div className="text-block step-2">Наша команда — это опытные врачи, объединённые одной целью</div>
        </FadeInOnScroll>

        <FadeInOnScroll direction="up">
          <div className="text-block step-3">Мы рядом, когда это важно. Онлайн и офлайн.</div>
        </FadeInOnScroll>

        <FadeInOnScroll direction="up">
          <h2 className="column-header"></h2>
        </FadeInOnScroll>

        <FadeInOnScroll direction="up">
          <img src={mainRightImg} alt="Right" className="bottom-image2" />
        </FadeInOnScroll>
      </div>
    </div>
  );
};

export default MainSection;
