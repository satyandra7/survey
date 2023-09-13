const bodyParser = require('body-parser');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const port = 3000;

// Connect to MongoDB using mongoose orm
mongoose.connect('mongodb://localhost:27017/surveydb');

// Define MongoDB schemas (Survey and Response)
const surveySchema = new mongoose.Schema({
  title: String,
  questions: [{ type: String, required: true }],
  options: [String],
});

const responseSchema = new mongoose.Schema({
  surveyId: mongoose.Schema.Types.ObjectId,
  answers: [Number],
});
//making MongoDB models
const Survey = mongoose.model('Survey', surveySchema);
const Response = mongoose.model('Response', responseSchema);
//using bodyparser
app.use(bodyParser.json());
app.use(cors());

// Create a new survey
//It takes title of the survey and the questions with options 
app.post('/surveys', async (req, res) => {
  try {
    const { title, questions, options } = req.body;
    const survey = new Survey({ title, questions, options });
    await survey.save(); 

    res.status(201).json({ message: 'Survey created successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Submit a response for a survey
app.post('/responses/:surveyId', async (req, res) => {
  try {
    const surveyId = req.params.surveyId;
    const { answers } = req.body;
    const response = new Response({ surveyId, answers });
    await response.save();
    res.status(201).json({ message: 'Response submitted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Calculate similarity between responses


app.get('/similarity', async (req, res) => {
    try {
      const candidateName = req.query.name.toLowerCase();
  
      // Retrieve all responses
      const responses = await Response.find();
  
      // Filter responses based on the candidate's name
      const filteredResponses = responses.filter((response) =>
        response.name.toLowerCase().includes(candidateName)
      );
      const page=1;
      const pageSize = 5;
  
      const similarityResults=[];
  
      // similarity of students
      for (let i = 0; i < filteredResponses.length; i++) {
        for (let j = i + 1; j < filteredResponses.length; j++) {
          const similarityPercentage = calculateSimilarity(filteredResponses[i].answers, filteredResponses[j].answers);
          similarityResults.push({
            candidate1: filteredResponses[i].surveyId,
            candidate2: filteredResponses[j].surveyId,
            similarityPercentage,
          });
        }

function calculateSimilarity(response1, response2) {
    const totalQuestions = response1.length;
    let count = 0;
  
    for (let i = 0; i < totalQuestions; i++) {
      if (response1.answers[i] === response2.answers[i]) {
        count++;
      }
    }
    const similarity_percentage = (count / totalQuestions) * 100;
    return similarity_percentage;
  }

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});