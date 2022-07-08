const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken')
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER1}:${process.env.DB_PASSWORD}@cluster0.whfsa.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send({ message: 'UnAuthorized access' });
  }
  const token = authHeader.split(' ')[1];
  jwt.verify(token, process.env.ACCESS_SECRET_TOKEN, function (err, decoded) {
    if (err) {
      return res.status(403).send({ message: 'Forbidden access' })
    }
    req.decoded = decoded;
    next();
  });
}




async function run() {
  try {
    await client.connect();
    const partsCollection = client.db('computerParts').collection('parts');
    const orderCollection = client.db('computerParts').collection('orders');
    const userCollection = client.db('computerParts').collection('user');
    const reviewCollection = client.db('computerParts').collection('review');
    const updateCollection = client.db('computerParts').collection('profile');
    
    app.get('/part', async (req, res) => {
      const query = {};
      const cursor = partsCollection.find(query);
      const parts = await cursor.toArray();
      res.send(parts);
    });
   
    // get user
    app.get('/user', async(req, res) =>{
      const users = await userCollection.find().toArray();
      res.send(users)
    })

    app.get('/admin/email', async(req, res) =>{
      const email = req.params.email;
      const user = await userCollection.findOne({email: email});
      const isAdmin = user.role === 'admin';
      res.send({admin: isAdmin})
    })

   
    app.put('/user/admin/:email', verifyJWT, async (req, res) => {
      const email = req.params.email;
       const requester = req.decoded.email;
      const requesterAccount = await userCollection.findOne({ email: requester });
       if (requesterAccount.role === 'admin') {
        const filter = { email: email };
        const updateDoc = {
          $set: { role: 'admin' },
        };
        const result = await userCollection.updateOne(filter, updateDoc);
        res.send({result});
       }} )
      // else{ 
      //   res.status(403).send({message: 'forbidden'});
      // }})
    
      app.put('/user/email', async (req, res) => {
        const email = req.params.email;
        const user = req.body;
       
        const requester = req.decoded.email;
        const requesterAccount = await userCollection.findOne({ email: requester });
        if (requesterAccount.role === 'admin') {
          const filter = { email: email };
          const options = {upsert:true}
          const updateDoc = {
            $set: user,
          };
          const result = await userCollection.updateOne(filter, updateDoc, options);
          res.send({result});
        }
      else{ 
        res.status(403).send({message: 'forbidden'});
      }})

    

    app.get('/part/:id', async(req , res) =>{
      const id = req.params.id;
      const query = {_id: ObjectId(id)};
      const part = await partsCollection.findOne(query);
      res.send(part);
    })
    
    
        ///purchase page api
    app.get('/orders/:id', async(req, res) =>{
      const customer = req.query.customer;
    //  const decodedEmail = req.decoded.email
    //   if(customer === decodedEmail){
        const query = {customer:customer};
      const orders = await orderCollection.find(query).toArray()
      return res.send(orders)
      
      // else{
      //   return res.status(403).send({meassage:'forbidden access'});
    })
     

    //  payment by id
    app.get('/orders/:id', async(req,res)=>{
    const id = req.params.id;
    const query = {_id: ObjectId(id)};
    const order = await orderCollection.findOne(query);
    res.send(order)
    })
    


          // get review
    app.get('/review', async (req, res) => {
      const query = {};
      const cursor = reviewCollection.find(query);
      const reviews = await cursor.toArray();
      res.send(reviews);
  });
        //  updated profile
    app.get('/profile', async (req, res) => {
      const query = {};
      const cursor = updateCollection.find(query);
      const newUpdate = await cursor.toArray();
      res.send(newUpdate);
  });



  // add review
  app.post('/review',async(req, res)=>{
    const newReview = req.body;
    const result = await reviewCollection.insertOne(newReview);
    res.send(result);
  })


  // add product
  app.post('/part',async(req, res)=>{
    const newReview = req.body;
    const result = await partsCollection.insertOne(newReview);
    res.send(result);
  })


 
    //  update profile
  app.put('/profile',async(req, res)=>{
    const newUpdate = req.body;
    const result = await updateCollection.insertOne(newUpdate);
    res.send(result);
  })


      // send data to database from client side
    app.post('/orders', async(req,res)=>{
      const orders = req.body;
      
      const result = await orderCollection.insertOne(orders);
      res.send(result);

    }) 
        // updated user
    app.post('/users', async(req,res)=>{
      const users = req.body;
      const result = await userCollection.insertOne(users);
      res.send(result);

    }) 


    


    app.put('/user/:email', async (req, res) => {
      const email = req.params.email;
      const user = req.body;
      const filter = { email: email };
      const options = { upsert: true };
      const updateDoc = {
        $set: user,
      };
      const result = await userCollection.updateOne(filter, updateDoc, options);
      const token = jwt.sign({ email: email }, process.env.ACCESS_SECRET_TOKEN, { expiresIn: '2h' })
      res.send({ result, accessToken:token });
    })



    app.delete('/order/:id', async(req, res) =>{
      const id = req.params.id;
      const query = {_id: ObjectId(id)}
      const result = await orderCollection.deleteOne(query)
      res.send(result);
    })
     

   
  }
  finally {

  }
}

run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('Hello !')
})
app.get('/', (req, res) => {
  res.send('Herokuooo !')
})

app.listen(port, () => {
  console.log(` listening on port ${port}`)
})