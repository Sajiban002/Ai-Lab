// File: index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const path = require('path');
const fileUpload = require('express-fileupload');

const sequelize = require('./db');
const models = require('./models/model');
const router = require('./routes/index');
const errorHandler = require('./middleware/ErrorHandlingMiddleware');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }, // Временно, пока не настроим
});

const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: ['http://192.168.101.8:3000', 'http://localhost:3000'],
  credentials: true // Если нужны куки (если твое приложение их использует)
}));
app.use(express.json());
app.use(fileUpload({
  limits: { fileSize: 5 * 1024 * 1024 },
  abortOnLimit: true
}));

// Serve static files
app.use('/database', express.static(path.join(__dirname, 'database')));

// Routes
app.use('/api', router);

// Error handling
app.use(errorHandler);

// Test route
app.get('/', (req, res) => {
  res.status(200).json({ message: 'WORKING!!!' });
});

// Get user from token function
const getUserFromToken = (token) => {
  try {
    return jwt.verify(token, process.env.SECRET_KEY);
  } catch {
    return null;
  }
};

// Socket.io events
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('joinRoom', (roomId) => {
    socket.join(roomId);
  });

  socket.on('sendMessage', async (data) => {
    const { chatRoomId, content, token } = data;

    if (!token || !chatRoomId || !content) return;

    const user = getUserFromToken(token);
    if (!user) return;

    try {
      const isMember = await models.ChatUser.findOne({
        where: { user_id: user.id, chat_room_id: chatRoomId },
      });
      if (!isMember) return;

      const chatRoom = await models.ChatRoom.findByPk(chatRoomId);
      if (!chatRoom || chatRoom.is_locked) return;

      const savedMessage = await models.ChatMessage.create({
        chat_room_id: chatRoomId,
        sender_id: user.id,
        content,
      });

      io.to(chatRoomId).emit('newMessage', {
        chatRoomId,
        content: savedMessage.content,
        sender_id: user.id,
        createdAt: savedMessage.createdAt,
      });
    } catch (err) {
      console.error('Error processing sendMessage:', err);
    }
  });

  socket.on('disconnect', () => {
    console.log('Disconnected:', socket.id);
  });
});

// Start the server
const start = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection successful');

    await sequelize.sync();
    server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (e) {
    console.error('Error starting server:', e);
  }
};

start();