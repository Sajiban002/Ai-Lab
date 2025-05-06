import React, { useState, useEffect, useRef } from 'react';
import { FaChartPie } from 'react-icons/fa';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';

const DiagnosisPieChart = ({ diagnoses }) => {
  const [animationActive, setAnimationActive] = useState(true);
  const [activeIndex, setActiveIndex] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  // Ссылка на контейнер диаграммы для корректного экспорта
  const chartContainerRef = useRef(null);
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A569BD', '#EC7063', '#5D6D7E', '#45B39D'];
  
  // Check if viewport is mobile
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);
  
  const normalizedData = React.useMemo(() => {
    if (!diagnoses || diagnoses.length === 0) return [];
    
    return diagnoses.map(item => ({
      name: (item.name || "Неизвестный диагноз").replace(/[.,!?]$/, '').trim(),
      probability: item.probability || 0,
    }));
  }, [diagnoses]);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimationActive(false);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, []);

  // Метод для подготовки диаграммы к экспорту
  const prepareForExport = () => {
    // Отключаем анимацию для корректного снимка
    setAnimationActive(false);
    
    // Даем немного времени для завершения рендеринга
    return new Promise(resolve => {
      setTimeout(() => {
        if (chartContainerRef.current) {
          resolve(chartContainerRef.current);
        } else {
          resolve(null);
        }
      }, 100);
    });
  };

  // Добавляем метод к компоненту для внешнего доступа
  React.useImperativeHandle(
    chartContainerRef,
    () => ({
      prepareForExport,
      getContainer: () => chartContainerRef.current
    }),
    []
  );

  if (!normalizedData || normalizedData.length === 0) {
    return (
      <div className="no-diagnoses">
        <p>Недостаточно данных для прогноза вероятных заболеваний</p>
      </div>
    );
  }

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, value }) => {
    // Don't show labels if the percentage is too small or on mobile
    if (percent < 0.1 || isMobile) return null;
    
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    
    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize="12"
        fontWeight="bold"
      >
        {`${value}%`}
      </text>
    );
  };

  const renderLegend = (props) => {
    const { payload } = props;
    
    return (
      <ul className="recharts-default-legend" style={{ 
        padding: 0, 
        margin: 0, 
        listStyle: 'none',
        fontSize: isMobile ? '0.8rem' : '0.9rem'
      }}>
        {payload.map((entry, index) => {
          const diagnosisItem = normalizedData[index] || { name: "Неизвестно", probability: 0 };
          
          return (
            <li 
              key={`item-${index}`} 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                marginBottom: isMobile ? '4px' : '8px',
                padding: isMobile ? '2px 4px' : '4px 6px',
                borderRadius: '4px',
                cursor: 'pointer',
                transition: 'background-color 0.2s ease',
                backgroundColor: activeIndex === index ? '#f0f7ff' : 'transparent'
              }}
              onMouseEnter={() => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
            >
              <div style={{
                width: isMobile ? 8 : 10,
                height: isMobile ? 8 : 10,
                backgroundColor: entry.color,
                marginRight: isMobile ? 4 : 8,
                borderRadius: '50%',
                transition: 'transform 0.2s ease',
                transform: activeIndex === index ? 'scale(1.3)' : 'scale(1)'
              }} />
              <span style={{ 
                fontSize: isMobile ? '0.8rem' : '0.9rem', 
                color: activeIndex === index ? '#333' : '#555',
                fontWeight: activeIndex === index ? '500' : 'normal',
                transition: 'all 0.2s ease'
              }}>
                {isMobile 
                  ? `${diagnosisItem.name.length > 15 ? diagnosisItem.name.substring(0, 15) + '...' : diagnosisItem.name}: ${diagnosisItem.probability}%`
                  : `${diagnosisItem.name.length > 30 ? diagnosisItem.name.substring(0, 30) + '...' : diagnosisItem.name}: ${diagnosisItem.probability}%`
                }
              </span>
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <div className="diagnosis-chart-container" ref={chartContainerRef}>
      <h3 className="chart-title">
        <FaChartPie className="chart-icon" />
        Вероятность диагнозов
      </h3>
      <div style={{ width: '100%', height: isMobile ? 220 : 300, position: 'relative' }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart margin={{ 
            top: isMobile ? 5 : 10, 
            right: isMobile ? 5 : 10, 
            bottom: isMobile ? 5 : 10, 
            left: isMobile ? 5 : 10 
          }}>
            <defs>
              {COLORS.map((color, index) => (
                <filter
                  key={`shadow-${index}`}
                  id={`shadow-${index}`}
                  x="-20%"
                  y="-20%"
                  width="140%"
                  height="140%"
                >
                  <feDropShadow 
                    dx="0" 
                    dy="0" 
                    stdDeviation={activeIndex === index ? "4" : "0"}
                    floodColor={color}
                    floodOpacity="0.3"
                  />
                </filter>
              ))}
            </defs>
            <Pie
              data={normalizedData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomizedLabel}
              outerRadius={isMobile ? 60 : 90}
              innerRadius={isMobile ? 30 : 50}
              fill="#8884d8"
              dataKey="probability"
              nameKey="name"
              isAnimationActive={animationActive}
              animationDuration={1500}
              animationBegin={0}
            >
              {normalizedData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={COLORS[index % COLORS.length]} 
                  style={{
                    filter: activeIndex === index ? `url(#shadow-${index})` : 'none',
                    opacity: activeIndex === null || activeIndex === index ? 1 : 0.8,
                    transition: 'opacity 0.3s ease',
                  }}
                />
              ))}
            </Pie>
            <Legend
              layout="vertical"
              verticalAlign={isMobile ? "bottom" : "middle"}
              align={isMobile ? "center" : "right"}
              content={renderLegend}
              wrapperStyle={isMobile ? 
                { bottom: 0, width: '100%', paddingTop: '10px' } : 
                { right: 0, maxWidth: '40%' }
              }
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      
      <style jsx>{`
        .diagnosis-chart-container {
          background: white;
          border-radius: 8px;
          padding: ${isMobile ? '0.75rem' : '1.25rem'};
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
          height: 100%;
          display: flex;
          flex-direction: column;
        }
        
        .chart-title {
          display: flex;
          align-items: center;
          gap: ${isMobile ? '0.5rem' : '0.75rem'};
          margin-top: 0;
          margin-bottom: ${isMobile ? '0.5rem' : '1rem'};
          font-size: ${isMobile ? '1rem' : '1.2rem'};
          color: #333;
          font-weight: 600;
        }
        
        .chart-icon {
          color: #2c73d2;
        }
        
        @media (max-width: 480px) {
          .diagnosis-chart-container {
            padding: 0.5rem;
          }
          
          .chart-title {
            font-size: 0.9rem;
            margin-bottom: 0.25rem;
          }
        }
      `}</style>
    </div>
  );
};

export default DiagnosisPieChart;