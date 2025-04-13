const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios');
const app = express();

app.use(express.json());

mongoose.connect('mongodb://mongo:27017/visadb')
  .then(() => console.log('Visa Service connected to DB'));


const VisaSchema = new mongoose.Schema({
  userId: String, 
  name: String,
  passport: String,
  country: String,
  bankBalance: Number,
  criminalHistory: Boolean,
  status: {
    type: String,
    enum: ['pending', 'rejected', 'approved'],
    default: 'pending'
  }
});

const Visa = mongoose.model('Visa', VisaSchema);

app.post('/apply', async (req, res) => {
  const { userId, name, passport, country, bankBalance, criminalHistory } = req.body;

  let status = 'pending';

  if (bankBalance < 5000 || criminalHistory === true) {
    status = 'rejected';
  }

  const visa = new Visa({
    userId, name, passport, country, bankBalance, criminalHistory, status
  });

  await visa.save();

  await axios.post('http://visa-admin:4000/log', {
    message: `New visa request for ${name} (${status})`
  });

  res.send({
    message: status === 'rejected' ? 'Visa rejected due to failing criteria' : 'Visa request submitted',
    status
  });
});

app.get('/my-applications/:userId', async (req, res) => {
  const apps = await Visa.find({ userId: req.params.userId });
  res.send(apps);
});

app.listen(3000, () => {
  console.log('Visa Service running on port 3000');
});
