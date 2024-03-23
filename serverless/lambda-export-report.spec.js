const exportReportLambda = require('./lambda-export-report');

const {mockClient} = require("aws-sdk-client-mock")
const {LambdaClient} = require("@aws-sdk/client-lambda");
const {SESClient} = require("@aws-sdk/client-ses");

const payloadAsArray =  [123, 34, 115, 116, 97, 116, 117, 115, 67, 111, 100, 101, 34, 58, 50, 48, 48, 44, 34, 104, 101, 97, 100, 101, 114, 115, 34, 58, 123, 34, 67, 111, 110, 116, 101, 110, 116, 45, 84, 121, 112, 101, 34, 58, 34, 97, 112, 112, 108, 105, 99, 97, 116, 105, 111, 110, 47, 106, 115, 111, 110, 34, 125, 44, 34, 98, 111, 100, 121, 34, 58, 34, 123, 92, 34, 117, 115, 101, 114, 110, 97, 109, 101, 92, 34, 58, 92, 34, 102, 117, 110, 99, 105, 111, 110, 97, 114, 105, 111, 92, 34, 44, 92, 34, 109, 97, 116, 114, 105, 99, 117, 108, 97, 92, 34, 58, 92, 34, 49, 49, 49, 92, 34, 44, 92, 34, 101, 109, 97, 105, 108, 92, 34, 58, 92, 34, 104, 101, 104, 97, 106, 111, 49, 50, 56, 53, 64, 115, 116, 111, 114, 101, 115, 114, 46, 99, 111, 109, 92, 34, 44, 92, 34, 112, 101, 114, 105, 111, 100, 111, 92, 34, 58, 123, 92, 34, 100, 97, 116, 97, 73, 110, 105, 99, 105, 97, 108, 92, 34, 58, 92, 34, 50, 48, 50, 52, 45, 48, 51, 45, 48, 49, 84, 48, 48, 58, 48, 48, 58, 48, 48, 92, 34, 44, 92, 34, 100, 97, 116, 97, 70, 105, 110, 97, 108, 92, 34, 58, 92, 34, 50, 48, 50, 52, 45, 48, 51, 45, 51, 49, 84, 50, 51, 58, 53, 57, 58, 53, 57, 92, 34, 44, 92, 34, 116, 111, 116, 97, 108, 68, 105, 97, 115, 84, 114, 97, 98, 97, 108, 104, 97, 100, 111, 115, 92, 34, 58, 50, 44, 92, 34, 116, 111, 116, 97, 108, 72, 111, 114, 97, 115, 84, 114, 97, 98, 97, 108, 104, 97, 100, 97, 115, 92, 34, 58, 92, 34, 48, 49, 58, 53, 56, 58, 49, 49, 92, 34, 125, 44, 92, 34, 114, 101, 103, 105, 115, 116, 114, 111, 115, 92, 34, 58, 91, 123, 92, 34, 50, 48, 50, 52, 45, 48, 51, 45, 50, 50, 92, 34, 58, 123, 92, 34, 104, 111, 114, 97, 115, 84, 114, 97, 98, 97, 108, 104, 97, 100, 97, 115, 92, 34, 58, 92, 34, 48, 48, 58, 48, 48, 58, 48, 48, 92, 34, 44, 92, 34, 111, 99, 111, 114, 114, 101, 110, 99, 105, 97, 115, 92, 34, 58, 91, 93, 125, 125, 44, 123, 92, 34, 50, 48, 50, 52, 45, 48, 51, 45, 50, 49, 92, 34, 58, 123, 92, 34, 104, 111, 114, 97, 115, 84, 114, 97, 98, 97, 108, 104, 97, 100, 97, 115, 92, 34, 58, 92, 34, 48, 49, 58, 53, 56, 58, 49, 49, 92, 34, 44, 92, 34, 111, 99, 111, 114, 114, 101, 110, 99, 105, 97, 115, 92, 34, 58, 91, 123, 92, 34, 95, 105, 100, 92, 34, 58, 92, 34, 54, 53, 102, 99, 100, 52, 56, 57, 53, 101, 49, 49, 56, 55, 53, 97, 53, 102, 99, 48, 100, 56, 52, 57, 92, 34, 44, 92, 34, 117, 115, 101, 114, 110, 97, 109, 101, 92, 34, 58, 92, 34, 102, 117, 110, 99, 105, 111, 110, 97, 114, 105, 111, 92, 34, 44, 92, 34, 109, 97, 116, 114, 105, 99, 117, 108, 97, 92, 34, 58, 92, 34, 49, 49, 49, 92, 34, 44, 92, 34, 111, 99, 111, 114, 114, 101, 110, 99, 105, 97, 92, 34, 58, 92, 34, 101, 110, 116, 114, 97, 100, 97, 92, 34, 44, 92, 34, 116, 105, 109, 101, 115, 116, 97, 109, 112, 92, 34, 58, 92, 34, 50, 48, 50, 52, 45, 48, 51, 45, 50, 49, 84, 50, 49, 58, 52, 52, 58, 53, 55, 92, 34, 125, 44, 123, 92, 34, 95, 105, 100, 92, 34, 58, 92, 34, 54, 53, 102, 99, 102, 48, 51, 97, 53, 99, 99, 53, 101, 101, 49, 101, 53, 48, 52, 99, 50, 101, 53, 48, 92, 34, 44, 92, 34, 117, 115, 101, 114, 110, 97, 109, 101, 92, 34, 58, 92, 34, 102, 117, 110, 99, 105, 111, 110, 97, 114, 105, 111, 92, 34, 44, 92, 34, 109, 97, 116, 114, 105, 99, 117, 108, 97, 92, 34, 58, 92, 34, 49, 49, 49, 92, 34, 44, 92, 34, 111, 99, 111, 114, 114, 101, 110, 99, 105, 97, 92, 34, 58, 92, 34, 115, 97, 105, 100, 97, 92, 34, 44, 92, 34, 116, 105, 109, 101, 115, 116, 97, 109, 112, 92, 34, 58, 92, 34, 50, 48, 50, 52, 45, 48, 51, 45, 50, 49, 84, 50, 51, 58, 52, 51, 58, 48, 54, 92, 34, 125, 44, 123, 92, 34, 95, 105, 100, 92, 34, 58, 92, 34, 54, 53, 102, 99, 102, 48, 51, 98, 53, 99, 99, 53, 101, 101, 49, 101, 53, 48, 52, 99, 50, 101, 53, 49, 92, 34, 44, 92, 34, 117, 115, 101, 114, 110, 97, 109, 101, 92, 34, 58, 92, 34, 102, 117, 110, 99, 105, 111, 110, 97, 114, 105, 111, 92, 34, 44, 92, 34, 109, 97, 116, 114, 105, 99, 117, 108, 97, 92, 34, 58, 92, 34, 49, 49, 49, 92, 34, 44, 92, 34, 111, 99, 111, 114, 114, 101, 110, 99, 105, 97, 92, 34, 58, 92, 34, 101, 110, 116, 114, 97, 100, 97, 92, 34, 44, 92, 34, 116, 105, 109, 101, 115, 116, 97, 109, 112, 92, 34, 58, 92, 34, 50, 48, 50, 52, 45, 48, 51, 45, 50, 49, 84, 50, 51, 58, 52, 51, 58, 48, 55, 92, 34, 125, 44, 123, 92, 34, 95, 105, 100, 92, 34, 58, 92, 34, 54, 53, 102, 99, 102, 48, 51, 100, 53, 99, 99, 53, 101, 101, 49, 101, 53, 48, 52, 99, 50, 101, 53, 50, 92, 34, 44, 92, 34, 117, 115, 101, 114, 110, 97, 109, 101, 92, 34, 58, 92, 34, 102, 117, 110, 99, 105, 111, 110, 97, 114, 105, 111, 92, 34, 44, 92, 34, 109, 97, 116, 114, 105, 99, 117, 108, 97, 92, 34, 58, 92, 34, 49, 49, 49, 92, 34, 44, 92, 34, 111, 99, 111, 114, 114, 101, 110, 99, 105, 97, 92, 34, 58, 92, 34, 115, 97, 105, 100, 97, 92, 34, 44, 92, 34, 116, 105, 109, 101, 115, 116, 97, 109, 112, 92, 34, 58, 92, 34, 50, 48, 50, 52, 45, 48, 51, 45, 50, 49, 84, 50, 51, 58, 52, 51, 58, 48, 57, 92, 34, 125, 93, 125, 125, 93, 125, 34, 125];
const mockLambdaPayload = {
    Payload: payloadAsArray
}

describe('Lambda Export Report', () => {
    let mockEvent;
    let mockContext;
    let lambdaClientMock;
    let sesClientMock;

    beforeEach(() => {

        lambdaClientMock = mockClient(LambdaClient);
        sesClientMock = mockClient(SESClient);

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
    });

    afterEach(() => {
        jest.clearAllMocks();
        lambdaClientMock.reset();
        sesClientMock.reset();
    });

    it('should export the records', async () => {
        const consoleSpy = jest.spyOn(console, 'log');
        lambdaClientMock.onAnyCommand().resolves(mockLambdaPayload);
        const response = await exportReportLambda.handler(mockEvent);

        expect(consoleSpy).toHaveBeenCalledWith('Finalizado com sucesso');
    })

    it('should handle errors', async () => {
        const fakeError = new Error('Mock Error');

        lambdaClientMock.onAnyCommand().callsFake(() => {
            throw fakeError;
        })

        expect(async () => {
            await exportReportLambda.handler(mockEvent);
        }).rejects.toThrow('Mock Error');
    });
});
