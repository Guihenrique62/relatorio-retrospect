import React, { useState } from 'react';
import axios from 'axios';
import './app.css'

export default function App() {
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      await axios.post('http://192.168.62.119:8000/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      alert('Arquivo enviado com sucesso!');
    } catch (error) {
      console.error('Erro ao enviar o arquivo:', error.message);
    }
  };

  return (
    <div className='conteiner-upload-home'>
      <h1 className='upload-title'>Upload do Relatório</h1>

      <div className="image-upload-container">
        <img src="/upload.png" alt="upload-image" className='upload-image'/>
        <div className="container-input-upload">
          <label for="fileInput" class="custom-file-input">Escolha um arquivo</label>
          <input type="file" id="fileInput" onChange={handleFileChange}></input>
        <button onClick={handleUpload} className='upload-button'>{'>'}</button>
      </div>
      </div>
      
    </div>
  );
}