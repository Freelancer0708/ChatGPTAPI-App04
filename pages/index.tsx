// pages/index.tsx
import { useState } from 'react';
import axios from 'axios';

const Home = () => {
  const [text, setText] = useState('');
  const [voice, setVoice] = useState('alloy'); // デフォルトの音声を'alloy'に設定
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerateSpeech = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post('/api/tts', { text, voice });
      setAudioUrl(response.data.audioUrl);
      console.log('Audio URL:', response.data.audioUrl);  // URLをコンソールに出力して確認
    } catch (error) {
      console.error('Error generating speech:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Text to Speech</h1>
      <textarea
        rows={4}
        value={text}
        onChange={(e) => setText(e.target.value)}
        style={{ width: '100%', marginBottom: '1rem' }}
      />
      <select value={voice} onChange={(e) => setVoice(e.target.value)} style={{ width: '100%', marginBottom: '1rem' }}>
        <option value="alloy">Alloy</option>
        <option value="echo">Echo</option>
        <option value="fable">Fable</option>
        <option value="onyx">Onyx</option>
        <option value="nova">Nova</option>
        <option value="shimmer">Shimmer</option>
      </select>
      <button onClick={handleGenerateSpeech} disabled={isLoading}>
        {isLoading ? 'Generating...' : 'Generate Speech'}
      </button>
      {isLoading && <p>Loading...</p>}
      {audioUrl && (
        <>
          <audio controls src={audioUrl} style={{ display: 'block', marginTop: '1rem' }} />
          <a href={audioUrl} download="speech.mp3" style={{ display: 'block', marginTop: '1rem' }}>
            Download Audio
          </a>
        </>
      )}
    </div>
  );
};

export default Home;
