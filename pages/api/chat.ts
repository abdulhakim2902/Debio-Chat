import type { NextApiRequest, NextApiResponse } from 'next'

import OpenAI from 'openai'
import axios from 'axios'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
      })

      console.log('request message is', req.body.msg)
      // const answer = await openai.chat.completions.create({
      //     model: 'gpt-4',
      //     messages: [{ role: 'user', content: req.body.msg }],
      //     stream: false,
      // });
      const response = await axios.post(`${process.env.NEXT_PUBLIC_DEBIO_AI_BACKEND}/openai`, {
        message: req.body.msg,
        directory: './example'
      })
      res.status(200).send({ response: response.data.further_response })
    } catch (err) {
      console.error(err)
      res.status(500).send({ error: 'failed to fetch data' })
    }
  }
}
