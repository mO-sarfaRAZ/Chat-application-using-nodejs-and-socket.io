const path=require('path');
const http=require('http');
const express= require('express');
const app=express();
const server=http.createServer(app);
const socketio=require('socket.io');
const fn1=require('./utils/messagse');
const formatmessages=fn1.formatmessages;
const botname='ChatBot';
const { userJoin, getCurrentUser,userLeave,getRoomUsers} = require('./utils/user');

const io=socketio(server);

//set static folder
app.use(express.static(path.resolve(__dirname,'./public')));


//run on connection with client
io.on('connection',(socket)=>{
    // console.log(socket.id);
    //  console.log("New connection established");
    // let v=socket.id;
    socket.on('joinRoom',({username,room})=>{
            const user = userJoin(socket.id,username,room);

            socket.join(user.room);

            console.log(user);
            //welcome new user
            socket.emit('message',formatmessages(botname,'Welcome to chatbot'));//only emit to the one who connected

            //runs when user connect
            //broadcast to all the client except that connected
            socket.broadcast
            .to(user.room)
            .emit('message',formatmessages(botname,`${user.username} has joined the chat`));

            //send users and room info
            io.to(user.room).emit('roomUsers',{
                room: user.room,
                users: getRoomUsers(user.room)
            });
    });
    


    
     //listen for chat message
     socket.on('chatMessage',(msg)=>{
        console.log(socket.id);
        const user= getCurrentUser(socket.id);
        console.log(user);
        io.to(user.room).emit('message',formatmessages(user.username,msg));
     });

      //runs when client disconnect
      socket.on('disconnect',()=>{
        //emit message to all user connected
        const user= userLeave(socket.id);
        if(user){
            io.to(user.room).emit('message',formatmessages(botname,`${user.username} has left the chat`));

            //send users and room info
            io.to(user.room).emit('roomUsers',{
                room: user.room,
                users: getRoomUsers(user.room)
            });
        }
        
     });

});




const PORT=3000 || process.env.PORT;

server.listen(PORT,()=>{
    console.log(`server started on port ${PORT}`);
});
