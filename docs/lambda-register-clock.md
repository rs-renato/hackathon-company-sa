# Lambda de Registro de Ponto: lambda-register-clock.js

Este lambda é responsável por registrar o ponto dos funcionários no sistema utilizando o serviço AWS DocumentDB.

## Contrato
- **Entrada**: Espera uma solicitação HTTP contendo um token de autorização no cabeçalho `Authorization` seguindo o esquema "Bearer".
- **Saída de Sucesso**: Retorna um código de status 200 e um objeto JSON contendo as informações do registro de ponto.
- **Saída de Erro**: Em caso de erro, retorna um código de status 500 e uma mensagem de erro no formato JSON.

## Funcionamento
1. Extrai o payload do token de autorização.
2. Obtém os dados de matrícula e nome de usuário do payload do token.
3. Conecta-se ao banco de dados AWS DocumentDB.
4. Consulta o último registro de ponto do funcionário para o dia atual.
5. Determina se a próxima ocorrência de ponto será uma entrada ou saída.
6. Registra o ponto no banco de dados.
7. Retorna o registro de ponto em formato JSON.

## Integrações
- Este lambda integra-se com o serviço AWS DocumentDB para registro de pontos dos funcionários.

## Variáveis de Ambiente
- `DOCUMENTDB_URL`: URL de conexão ao AWS DocumentDB.
- `DATABASE_NAME`: Nome do banco de dados no AWS DocumentDB.
- `COLLECTION_NAME`: Nome da coleção no AWS DocumentDB.

## Exemplos

|**Requisição**|**Resposta de Sucesso**| **Resposta de Erro**|
|--------------|------------------------|---------------------|
|**Método:** POST<br>**URL:** /register-clock<br>**Headers:**<br>Authorization: Bearer {token}| **Status:** 200 OK<br>**Headers:**<br>Content-Type: application/json<br><br>**Body:**<br>{<br>&nbsp;&nbsp;"username": "example_user",<br>&nbsp;&nbsp;"matricula": "123456",<br>&nbsp;&nbsp;"ocorrencia": "entrada",<br>&nbsp;&nbsp;"timestamp": "2023-01-01T08:00:00"<br>} | **Status:** 500 Internal Server Error<br>**Headers:**<br>Content-Type: application/json<br><br>**Body:**<br>{<br>&nbsp;&nbsp;"message": "Erro ao registrar o ponto."<br>}|