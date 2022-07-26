const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken')
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// W1TRf0zOFhnmYj2C
// manufacture-user




const uri = "mongodb+srv://manufacture-user:W1TRf0zOFhnmYj2C@cluster0.whfsa.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

 

function verifyJWT(req, res, next){
  const authHeader = req.headers.authorization;
  console.log(authHeader)
  if(!authHeader){
    return res.status(401).send({message:'unauthorized access'});
  }
  const token = authHeader.split(' ')[1]
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function(err, decoded){
    if(err){
      return res.status(403).send({meassage:'Forbeidden access'})
    }
    console.log('decoded', decoded)
    req.decoded = decoded;
    next()
  })
 
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


    app.get('/users', async(req, res) =>{
      const query = {};
      const cursor = userCollection.find(query)
      const users = await cursor.toArray()
      res.send(users)
    })
   
    // get user
    // app.get('/user', async(req, res) =>{
    //   const users = await userCollection.find().toArray();
    //   res.send(users)
    // })

    // app.get('/admin/email', async(req, res) =>{
    //   const email = req.params.email;
    //   const user = await userCollection.findOne({email: email});
    //   const isAdmin = user.role === 'admin';
    //   res.send({admin: isAdmin})
    // })

   
    // app.put('/user/admin/:email', verifyJWT, async (req, res) => {
    //   const email = req.params.email;
    //    const requester = req.decoded.email;
    //   const requesterAccount = await userCollection.findOne({ email: requester });
    //    if (requesterAccount.role === 'admin') {
    //     const filter = { email: email };
    //     const updateDoc = {
    //       $set: { role: 'admin' },
    //     };
    //     const result = await userCollection.updateOne(filter, updateDoc);
    //     res.send({result});
    //    }} )
      // else{ 
      //   res.status(403).send({message: 'forbidden'});
      // }})
    
      // app.put('/user/:email', async (req, res) => {
      //   const email = req.params.email;
      //   const user = req.body;
      //   console.log(user)
      //   // const requester = req.decoded.email;
      //   // const requesterAccount = await userCollection.findOne({ email: requester });
      //   // if (requesterAccount.role === 'admin') {
      //     const filter = { email: email };
      //     const options = {upsert: true}
      //     const updateDoc = {
      //       $set: user,
      //     };
      //     const result = await userCollection.updateOne(filter, updateDoc, options);
      //     // const token = jwt.sign()
      //     res.send(result);
      //   })
      // // else{ 
      // //   res.status(403).send({message: 'forbidden'});
      // // }})

    

    app.get('/part/:id', async(req , res) =>{
      const id = req.params.id;
      const query = {_id: ObjectId(id)};
      const part = await partsCollection.findOne(query);
      res.send(part);
    })
    
    
    //     ///purchase page api
    // app.get('/orders/:id', async(req, res) =>{
    //   const customer = req.query.customer;
    // //  const decodedEmail = req.decoded.email
    // //   if(customer === decodedEmail){
    //     const query = {customer:customer};
    //   const orders = await orderCollection.find(query).toArray()
    //   return res.send(orders)
      
    //   // else{
    //   //   return res.status(403).send({meassage:'forbidden access'});
    // })
     

   


          // get review
    app.get('/review', async (req, res) => {
      const query = {};
      const cursor = reviewCollection.find(query);
      const reviews = await cursor.toArray();
      res.send(reviews);
  });
  //       //  updated profile
  //   app.get('/profile', async (req, res) => {
  //     const query = {};
  //     const cursor = updateCollection.find(query);
  //     const newUpdate = await cursor.toArray();
  //     res.send(newUpdate);
  // });



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


 
  //   //  update profile
  // app.put('/profile',async(req, res)=>{
  //   const newUpdate = req.body;
  //   const result = await updateCollection.insertOne(newUpdate);
  //   res.send(result);
  // })


      // send data to database from client side
    app.post('/orders', async(req,res)=>{
      const orders = req.body;
      console.log(orders)
      const result = await orderCollection.insertOne(orders);
      res.send(result);

    }) 

    app.get('/orders', async (req, res) => {
      const query = {};
      const cursor = orderCollection.find(query);
      const orders = await cursor.toArray();
      res.send(orders);
  });
       
    // // updated user
    // app.post('/user', async(req,res)=>{
    //   const users = req.body;
    //   console.log(users)
    //   const result = await userCollection.insertOne(users);
    //   res.send(result);

    // }) 




      //  // jwt token for login
      //  app.post('/login', async(req,res)=>{
      //   const user = req.body
      //   const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
      //     expiresIn: '1h'
      //  })
      //  res.send({accessToken})
      //  console.log(accessToken)
      //  })
    


      app.put('/user/:email', async (req, res) => {
        const email = req.params.email;
        const user = req.body;
        const filter = { email: email };
        const options = { upsert: true };
        const updateDoc = {
          $set: user,
        };
        const result = await userCollection.updateOne(filter, updateDoc, options);
        const token = jwt.sign({ email: email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '2h' })
        res.send( {result, accessToken:token});
      })
      
    app.get('/myOrders', verifyJWT, async (req, res) => {
    //  const authorization = req.headers.authorization
   
      
      const customerEmail = req.query.customerEmail;
      const decodedEmail=req.decoded.email
    
      
    
         if(customerEmail === decodedEmail){
       const query = {customerEmail:customerEmail};
      
       const cursor = orderCollection.find(query);
           const myOrders = await cursor.toArray();
          return res.send(myOrders)}
          else{
            return res.status(403).send({message: 'Forbidden access'})
          };
        
          });

              //  manage all orders
          app.get('/orders', async (req, res) => {

            const query = {};
            const cursor = orderCollection.find(query);
            const allOrders = await cursor.toArray();
            res.send(allOrders);
        });
     
        // myOrders delete
    app.delete('/myOrders/:id',  async(req, res) =>{
      const id = req.params.id;
      const query = {_id: ObjectId(id)}
      const result = await orderCollection.deleteOne(query)
      res.send(result);
    })

    // manageProduct delete 
    app.delete('/part/:id', async(req, res) =>{
      const id = req.params.id;
      const query = {_id: ObjectId(id)}
      const result = await partsCollection.deleteOne(query)
      res.send(result);
    })
  
        //  manageOrders delete
    app.delete('/orders/:id', async(req, res) =>{
      const id = req.params.id;
      const query = {_id: ObjectId(id)}
      const result = await orderCollection.deleteOne(query)
      res.send(result);
    })
     

         // quantity inecrease
         app.put('/orders', async(req, res) =>{
          const id = req.params.id;
          const updatedProduct = req.body
          // console.log(req.body)
          // console.log(updatedProduct)
          const {updateQuantity} = updatedProduct
          console.log(updatedProduct)
        
          
         const filter = {_id : ObjectId(id)}
          const options = {upsert:true};
        
          const updateDoc = {
            $set: updatedProduct 
  
          };
          
          
         const result = await orderCollection.updateOne(filter , updateDoc, options);
          res.send(result);
      });
      
  

   
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