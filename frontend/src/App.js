import React, { useState } from 'react';
import axios from 'axios';
import './App.css'; // Import the CSS file

function App() {
  const [message, setMessage] = useState('');
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [response, setResponse] = useState(null);

  const handleImageChange = (event) => {
    const files = event.target.files;
    const newImages = [];
    const newImagePreviews = [];

    for (let i = 0; i < files.length; i++) {
      newImages.push(files[i]);

      const reader = new FileReader();
      reader.onload = (e) => {
        newImagePreviews.push(e.target.result);
        setImagePreviews((prevPreviews) => [...prevPreviews, e.target.result]);
      };
      reader.readAsDataURL(files[i]);
    }

    setImages((prevImages) => [...prevImages, ...newImages]);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const formData = new FormData();
    formData.append('message', message);
    for (let i = 0; i < images.length; i++) {
      formData.append('files', images[i]); // Changed 'images' to 'files'
    }

    try {
      const res = await axios.post('http://localhost:5000/post', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setResponse(res.data);
    } catch (error) {
      console.error('Error posting on Facebook:', error.response ? error.response.data : error.message);
      setResponse(error.response ? error.response.data : 'Error posting on Facebook');
    }
  };

  return (
    <div className="App">
      <h1>Post on Facebook</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Message:</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </div>
        <div>
          <label>Images:</label>
          <input
            type="file"
            multiple
            onChange={handleImageChange}
          />
          <div className="image-previews">
            {imagePreviews.map((src, index) => (
              <img key={index} src={src} alt={`Preview ${index}`} />
            ))}
          </div>
        </div>
        <button type="submit">Post</button>
      </form>
      {response && <div>{JSON.stringify(response)}</div>}
    </div>
  );
}

export default App;
