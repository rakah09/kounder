import { useState } from 'react'
import './App.css'

// Update this URL to your backend server or ngrok tunnel
const WEB_URL = import.meta.env.VITE_API_URL

function App() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedFormat, setSelectedFormat] = useState('mp4')
  const [downloadLink, setDownloadLink] = useState('')
  const [thumbnail, setThumbnail] = useState('')
  const [title, setTitle] = useState('')

  const formats = [
    { id: 'mp4', label: 'Video', quality: 'HD' },
    { id: 'mp3', label: 'Audio', quality: '320kbps' }
  ]

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setDownloadLink('')
    setThumbnail('')
    setTitle('')

    if (!url.includes('youtube.com') && !url.includes('youtu.be')) {
      setError('Please enter a valid YouTube URL')
      setLoading(false)
      return
    }

    try {
      let endpoint = ''
      if (selectedFormat === 'mp4' || selectedFormat === 'webm') {
        endpoint = `/getDownloadLink?url=${encodeURIComponent(url)}`
      } else if (selectedFormat === 'mp3') {
        endpoint = `/getAudioLink?url=${encodeURIComponent(url)}`
      }

      const fullUrl = `${WEB_URL}${endpoint}`
      const response = await fetch(fullUrl)

      const responseText = await response.text()
      let data
      try {
        data = JSON.parse(responseText)
      } catch (parseError) {
        throw new Error('Server returned invalid JSON')
      }

      if (!response.ok) {
        throw new Error(data.error || 'Failed to process video')
      }

      const link = selectedFormat === 'mp3' ? data.audioLink : data.downloadLink
      console.log(link, "KINK");
      
      setDownloadLink(link)
      setTitle(data.title || 'Video')
      setThumbnail(data.thumbnail || '')
    } catch (err) {
      if (err.name === 'TypeError' && err.message.includes('Failed to fetch')) {
        setError('Network error: Could not connect to the server')
      } else {
        setError(err.message || 'An error occurred while processing the video')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleThumbnailClick = () => {
    if (!downloadLink) return

    const a = document.createElement('a')
    a.href = downloadLink
    a.download = `video.${selectedFormat}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  return (
    <div className="container">
      <div className="content">
        <h1>Video & Audio Downloader</h1>
        <p className="subtitle">Download videos and audio in high quality formats</p>

        <form onSubmit={handleSubmit} className="download-form">
          <div className="input-group">
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Paste video URL here"
              className="url-input"
            />
            <button
              type="submit"
              className="download-button"
              disabled={loading || !url.trim()}
            >
              {loading ? 'Processing...' : 'Download'}
            </button>
          </div>

          <div className="format-selection">
            {formats.map((format) => (
              <label key={format.id} className="format-option">
                <input
                  type="radio"
                  name="format"
                  value={format.id}
                  checked={selectedFormat === format.id}
                  onChange={(e) => setSelectedFormat(e.target.value)}
                />
                <span className="format-label">
                  <span className="format-name">{format.label}</span>
                  <span className="format-quality">{format.quality}</span>
                </span>
              </label>
            ))}
          </div>

          {error && <p className="error-message">{error}</p>}
        </form>

        {downloadLink && thumbnail && (
          <div className="video-preview">
            <h2 className="video-title">{title}</h2>
            <img
              src={thumbnail}
              alt="Video thumbnail"
              className="thumbnail-image"
              onClick={handleThumbnailClick}
              style={{ cursor: 'pointer', maxWidth: '100%', borderRadius: '8px', marginTop: '10px' }}
            />
            <p>Click the thumbnail to start the download</p>
          </div>
        )}

        <div className="features">
          <div className="feature">
            <h3>High Quality</h3>
            <p>Download videos in HD quality with multiple format options</p>
          </div>
          <div className="feature">
            <h3>Fast & Secure</h3>
            <p>Quick downloads with secure processing and no ads</p>
          </div>
          <div className="feature">
            <h3>Free Service</h3>
            <p>No registration required, unlimited downloads</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
