# Lambda de Exportação de Relatório de Ponto por Email: lambda-export-report.js

Este lambda é responsável por exportar o relatório de ponto dos funcionários por e-mail, utilizando os serviços AWS Lambda e Amazon SES.

## Contrato
- **Entrada**: Espera uma solicitação HTTP com a referência do relatório de ponto na query string.
- **Saída de Sucesso**: Retorna um código de status 200 e um objeto JSON contendo o protocolo de envio do e-mail.
- **Saída de Erro**: Em caso de erro, retorna um código de status 500 e uma mensagem de erro no formato JSON.

## Funcionamento
1. Obtém a referência do relatório de ponto da query string.
2. Valida a presença e o formato da referência.
3. Formata a data inicial e final do relatório.
4. Invoca a lambda `lambda-query-clock` para obter os registros de ponto dentro do período especificado.
5. Se a consulta for bem-sucedida, gera o corpo do e-mail com as informações do relatório.
6. Utiliza o serviço Amazon SES para enviar o e-mail com o relatório de ponto.
7. Retorna o protocolo de envio do e-mail em caso de sucesso.

## Integrações
- Este lambda integra-se com os serviços AWS Lambda e Amazon SES para exportar o relatório de ponto por e-mail.

## Exemplos

|**Requisição**|**Resposta de Sucesso**| **Resposta de Erro**|
|--------------|------------------------|---------------------|
|**Método:** POST<br>**URL:** /export-report?referencia=2024-03| **Status:** 200 OK<br>**Headers:**<br>Content-Type: application/json<br><br>**Body:**<br>{<br>&nbsp;&nbsp;"protocolo": "abcd-1234-efgh-5678"<br>} | **Status:** 500 Internal Server Error<br>**Headers:**<br>Content-Type: application/json<br><br>**Body:**<br>{<br>&nbsp;&nbsp;"message": "Erro gerar relatório de registros de ponto."<br>}|