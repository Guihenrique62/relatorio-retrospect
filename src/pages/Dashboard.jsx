import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { Chart } from "react-google-charts"
import '../styles/Dashboard.css'
import UserContainer from '../components/UserContainer';

export default function Dashboard() {
    const [atendimentosTotais, setAtendimentosTotais] = useState([])
    const [top5Tarefas, setTop5Tarefas] = useState([])
    const [nomesUsuario, setNomesUsuario] = useState([])
    const [loader, setLoader] = useState(false)

    useEffect(() => {

        function removerAcentos(str) {
            return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        }

        const fetchData = async () => {
        try {
            // Configuração do cabeçalho para contornar o CORS
            const response = await axios.get('http://192.168.62.106:8000/api/dados');
            let totalData = response.data.data;
            const atendTotal = [["Mês", "Atendimentos", "Erros por Chamado", "Erros por Analise"]];

            // Objeto para armazenar temporariamente os totais de atendimentos de cada mês para cada usuário
            const totalAtendimentos = {};
            const totalChamadosErr = {}
            const totalErrAnalis = {}
            const totalHorasPorTarefa = {};
            const top5tarefasTotal = [['Tarefa','Horas']]
            const namesOfUsers = []

            // Calcula os totais de atendimentos de cada usuário por mês
            for (const user in totalData) {
                namesOfUsers.push(user.slice(0, -5))
                for (const mes in totalData[user]) {
                    const antendimentosMes = totalData[user][mes]
                        .filter(tarefa => removerAcentos(tarefa.Tarefa.toUpperCase()) === "ATENDIMENTO CONCLUIDO")
                        .reduce((acc, curr) => acc + curr.Total_Valid, 0);

                    const errochamadoMes = totalData[user][mes]
                        .filter(tarefa => removerAcentos(tarefa.Tarefa.toUpperCase()) === "CARD DE ERRO POR CHAMADOS")
                        .reduce((acc, curr) => acc + curr.Total_Valid, 0);
                    
                    const erroAnalis = totalData[user][mes]
                        .filter(tarefa => removerAcentos(tarefa.Tarefa.toUpperCase()) === "CARD DE ERRO POR ANALISE")
                        .reduce((acc, curr) => acc + curr.Total_Valid, 0);
                    

                    // Se o mês já existe no objeto, adiciona o total de atendimentos
                    // Senão, cria uma nova entrada para o mês e atribui o total de atendimentos
                    if (totalAtendimentos[mes]) {totalAtendimentos[mes] += antendimentosMes;} else {totalAtendimentos[mes] = antendimentosMes;}
                    if (totalChamadosErr[mes]) {totalChamadosErr[mes] += errochamadoMes;} else {totalChamadosErr[mes] = errochamadoMes;}
                    if (totalErrAnalis[mes]) {totalErrAnalis[mes] += erroAnalis;} else {totalErrAnalis[mes] = erroAnalis;}

                    for (const tarefa of totalData[user][mes]) {
                        const nomeTarefa = removerAcentos(tarefa.Tarefa.toUpperCase())
                        const totalMinutos = tarefa.Total_Valid;
                        const totalHoras = totalMinutos / 60; // Converter minutos para horas
                    
                        if (totalHorasPorTarefa[nomeTarefa]) {
                            totalHorasPorTarefa[nomeTarefa] += totalHoras;
                        } else {
                            totalHorasPorTarefa[nomeTarefa] = totalHoras;
                        }
                    }
                    

                }
            }

            // Cria o array atendTotal a partir dos totais calculados por mês
            for (const mes in totalAtendimentos) {
                atendTotal.push([mes, totalAtendimentos[mes],totalChamadosErr[mes],totalErrAnalis[mes]]);
            }

            // Transforma o objeto em um array de pares [nomeTarefa, totalHoras]
            const totalHorasArray = Object.entries(totalHorasPorTarefa);
            // Ordena o array em ordem decrescente com base nas horas gastas
            totalHorasArray.sort((a, b) => b[1] - a[1]);
            // Seleciona as cinco primeiras tarefas do array ordenado
            const top5Tarefas = totalHorasArray.slice(0, 10);
            
            top5Tarefas.forEach((task)=> {
                top5tarefasTotal.push(task)
            })
            setNomesUsuario(namesOfUsers)
            setTop5Tarefas(top5tarefasTotal)
            setAtendimentosTotais(atendTotal)
            setLoader(true)
        } catch (error) {
            console.error('Erro ao buscar dados:', error);
        }
    };
    fetchData();
}, [])

let totalAtendimentos = 0
for (let y = 1; y < atendimentosTotais.length; y++) {totalAtendimentos = totalAtendimentos + atendimentosTotais[y][1]}


  return (
<>
{loader ? <div className='container_Dashboard'>
        
        <h1 className='tittle-dashboard'>Relatórios da Retrospect</h1>
        <div className='row-container'></div>
        
        <div className='chart-top10'>
            <Chart
            chartType="PieChart"
            width="100%"
            height="100%"
            data={top5Tarefas}
            options={{
                title: "Top 10 Tarefas mais realizadas",
                pieHole: 0.4,
                is3D: false,
                }}
            />
        </div>

        <div className='chart-linha-attend'>
            <Chart
            chartType="LineChart"
            width="100%"
            height="100%"
            data={atendimentosTotais}
            options={{
                title: "Linha de Chamados/Erros",
                curveType: "function",
                legend: { position: "bottom" },
                colors: ['#34ea80', '#dd7f32','#c9452e'],
              }}
            
            />
        </div>


        <div className='chart-attend-total'>
            <p>Total de Atendimentos: {totalAtendimentos}</p>
            <Chart
            chartType="Bar"
            width="90%"
            height="100%"
            data={atendimentosTotais}
            options={{
            colors: ['#34ea80', '#dd7f32','#c9452e'],
            }}
            />
        </div>

        <h1 className='tittle-individual'>Relatórios Individuais</h1>
        <div className='row-container-individual'></div>

        <div className='users-container'>
            {nomesUsuario.map((name, index) => (
                <UserContainer key={index} name={name}></UserContainer>
            ))}

        </div>
    </div> : <div>Carregando...</div>}
    
    
  </>
  )
}
