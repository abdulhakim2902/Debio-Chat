import type { NextApiRequest, NextApiResponse } from 'next'
import axios from 'axios'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const userId = req.query.userId
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/chat/tokens?userId=${userId}`)
      res.status(200).send({ response: response.data })
    } catch (err) {
      console.error(err)
      res.status(500).send({ error: 'failed to fetch data' })
    }
  }
}
