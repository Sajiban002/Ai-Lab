import React, { useState } from 'react';
import '../css/AboutUs.css';
import image1 from '../images/doc1.jpg';
import image2 from '../images/doc2.jpg';
import image3 from '../images/doc3.jpg';
import image4 from '../images/doc4.jpg';

const data = [
  { img: image1, label: 'Наталия Дмитриевна', title: 'Педиатр 10 лет опыта ' },
  { img: image2, label: 'Виктор Витальевич', title: 'Хирург 5 лет опыта' },
  { img: image3, label: 'Ким София', title: 'Окулист 7 лет' },
  { img: image4, label: 'Джеймс Лок', title: 'Травматолог 12 лет ' }
];

const Slider = () => {
  const [activeId, setActiveId] = useState(0);

  const handleClick = (e) => {
    const { left, width } = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - left;

    if (x < width / 2 && activeId > 0) {
      setActiveId((prevId) => prevId - 1);
    } else if (x >= width / 2 && activeId < data.length - 1) {
      setActiveId((prevId) => prevId + 1);
    }
  };

  return (
    <div className="slider-fone">
      <h2 className="slider-title">Наши врачи</h2> {/* Заголовок */}
      <div className="slider-wrap" onClick={handleClick}>
        <div className="slider">
          {data.map((slide, idx) => (
            <div key={idx} className={`slide${idx === activeId ? ' active' : ''}`}>
              <img src={slide.img} alt={`Slide ${idx + 1}`} />
              <div className="slide__footer">
                <div className="slide__label">{slide.label}</div>
                <div className="slide__title">{slide.title}</div>
              </div>
            </div>          
          ))}
        </div>
      </div>
    </div>
  );
};

export default Slider;
