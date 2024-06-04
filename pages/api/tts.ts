// pages/api/tts.ts
import { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';

// 環境変数からAPIキーを取得
const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;

// OpenAIクライアントを初期化
const openai = new OpenAI({
  apiKey: apiKey,
});

// ファイル名を生成する関数
const generateFileName = (summary: string, date: string, time: string) => {
  let safeSummary = summary.replace(/[^a-zA-Z0-9-_]/g, ''); // ファイル名として安全な文字のみを使用
  let fileName = `${date}_${time}_${safeSummary}.mp3`;
  return fileName;
};

// テキストを短く要約する関数
const summarizeText = async (text: string) => {
  const completion = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [
      {
        role: 'system',
        content: 'Summarize the following text in a very short phrase suitable for a file name.',
      },
      {
        role: 'user',
        content: text,
      },
    ],
  });

  return completion.choices[0].message.content.trim().replace(/\s+/g, '-').substring(0, 20); // ファイル名に適した形に整形
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { text, voice } = req.body;

  if (!text || !voice) {
    return res.status(400).json({ error: 'Text and voice are required' });
  }

  try {
    // テキストを要約
    const summary = await summarizeText(text);

    // 日付と時間を取得
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    const dateString = `${year}-${month}-${day}`;
    const timeString = `${hours}-${minutes}-${seconds}`;

    const mp3 = await openai.audio.speech.create({
      model: 'tts-1',
      voice: voice,
      input: text,
    });

    const buffer = Buffer.from(await mp3.arrayBuffer());
    const publicDir = path.resolve('./public');
    const fileName = generateFileName(summary, dateString, timeString);
    const filePath = path.join(publicDir, fileName);

    // publicディレクトリが存在するか確認し、存在しない場合は作成
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir);
    }

    await fs.promises.writeFile(filePath, buffer);

    res.status(200).json({ audioUrl: `/${fileName}` });
  } catch (error) {
    console.error('Error generating speech:', error);
    return res.status(500).json({ error: error.message });
  }
}
