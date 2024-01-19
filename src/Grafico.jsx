import { useEffect, useState } from 'react'
import './grafico.css'
import { Chart } from "react-google-charts"
import axios from 'axios';

function Grafico() {

  let [data, setData] = useState([])
  let [atendTotal, setAtendTotal] = useState([])
  let [ultimoMes, setultimoMes] = useState([])
  let [learnAtual, setLearnAtual] = useState([])

  useEffect(() => {

    const fetchData = async () => {
      try {
        // Configuração do cabeçalho para contornar o CORS
        const response = await axios.get('http://192.168.62.76:8000/api/dados',);

        // Estruturando os dados para o formato que a biblioteca de gráficos espera
        const formattedData = [["Tarefas", "Horas"]];
        const atendTotal = [["Mês", "Atendimentos", "Erros por Chamado", "Erros por Analise"]];
        const formattedMesAtual = [["Tarefas", "Horas"]]
        const formattedLearnAtual = []

        let dadosAno = response.data.data
        let somaTarefas = {};

        console.log(dadosAno)

        // Iterar sobre cada mês
        for (const mes in dadosAno) {
          // Iterar sobre cada tarefa do mês
          for (const tarefa of dadosAno[mes]) {
            // Verificar se a tarefa já existe no objeto somaTarefas
            if (!somaTarefas[tarefa.Tarefa]) {
              somaTarefas[tarefa.Tarefa] = 0;
            }
            // Adicionar o valor Total_Valid ao total da tarefa
            somaTarefas[tarefa.Tarefa] += tarefa.Total_Valid;
          }
        }

        // Converter o objeto em um array de objetos
        const anoInteiro = Object.entries(somaTarefas).map(([tarefa, total]) => ({ Tarefa: tarefa, Total_Valid: total }));
        anoInteiro.forEach(({ Tarefa, Total_Valid }) => {
          if (Tarefa != "Atendimento Concluido" && Tarefa != "Card de Erro por Chamados" && Tarefa != "Card de Erro por Analise") {
            formattedData.push([Tarefa, Total_Valid]);
          }
        });
     
        //Pega somente as Tarefas do Mês Atual (horas)
        for (const mes in dadosAno) {
          // Verificar se a tarefa já existe no objeto somaTarefas
          if (mes === Object.keys(dadosAno).slice(-1)[0]) {
            for (const tarefa of dadosAno[mes]) {
              if (tarefa.Tarefa !== "Atendimento Concluido" && tarefa.Tarefa !== "Card de Erro por Chamados" && tarefa.Tarefa !== "Card de Erro por Analise") {
                formattedMesAtual.push([tarefa.Tarefa, tarefa.Total_Valid]);
              }
            }
          }
        }

        for (const mes in dadosAno) {
          // Verificar se a tarefa já existe no objeto somaTarefas
          if (mes === Object.keys(dadosAno).slice(-1)[0]) {
            for (const tarefa of dadosAno[mes]) {
              formattedLearnAtual.push([tarefa.Tarefa,tarefa.Resultado_e_Aprendizado])
            }
          }
        }


        //Pega somente as tarefas selecionadas
        for (const mes in dadosAno) {
          if (dadosAno[mes].find(tarefa => tarefa.Tarefa === "Atendimento Concluido")) {
            atendTotal.push([mes, dadosAno[mes].find(tarefa => tarefa.Tarefa === "Atendimento Concluido").Total_Valid]);
          }
          // if (dadosAno[mes].find(tarefa => tarefa.Tarefa === "Atendimento Pendente")) {
          //   atendTotal[atendTotal.length - 1].push(dadosAno[mes].find(tarefa => tarefa.Tarefa === "Atendimento Pendente").Total_Valid);
          // }
          // if (dadosAno[mes].find(tarefa => tarefa.Tarefa === "Atendimento Atrasado")) {
          //   atendTotal[atendTotal.length - 1].push(dadosAno[mes].find(tarefa => tarefa.Tarefa === "Atendimento Atrasado").Total_Valid);
          // }
          if (dadosAno[mes].find(tarefa => tarefa.Tarefa === "Card de Erro por Chamados")) {
            atendTotal[atendTotal.length - 1].push(dadosAno[mes].find(tarefa => tarefa.Tarefa === "Card de Erro por Chamados").Total_Valid);
          }
          if (dadosAno[mes].find(tarefa => tarefa.Tarefa === "Card de Erro por Analise")) {
            atendTotal[atendTotal.length - 1].push(dadosAno[mes].find(tarefa => tarefa.Tarefa === "Card de Erro por Analise").Total_Valid);
          }
        }

        console.log(atendTotal)
        setultimoMes(formattedMesAtual)
        setData(formattedData);
        setAtendTotal(atendTotal)
        setLearnAtual(formattedLearnAtual)

      } catch (error) {
        console.error('Erro ao buscar dados:', error);
      }
    };

    fetchData();
  }, [])

  function minToHours(min) {
    var horas = Math.floor(min / 60);
    var minRestantes = min % 60;

    // Adiciona um zero à esquerda se os min forem menores que 10
    if (minRestantes < 10) {
      minRestantes = "0" + minRestantes;
    }

    return horas + ":" + minRestantes;
  }

  let minTotal = 0
  for (let i = 1; i < data.length; i++) {
    minTotal = minTotal + data[i][1]
  }

  let totalAtendimentos = 0
  for (let y = 1; y < atendTotal.length; y++) {
    totalAtendimentos = totalAtendimentos + atendTotal[y][1]
  }

  let ultimoMesminTotal = 0
  for (let x = 1; x < ultimoMes.length; x++) {
    ultimoMesminTotal = ultimoMesminTotal + ultimoMes[x][1]
  }

  console.log(learnAtual)
  // Ordenando o array sem o cabeçalho com base nas horas em ordem decrescente
  const dataWithoutHeader = data.slice(1);
  const sortedData = dataWithoutHeader.sort((a, b) => b[1] - a[1]);

  const ultimoMesWithouHeader = ultimoMes.slice(1)
  const sortedultimoMes = ultimoMesWithouHeader.sort((a, b) => b[1] - a[1]);
  return (
    <div className='Conteiner-Graphics'>
      <h1>Resultados Da Retrospectiva</h1>

      <h2>Total de Atendimentos: {totalAtendimentos}</h2>

      {/* Grafico total de atendimentos */}
      <div className="atendimento-erro">

        <Chart
          chartType="Bar"
          width="800px"
          height="300px"
          data={atendTotal}
          options={{
            colors: ['#34ea80', '#dd7f32','#c9452e'],
          }}
        />
      </div>

      {/* {Tabela Mes Atual} */}

      <h2>Total de Horas (ultimo Mês): {minToHours(ultimoMesminTotal)}</h2>
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
              {sortedultimoMes.map((item, index) => (
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
          data={ultimoMes}
          width={"100%"}
          height={"600px"}
        />
      </div>

      <div className="container-table-learnig">
        <h2>Aprendizados deste Mês:</h2>
        <table className='table-learning'>
            <thead>
              <tr>
                <th>Tarefa</th>
                <th>Aprendizado</th>
              </tr>
            </thead>
            <tbody>
              {learnAtual.map((item, index) => (
                <tr key={index}>
                  <td>{item[0]}</td>
                  <td>{item[1]}</td>
                </tr>
              ))}
            </tbody>
          </table>
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

      
    </div>
  )
}

export default Grafico
