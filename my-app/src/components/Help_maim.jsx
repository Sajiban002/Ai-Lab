import { useState } from 'react';
import '../css/DOC.css'; 

const HelpBlock = ({ question, answer }) => {
  const [showHelp, setShowHelp] = useState(false);

  const toggleHelp = () => {
    setShowHelp(prev => !prev);
  };

  return (
    <div style={{ marginBottom: '20px' }}>
      <div className="main_2_divBtn" onClick={toggleHelp}>
        {question}
      </div>
      {showHelp && (
        <div className="help-text">
          {answer}
        </div>
      )}
    </div>
  );
};

const Main_site = () => {
  return (
    <div>
      <HelpBlock
        question="Как получить консультацию?"
        answer="Прежде чем начать, вам необходимо зарегистрироваться. После регистрации отправьте запрос, и наш ИИ проведет предварительный анализ симптомов. После этого вы сможете выбрать врача для дальнейшей консультации."
      />
      <HelpBlock
        question="Когда доступна консультация?"
        answer="Наши консультации доступны круглосуточно, без выходных и перерывов."
      />
      <HelpBlock
        question="Как оплатить консультацию?"
        answer="После того как вы получите рекомендации, вам будет предложена оплата. Как только оплата будет подтверждена, вы сможете начать консультацию с врачом."
      />
      <HelpBlock
        question="Какие правила чата?"
        answer="В чате запрещено оскорбительное поведение, спам и распространение личной информации. Соблюдайте уважение к врачу и другим участникам чата."
      />
    </div>
  );
};

export default Main_site;
