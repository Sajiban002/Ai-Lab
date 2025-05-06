import React from 'react';
import "../css/AboutUs.css";
import doctorImage from '../images/everyhour.jpg';  
import callImage from '../images/sos.jpg';  
import locationImage from '../images/image12.jpg';  

const CustomCard = () => {
  return (
    <div className="custom-container">
      <div className="card-grid">
        <div className="card slide-left">
          <div className="card-inner">
            <div className="card-front">
              <div className="card-header">
                <h5>График</h5>
              </div>
              <div className="card-image">
                <img src={doctorImage} alt="Team" />
              </div>
              <div className="card-numbers">
                <span className="big-number">24/7</span>
              </div>
              <div className="card-text">Наш ии-врач работает без выходных</div>
            </div>
            <div className="card-back">
              <div className="card-text">
                <h5>24/7</h5>
                <div style={{ borderTop: '2px solid rgb(14, 4, 106)', margin: '20px 0' }}></div>
                <p>Наш ИИ-врач всегда на связи — он работает 24 часа в сутки, 7 дней в неделю, без выходных и перерывов, чтобы вы могли получить своевременную медицинскую помощь и консультацию в любой момент, независимо от времени суток и вашего местоположения.</p>
              </div>
              <a href="/"><button className="icon-button">→</button></a>
            </div>
          </div>
        </div>

        <div className="card slide-up">
          <div className="card-inner">
            <div className="card-front">
              <div className="card-header">
                <h5>Экстренные ситуации</h5>
              </div>
              <div className="card-image">
                <img src={callImage} alt="Call" />
              </div>
              <div className="card-numbers">
                <a href="/" className="phone-link">SOS</a>
              </div>
              <div className="card-text">Спроси если не знаешь!</div>
            </div>
            <div className="card-back">
              <div className="card-text">
                <h5>Первая помощь под контролем ИИ </h5>
                <div style={{ borderTop: '2px solid rgb(14, 4, 106)', margin: '20px 0' }}></div>
                <p>Не знаете, как сделать искусственное дыхание или массаж сердца?
Рядом человек задыхается, и вы не уверены, как действовать?
Наш ИИ-консультант подскажет чёткий пошаговый алгоритм:
как спасти человека при экстренной ситуации </p>
              </div>
              <a href="/"><button className="action-button">Спросить</button></a>
            </div>
          </div>
        </div>

        <div className="card slide-right">
          <div className="card-inner">
            <div className="card-front">
              <div className="card-header">
                <h5>Доктора</h5>
              </div>
              <div className="card-image">
                <img src={locationImage} alt="Location" />
              </div>
              <div className="card-text">Найди своего специалиста!</div>
            </div>
            <div className="card-back">
              <div className="card-text">
                <h5>Множество специалистов</h5>
                <div style={{ borderTop: '2px solid rgb(14, 4, 106)', margin: '20px 0' }}></div>
                <p>Наши квалифицированные специалисты готовы помочь вам! Мы предлагаем консультации по более чем 20 различным направлениям медицины.</p>
              </div>
              <a href="/"><button className="action-button">Найти специалиста</button></a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomCard;
