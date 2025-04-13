const express = require('express');
const mongoose = require('mongoose');
const app = express();

app.use(express.json());

mongoose.connect('mongodb://mongo:27017/visadb')
  .then(() => console.log('Admin Service connected to DB'));

const LogSchema = new mongoose.Schema({
  message: String,
  timestamp: { type: Date, default: Date.now }
});

const Log = mongoose.model('Log', LogSchema);

app.post('/log', async (req, res) => {
  const log = new Log(req.body);
  await log.save();
  res.send({ status: 'Logged' });
});


app.get('/all-visas', async (req, res) => {
  const Visa = mongoose.connection.collection('visas');
  const visas = await Visa.find({}).toArray();
  res.send(visas);
});


app.put('/approve/:id', async (req, res) => {
  const Visa = mongoose.connection.collection('visas');
  await Visa.updateOne({ _id: new mongoose.Types.ObjectId(req.params.id) }, { $set: { status: 'approved' } });
  res.send({ message: 'Visa approved' });
});

app.listen(4000, () => {
  console.log('Admin Service running on port 4000');
});
