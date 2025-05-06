import React, { useState, useEffect, useRef } from 'react'; // Добавьте useRef сюда
import Diagnozi_look from './Dianoz_look';
import MedicalRecordForm from './Dianoz_doc';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';



function Docs_input() {
    const [chats, setChats] = useState([]);
    const [messages, setMessages] = useState([]); // Состояние для сообщений чата
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false); // Состояние для модального окна
    const [selectedChat, setSelectedChat] = useState(null); // Состояние для выбранного чата
    const [message, setMessage] = useState(""); // Состояние для текста сообщения
    const [isChatLocked, setIsChatLocked] = useState(false); // Состояние для блокировки чата
    const [userRole, setUserRole] = useState('');


    const messagesEndRef = useRef(null); 
    const scrollToBottom = () => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    };
    useEffect(() => {
        const fetchChats = async () => {
          try {
            setLoading(true); // Устанавливаем загрузку в начале запроса
      
            const token = localStorage.getItem('token');
            if (!token) {
              setError('Нет токена авторизации');
              return;
            }
      
            // Получаем информацию о пользователе с токеном
            const userResponse = await axios.get('http://localhost:5001/api/user/profile', {
              headers: { Authorization: `Bearer ${token}` },
            });
      
            const userId = userResponse.data.id; // Получаем user_id из ответа
      
            if (!userId) {
              setError('Не удалось получить идентификатор пользователя');
              return;
            }
      
            const response = await fetch('http://localhost:5001/api/chat/get-chats', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ user_id: userId }), // Передаем user_id
            });
      
            if (!response.ok) {
              throw new Error('Ошибка при загрузке чатов');
            }
      
            const data = await response.json();
            console.log("Полученные данные:", data);
      
            if (data && Array.isArray(data.chats)) {
              setChats(data.chats); // Устанавливаем чаты
            } else {
              setError('Чаты не найдены или неправильный формат данных');
            }
      
          } catch (error) {
            console.error(error.message);
            setError(error.message); // Устанавливаем ошибку в состояние
          } finally {
            setLoading(false); // Завершаем загрузку
          }
        };
      
        fetchChats(); // Запускаем функцию без проверки userId
      
      }, []); // Эффект будет вызван только один раз при монтировании компонента
      
    
    
      useEffect(() => {
        scrollToBottom(); // Прокручиваем вниз каждый раз, когда обновляются сообщения
      }, [messages]);
      
      useEffect(() => {
        const fetchUserRole = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    console.error('Нет токена авторизации');
                    setError('Нет токена авторизации');
                    return;
                }
        
                // Получаем информацию о пользователе
                const userResponse = await axios.get('http://localhost:5001/api/user/profile', {
                    headers: { Authorization: `Bearer ${token}` },
                });
        
                const userId = userResponse.data.id;
                if (!userId) {
                    throw new Error('Не удалось получить идентификатор пользователя');
                }
    
                // Получаем роль пользователя
                const response = await fetch('http://localhost:5001/api/chat/get-chats', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ user_id: userId }), // Передаем userId для получения данных
                });
        
                if (!response.ok) {
                    throw new Error(`Ошибка при получении чатов: ${response.statusText}`);
                }
        
                const data = await response.json();
        
                console.log('Полученные данные:', data); // Проверим, что получаем от сервера
        
                // Предполагаем, что у бэка есть поле role
                if (data && data.role) {
                    console.log('Роль пользователя:', data.role); // Логирование роли
                    setUserRole(data.role);
                } else {
                    throw new Error('Роль пользователя не найдена в данных');
                }
        
            } catch (error) {
                console.error('Ошибка при получении роли:', error);
                setError(error.message || 'Неизвестная ошибка');
            }
        };
    
        fetchUserRole();
    }, []);
    
     // Эффект будет вызван только один раз при монтировании компонента
     useEffect(() => {
        if (userRole) {
            console.log("userRole из useState:", userRole);
        } else {
            console.log("userRole еще не обновлен");
        }
    }, [userRole]);
    
      
      const openModal = async (chat) => {
        setSelectedChat(chat); // Устанавливаем выбранный чат
        setIsModalOpen(true); // Открываем модальное окно
    
        const token = localStorage.getItem('token');
        if (!token) {
            setError('Нет токена авторизации');
            return;
        }
    
        // Проверяем блокировку чата
        const checkLock = async () => {
            try {
                const response = await fetch('http://localhost:5001/api/chat/check-chat-lock', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`, // Добавляем токен в заголовок
                    },
                    body: JSON.stringify({ chat_room_id: chat.id }) // Отправляем chat_room_id на сервер
                });
    
                // Проверка ответа от сервера
                if (!response.ok) {
                    const errorData = await response.json();  // Получаем ошибку от сервера, если она есть
                    throw new Error(errorData.error || 'Ошибка при проверке блокировки чата');
                }
    
                const data = await response.json();
                setIsChatLocked(data.is_locked); // Сохраняем состояние блокировки чата
            } catch (error) {
                console.error('Ошибка при проверке блокировки:', error);
                setError(error.message || 'Ошибка при проверке блокировки чата'); // Убедитесь, что error.message доступен
            }
        };
    
        // Вызов функции
        checkLock();
    
        // Загружаем сообщения чата
        const fetchMessages = async () => {
            try {
                const response = await fetch('http://localhost:5001/api/chat/get-messages', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`, // Добавляем токен в заголовок
                    },
                    body: JSON.stringify({ chat_room_id: chat.id }) // Отправляем chat_room_id на сервер
                });
                if (!response.ok) {
                    throw new Error('Ошибка при загрузке сообщений');
                }
                const data = await response.json();
                setMessages(data); // Сохраняем сообщения в состоянии
            } catch (error) {
                setError(error.message);
            }
        };
    
        fetchMessages();
    };
    

    const closeModal = () => {
        setIsModalOpen(false); // Закрываем модальное окно
        setSelectedChat(null); // Очищаем выбранный чат
        setMessages([]); // Очищаем сообщения
        setMessage(""); // Очищаем поле ввода
        setIsChatLocked(false); // Сбрасываем блокировку чата
    };

    const handleMessageChange = (e) => {
        setMessage(e.target.value); // Обновляем состояние сообщения
    };

    const lockChat = async () => {
        if (!selectedChat || !selectedChat.id) {
            alert("Чат не выбран или id отсутствует");
            return;
        }
    
        const isConfirmed = window.confirm("Вы уверены, что хотите завершить сеанс?");
        if (!isConfirmed) {
            return; // Если пользователь отменит, ничего не будет сделано
        }
    
        try {
            const response = await fetch('http://localhost:5001/api/chat/lock-chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ chat_room_id: selectedChat.id }),
            });
    
            if (!response.ok) throw new Error("Не удалось заблокировать чат");
    
            const data = await response.json();
            alert("Чат заблокирован!");
            window.location.reload();
            setChats((prevChats) =>
                prevChats.map((chat) =>
                    chat.id === selectedChat.id ? { ...chat, is_locked: true } : chat
                )
            );
            closeModal();
        } catch (err) {
            alert("Ошибка при блокировке чата: " + err.message);
        }
    };
    
    const sendMessage = async (e) => {
        e.preventDefault();
    
        if (!message.trim()) {
            alert("Сообщение не может быть пустым!");
            return;
        }
    
        const token = localStorage.getItem('token');
        if (!token) {
            alert("Нет токена авторизации");
            return;
        }
    
        try {
            // Декодируем токен
            const decodedToken = jwtDecode(token);
            console.log("Декодированный токен:", decodedToken); // Выводим декодированную информацию из токена
    
            // Извлекаем userId из полезной нагрузки токена
            const userId = decodedToken.id; // Обычно userId хранится в поле id
    
            if (!userId) {
                alert("Не удалось извлечь ID пользователя из токена");
                return;
            }
    
            // Отправка сообщения
            const response = await fetch('http://localhost:5001/api/chat/send-messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    chat_room_id: selectedChat.id, // ID чата
                    user_id: userId, // ID пользователя, полученный из токена
                    content: message, // Текст сообщения
                }),
            });
    
            // Логируем ответ сервера для диагностики
            const responseData = await response.json();
            console.log("Ответ от сервера:", responseData); // Выводим ответ от сервера
    
            if (response.status === 403) {
                alert(responseData.error); // Показываем сообщение, если чат заблокирован
                return;
            }
    
            if (!response.ok) {
                throw new Error(responseData.error || 'Ошибка при отправке сообщения');
            }
    
            // Добавляем сообщение в список
            setMessages((prevMessages) => [
                ...prevMessages,
                {
                    id: responseData.messageId,
                    sender_id: Number(userId), // Используем userId из декодированного токена
                    content: message,
                    sent_at: new Date().toISOString(),
                },
            ]);
    
            setMessage(""); // Очищаем поле
        } catch (error) {
            console.error("Ошибка при отправке сообщения:", error);
            alert("Ошибка при отправке сообщения");
        }
    };


    const deleteChat = async (chatRoomId) => {
        const token = localStorage.getItem('token');
        if (!token) {
            alert("Нет токена авторизации");
            return;
        }
    
        // Запрос подтверждения у пользователя
        const isConfirmed = window.confirm("Вы уверены, что хотите удалить этот чат?");
    
        if (!isConfirmed) {
            return;  // Если пользователь отменил, прерываем выполнение функции
        }
    
        try {
            const response = await fetch('http://localhost:5001/api/chat/delete-chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`, // Добавляем токен в заголовок
                },
                body: JSON.stringify({
                    chat_room_id: chatRoomId,  // ID чата
                    user_id: token,            // Вместо userId передаем токен
                }),
            });
    
            const result = await response.json();
    
            if (response.ok) {
                alert(result.message); // Выводим сообщение об успешном удалении
    
                // Перезагружаем страницу после успешного удаления чата
                window.location.reload();
            } else {
                // Показываем дополнительные детали ошибки
                console.error(result.details);  // Логируем подробности ошибки
                alert(result.error); // Если ошибка, показываем ошибку
            }
        } catch (error) {
            console.error("Ошибка при удалении чата:", error);
            alert("Ошибка при удалении чата");
        }
    };
    
    
    

    if (loading) {
        return <div>Загрузка...</div>;
    }
    
    if (error) {
        return <div>Ошибка: {error}</div>;
    }
    

    return (
        <div className="Clogddd">
            <ul className="chat_list">
                {chats.map((chat) => (
                    <li key={chat.id} className="chat_card">
                        <p><strong>{chat.name_chat_room}</strong></p>
                        <p>Создан: {chat.created_at}</p>
                        <button onClick={() => openModal(chat)}>Открыть чат</button>
                    </li>
                ))}
            </ul>
    
            {/* Модальное окно */}
            {isModalOpen && selectedChat && (
                <div className="modal-overlay">
                    <div className="modal-content_2">
                        <h3>Чат: {selectedChat.name_chat_room}</h3>
                        <p>Создан: {selectedChat.created_at}</p>
    
                        {/* Список сообщений */}
                        <div className="messages">
                            {messages.map((msg) => {
                                const token = localStorage.getItem('token');
                                if (!token) {
                                    return null; // Если токен не найден, ничего не отображаем
                                }

                                const decodedToken = jwtDecode(token);
                                console.log('Decoded Token:', decodedToken);
                                console.log('Message Sender ID:', msg.sender_id);

                                // Проверка на правильное поле
                                const isOwnMessage = String(decodedToken.id) === String(msg.sender_id);
                                console.log('isOwnMessage:', isOwnMessage);

                                return (
                                    <div
                                        key={msg.id}
                                        className={`message ${isOwnMessage ? "my-message" : "doctor-message"}`}
                                    >
                                        <div className="bubble">
                                            <div>{msg.content}</div>
                                            <div className="timestamp">
                                                {new Date(msg.sent_at).toLocaleString()}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}

                            <div ref={messagesEndRef} />
                        </div>
    
                        {/* Если чат не заблокирован — показываем форму и кнопки */}
                        {!isChatLocked ? (
                            <>
                                <form onSubmit={sendMessage} className='form_tochat'>
                                    <textarea
                                        value={message}
                                        onChange={handleMessageChange}
                                        placeholder="Напишите сообщение..."
                                        required
                                        className='input_tochat'
                                    />
                                    <button type="submit">Отправить сообщение</button>
                                </form>
    
                                
                                <div className='btns_doc'>
                                    {userRole === 'doctor' && (
                                        <Diagnozi_look chatId={selectedChat.id} />
                                    )}
                                    {userRole === 'doctor' && (
                                        <MedicalRecordForm chatId={selectedChat.id}/>
                                    )}
                                    {userRole === 'doctor' && (
                                        <button onClick={lockChat} className="lock-button">
                                            Завершить сенанс
                                        </button>
                                    
                                    )}
                                </div>
                            </>
                        ) : (
                            <>
                                <p style={{ marginTop: '20px', fontStyle: 'italic', color: 'gray' }}>
                                    Этот чат заблокирован. Новые сообщения отправить невозможно.
                                </p>
                                <button onClick={() => deleteChat(selectedChat.id)}>Удалить чат</button>
                            </>
                        )}
    
                        <button onClick={closeModal}>Закрыть</button>
                    </div>
                </div>
            )}
        </div>
    );
    
}

export default Docs_input;
