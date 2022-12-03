const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId, } = require('mongodb');
const cors = require('cors');
const jwt=require('jsonwebtoken')
require('dotenv').config();
const app= express();
const port =process.env.PORT || 5000;


app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.1pxon9n.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri)
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

function verifyJwt(req,res,next){
    const authHeader=req.headers.authorization;
   
    if(!authHeader){
        return res.status(401).send({message:'unauthorized access'})
    }
    const token=authHeader.split(' ')[1]
    jwt.verify(token,process.env.ACCESS_TOKEN_SECRET,function(err,decoded){
      if(err){
        return res.status(403).send({message:'unauthorized access'})
      }
      req.decoded=decoded;
      next();
    })
 }
async function run(){
    
     try{
        const serviceCollection=client.db('photography').collection('services')
        const reviewCollection=client.db('photography').collection('review')
       
        app.post('/jwt',(req,res)=>{
            const user=req.body;
            const token=jwt.sign(user,process.env.ACCESS_TOKEN_SECRET,{expiresIn:'10h'})
           res.send({token})
            console.log(user)

        })
        app.get('/services',async(req,res)=>{
            const query={};
            let services;
            const cursur=serviceCollection.find(query).sort({_id:-1})
            if(req.query.home)

            {   
               const  s = await cursur.limit(3).toArray();
               services=s
            }
            else{
                services = await cursur.toArray();
            }
           
            res.send(services)
        })
       
        app.get('/services/:id',async(req,res)=>{
            const id=req.params.id;
            const query={_id:ObjectId(id)}
            const service= await serviceCollection.findOne(query);
            res.send(service)
        })
        app.post('/services',async(req,res)=>{
            const review=req.body;
            const result= await serviceCollection.insertOne(review)
            res.send(result)
            
        })
        app.get('/review',verifyJwt,async(req,res)=>{
            const decoded=req.decoded;
            console.log(decoded)
            if(decoded.email!==req.query.email){
                return res.status(403).send({message:'unauthorized access'})
             }
           
            let query={}
            console.log(req.query.review)
           if(req.query.email){
            query={
                email:req.query.email
            }
           }
            const cursur=reviewCollection.find(query)
            const review=await cursur.toArray();
            res.send(review)
        })

        app.get('/service-review',async(req,res)=>{
            let query={}
            console.log(req.query.review)
           if(req.query.review){
            query={
                review:req.query.review
            }
           }
            const cursur=reviewCollection.find(query).sort({_id:-1})
            const review=await cursur.toArray();
            res.send(review)
        })

    //  app.get('/review/:id',async(req,res)=>{
    //     const id=req.params.id;
    //     console.log(id)
    //     const query={_id:ObjectId(id)}
    //     const service= await reviewCollection.findOne(query);
    //     res.send(service)
    //  })
   
        

        app.post('/review',async(req,res)=>{
            const review=req.body;
            const result= await reviewCollection.insertOne(review)
            res.send(result)
        })
        app.delete('/review/:id',async(req,res)=>{
            const id=req.params.id;
            const query={_id:ObjectId(id)}
            const result = await reviewCollection.deleteOne(query)
            res.send(result)
          
        } )

        

     }
     finally{

     }
}
run().catch(err=>console.error(err))

app.get('/',(req,res)=>{
    res.send('server is running')
})

app.listen(port,()=>{
    console.log(` service running on ${port}`)
}) 