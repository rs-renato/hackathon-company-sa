# Lambda de Exportação de Relatório de Ponto por Email: lambda-export-report.js

Este lambda é responsável por exportar o relatório de ponto dos funcionários por e-mail, utilizando os serviços AWS Lambda e Amazon SES.

## Contrato
- **Entrada**: Consume mensagens da fila SQS contendo a referência do relatório de ponto e as credenciais de autorização.
- **Saída**: Não possui resposta direta. As mensagens processadas com sucesso são removidas da fila SQS e o relatório é enviado por e-mail.

## Funcionamento
1. Recebe mensagens da fila SQS contendo a referência do relatório de ponto e as credenciais de autorização.
2. Valida a presença e o formato da referência e das credenciais de autorização.
3. Formata a data inicial e final do relatório com base na referência.
4. Invoca a lambda `lambda-query-clock` para obter os registros de ponto dentro do período especificado.
5. Se a consulta for bem-sucedida, gera o corpo do e-mail com as informações do relatório.
6. Utiliza o serviço Amazon SES para enviar o e-mail com o relatório de ponto.
7. Remove a mensagem processada da fila SQS.


## Integrações
- Este lambda integra-se com os serviços AWS Lambda, Amazon SES e Amazon SQS para exportar o relatório de ponto por e-mail.


## Exemplos
Abaixo o exemplo de relatório enviado por email.
```
Olá funcionario, conforme solicitado, abaixo está o relatório de espelho de ponto:

-----------------------------------------------------------------------------
Período:    2024-03-01T00:00:00 a 2024-03-31T23:59:59
Total de horas trabalhadas no período:  01:58:11
-----------------------------------------------------------------------------

Data:   2024-03-21
Horas Trabalhadas:  01:58:11
-----------------------------------------------------------------------------
#1  Entrada:        2024-03-21T21:44:57
#2  Saída:          2024-03-21T23:43:06
#3  Entrada:        2024-03-21T23:43:07
#4  Saída:          2024-03-21T23:43:09
-----------------------------------------------------------------------------
Atenciosamente,
Hackathon Company SA
```