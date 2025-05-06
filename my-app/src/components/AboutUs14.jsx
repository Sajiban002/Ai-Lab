import React from 'react';
import '../css/AboutUs.css';

// Импортируем иконки
import icon1 from '../images/bones.png';
import icon2 from '../images/cardiology.png';
import icon3 from '../images/dermatology.png';
import icon4 from '../images/gynecologist.png';
import icon5 from '../images/neuron.png';
import icon6 from '../images/ophthalmologist.png';
import icon7 from '../images/pediatrics.png';
import icon8 from '../images/psychologist.png';
import icon9 from '../images/stethoscope.png';
import icon10 from '../images/surgery.png';

const IconCarousel = () => {
  const icons = [
    { src: icon1, alt: 'Bones', text: 'Bones' },
    { src: icon2, alt: 'Cardiology', text: 'Cardiology' },
    { src: icon3, alt: 'Dermatology', text: 'Dermatology' },
    { src: icon4, alt: 'Gynecologist', text: 'Gynecologist' },
    { src: icon5, alt: 'Neuron', text: 'Neuron' },
    { src: icon6, alt: 'Ophthalmologist', text: 'Ophthalmologist' },
    { src: icon7, alt: 'Pediatrics', text: 'Pediatrics' },
    { src: icon8, alt: 'Psychologist', text: 'Psychologist' },
    { src: icon9, alt: 'Stethoscope', text: 'Stethoscope' },
    { src: icon10, alt: 'Surgery', text: 'Surgery' },
  ];

  return (
    <section className="icon-carousel">
      <div className="icon-carousel-wrapper">
        {icons.concat(icons).map((icon, index) => (
          <div className="icon-card" key={index}>
            <img src={icon.src} alt={icon.alt} className="icon-image" />
            <p>{icon.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default IconCarousel;
