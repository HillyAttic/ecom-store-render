import { Server } from 'socket.io';

const SocketHandler = (req, res) => {
  if (res.socket.server.io) {
    console.log('Socket is already running');
    res.end();
    return;
  }
  
  console.log('Setting up socket.io server...');
  const io = new Server(res.socket.server);
  res.socket.server.io = io;
  
  io.on('connection', socket => {
    console.log(`Socket connected: ${socket.id}`);
    
    // Join a room specific to the user
    socket.on('join-user-room', userId => {
      if (userId) {
        console.log(`User ${userId} joined their room`);
        socket.join(`user-${userId}`);
      }
    });
    
    // Join a room for admin updates
    socket.on('join-admin-room', () => {
      console.log('Admin joined admin room');
      socket.join('admin-room');
    });
    
    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });
  
  console.log('Socket.io server started');
  res.end();
};

export default SocketHandler; 