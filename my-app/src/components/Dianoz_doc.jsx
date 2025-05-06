import React, { useState } from 'react';



const MedicalRecordForm = ({ chatId }) => {
  const [loading, setLoading] = useState(false);
  const [diagnosis, setDiagnosis] = useState('');
  const [treatment, setTreatment] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false); // Состояние для открытия модального окна

  const openModal = () => {
    setIsModalOpen(true); // Открываем модальное окно для добавления записи
  };

  const closeModal = () => {
    setIsModalOpen(false); // Закрываем модальное окно
    setDiagnosis(''); // Очищаем поля формы
    setTreatment('');
    setMessage('');
    setError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!diagnosis) {
      setError('Диагноз не может быть пустым');
      return;
    }
  
    setLoading(true);
    setMessage('');
    setError('');
  
    try {
      // Получение токена из локального хранилища или состояния
      const token = localStorage.getItem('authToken');
  
      const response = await fetch(`http://localhost:5001/api/chat/medical-records/${chatId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, // Передаем токен
        },
        body: JSON.stringify({
          diagnosis,
          treatment,
          chatId,
        }),
      });
  
      if (!response.ok) {
        const errorDetails = await response.text();
        console.error(errorDetails);
        throw new Error(errorDetails || 'Ошибка при добавлении записи');
      }
  
      const data = await response.json();
      setMessage('Медицинская запись успешно добавлена');
      setDiagnosis('');
      setTreatment('');
      
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };
  
  
  return (
    <div>
      <button onClick={openModal} className='MedicalRecordForm'>Добавить медицинскую запись</button> {/* Кнопка для открытия модального окна */}

      {/* Модальное окно */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button onClick={closeModal} className="close-button">×</button>
            <h3>Добавить медицинскую запись</h3>
            {loading && <p>Загрузка...</p>}
            {message && <p style={{ color: 'green' }}>{message}</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <form onSubmit={handleSubmit}>
              <div>
                <label>Диагноз:</label>
                <input
                  type="text"
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  required
                />
              </div>
              <div>
                <label>Лечение:</label>
                <textarea
                  value={treatment}
                  onChange={(e) => setTreatment(e.target.value)}
                />
              </div>
              <button type="submit">Добавить запись</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicalRecordForm;
