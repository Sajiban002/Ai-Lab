// Файл: controllers/diagnosisHistoryController.js

const ApiError = require('../error/ApiError'); // Убедись, что импорт ApiError есть и путь верный
const { DiagnosisHistory, User } = require('../models/model'); // Импорт моделей
const { Op } = require('sequelize');
const sequelize = require('../db');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

class DiagnosisHistoryController {

    // --- Метод saveDiagnosis ---
    // (Оставлен как в твоем коде)
    async saveDiagnosis(req, res, next) {
        try {
            const { symptoms, diagnosis_id, diagnosis_data, user_id } = req.body;

            if (!symptoms || !diagnosis_data) {
                return next(ApiError.badRequest('Не предоставлены необходимые данные для сохранения (symptoms, diagnosis_data)'));
            }

            const final_user_id = user_id;
            if (!final_user_id) {
                 console.warn("Сохранение диагноза без user_id (анонимно)");
            }

            const effective_diagnosis_id = diagnosis_id || uuidv4();

            const diagnosisEntry = {
                diagnosis_id: effective_diagnosis_id,
                symptoms,
                diagnosis_data,
                user_id: final_user_id || null
            };

            let file_path = null;
            const baseDir = path.join('data', 'diagnoses');
            const userSubDir = final_user_id ? String(final_user_id) : 'anonymous';
            // Используем path.resolve для получения абсолютного пути
            const fullDirPath = path.resolve(__dirname, '..', '..', baseDir, userSubDir);
            const fullFilePath = path.join(fullDirPath, `${effective_diagnosis_id}.json`);
            // Сохраняем относительный путь
            diagnosisEntry.file_path = path.join(baseDir, userSubDir, `${effective_diagnosis_id}.json`).replace(/\\/g, '/');

            try {
                if (!fs.existsSync(fullDirPath)) {
                    fs.mkdirSync(fullDirPath, { recursive: true });
                }
                fs.writeFileSync(
                    fullFilePath,
                    JSON.stringify(diagnosis_data, null, 2),
                    'utf8'
                );
            } catch (fileErr) {
                console.error(`Error saving diagnosis backup file to ${fullFilePath}:`, fileErr);
            }

            const history = await DiagnosisHistory.create(diagnosisEntry);

            // Отвечаем 200 OK или 201 Created
            return res.status(201).json({
                success: true,
                message: 'История диагноза сохранена',
                diagnosis_id: history.diagnosis_id,
                user_id: history.user_id
            });

        } catch (err) {
            console.error('!!! Ошибка при сохранении истории диагноза:', err);
            if (err.name === 'SequelizeValidationError') {
                const messages = err.errors.map(e => e.message).join(', ');
                return next(ApiError.badRequest(`Ошибка валидации: ${messages}`));
            }
            if (err.name === 'SequelizeForeignKeyConstraintError') {
                console.error('Foreign Key Constraint Error Details:', err.parent);
                 return next(ApiError.badRequest(`Ошибка внешнего ключа: Указанный пользователь (user_id: ${req.body?.user_id || 'N/A'}) не существует.`));
            }
            if (err.name === 'SequelizeUniqueConstraintError') {
                 console.error('Unique Constraint Error Details:', err.parent);
                 return next(ApiError.badRequest(`Ошибка уникальности: Запись с таким diagnosis_id (${req.body?.diagnosis_id || 'N/A'}) уже существует.`));
            }
             // Используем твой ApiError.internal или конструктор
             next(ApiError.internal('Внутренняя ошибка сервера при сохранении истории диагноза'));
            // next(new ApiError(500, `Внутренняя ошибка сервера при сохранении: ${err.message}`));
        }
    }

    // --- Метод getUserHistory ---
    // (Оставлен как в твоем коде, но убедись, что authMiddleware используется в роутере)
    async getUserHistory(req, res, next) {
        try {
            const { limit = 10, offset = 0 } = req.query; // Убираем userId из query
            const userId = req.user?.id; // Берем ID пользователя из токена

            if (!userId) {
                console.error('getUserHistory вызван без аутентификации (нет req.user.id)');
                // Используем конструктор ApiError для 401
                return next(new ApiError(401, 'Пользователь не авторизован'));
            }

            // Запрос истории для аутентифицированного пользователя
            const history = await DiagnosisHistory.findAndCountAll({
                where: { user_id: userId }, // Используем userId из токена
                order: [['created_at', 'DESC']],
                limit: parseInt(limit) || 10,
                offset: parseInt(offset) || 0,
                attributes: [
                    'diagnosis_id',
                    'created_at',
                    'symptoms',
                    [
                        sequelize.literal(`(diagnosis_data->'diagnosis_predictions'->0->>'name')`),
                        'main_diagnosis'
                    ],
                    'user_id'
                ]
            });
            return res.json(history);

        } catch (err) {
            console.error(`Ошибка при получении истории диагнозов для user ${req.user?.id}:`, err);
            // Используем твой ApiError.internal или конструктор
            next(ApiError.internal('Ошибка при получении истории диагнозов'));
            // next(new ApiError(500, `Ошибка при получении истории диагнозов: ${err.message}`));
        }
    }

    // --- Метод getDiagnosisById ---
    // (Оставлен как в твоем коде, но убедись, что authMiddleware используется в роутере)
    async getDiagnosisById(req, res, next) {
        try {
            const { id } = req.params;
            const authenticatedUserId = req.user?.id; // ID пользователя из токена

            if (!authenticatedUserId) {
                 console.error('getDiagnosisById вызван без аутентификации');
                 // Используем конструктор ApiError для 401
                 return next(new ApiError(401, 'Пользователь не авторизован'));
            }

            const diagnosis = await DiagnosisHistory.findOne({
                where: { diagnosis_id: id }
            });

            if (!diagnosis) {
                console.log(`Diagnosis ${id} not found in DB.`);
                // Используем твой ApiError.notFound
                 return next(ApiError.notFound('Диагноз не найден'));
            }

            // Проверка прав доступа
            if (diagnosis.user_id && String(authenticatedUserId) !== String(diagnosis.user_id)) {
               console.warn(`Forbidden attempt: User ${authenticatedUserId} tried to access diagnosis ${id} owned by user ${diagnosis.user_id}`);
               // Используем твой ApiError.forbidden
               return next(ApiError.forbidden('Доступ к этому диагнозу запрещен'));
            }

            // Возвращаем полную запись (фронтенд читает файл сам)
            // const result = diagnosis.toJSON();
            // return res.json(result.diagnosis_data ? result.diagnosis_data : result); // Твой вариант возвращал только diagnosis_data
            return res.json(diagnosis); // Возвращаем всю запись из БД

        } catch (err) {
            console.error(`Общая ошибка при получении диагноза ${req.params.id}:`, err);
            // Используем твой ApiError.internal или конструктор
            next(ApiError.internal('Ошибка при получении диагноза'));
            // next(new ApiError(500, `Ошибка при получении диагноза: ${err.message}`));
        }
    }


    // --- Метод deleteDiagnosis ---
    // (Оставлен как в твоем коде, но с ИСПРАВЛЕННЫМ ВЫЗОВОМ ОШИБКИ 401)
    async deleteDiagnosis(req, res, next) {
        try {
            const { id } = req.params;
            // !!! Используем ID ТОЛЬКО из токена (предполагая, что authMiddleware добавлен в роутер) !!!
            const userId = req.user?.id;

            // !!! Проверка наличия userId из токена !!!
            if (!userId) {
                 console.error(`Attempt to delete diagnosis ${id} without user identification.`);
                 // !!! ИСПРАВЛЕННЫЙ ВЫЗОВ ОШИБКИ: Используем конструктор new ApiError !!!
                 return next(new ApiError(401, 'Не удалось определить пользователя для удаления диагноза')); // Было ApiError.unauthorized(...)
            }

            console.log(`Пользователь ${userId} пытается удалить диагноз ${id}`);

            const diagnosis = await DiagnosisHistory.findOne({
                where: {
                    diagnosis_id: id,
                    user_id: userId // Проверяем принадлежность пользователю
                }
            });

            if (!diagnosis) {
                console.warn(`Диагноз ${id} не найден для пользователя ${userId} или уже удален.`);
                // Используем твой ApiError.notFound
                return next(ApiError.notFound('Диагноз не найден или доступ запрещен'));
            }

            // Удаление файла
            if (diagnosis.file_path) {
                // Используем path.resolve для получения абсолютного пути
                const fullFilePath = path.resolve(__dirname, '..', '..', diagnosis.file_path);
                console.log(`Попытка удаления файла: ${fullFilePath}`);
                if (fs.existsSync(fullFilePath)) {
                    try {
                        fs.unlinkSync(fullFilePath);
                        console.log(`Файл ${fullFilePath} успешно удален.`);
                    } catch (fileErr) {
                        console.error(`Ошибка при удалении файла ${fullFilePath}:`, fileErr);
                        // Не прерываем операцию из-за ошибки файла
                    }
                } else {
                    console.log(`Файл диагноза не найден для удаления: ${fullFilePath}`);
                }
            } else {
                 console.log(`Путь к файлу для диагноза ${id} не найден в БД, удаление файла пропущено.`);
            }

            // Удаление из БД
            await diagnosis.destroy();
            console.log(`Диагноз ${id} успешно удален для пользователя ${userId}`);
            return res.status(200).json({ message: 'Диагноз успешно удален из истории' });

        } catch (err) {
            console.error(`Ошибка при удалении диагноза ${req.params.id}:`, err);
            // Используем твой ApiError.internal или конструктор
            next(ApiError.internal('Ошибка при удалении диагноза'));
            // next(new ApiError(500, `Ошибка при удалении диагноза: ${err.message}`));
        }
    }


    // --- Метод getUserStats (ИСПРАВЛЕННЫЙ SQL) ---
    // (Убедись, что authMiddleware используется в роутере)
    async getUserStats(req, res, next) {
        try {
            // ID пользователя ТОЛЬКО из токена
             const userId = req.user?.id;

             if (!userId) {
                  console.error('getUserStats вызван без аутентификации');
                   // Используем КОНСТРУКТОР new ApiError
                  return next(new ApiError(401, 'Пользователь не авторизован'));
             }

            // Получаем общее количество
             const totalDiagnoses = await DiagnosisHistory.count({ where: { user_id: userId } });

             if (totalDiagnoses === 0) {
                 return res.json({
                     total_diagnoses: 0,
                     first_diagnosis_date: null,
                     latest_diagnosis_date: null,
                     most_common_diagnoses: []
                 });
             }

            // Получаем даты
             const dateStats = await DiagnosisHistory.findOne({
                 where: { user_id: userId },
                 attributes: [
                     [sequelize.fn('MIN', sequelize.col('created_at')), 'first_diagnosis_date'],
                     [sequelize.fn('MAX', sequelize.col('created_at')), 'latest_diagnosis_date']
                 ],
                 raw: true // Важно для получения простого объекта
             });

            // --- ИСПРАВЛЕННЫЙ SQL-ЗАПРОС ДЛЯ САМЫХ ЧАСТЫХ ДИАГНОЗОВ ---
             const mostCommonQuery = `
               SELECT diagnosis_data->'diagnosis_predictions'->0->>'name' as diagnosis_name,
                      COUNT(*) as count
               FROM "${DiagnosisHistory.tableName}" -- Используем имя таблицы из модели (в кавычках для PostgreSQL)
               WHERE user_id = :userId
                 AND diagnosis_data->'diagnosis_predictions'->0->>'name' IS NOT NULL
               -- !!! ИСПРАВЛЕНИЕ: Группируем по выражению, а не по псевдониму !!!
               GROUP BY diagnosis_data->'diagnosis_predictions'->0->>'name'
               ORDER BY count DESC
               LIMIT 5
             `;
            // --- КОНЕЦ ИСПРАВЛЕННОГО ЗАПРОСА ---

             const mostCommon = await sequelize.query(mostCommonQuery, {
                 replacements: { userId: userId }, // Передаем параметр
                 type: sequelize.QueryTypes.SELECT // Указываем тип
             });

             // Формируем финальный объект статистики
             const stats = {
                 total_diagnoses: totalDiagnoses,
                 first_diagnosis_date: dateStats?.first_diagnosis_date,
                 latest_diagnosis_date: dateStats?.latest_diagnosis_date,
                 most_common_diagnoses: mostCommon.map(item => ({
                     name: item.diagnosis_name,
                     count: parseInt(item.count, 10) || 0 // Преобразуем count в число
                 }))
             };

            return res.json(stats); // Отправляем статистику

        } catch (err) {
            console.error(`Ошибка при получении статистики диагнозов для user ${req.user?.id}:`, err);
            // Добавляем SQL в лог, если он доступен в ошибке
            if (err.sql) {
                console.error("SQL Query:", err.sql);
            }
             // Используем твой ApiError.internal или конструктор
            next(ApiError.internal('Ошибка при получении статистики диагнозов'));
            // next(new ApiError(500, `Ошибка при получении статистики диагнозов: ${err.message}`));
        }
    }
}

module.exports = new DiagnosisHistoryController();