const { MongoClient } = require('mongodb');
const { decomposeUnverifiedJwt } = require("aws-jwt-verify/jwt");
const moment = require("moment-timezone");

const documentURL = process.env.DOCUMENTDB_URL
const databaseName = process.env.DATABASE_NAME
const collectionName = process.env.COLLECTION_NAME

exports.handler = async (event) => {
    let client;

    try {
        // Extração do payload do token
        const { payload } = decomposeUnverifiedJwt(event.headers.Authorization);
        console.log(`Payload: ${JSON.stringify(payload)}`);

        // Obtendo ID do funcionário a partir do payload do token
        const matricula = payload['custom:matricula'];
        const username = payload['cognito:username'];
        const email = payload['email'];
        const dataInicial = event?.queryStringParameters?.dataInicial;
        const dataFinal = event?.queryStringParameters?.dataFinal;

        // Validação das entradas
        if (!moment(dataInicial, moment.ISO_8601, true).isValid() || !moment(dataFinal, moment.ISO_8601, true).isValid()) {
            // Retornar erro de validação
            return {
                statusCode: 400,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ message: "Parâmetros dataInicial e/ou dataFinal não encontrados ou inválidos (YYYY-MM-DDTHH:mm:ss)" })
            };
        }

        // Conexão com o DocumentDB
        // const mongo = new MongoClient(documentURL);
        // console.log(`Conectando ao banco de dados`);
        // client = await mongo.connect(documentURL);
        // const database = client.db(databaseName);

        // console.log(`Consultando registros de ponto de ${dataInicial} a ${dataFinal} para o funcionário ${username}`);

        // let clocks = await database.collection(collectionName).aggregate([
        //     {
        //         $match: {
        //             matricula: matricula,
        //             timestamp: {
        //                 $gte: dataInicial,
        //                 $lte: dataFinal
        //             }
        //         }
        //     },
        //     {
        //         $group: {
        //             _id: { $dateToString: { format: "%Y-%m-%d", date: { $toDate: "$timestamp" } } },
        //             registros: { $push: "$$ROOT" } // Agrupa os documentos em um array
        //         }
        //     },
        //     {
        //         $replaceRoot: {
        //             newRoot: { $arrayToObject: [[{ k: "$_id", v: "$registros" }]] } // Transforma o array em objeto com a data como chave
        //         }
        //     }
        // ]).toArray();

        let clocks = [
            {
                "2024-03-20":[
                    {
                       "_id":"65fae4470e5fc78b88708db3",
                       "username":null,
                       "matricula":"111",
                       "ocorrencia":"entrada",
                       "timestamp":"2024-03-20T10:27:35"
                    },
                    {
                       "_id":"65fae44f0e5fc78b88708db4",
                       "username":null,
                       "matricula":"111",
                       "ocorrencia":"saida",
                       "timestamp":"2024-03-20T10:27:43"
                    },
                    {
                       "_id":"65fae4530e5fc78b88708db5",
                       "username":null,
                       "matricula":"111",
                       "ocorrencia":"entrada",
                       "timestamp":"2024-03-20T10:27:47"
                    },
                    {
                       "_id":"65fb2e431a3fa06170c018ee",
                       "username":null,
                       "matricula":"111",
                       "ocorrencia":"saida",
                       "timestamp":"2024-03-20T15:43:15"
                    }
              ],
              "2024-03-21":[
                 {
                    "_id":"65fae4470e5fc78b88708db3",
                    "username":null,
                    "matricula":"111",
                    "ocorrencia":"entrada",
                    "timestamp":"2024-03-21T08:00:00"
                 },
                 {
                    "_id":"65fae44f0e5fc78b88708db4",
                    "username":null,
                    "matricula":"111",
                    "ocorrencia":"saida",
                    "timestamp":"2024-03-21T12:00:00"
                 },
                 {
                    "_id":"65fae4530e5fc78b88708db5",
                    "username":null,
                    "matricula":"111",
                    "ocorrencia":"entrada",
                    "timestamp":"2024-03-21T13:00:00"
                 },
                 {
                    "_id":"65fb2e431a3fa06170c018ee",
                    "username":null,
                    "matricula":"111",
                    "ocorrencia":"saida",
                    "timestamp":"2024-03-21T18:00:00"
                 }
              ]
            }
         ]
    let registros = [];
    let totalHorasTrabalhadas = 0;

    // composicao do calculo de horas trabalhadas, por dia.
    clocks.map((registro) => {
        const datas = Object.keys(registro);
        
        datas.forEach((data) => {
            console.log(`data: ${JSON.stringify(data)}`)

            const ocorrencia = calcularHorasPorDia(registro[data]);
            totalHorasTrabalhadas += ocorrencia.horasTrabalhadas;
            registros.push({
                [data]: {
                    horasTrabalhadas: formatarDuracao(ocorrencia.horasTrabalhadas),
                    ocorrencias: ocorrencia.ocorrencias
                }
            })
        })
    });

        // Retornar os registros de ponto
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: username,
                matricula: matricula,
                email: email,
                periodo: {
                    dataInicial: dataInicial,
                    dataFinal: dataFinal,
                    totalDiasTrabalhados: registros.length,
                    totalHorasTrabalhadas: formatarDuracao(totalHorasTrabalhadas),
                },
                registros: registros
            })
        };
    } catch (error) {
        console.error('Erro ao visualizar registros de ponto', error);
        // Retornar erro na consulta
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message: "Erro ao visualizar registros de ponto." })
        };
    } finally {
        if (client) {
            await client.close();
        }
    }
};


const calcularDuracaoHorasTrabalhadas = (entrada, saida) => {
    const diff = moment(saida.timestamp).diff(moment(entrada.timestamp));
    return moment.duration(diff).asSeconds();
};

const calcularHorasPorDia = (registrosDoDia) => {
    let totalDuracaoSegundos = 0;
    const ocorrencias = [];

    let entrada = null;

    registrosDoDia.forEach((registro, index) => {
        if (registro.ocorrencia === 'entrada') {
            entrada = registro;
        } else if (registro.ocorrencia === 'saida' && entrada) {
            const duracaoSegundos = calcularDuracaoHorasTrabalhadas(entrada, registro);
            console.log(`duracaoSegundos: ${duracaoSegundos} -->> entrada: ${entrada.timestamp} registro: ${registro.timestamp}`)
            totalDuracaoSegundos += duracaoSegundos;
            ocorrencias.push(entrada);
            ocorrencias.push(registro);
            entrada = null; // Resetar o registro de entrada para o próximo conjunto
        }
    });

    return { horasTrabalhadas: totalDuracaoSegundos, ocorrencias };
};

const formatarDuracao = (totalDuracaoSegundos) => {
    const duracao = moment.duration(totalDuracaoSegundos, 'seconds');
    const horas = duracao.hours().toString().padStart(2, '0');
    const minutos = duracao.minutes().toString().padStart(2, '0');
    const segundos = duracao.seconds().toString().padStart(2, '0');
    return `${horas}:${minutos}:${segundos}`;
};