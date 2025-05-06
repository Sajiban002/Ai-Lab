import React, { useState } from 'react';
import "../css/AboutUs.css";

import img1 from '../images/img1.jpg';
import img2 from '../images/robot.JPG';
import img3 from '../images/chat.jpg';
import img4 from '../images/phone.jpg';



const tabs = [
  {
    id: 1,
    title: 'Как это работает?',
    subtitle: '01',
    image: img1,
    text: 'Наша платформа обеспечивает быстрые консультации с врачами через чат, используя ИИ для точной диагностики и рекомендаций.'
  },
  {
    id: 2,
    title: 'Как помогает ИИ?',
    subtitle: '02',
    image: img2,
    text: 'ИИ анализирует ваши симптомы, сравнивая их с тысячами клинических случаев. Он помогает быстрее получить предварительный диагноз и понять, нужен ли врач.'
  },
  {
    id: 3,
    title: 'Как общаться с врачом?',
    subtitle: '03',
    image: img3,
    text: 'Вы можете начать платную консультацию с врачом в чате. Оплата производится перед началом общения, после чего открывается доступ к обмену сообщениями и медицинским рекомендациям.'
  },
  {
    id: 4,
    title: 'Можно ли отправить фото?',
    subtitle: '04',
    image: img4,
    text: 'Да, вы можете прикрепить фото симптомов (например, сыпи или воспалений) при обращении к врачу. Это помогает поставить более точный диагноз.'
  }
];

const TabsSection = () => {
  const [activeTab, setActiveTab] = useState(3);

  return (
    <section className="section-tabs">
      <div className="tabs-container">
        <h2 className="section-title">О сервисе</h2>
        <div className="tabs-content">
          <div className="tabs-menu">
            {tabs.map(tab => (
              <div
                key={tab.id}
                className={`tab-link ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <div className="tab-header">
                  <h3>{tab.subtitle}</h3>
                  <h4>{tab.title}</h4>
                </div>
                {activeTab === tab.id && (
                  <div className="tab-body">
                    <p>{tab.text}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="tabs-image">
            <img src={tabs.find(t => t.id === activeTab).image} alt="Tab visual" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default TabsSection;
