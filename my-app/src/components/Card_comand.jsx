import React from "react";
import '../css/DOC.css'; 


const CardEffect = ({ frontText, backText, frontImage, backImage }) => {
  return (
    <div className="card-wrapper">
      <div className="card-inner">
        <div className="card-front">
          {frontImage && <img src={frontImage} alt="Front" className="card-image" />}
          <p>{frontText}</p>
          <button>О нас</button>
        </div>
        <div className="card-back">
          {backImage && <img src={backImage} alt="Back" className="card-image" />}
          <p>{backText}</p>
          <button>О нас</button>
        </div>
      </div>
    </div>
  );
};

export default CardEffect;
