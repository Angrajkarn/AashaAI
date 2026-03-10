import boto3
client = boto3.client('logs', region_name='us-east-1')
response = client.get_log_events(
    logGroupName='/aws/codebuild/aasha-ai-frontend-build',
    logStreamName='6dc972b9-e0b4-4e23-959f-870fbde68561'
)
with open('build_logs_final.txt', 'w', encoding='utf-8') as f:
    for event in response['events']:
        f.write(event['message'])
