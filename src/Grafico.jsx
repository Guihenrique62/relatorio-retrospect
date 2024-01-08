import { useEffect, useState } from 'react'
import './grafico.css'
import { Chart } from "react-google-charts"
import axios from 'axios';

function Grafico() {

  let [data, setData] = useState([])
  let [atendTotal, setAtendTotal] = useState([])
  let [mesAtual, setMesAtual] = useState([])

  useEffect(()=>{
   
    const fetchData = async () => {
      try {
        // Configuração do cabeçalho para contornar o CORS
        const response = await axios.get('http://localhost:8000/api/dados',);

        // Estruturando os dados para o formato que a biblioteca de gráficos espera
        const formattedData = [["Tarefas", "Horas"]];
        const atendTotal = [["Mês", "Atendimentos", "Erros"]];
        const mesAtual = [["Tarefas", "Horas"]];

    
        for (const key in response.data.group_data) {
          if (key !== "Atendimento concluido" && key !== "Elaboração card de erro/melhoria") {
            formattedData.push([key, response.data.group_data[key].TOTAL_VALID]);
        }
        }

        for (const key in response.data.dez_df_concat) {
          if (response.data.dez_df_concat[key].Tarefa !== "Atendimento concluido" && response.data.dez_df_concat[key].Tarefa !== "Elaboração card de erro/melhoria") {
            mesAtual.push([response.data.dez_df_concat[key].Tarefa, response.data.dez_df_concat[key].TOTAL_VALID]);
        }
        }


        for (const key in response.data.nov_df_concat) {
          if (response.data.nov_df_concat[key].Tarefa === "Atendimento concluido") {
            atendTotal.push(["Nov", response.data.nov_df_concat[key].TOTAL_VALID]);
             
          }
          if (response.data.nov_df_concat[key].Tarefa === "Elaboração card de erro/melhoria") {
            atendTotal[atendTotal.length - 1].push(response.data.nov_df_concat[key].TOTAL_VALID);
          }
        }

        for (const key in response.data.dez_df_concat) {
          if (response.data.dez_df_concat[key].Tarefa === "Atendimento concluido") {
            atendTotal.push(["Dez", response.data.dez_df_concat[key].TOTAL_VALID]);
             
          }
          if (response.data.dez_df_concat[key].Tarefa === "Elaboração card de erro/melhoria") {
            atendTotal[atendTotal.length - 1].push(response.data.dez_df_concat[key].TOTAL_VALID);
          }
        }

        console.log(atendTotal)
        setData(formattedData);
        setAtendTotal(atendTotal)
        setMesAtual(mesAtual)
        
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
      }
    };

    fetchData();
  },[])
  
  function minToHours (min) {
    var horas = Math.floor(min / 60);
    var minRestantes = min % 60;
  
    // Adiciona um zero à esquerda se os min forem menores que 10
    if (minRestantes < 10) {
      minRestantes = "0" + minRestantes;
    }
  
    return horas + ":" + minRestantes;
  }
  
  let minTotal = 0
  for ( let i = 1; i < data.length; i++){
      minTotal = minTotal + data[i][1]
  }

  let totalAtendimentos = 0
  for (let y = 1; y < atendTotal.length; y++){
    totalAtendimentos = totalAtendimentos + atendTotal[y][1]
  }

  let mesAtualminTotal = 0
  for ( let x = 1; x < mesAtual.length; x++){
    mesAtualminTotal = mesAtualminTotal + mesAtual[x][1]
}

  // Ordenando o array sem o cabeçalho com base nas horas em ordem decrescente
  const dataWithoutHeader = data.slice(1);
  const sortedData = dataWithoutHeader.sort((a, b) => b[1] - a[1]);

  const mesAtualWithouHeader = mesAtual.slice(1)
  const sortedMesAtual= mesAtualWithouHeader.sort((a, b) => b[1] - a[1]);
  return (
    <>
      <h1>Resultados Da Retrospectiva</h1>

      <h2>Total de Atendimentos: {totalAtendimentos}</h2>

      {/* Grafico total de atendimentos */}
      <div className="atendimento-erro">
        <Chart
        chartType="Bar"
        width="90%"
        height="300px"
        data={atendTotal}
        />
      </div>

    {/* {Tabela Mes Atual} */}

    <h2>Total de Horas (ultimo Mês): {minToHours(mesAtualminTotal)}</h2>
    <div className="container-grafico-tabela">
      <div className='tabela-mes-atual'>
        <table>
          <thead>
            <tr>
              <th>Tarefa</th>
              <th>Horas</th>
            </tr>
          </thead>
          <tbody>
            {sortedMesAtual.map((item, index) => (
              <tr key={index}>
                <td>{item[0]}</td>
                <td>{minToHours(item[1])}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Chart
          chartType="PieChart"
          data={mesAtual}
          width={"100%"}
          height={"600px"}
        />
    </div>




    {/* Tabela total de horas */}
    <h2>Total de Horas (Todos Os Meses): {minToHours(minTotal)}</h2>
    <div className="container-grafico-tabela">
      <div className='tabela-mes-atual'>
        <table>
          <thead>
            <tr>
              <th>Tarefa</th>
              <th>Horas</th>
            </tr>
          </thead>
          <tbody>
            {sortedData.map((item, index) => (
              <tr key={index}>
                <td>{item[0]}</td>
                <td>{minToHours(item[1])}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
        {/* Grafico total de Horas */}
        <Chart
          chartType="PieChart"
          data={data}
          width={"100%"}
          height={"600px"}
        />
    </div>

    </>
  )
}

export default Grafico
