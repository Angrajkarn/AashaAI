import boto3
import sys

client = boto3.client('logs', region_name='us-east-1')

# Get the latest log stream from the backend log group
log_group = '/ecs/aasha-ai-prod/backend'

streams = client.describe_log_streams(
    logGroupName=log_group,
    orderBy='LastEventTime',
    descending=True,
    limit=1
)

stream_name = streams['logStreams'][0]['logStreamName']
print(f"Log stream: {stream_name}")

response = client.get_log_events(
    logGroupName=log_group,
    logStreamName=stream_name,
    startFromHead=True
)

with open('backend_logs2.txt', 'w', encoding='utf-8') as f:
    for event in response['events']:
        f.write(event['message'])
        f.write('\n')

print("Done! See backend_logs2.txt")
