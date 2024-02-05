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




def consult_files():
    try:
        # Pasta compartilhada onde os arquivos estão localizados
        folder_path = r"C:\Users\guilherme.santos\AGROCONTAR CONSULTORIA CONTABIL LTDA\Suporte - Documentos\Arquivos\Retrospectiva\Relatorios"

        # Obtém a lista de arquivos na pasta compartilhada
        files = os.listdir(folder_path)

        # Verifica se há arquivos na pasta
        if not files:
            print("Nenhum arquivo encontrado na pasta compartilhada.")

        # Assume o primeiro arquivo da lista como o arquivo a ser processado
        file = os.path.join(folder_path, files[0])

        #Define o Padrao de Paginas Desejado
        paginas_desejadas = ['NOV - 2023', 'DEZ - 2023', 'JAN - 2024', 'FEV - 2024', 'MAR - 2024', 'ABR - 2024', 'MAI - 2024', 'JUN - 2024', 'JUL - 2024', 'AGO - 2024', 'SET - 2024', 'OUT - 2024', 'NOV - 2024','DEZ - 2024',]

        global df_final
        df_final = {}
        for file in files:
            arquivo = os.path.join(folder_path, file)
            #Faz um loop pelo arquivo guardando as Paginas Desejadas dentro do dicionario.
            dados_por_pagina = {}
            for pagina in paginas_desejadas:
                if pagina in pd.ExcelFile(arquivo).sheet_names:
                    dados_por_pagina[pagina] = pd.read_excel(arquivo, sheet_name=pagina)
                    print(f"A pagina {pagina} do arquivo {file} foi lida com sucesso!")

            #Cria a coluna Valida e coloca o array convertido em float
            for pagina, df_atual in zip(paginas_desejadas, dados_por_pagina.values()):
                df_atual['Total_Valid'] = [convert_to_float(val) for val in df_atual['Total']]

            #Cria um novo df somente com as colunas validas e armazena no df_final
            # Cria um novo df somente com as colunas validas e armazena no df_final
            for pagina in dados_por_pagina:
                if file not in df_final:
                    df_final[file] = {}
                df_final[file][pagina] = dados_por_pagina[pagina][['Tarefa', 'Total_Valid', 'Resultado_e_Aprendizado']]
                df_final[file][pagina]['Resultado_e_Aprendizado'] = df_final[file][pagina]['Resultado_e_Aprendizado'].fillna("nenhum")


        return {"message": "Arquivo processado com sucesso!"}
    except Exception as e:
        return {"message": f"Erro ao processar o arquivo: {str(e)}"}

consult_files()
print(df_final)
@app.get("/api/dados")
def obter_dados():
    try:
        # Cria um novo dicionário para armazenar os dados formatados
        formatted_data = {}

        # Itera sobre os arquivos e páginas no df_final
        for arquivo, paginas in df_final.items():
            arquivo_data = {}
            # Itera sobre as páginas em cada arquivo
            for pagina, df in paginas.items():
                # Converte o DataFrame para uma lista de dicionários
                pagina_data = df.to_dict(orient='records')
                # Adiciona os dados da página ao dicionário do arquivo
                arquivo_data[pagina] = pagina_data
            # Adiciona os dados do arquivo ao dicionário formatado
            formatted_data[arquivo] = arquivo_data

        response_data = {"data": formatted_data}
        return JSONResponse(content=response_data)
    except Exception as e:
        return JSONResponse(content={"error": f"Erro ao obter os dados: {str(e)}"})

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

