const mongoose = require('mongoose');
const Document=require('./Document')
require('dotenv').config()





const defaultValue=''
mongoose.connect(`${process.env.DATABASE}`).then(()=>{
    console.log("Database Connected");})

const io=require('socket.io')(process.env.PORT||3001,{
    cors:{
        // origin:'http://localhost:3000',
        methods:['GET','POST']

    }
})




io.on("connection",socket=>{

    socket.on('get-document',async documentId=>{
        const document = await findOrCreateDocument(documentId)
        socket.join(documentId)

        socket.emit('load-document',document.data)

        socket.on('send-changes',delta=>{
            socket.broadcast.to(documentId).emit('receive-changes',delta)
        })

        socket.on('save-changes', async data=>{
            return await Document.findByIdAndUpdate(documentId,{data})
        })
    })

    
    console.log('Socket connected');
})

const findOrCreateDocument = async(id)=>{
    if (id==null) return
    const document = await Document.findById(id)
    if (document) return document
    return await Document.create({_id:id,data:defaultValue})



}