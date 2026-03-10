import boto3

client = boto3.client('logs', region_name='us-east-1')

log_group = '/ecs/aasha-ai-prod/backend'

streams = client.describe_log_streams(
    logGroupName=log_group,
    orderBy='LastEventTime',
    descending=True,
    limit=5
)

print("Available streams:")
for s in streams['logStreams']:
    print(f"  {s['logStreamName']} - last event: {s.get('lastIngestionTime', 'N/A')}")

stream_name = streams['logStreams'][0]['logStreamName']
print(f"\nFetching from: {stream_name}")

response = client.get_log_events(
    logGroupName=log_group,
    logStreamName=stream_name,
    startFromHead=True
)

print("\n--- LOG CONTENT ---")
with open('backend_logs_latest.txt', 'w', encoding='utf-8') as f:
    for event in response['events']:
        f.write(event['message'])
        f.write('\n')
        print(event['message'])
