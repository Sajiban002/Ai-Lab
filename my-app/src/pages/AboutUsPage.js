import React from "react";
import About from "../components/AboutUs";
import AboutSection3 from "../components/AboutUs2";
import Carousel from "../components/AboutUs3";
import CustomCard from "../components/AboutUs5";
import ImageLayout from "../components/AboutUs6";
import TabsSection from "../components/AboutUs8";
import MedicalAchievements from '../components/AboutUs9';
import AboutSection2 from '../components/AboutUs10';
import MissionSection from '../components/AboutUs11';
import TestimonialSection from '../components/AboutUs12';
import HowWeWork from '../components/AboutUs13';
import IconCarousel from '../components/AboutUs14';
import MainSection from '../components/AboutUs15';




function AboutUsPage() {
  return (
    <div>
      <About />
      <MissionSection />
      <MainSection />
      <MedicalAchievements />
      <TabsSection />
    </div>
  );
}

export default AboutUsPage;
