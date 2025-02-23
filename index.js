const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express();
app.use(cors());

app.use(express.json());
const port = process.env.PORT || 5000;


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.k53g2.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    const userCollection = client.db("taskFlowDB").collection("users");
    const taskCollection = client.db("taskFlowDB").collection("tasks");
    app.post('/users',async(req,res)=>{
        const user = req.body;
        const query = { email: user.email };
        const existingUser = await userCollection.findOne(query);
        if (existingUser) {
            return res.send({ message: 'user already exist' })
        }
        const result = await userCollection.insertOne(user);
        res.send(result)
    })
    app.post('/tasks',async(req,res)=>{
        const task = req.body;
        const result = await taskCollection.insertOne(task);
        res.send(result)
    })
    app.get('/tasks/:email',async(req,res)=>{
        const email = req.params.email;
        const query = {email: email}
        const data = await taskCollection.find(query).toArray();
        res.send(data)
    })
    app.delete('/deleteTask/:id',async(req,res)=>{
        const id = req.params.id;
        const query = {_id: new ObjectId(id)};
        const result = await taskCollection.deleteOne(query);
        res.send(result);
    })
    app.patch('/taskUpdate/:id',async(req,res)=>{
        const id = req.params.id;
        const query = {_id: new ObjectId(id)};
        const updateData = { $set: req.body };
        const result = await taskCollection.updateOne(query,updateData);
        res.send(result)
    })
    app.put('/tasks/:id', async (req, res) => {
        const id = new ObjectId(req.params.id); 
        const  {category,time}  = req.body;  
  
        try {
          
          const result = await taskCollection.updateOne(
            { _id: new ObjectId(id) },  
            { $set: { category: category ,time: time} }  
          );
  
          if (result.matchedCount === 0) {
            return res.status(404).send("Task not found");
          }
  
         
          const updatedTask = await taskCollection.findOne({ _id: new ObjectId(id) });
          res.json(updatedTask);
        } catch (error) {
          console.error("Error updating task:", error);
          res.status(500).send("Server Error");
        }
      });
  
    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    // console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get('/',async(req,res)=>{
    res.send('taskFlow running')
})
app.listen(port,()=>{
    console.log(`taskflow is runnig at ${port}`)
})


