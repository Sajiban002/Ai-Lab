import React, { useState, useEffect } from 'react';



const Diagnozi_look = ({ chatId }) => {
  const [loading, setLoading] = useState(false);
  const [patientData, setPatientData] = useState(null);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false); // Состояние для открытия и закрытия модального окна

  const openModal = async () => {
    setLoading(true); // Начинаем загрузку
    setError(''); // Очищаем старые ошибки

    try {
      // Отправляем запрос на сервер
      const response = await fetch(`http://localhost:5001/api/chat/patient-info/${chatId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorDetails = await response.json();
        throw new Error(errorDetails?.message || 'Ошибка при получении данных');
      }

      const data = await response.json();
      setPatientData(data); // Сохраняем полученные данные пациента
      setIsModalOpen(true); // Открываем модальное окно
    } catch (error) {
      setError(error.message); // Отображаем ошибку
    } finally {
      setLoading(false); // Завершаем загрузку
    }
  };

  const closeModal = () => {
    setIsModalOpen(false); // Закрываем модальное окно
    setPatientData(null); // Очищаем данные пациента
  };

  return (
    <div>
      <button onClick={openModal} className='Diagnozi_look'>Открыть информацию о пациенте</button> {/* Кнопка для открытия модального окна */}

      {/* Модальное окно */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Информация о пациенте</h3>
            {loading && <p>Загрузка...</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {patientData && (
              <div className="patient-info">
                <div className='petient_info_tel'>
                  <p>
                    <strong>Имя:</strong> {patientData.user.first_name} {patientData.user.last_name}
                  </p>
                  <p>
                    <strong>Телефон:</strong> {patientData.patient_details.phone || 'Не указано'}
                  </p>
                  <p>
                    <strong>Группа крови:</strong> {patientData.patient_details.blood_type || 'Не указано'}
                  </p>
                  <p>
                    <strong>Аллергии:</strong> {patientData.patient_details.allergies || 'Не указаны'}
                  </p>
                  <p>
                    <strong>Хронические заболевания:</strong> {patientData.patient_details.chronic_conditions || 'Не указаны'}
                  </p>
                </div>

                <div>
                  <h4>Медицинские записи:</h4>
                  {patientData.records.length === 0 ? (
                    <p>Медицинские записи отсутствуют.</p>
                  ) : (
                    <ul>
                      {patientData.records.map((record, index) => (
                        <li key={index}>
                          <p>
                            <strong>Диагноз:</strong> {record.diagnosis}
                          </p>
                          <p>
                            <strong>Лечение:</strong> {record.treatment}
                          </p>
                          {/* Убираем вывод даты, если она отсутствует */}
                          {record.created_at && (
                            <p>
                              <strong>Дата:</strong> {new Date(record.created_at).toLocaleDateString()}
                            </p>
                          )}
                          <p>
                            <strong>Доктор:</strong> {record.doctor_name || 'Не указан'}
                          </p>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}
             <button onClick={closeModal} className="close-button">Закрыть</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Diagnozi_look;
