# Lambda de Consulta de Registro de Ponto: lambda-query-clock.js

Este lambda é responsável pela consulta do registro de ponto dos funcionários no sistema utilizando o serviço AWS DocumentDB.

## Contrato
- **Entrada**: Espera uma solicitação HTTP contendo um token de autorização no cabeçalho `Authorization` seguindo o esquema "Bearer" e opcionalmente os parâmetros de consulta `dataInicial` e `dataFinal` no formato ISO 8601 (`YYYY-MM-DDTHH:mm:ss`).
- **Saída de Sucesso**: Retorna um código de status 200 e um objeto JSON contendo as informações do registro de ponto.
- **Saída de Erro**: Em caso de erro, retorna um código de status 4xx ou 5xx e uma mensagem de erro no formato JSON.

## Funcionamento
1. Extrai o payload do token de autorização.
2. Obtém os dados de matrícula, nome de usuário, e-mail e intervalo de datas (se fornecidos).
3. Valida a presença e a validade dos parâmetros de consulta de data.
4. Conecta-se ao banco de dados AWS DocumentDB.
5. Consulta os registros de ponto dentro do intervalo de datas fornecido para o funcionário especificado.
6. Calcula as horas trabalhadas e prepara a resposta.
7. Retorna os registros de ponto em formato JSON.

## Integrações
- Este lambda integra-se com o serviço AWS DocumentDB para consulta de registros de ponto.

## Variáveis de Ambiente
- `DOCUMENTDB_URL`: URL de conexão ao AWS DocumentDB.
- `DATABASE_NAME`: Nome do banco de dados no AWS DocumentDB.
- `COLLECTION_NAME`: Nome da coleção no AWS DocumentDB.

## Exemplos

|**Requisição**|**Resposta de Sucesso**| **Reposta Validações (400)**| **Reposta Erros (500)**|
|--------------|------------------------|---------------------|---------------------|
|**Método:** GET<br>**URL:** /query-clock<br>**Headers:**<br>Authorization: Bearer {token}<br>Content-Type: application/json<br><br>**Query String:**<br>dataInicial=2023-01-01T00:00:00&dataFinal=2023-01-31T23:59:59| **Status:** 200 OK<br>**Headers:**<br>Content-Type: application/json<br><br>**Body:**<br>{<br>&nbsp;&nbsp;"username": "example_user",<br>&nbsp;&nbsp;"matricula": "123456",<br>&nbsp;&nbsp;"email": "user@example.com",<br>&nbsp;&nbsp;"periodo": {<br>&nbsp;&nbsp;&nbsp;&nbsp;"dataInicial": "2023-01-01T00:00:00",<br>&nbsp;&nbsp;&nbsp;&nbsp;"dataFinal": "2023-01-31T23:59:59",<br>&nbsp;&nbsp;&nbsp;&nbsp;"totalDiasTrabalhados": 20,<br>&nbsp;&nbsp;&nbsp;&nbsp;"totalHorasTrabalhadas": "160:00:00"<br>&nbsp;&nbsp;},<br>&nbsp;&nbsp;"registros": [<br>&nbsp;&nbsp;&nbsp;&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"2023-01-01": {<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"horasTrabalhadas": "08:00:00",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"ocorrencias": [{<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"timestamp": "2023-01-01T08:00:00",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"ocorrencia": "entrada"<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;}]<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;}<br>&nbsp;&nbsp;&nbsp;&nbsp;},<br>&nbsp;&nbsp;&nbsp;&nbsp;// Outros registros...<br>&nbsp;&nbsp;]<br>}| -| **Status:** 500 Internal Server Error<br>**Headers:**<br>Content-Type: application/json<br><br>**Body:**<br>{<br>&nbsp;&nbsp;"message": "Erro ao visualizar registros de ponto."<br>}|