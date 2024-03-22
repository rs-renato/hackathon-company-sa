const { MongoClient } = require('mongodb');
const { decomposeUnverifiedJwt } = require('aws-jwt-verify/jwt');
const moment = require('moment-timezone');
const queryClockLambda = require('./lambda-query-clock');

jest.mock('mongodb');
jest.mock('aws-jwt-verify/jwt');

const mockRecords = [
  {
    "2024-03-21": [
      {
        "_id": "65fc15aded658460c91477c5",
        "matricula": "111",
        "ocorrencia": "entrada",
        "timestamp": "2024-03-21T08:10:37",
        "username": "funcionario"
      },
      {
        "_id": "65fc15b8ed658460c91477c6",
        "matricula": "111",
        "ocorrencia": "saida",
        "timestamp": "2024-03-21T08:10:48",
        "username": "funcionario"
      },
      {
        "_id": "65fc1615008414facbc5effa",
        "matricula": "111",
        "ocorrencia": "entrada",
        "timestamp": "2024-03-21T08:12:21",
        "username": "funcionario"
      },
      {
        "_id": "65fc161d008414facbc5effb",
        "matricula": "111",
        "ocorrencia": "saida",
        "timestamp": "2024-03-21T08:12:29",
        "username": "funcionario"
      }
    ]
  },
  {
    "2024-03-20": [
      {
        "_id": "65fae4470e5fc78b88708db3",
        "matricula": "111",
        "ocorrencia": "entrada",
        "timestamp": "2024-03-20T10:27:35",
        "username": null
      },
      {
        "_id": "65fae44f0e5fc78b88708db4",
        "matricula": "111",
        "ocorrencia": "saida",
        "timestamp": "2024-03-20T10:27:43",
        "username": null
      },
      {
        "_id": "65fae4530e5fc78b88708db5",
        "matricula": "111",
        "ocorrencia": "entrada",
        "timestamp": "2024-03-20T10:27:47",
        "username": null
      },
      {
        "_id": "65fb2e431a3fa06170c018ee",
        "matricula": "111",
        "ocorrencia": "saida",
        "timestamp": "2024-03-20T15:43:15",
        "username": null
      },
      {
        "_id": "65fb2e4c1a3fa06170c018ef",
        "matricula": "111",
        "ocorrencia": "entrada",
        "timestamp": "2024-03-20T15:43:24",
        "username": null
      },
      {
        "_id": "65fb2e4e1a3fa06170c018f0",
        "matricula": "111",
        "ocorrencia": "saida",
        "timestamp": "2024-03-20T15:43:26",
        "username": null
      },
      {
        "_id": "65fb2e8d1a3fa06170c018f1",
        "matricula": "111",
        "ocorrencia": "entrada",
        "timestamp": "2024-03-20T15:44:29",
        "username": null
      },
      {
        "_id": "65fb38f520caafb97851b4b8",
        "matricula": "111",
        "ocorrencia": "saida",
        "timestamp": "2024-03-20T16:28:53",
        "username": "funcionario"
      }
    ]
  }
];

mockEventWithInvalidDate = {
  headers: {
    Authorization: 'Bearer your_jwt_token_here',
  },
  queryStringParameters: {
    dataInicial: '2023/03/20',
    dataFinal: '2023-03-20T12:00:00',
  }
};


describe('Lambda Query Clock', () => {
  let mockEvent;
  let mockContext;

  beforeAll(() => {
    process.env.DOCUMENTDB_URL = 'testDocumentDbURL';
    process.env.DATABASE_NAME = 'testDataBaseName';
    process.env.COLLECTION_NAME = 'testCollectionName';
  });

  beforeEach(() => {
    mockEvent = {
      headers: {
        Authorization: 'Bearer your_jwt_token_here',
      },
      queryStringParameters: {
        dataInicial: '2023-03-20T08:00:00',
        dataFinal: '2023-03-20T12:00:00',
      }
    };

    mockContext = {};
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return a 400 error because of invalid date format', async () => {
    const mockPayload = {
      'custom:matricula': '123456',
      'cognito:username': 'testuser',
      'email': 'sample@email.com'
    };

    decomposeUnverifiedJwt.mockReturnValue({ payload: mockPayload });

    const response = await queryClockLambda.handler(mockEventWithInvalidDate);
    expect(response.statusCode).toBe(400);
    expect(response.body).toContain("Parâmetros dataInicial e/ou dataFinal não encontrados ou inválidos (YYYY-MM-DDTHH:mm:ss)");
  });


  it('should return the records', async () => {

    const expectedBody = '{"username":"testuser","matricula":"123456","email":"sample@email.com","periodo":{"dataInicial":"2023-03-20T08:00:00","dataFinal":"2023-03-20T12:00:00","totalDiasTrabalhados":1,"totalHorasTrabalhadas":"00:00:19"},"registros":[{"2024-03-21":{"horasTrabalhadas":"00:00:19","ocorrencias":[{"_id":"65fc15aded658460c91477c5","matricula":"111","ocorrencia":"entrada","timestamp":"2024-03-21T08:10:37","username":"funcionario"},{"_id":"65fc15b8ed658460c91477c6","matricula":"111","ocorrencia":"saida","timestamp":"2024-03-21T08:10:48","username":"funcionario"},{"_id":"65fc1615008414facbc5effa","matricula":"111","ocorrencia":"entrada","timestamp":"2024-03-21T08:12:21","username":"funcionario"},{"_id":"65fc161d008414facbc5effb","matricula":"111","ocorrencia":"saida","timestamp":"2024-03-21T08:12:29","username":"funcionario"}]}}]}';

    const mockPayload = {
      'custom:matricula': '123456',
      'cognito:username': 'testuser',
      'email': 'sample@email.com'
    };

    decomposeUnverifiedJwt.mockReturnValue({ payload: mockPayload });

    const mockDatabase = {
      collection: jest.fn().mockReturnThis(),
      aggregate: jest.fn().mockReturnThis(),
      toArray: jest.fn().mockResolvedValue([mockRecords[0]]),
    };

    const mockClose = jest.fn();

    const mockClient = {
      db: jest.fn().mockReturnValue(mockDatabase),
      connect: jest.fn().mockResolvedValue({
        db: jest.fn().mockResolvedValue(mockDatabase),
        close: mockClose,
      }),
    };
    MongoClient.mockImplementation(() => mockClient);

    const response = await queryClockLambda.handler(mockEvent);

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual(expectedBody);

  })

  it('should handle errors', async () => {
    const errorMessage = 'Mock Error';
    decomposeUnverifiedJwt.mockImplementation(() => {
      throw new Error(errorMessage);
    });

    const result = await queryClockLambda.handler(mockEvent);

    expect(result.statusCode).toBe(500);
    expect(result.body).toEqual(
      JSON.stringify({ message: 'Erro ao visualizar registros de ponto.' })
    );
  });
});
