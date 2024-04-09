![Static Badge](https://img.shields.io/badge/serverless-black?style=for-the-badge) ![Static Badge](https://img.shields.io/badge/v18.16.0-version?logo=nodedotjs&color=%23339933&labelColor=white&label=Node%2EJS)

![Static Badge](https://img.shields.io/badge/database-black?style=for-the-badge) ![Static Badge](https://img.shields.io/badge/v8.X-version?logo=mongodb&color=%234169E1&labelColor=white&label=MongoDB)

![Static Badge](https://img.shields.io/badge/cloud-black?style=for-the-badge) ![Static Badge](https://img.shields.io/badge/Amazon_Web_Services-232F3E?logo=amazon-aws&logoColor=%232596be&label=AWS&labelColor=white&color=%232596be)

![Static Badge](https://img.shields.io/badge/iac-black?style=for-the-badge) ![Static Badge](https://img.shields.io/badge/v1.0.x-version?logo=terraform&color=%23623CE4&labelColor=white&label=Terraform)

# ⏰ Hackathon Company SA ![Github Actions](https://github.com/rodrigo-ottero/hackathon-company-sa/actions/workflows/ci-pipeline.yml/badge.svg?branch=main) ![Static Badge](https://img.shields.io/badge/v1.0.0-version?logo=&color=%232496ED&labelColor=white&label=hackathon-company-sa)

Sistema de registro de ponto. Projeto de conclusão do hackathon da pós gradução em Software Architecture.

# Arquitetura Serverless AWS (MVP)
![arquitetura-cloud-aws.png](docs/diagrams/png/arquitetura-cloud-aws.png)

# Arquitetura Evolutiva Serverless AWS (Fase 02)
![arquitetura](docs/diagrams/png/administracao-registro-ponto.png)
![edicao-aprovacao](docs/diagrams/png/edicao-aprovacao-registro-ponto.png)
![notificacao](docs/diagrams/png/notificacao-registro-ponto.png)
![relatorios](docs/diagrams/png/relatorios-visao-administrativa.png)

# Lambdas
- [Lambda de Autenticação](docs/lambda-authorizer.md)
- [Lambda de Registro de Ponto](docs/lambda-register-clock.md)
- [Lambda de Consulta de Registro de Ponto](docs/lambda-query-clock.md)
- [Lambda de Exportação de Registro de Ponto](docs/lambda-export-report.md)
- [Lambda de Requisição de Relatório](docs/lambda-request-report.md)