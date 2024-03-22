const {decomposeUnverifiedJwt} = require('aws-jwt-verify/jwt');

const requestReportLambda = require('./lambda-request-report');

const {mockClient} = require("aws-sdk-client-mock")

const { SQSClient } = require("@aws-sdk/client-sqs");

const mockEventWithInvalidReference = {
    headers: {
        Authorization: 'Bearer your_jwt_token_here',
    },
    queryStringParameters: {
        referencia: '2023/03',
    }
};

describe('Lambda Export Report', () => {
    let mockEvent;
    let mockContext;
    let sqsClientMock;

    beforeAll(() => {
        process.env.SQS_HACKATHON_REPORT_REQUEST = 'someQueueUrl';
    });

    beforeEach(() => {
        mockEvent = {
            headers: {
                Authorization: 'Bearer your_jwt_token_here',
            },
            queryStringParameters: {
                referencia: '2024-03',
            },
            Records: [
                {
                    body: "\"event\": { \"headers\": { \"Authorization\": \"eyJraWQiOiJtVFwvaUxjZVJKVW00dGhjU2JxaG9Ddk9abzFUN21HZHdiYWd2MXAzdlhcL1E9IiwiYWxnIjoiUlMyNTYifQ.eyJzdWIiOiIzYWQwMzA0NS0zM2YzLTRkYzEtYTU5MS1kZTBiODk2YzdiYTIiLCJjdXN0b206cm9sZXMiOiJmdW5jIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsImlzcyI6Imh0dHBzOlwvXC9jb2duaXRvLWlkcC51cy1lYXN0LTEuYW1hem9uYXdzLmNvbVwvdXMtZWFzdC0xX1ZOR0ZjZFYzZSIsImNvZ25pdG86dXNlcm5hbWUiOiJmdW5jaW9uYXJpbyIsIm9yaWdpbl9qdGkiOiJjNmM2NzIxMy1jZTMzLTQ4ZTYtYTg1OC1lYWI2MzY1ZjI4OTUiLCJhdWQiOiIzbXNqOXAzcDQ3amk4a21xbjFjZ2NhZ2ljIiwiZXZlbnRfaWQiOiIyMDhkN2Y2NS05MmVmLTRmMWUtYWM5Yi1iMDBkODgyMzk4ZTUiLCJ0b2tlbl91c2UiOiJpZCIsImN1c3RvbTptYXRyaWN1bGEiOiIxMTEiLCJhdXRoX3RpbWUiOjE3MTEwMTkzMjEsImV4cCI6MTcxMTAyMjkyMSwiaWF0IjoxNzExMDE5MzIxLCJqdGkiOiI3N2JkMmY4My0yYjVhLTQxMWMtYWYxOC03NDBjODIwOWZjMTAiLCJlbWFpbCI6ImZ1bmNpb25hcmlvQGhhY2thdGhvbi1jb21wYW55LmNvbSJ9.D_jXrPt8yMAPPGMjhkuX0xm8TnhVOvhFamiobKgH6Q3xee_D0Z3rtso92sdtasSiSB9ONOXSUvygiahNyCWnxkBiT7mSAvCGLPwGgI-2A6DMr5qZbXemGGGUnyr07_4Fo7QJ5dxzJpafyfx2SHwpqV5-LZx5TR-xxSJqbgnpnVRhf2jM7lbBprGCd0lMAXlQHHVfazQNMLuHJ9AWS-BufulXmrwJtDek6Vyc-jZ6wbzrL5sWPLJ5zdV0r2eJBkOdFP92iwybnRYYNk_SsEWoDx0adOagYZdKL97oGFF5y7LZ4n_dd50LNqjQL0MO6tMN_GmY6cCi137c2LKRaLsnVg\", }, \"queryStringParameters\": { \"referencia\": \"2024-03\" } }"
                },
            ]
        };

        mockContext = {};
        sqsClientMock = mockClient(SQSClient);

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

        const response = await requestReportLambda.handler(mockEventWithInvalidReference);
        expect(response.statusCode).toBe(400);
        expect(response.body).toContain("Parâmetro referencia não encontrado ou inválido (YYYY-MM)");
    });


    it('should request the records', async () => {

        sqsClientMock.onAnyCommand().resolves({MessageId: 'mockedId'});
        const response = await requestReportLambda.handler(mockEvent);

        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual('{"protocolo":"mockedId"}');

    })

});
