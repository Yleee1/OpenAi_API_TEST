import express from 'express';
import * as dotenv from 'dotenv';
import cors from 'cors';
import OpenAI from "openai";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', async (req, res) => {
  res.status(200).send({ message: 'Hello World' });
});

async function fetchOpenAI(prompt, retries = 3) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { "role": "system", "content": "You will be provided with a piece of code, and your task is to explain it in a concise way." },
        { "role": "user", "content": prompt }
      ],
      temperature: 0,
      max_tokens: 1024,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    });
    return response;
  } catch (error) {
    console.error("Attempt failed with error: ", error.message);
    if (retries > 0) {
      console.log(`Retrying... ${retries} attempts left`);
      await new Promise(resolve => setTimeout(resolve, 1000)); // wait 1 second before retrying
      return fetchOpenAI(prompt, retries - 1);
    } else {
      throw new Error('Max retries reached');
    }
  }
}

app.post('/', async (req, res) => {
  try {
    const prompt = req.body.prompt;
    const response = await fetchOpenAI(prompt);
    console.log(response);
    res.status(200).send({ bot: response.data.choices[0].text });
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: error.message || 'Error fetching response from OpenAI' });
  }
});

app.listen(5000, () => console.log('Server is running on port http://localhost:5000'));
