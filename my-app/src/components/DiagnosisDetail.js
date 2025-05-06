import React, { useState, useEffect, useRef } from 'react'; // Добавили useRef
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FaHeartbeat,
    FaCapsules,
    FaExclamationTriangle,
    FaPrescriptionBottleAlt,
    FaArrowLeft,
    FaFilePdf, 
    FaDownload 
} from 'react-icons/fa';
import DiagnosisPieChart from './piechart';
import '../style/generate.css';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { downloadMedicalPDF } from './downloadPDF';


const extractDiagnosesFromText = (text) => {
    if (!text) return [];
    const diagnosisPattern = /([А-Яа-я\s]+(?:\(?\d+%\)?|\s*-\s*\d+%))/g;
    const percentagePattern = /(\d+)%/;
    const namePattern = /(.+?)(?:\s*\(?\d+%\)?|\s*-\s*\d+%)/;
    const diagnosisMatches = text.match(diagnosisPattern) || [];

    let diagnoses = diagnosisMatches.map(match => {
        const percentMatch = match.match(percentagePattern);
        const nameMatch = match.match(namePattern);
        if (percentMatch && nameMatch) {
            return { name: nameMatch[1].trim(), probability: parseInt(percentMatch[1], 10) };
        }
        return null;
    }).filter(Boolean);

    if (diagnoses.length === 0) {
        const mainDiagnosisPart = text.match(/ОСНОВНОЙ ДИАГНОЗ:(.*?)(?=\n\n|СИМПТОМАТИКА:|РЕКОМЕНДАЦИИ:|ВАЖНО:|ПРОГНОЗ ЗАБОЛЕВАНИЙ:|$)/is);
        if (mainDiagnosisPart && mainDiagnosisPart[1]) {
            const mainDiagnosis = mainDiagnosisPart[1].trim().replace(/^\d+\.\s*\n?/, '').trim();
            if (mainDiagnosis) {
                diagnoses = [{ name: mainDiagnosis, probability: 100 }];
            }
        }
    }

     if (diagnoses.length === 0) {
         const prognosisPart = text.match(/ПРОГНОЗ ЗАБОЛЕВАНИЙ:(.*?)(?=\n\n|ОСНОВНОЙ ДИАГНОЗ:|СИМПТОМАТИКА:|РЕКОМЕНДАЦИИ:|ВАЖНО:|$)/is);
         if (prognosisPart && prognosisPart[1]) {
             const prognosisText = prognosisPart[1].trim();
             const prognosisLines = prognosisText.split('\n');
             diagnoses = prognosisLines.map(line => {
                 const parts = line.trim().match(/(\d+)%\s*-\s*(.+)/);
                 if (parts && parts[1] && parts[2]) {
                     return { name: parts[2].trim(), probability: parseInt(parts[1], 10) };
                 }
                 return null;
             }).filter(Boolean);
         }
     }
    return diagnoses;
};

const extractMedicationsFromText = (text) => {
    if (!text) return [];
    const medicationSection = text.match(/(?:РЕКОМЕНДУЕМЫЕ ПРЕПАРАТЫ|Рекомендуемые\s+препараты):(.*?)(?=\n\n|ВАЖНО:|Дополнительные\s+рекомендации|Советы:|ПРОГНОЗ ЗАБОЛЕВАНИЙ:|$)/is);

    if (medicationSection && medicationSection[1]) {
        const medicationText = medicationSection[1].trim();
        const medicationItems = medicationText.split('\n').map(item => item.replace(/^[\s*-–•]+\s*/, '').trim()).filter(Boolean);
        if (medicationItems.length > 0) {
            return medicationItems.map(med => {
                const categoryMatch = med.match(/\(([^)]+)\)$/);
                const name = categoryMatch ? med.replace(/\s*\(([^)]+)\)$/, '').trim() : med;
                const category = categoryMatch ? categoryMatch[1] : 'Медикамент';
                return { name, category };
            });
        }
    }

    const recommendationsSection = text.match(/РЕКОМЕНДАЦИИ:(.*?)(?=\n\n|ВАЖНО:|Дополнительные\s+рекомендации|Советы:|ПРОГНОЗ ЗАБОЛЕВАНИЙ:|$)/is);
    if (recommendationsSection && recommendationsSection[1]) {
        const recommendations = recommendationsSection[1].trim();
        const medicationMention = recommendations.match(/(?:используйте\s+лекарства|препараты|таблетки|капсулы|спрей|леденцы|пастилки|сироп):?\s*(.*?)(?=\n\n|$)/si);
        if (medicationMention && medicationMention[1]) {
            const medText = medicationMention[1].trim();
            const items = medText.split(/;|,\s*|\n/).map(item => item.replace(/^[\s*-–•]+\s*/, '').trim()).filter(Boolean);
            if (items.length > 0) {
                return items.map(m => ({ name: m, category: 'Симптоматическое лечение' }));
            }
        }
    }
    return [];
};


const formatResults = (text) => {
    if (!text) return [];
    const mainDiagnosisPart = text.match(/ОСНОВНОЙ ДИАГНОЗ:(.*?)(?=\n\n|СИМПТОМАТИКА:|РЕКОМЕНДАЦИИ:|ВАЖНО:|ПРОГНОЗ ЗАБОЛЕВАНИЙ:|$)/is);
    const symptomsPart = text.match(/СИМПТОМАТИКА:(.*?)(?=\n\n|ОСНОВНОЙ ДИАГНОЗ:|РЕКОМЕНДАЦИИ:|ВАЖНО:|ПРОГНОЗ ЗАБОЛЕВАНИЙ:|$)/is);
    const recommendationsPart = text.match(/РЕКОМЕНДАЦИИ:(.*?)(?=\n\n|ОСНОВНОЙ ДИАГНОЗ:|СИМПТОМАТИКА:|ВАЖНО:|РЕКОМЕНДУЕМЫЕ ПРЕПАРАТЫ:|ПРОГНОЗ ЗАБОЛЕВАНИЙ:|$)/is);
    const importantPart = text.match(/ВАЖНО:(.*?)(?=\n\n|ОСНОВНОЙ ДИАГНОЗ:|СИМПТОМАТИКА:|РЕКОМЕНДАЦИИ:|ПРОГНОЗ ЗАБОЛЕВАНИЙ:|$)/is);
    // const prognosisPart = text.match(/ПРОГНОЗ ЗАБОЛЕВАНИЙ:(.*?)(?=\n\n|ОСНОВНОЙ ДИАГНОЗ:|СИМПТОМАТИКА:|РЕКОМЕНДАЦИИ:|ВАЖНО:|$)/is); // Убрали поиск прогноза для отображения

    const sections = [];
    const processedContent = new Set();

    const addSection = (title, contentMatch, special = '') => {
        if (contentMatch && contentMatch[1]) {
            const rawContent = contentMatch[1].trim().replace(/^\d+\.\s*\n?/, '');
            if (processedContent.has(rawContent) || !rawContent) return;
            let contentLines = rawContent.split('\n');
            contentLines = contentLines
                .map(item => item.replace(/^\s*[-•*–]\s*/, '').trim())
                .filter(line => Boolean(line) && !/^\d+\.$/.test(line.trim()));
            if (contentLines.length > 0) {
                sections.push({ title, content: contentLines, special });
                processedContent.add(rawContent);
            }
        }
    };

    addSection('ОСНОВНОЙ ДИАГНОЗ', mainDiagnosisPart, 'main-diagnosis');
    addSection('СИМПТОМАТИКА', symptomsPart);
    addSection('РЕКОМЕНДАЦИИ', recommendationsPart);
    addSection('ВАЖНО', importantPart, 'warning');
    // addSection('ПРОГНОЗ ЗАБОЛЕВАНИЙ', prognosisPart); // Не добавляем прогноз в отображение

    if (sections.length === 0 && text) {
         const fullTextClean = text.trim().replace(/^\d+\.\s*\n?/gm, '');
         if (!processedContent.has(fullTextClean) && fullTextClean) {
             let content = fullTextClean.split('\n').filter(line => line.trim() !== '');
             content = content.map(item => item.replace(/^\s*[-•*–]\s*/, '').trim()).filter(line => Boolean(line) && !/^\d+\.$/.test(line.trim()));
             if (content.length > 0) {
                 const cleanContent = content.filter(line =>
                    !/^(ОСНОВНОЙ ДИАГНОЗ|СИМПТОМАТИКА|РЕКОМЕНДАЦИИ|ВАЖНО|ПРОГНОЗ ЗАБОЛЕВАНИЙ|РЕКОМЕНДУЕМЫЕ ПРЕПАРАТЫ):/i.test(line)
                 );
                 if(cleanContent.length > 0) {
                     return [{ title: 'Результат анализа', content: cleanContent }];
                 }
             }
         }
    }
    return sections;
};

const MedicationsSection = ({ medications }) => {
    if (!medications || medications.length === 0) {
        return null;
    }
    return (
        <div className="medications-container">
            <h3 className="chart-title">
                <FaPrescriptionBottleAlt className="medications-icon" />
                Рекомендуемые медикаменты
            </h3>
            <div className="medications-list">
                {medications.map((med, index) => (
                    <div key={index} className="medication-item">
                        <div className="medication-icon-container">
                            <FaCapsules className="medication-pill-icon" />
                        </div>
                        <div className="medication-info">
                            <span className="medication-name">{med.name}</span>
                            {med.category && <span className="medication-category">{med.category}</span>}
                        </div>
                    </div>
                ))}
            </div>
            <div className="medication-disclaimer">
                <FaExclamationTriangle className="medication-disclaimer-icon" />
                <span>Перед применением любых лекарств проконсультируйтесь с врачом</span>
            </div>
        </div>
    );
};


// --- ОСНОВНОЙ КОМПОНЕНТ ---

function DiagnosisDetail() {
    const { diagnosisId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [diagnosisData, setDiagnosisData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [diagnosisPredictions, setDiagnosisPredictions] = useState([]);
    const [allRecommendedMedications, setAllRecommendedMedications] = useState([]); // Для PDF
    const [formattedResults, setFormattedResults] = useState([]);
    const [generatedTextContent, setGeneratedTextContent] = useState(''); // Для PDF
    const [downloadInProgress, setDownloadInProgress] = useState(false); // Состояние для кнопки PDF
    const chartRef = useRef(null); // Ref для секции с диаграммой/медикаментами

    useEffect(() => {
        const fetchDiagnosisJson = async () => {
            setLoading(true);
            setError('');
            setDiagnosisData(null); // Сброс перед загрузкой
            setDiagnosisPredictions([]);
            setAllRecommendedMedications([]);
            setFormattedResults([]);
            setGeneratedTextContent('');


            if (!user?.id) {
                // Ждем user.id без установки ошибки, если loading еще true
                if (!loading) {
                    setError('Ошибка: ID пользователя не определен.');
                }
                setLoading(false); // Устанавливаем false, если user.id так и не пришел
                return;
            }
            if (!diagnosisId) {
                setError('Ошибка: ID диагноза не указан в URL.');
                setLoading(false);
                return;
            }

            const userId = user.id;
            const filePath = `/diagnoses/${userId}/${diagnosisId}.json`;

            try {
                const response = await fetch(filePath);

                if (!response.ok) {
                    if (response.status === 404) {
                        throw new Error(`JSON-файл не найден: ${filePath}. Проверьте ID пользователя (${userId}), ID диагноза (${diagnosisId}) и имя файла (${diagnosisId}.json).`);
                    } else {
                        throw new Error(`Ошибка загрузки файла (${filePath}): ${response.status} ${response.statusText}`);
                    }
                }

                const jsonData = await response.json();

                const createdAt = jsonData.timestamp || new Date().toISOString();
                const symptoms = jsonData.symptoms || 'Не указано';
                const currentUserId = jsonData.user_id || userId;
                const textContent = jsonData.generated_text || '';

                setDiagnosisData({
                    diagnosis_id: jsonData.diagnosis_id || diagnosisId,
                    created_at: createdAt,
                    symptoms: symptoms,
                    user_id: currentUserId,
                    // Сохраняем и текст, чтобы передать в PDF
                    generated_text: textContent
                });
                setGeneratedTextContent(textContent); // Сохраняем текст отдельно для PDF

                const predictions = Array.isArray(jsonData.diagnosis_predictions) && jsonData.diagnosis_predictions.length > 0
                    ? jsonData.diagnosis_predictions
                    : extractDiagnosesFromText(textContent);
                setDiagnosisPredictions(predictions);

                // Извлекаем ВСЕ медикаменты для PDF
                const allMeds = Array.isArray(jsonData.recommended_medications) && jsonData.recommended_medications.length > 0
                    ? jsonData.recommended_medications
                    : extractMedicationsFromText(textContent);
                setAllRecommendedMedications(allMeds);

                const results = formatResults(textContent);
                setFormattedResults(results);

            } catch (err) {
                 if (err instanceof SyntaxError) {
                     setError(`Ошибка парсинга JSON-файла (${filePath}). Файл поврежден или имеет неверный формат.`);
                 } else {
                    setError(err.message || 'Не удалось загрузить или обработать JSON-файл.');
                 }
            } finally {
                setLoading(false);
            }
        };

        fetchDiagnosisJson();

    }, [diagnosisId, user?.id]); // Убрали loading из зависимостей

    // Обработчик скачивания PDF
    const handleDownloadPDF = async () => {
        if (!diagnosisData) return;

        setDownloadInProgress(true);
        setError(''); // Сброс ошибки перед скачиванием
        try {
          // Передаем все необходимые данные
          await downloadMedicalPDF({
            patientDescription: diagnosisData.symptoms,
            diagnosisPredictions: diagnosisPredictions,
            // Передаем ПОЛНЫЙ список медикаментов
            recommendedMedications: allRecommendedMedications,
            generatedText: generatedTextContent, // Передаем оригинальный текст
            resultElement: chartRef.current // Передаем ref на элемент с диаграммой/медикаментами
          });
        } catch (error) {
          console.error('Ошибка при создании PDF:', error);
          setError('Не удалось создать PDF файл.');
        } finally {
          setDownloadInProgress(false);
        }
      };

    // --- РЕНДЕРИНГ КОМПОНЕНТА ---

    if (loading) {
        return (
            <main className="medical-main">
                <div className="loading-container">
                    <div className="medical-loader">
                        <div className="loading-icon"></div>
                        <p className="loading-text">Загрузка данных диагноза...</p>
                    </div>
                </div>
            </main>
        );
    }

    if (error) {
        return (
            <main className="medical-main">
                <motion.div
                    className="error-message"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <div className="error-icon">!</div>
                    <p>{error}</p>
                    <button onClick={() => navigate(-1)} className="btn small back-btn" style={{ marginTop: '15px' }}>
                        <FaArrowLeft /> Назад
                    </button>
                </motion.div>
            </main>
        );
    }

    if (!diagnosisData) {
        return (
            <main className="medical-main">
                {/* Сообщение может быть другим, если ошибка уже отображена */}
                <p>Данные для этого диагноза не найдены.</p>
                <button onClick={() => navigate(-1)} className="btn small back-btn">
                    <FaArrowLeft /> Назад
                </button>
            </main>
        );
    }

    const diagnosisDate = diagnosisData.created_at
        ? format(new Date(diagnosisData.created_at), 'dd MMMM yyyy, HH:mm', { locale: ru })
        : 'Дата неизвестна';

    // Отображаем только первые 4 медикамента
    const displayedMedications = allRecommendedMedications.slice(0, 4);

    return (
        <main className="medical-main">
            <AnimatePresence>
                <motion.section
                    className="results-section"
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <div className="section-header">
                        <FaHeartbeat className="section-icon pulse" />
                        <h2>Анализ от {diagnosisDate}</h2>
                        {/* Кнопка Скачать PDF */}
                        <motion.button
                            className="pdf-download-button" /* Используем класс как в Generate.js */
                            onClick={handleDownloadPDF}
                            disabled={downloadInProgress || !diagnosisData}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            title="Скачать результаты в PDF"
                            style={{ marginLeft: '10px' }} // Небольшой отступ от кнопки Назад
                        >
                            {downloadInProgress ? (
                            <><div className="spinner small"></div><FaFilePdf /></>
                            ) : (
                            <><FaDownload /><FaFilePdf /></>
                            )}
                            <span>Скачать PDF</span>
                        </motion.button>
                        {/* Кнопка Назад */}
                        <motion.button
                        className="pdf-download-button-back" 
                        onClick={() => navigate(-1)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        title="Вернуться назад"
                        style={{ marginLeft: 'auto' }} 
                    >
                        <FaArrowLeft />
                        <span>Назад</span>
                    </motion.button>
                    </div>

                    <div className="medical-card result-card">
                        {diagnosisData.symptoms && (
                            <div className="report-section initial-symptoms" style={{ marginBottom: '20px', paddingBottom: '15px', borderBottom: '1px solid #eee' }}>
                                <h3 className="report-section-title">Исходное описание</h3>
                                <div className="report-content">
                                    <p><i>{diagnosisData.symptoms}</i></p>
                                </div>
                            </div>
                        )}

                        <div className="results-layout">
                            <div className="medical-report">
                                {formattedResults.length > 0 ? (
                                    formattedResults.map((section, index) => (
                                        <div key={index} className={`report-section ${section.special || ''}`}>
                                            <h3 className="report-section-title">
                                                {section.special === 'warning' && <FaExclamationTriangle className="warning-icon" />}
                                                {section.title}
                                            </h3>
                                            <div className="report-content">
                                                {section.content.map((paragraph, i) => <p key={i}>{paragraph}</p>)}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    diagnosisData.generated_text ?
                                    <p>Не удалось извлечь структурированный результат из текстового описания.</p>
                                    : <p>Текстовое описание отсутствует в данных.</p>
                                )}
                            </div>

                            {/* Добавляем ref к секции с диаграммой/медикаментами */}
                            <div className="chart-section" ref={chartRef}>
                                {diagnosisPredictions.length > 0 && (
                                    <DiagnosisPieChart diagnoses={diagnosisPredictions} />
                                )}
                                {/* Используем displayedMedications для отображения */}
                                {displayedMedications.length > 0 && (
                                    <MedicationsSection medications={displayedMedications} />
                                )}
                                {diagnosisPredictions.length === 0 && displayedMedications.length === 0 && (
                                    <div style={{ textAlign: 'center', color: '#888', marginTop: '20px' }}>
                                        <p>Нет данных для диаграммы и рекомендуемых медикаментов.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="disclaimer">
                            <FaCapsules className="disclaimer-icon" />
                            <p>Данная информация предоставляется исключительно в ознакомительных целях и не заменяет консультацию квалифицированного медицинского специалиста. Точность анализа не гарантирована.</p>
                        </div>
                    </div>
                </motion.section>
            </AnimatePresence>
        </main>
    );
}

export default DiagnosisDetail;