import React, { useRef, useEffect, useState } from 'react';

const FadeInOnScroll = ({ children, direction = 'up' }) => {
  const ref = useRef();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const getInitialTransform = () => {
    switch (direction) {
      case 'left':
        return 'translateX(-50px)';
      case 'right':
        return 'translateX(50px)';
      case 'down':
        return 'translateY(50px)';
      case 'up':
      default:
        return 'translateY(-50px)';
    }
  };

  const style = {
    opacity: visible ? 1 : 0,
    transform: visible ? 'translateX(0) translateY(0)' : getInitialTransform(),
    transition: 'opacity 1s ease, transform 1s ease',
  };

  return (
    <div ref={ref} style={style}>
      {children}
    </div>
  );
};

export default FadeInOnScroll;
