import React, { useState } from 'react';
import axios from 'axios';
import './upload.css'
import Grafico from './grafico';
import { Link } from 'react-router-dom';

export default function Upload() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [renderGraphic, setRenderGraphic] = useState(false)
 

  const handleFileChange = (event) => {
    const file = event.target.files[0];

    if (file && file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
      setSelectedFile(file);
    } else {
      setSelectedFile(null);
      alert('Por favor, selecione um arquivo no formato xlsx.');
    }
  };

  const handleUpload = async () => {
    try {
      if (!selectedFile) {
        alert('Por favor, selecione um arquivo no formato xlsx.');
        return;
      }

      const formData = new FormData();
      formData.append('file', selectedFile);

      await axios.post('http://192.168.62.119:8000/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setRenderGraphic(true)

    } catch (error) {
      console.error('Erro ao enviar o arquivo:', error.message);
      alert('Erro ao Enviar arquivo: O arquivo enviado não corresponde ao padrão!')
    }
  };

  return (
        <>
            <h1 className='upload-title'>Upload do Relatório</h1>

        <div className="image-upload-container">
        <img src="/upload.png" alt="upload-image" className='upload-image'/>
        <div className="input-group mb-3">
            <input type="file" className="form-control" id="inputGroupFile02" onChange={handleFileChange} accept=".xlsx"></input>
            <button className="input-group-text label-upload"  onClick={handleUpload}>Upload</button>
        </div>

        {renderGraphic ? 
        <div className='linkToGraphic-container'>
            <label>Relatório gerado com Sucesso!</label>
            <Link to={'/graphic'} className='LinkToGraphic'>Ver Resultados</Link>
        </div> : null}
        
        </div>
      
    </>
  );
}
