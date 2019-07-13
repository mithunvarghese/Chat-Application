const express = require('express');
const path = require('path');
const http = require('http');
const socketio = require('socket.io');
const Filter = require('bad-words');
const query = require('qs');
// const Sentiment = require('sentiment');

// function to get the date
const {generateMessage, generateLocationMessage} = require('./utils/messages')
const { addUser, removeUser, getUser, getUsersInRoom} = require('./utils/users')

const app = express();
const server =  http.createServer(app);// Just for refactoring, if we don't do this the express 
//library does this behind the scenes

const io = socketio(server);

const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname, '/public');



app.use(express.static(publicDirectoryPath))

io.on('connection',(socket) =>{
    console.log('New web socket connection'); 
    socket.on('join', ({ username, room}, callback) => {
        const { error, user } = addUser({ id: socket.id, username, room})

        if(error){
            return callback(error)
        }

        socket.join(user.room)
        socket.emit('message', generateMessage(`Welcome ${user.username}`));
        socket.broadcast.to(user.room).emit('message', generateMessage(`${user.username} has joined!'`));
        io.to(user.room).emit('roomData',{
            room: user.room,
            users: getUsersInRoom(user.room)
        })  
        callback()
    });

    socket.on('sendMessage',(message, callback) =>{
        // const sentiment = new Sentiment();
        // let result = sentiment.analyze(message);
            // if(result.score < 0)
            // return callback('We are dreamers. Dreamers never put themselves down', result);
        const user = getUser(socket.id)
        const filter = new Filter();

        if(filter.isProfane(message))
        {
            return callback('Profanity not allowed!');
        }
        io.to(user.room).emit('message',generateMessage(user.username,message));
        callback()
    
    })

     socket.on('sendLocation', (coords, callback) =>{
         const user = getUser(socket.id)
        io.to(user.room).emit('locationMessage', generateLocationMessage(user.username, `https://www.google.com/maps?q=${coords.latitude},${coords.longitude}`));
        callback();
     })
    
     socket.on('disconnect' , () => {
        const user = removeUser(socket.id)

        if(user) {
           io.to(user.room).emit('message',generateMessage(`${user.username} has left`));
           io.to(user.room).emit('roomData',{
               room: user.room,
               users: getUsersInRoom(user.room)
           })
        }
       
        
    });
});


server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    
});