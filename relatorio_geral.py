import pandas as pd
import datetime
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import numpy as np
import uvicorn
import os
#Abre a Api e Configura os Parametros
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

#Converte o valor recebido como Date.time em float
def convert_to_float(value):
    if isinstance(value, (int, float)):
        if value > 0:
            return value
        else:
            return 0
    elif isinstance(value, (datetime.datetime, datetime.time, np.ndarray)):
        if isinstance(value, np.ndarray):
            # Se for um array numpy, aplicar a função a cada elemento
            return [convert_to_float(val) for val in value]
        elif isinstance(value, datetime.datetime):
            # Se for datetime.datetime, converter dias e horas para minutos
            return value.day * 24 * 60 + value.hour * 60 + value.minute
        elif isinstance(value, datetime.time):
            # Se for datetime.time, converter para minutos
            return value.hour * 60 + value.minute
    else:
        raise ValueError(f'Tipo não suportado: {type(value)}')

df_final = {}

@app.post("/api/upload")
async def upload_file(file: UploadFile = File(...)):

    try:

        # Caminho completo para salvar o arquivo na pasta "relatorios"
        relatorios_folder = "relatorios"
        file_path = os.path.join(relatorios_folder, file.filename)

        # Salva o arquivo no diretório de relatórios
        with open(file_path, "wb") as buffer:
            buffer.write(file.file.read())

        arquivo = file_path
        #Define o Padrao de Paginas Desejado
        paginas_desejadas = ['NOV - 2023', 'DEZ - 2023', 'JAN - 2024', 'FEV - 2024', 'MAR - 2024', 'ABR - 2024', 'MAI - 2024', 'JUN - 2024', 'JUL - 2024', 'AGO - 2024', 'SET - 2024', 'OUT - 2024', 'NOV - 2024','DEZ - 2024',]

        #Faz um loop pelo arquivo guardando as Paginas Desejadas dentro do dicionario.
        dados_por_pagina = {}
        for pagina in paginas_desejadas:
            if pagina in pd.ExcelFile(arquivo).sheet_names:
                    dados_por_pagina[pagina] = pd.read_excel(arquivo, sheet_name=pagina)
                    print(f"A pagina {pagina} Foi lida com sucesso!")

        
        #Faz um loop em todos as paginas e guarda o valor total de cada uma em um array
        arr_total = []
        for df_atual in dados_por_pagina:
            arr_total.append(dados_por_pagina[df_atual]['Total'].to_numpy())

        #Cria a coluna Valida e coloca o array convertido em float
        for pagina, df_atual in zip(paginas_desejadas, dados_por_pagina.values()):
            df_atual['Total_Valid'] = [convert_to_float(val) for val in df_atual['Total']]

        # #Cria um novo df somente com as colunas validas
        
        for pagina in dados_por_pagina:
            df_final[pagina] = dados_por_pagina[pagina][['Tarefa','Total_Valid','Resultado_e_Aprendizado']]
            df_final[pagina]['Resultado_e_Aprendizado'] = df_final[pagina]['Resultado_e_Aprendizado'].fillna("nenhum")


        return {"message": "Arquivo processado com sucesso!"}
    
    except Exception as e:
        # Trate exceções e retorne uma resposta apropriada
        raise HTTPException(status_code=500, detail=f"Erro ao processar o arquivo: {str(e)}")



@app.get("/api/dados")
def obter_dados():
    response_data = {
        "data": {pagina: df.to_dict(orient='records') for pagina, df in df_final.items()}
    }
    return JSONResponse(content=response_data)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

