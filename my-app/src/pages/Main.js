import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import LocomotiveScroll from "locomotive-scroll";
import "locomotive-scroll/dist/locomotive-scroll.css";
import '../css/Main.css'; 
import AboutSection3 from "../components/AboutUs2";
import HowWeWork from '../components/AboutUs13';
import IconCarousel from '../components/AboutUs14';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import AboutSection2 from '../components/AboutUs10';
import Carousel from "../components/AboutUs3";
import CustomCard from "../components/AboutUs5";
import MainSection from '../components/AboutUs15';
import TestimonialSection from '../components/AboutUs12';



const HomePage = () => {
  const { user } = useAuth();
  const [scrollY, setScrollY] = useState(0);
  const containerRef = useRef(null);

  useEffect(() => {
    const scrollEl = containerRef.current;
    if (!scrollEl) return;

    let scrollInstance;
    const timeoutId = setTimeout(() => {
      scrollInstance = new LocomotiveScroll({
        el: scrollEl,
        smooth: true,
        multiplier: 0.5,
        smartphone: { smooth: true },
        tablet: { smooth: true },
      });

      scrollInstance.on("scroll", (obj) => {
        setScrollY(obj.scroll.y);
      });

      scrollEl.scrollInstance = scrollInstance;

      // 🔧 Обновляем scroll после монтирования DOM
      setTimeout(() => {
        scrollInstance.update();
      }, 500);
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      if (scrollInstance) {
        scrollInstance.stop();
        scrollInstance.destroy();
      }
    };
  }, []);

  const parallaxEffect = (depth) => {
    return 1 + (window.innerWidth / 100) * (scrollY / 500) * depth;
  };

  const opacityEffect = () => {
    return 1 - Math.min(1, scrollY / 170);
  };

  return (
    <div className="wrapper" data-scroll-container ref={containerRef}>
      <div className="page" data-scroll-section>
        <div className="parallax">
          <motion.div
            className="parallax__auctionn parallax__auctionn_1"
            style={{
              transform: `scale(${parallaxEffect(2)})`,
              opacity: opacityEffect(),
              display: scrollY > 300 ? "none" : "block",
            }}
          />
          <motion.div
            className="parallax__auctionn parallax__auctionn_2"
            style={{
              transform: `scale(${parallaxEffect(4)})`,
              opacity: opacityEffect(),
              display: scrollY > 300 ? "none" : "block",
            }}
          />
        </div>
        <div className="stage" data-scroll>
          {[...Array(20)].map((_, i) => (
            <div className="layer" key={i}></div>
          ))}
        </div>
      </div>
      {/* Контент, обернутый в data-scroll-section */}
      <div className="main_content_no_bg">
        <div data-scroll-section><HowWeWork /></div>
        <div data-scroll-section><AboutSection3 /></div>
        <div data-scroll-section><CustomCard /></div>
        <div data-scroll-section><AboutSection2 /></div>
        <div data-scroll-section><IconCarousel /></div>
        <div data-scroll-section><Carousel /></div>
        <div data-scroll-section><TestimonialSection /></div>
      </div>
      <div data-scroll-section><Footer /></div>
    </div>
  );
};

export default HomePage;
