const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors');
require('dotenv').config();
const app= express();
const port =process.env.PORT || 5000;


app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.1pxon9n.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri)
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run(){
    
     try{
        const serviceCollection=client.db('photography').collection('services')
        app.get('/limitservices',async(req,res)=>{
            const query={};
            const cursur=serviceCollection.find(query)
            const services=await cursur.limit(3).toArray();
            res.send(services)
        });
        app.get('/services',async(req,res)=>{
            const query={};
            const cursur=serviceCollection.find(query)
            const services=await cursur.toArray();
            res.send(services)
        })
        app.get('/services/:id',async(req,res)=>{
            const id=req.params.id;
            const query={_id:ObjectId(id)}
            const service= await serviceCollection.findOne(query);
          
            res.send(service)
        })
;
        

     }
     finally{

     }
}
run().catch(err=>console.error(err))

app.get('/',(req,res)=>{
    res.send('server is running')
})

app.listen(port,()=>{
    console.log(` emajhon running on ${port}`)
})