import boto3
import os
import time
import uuid
from typing import Optional

class VoiceService:
    def __init__(self):
        self.region = os.getenv("AWS_REGION", "us-east-1")
        self.s3_bucket = os.getenv("VOICE_S3_BUCKET", "aasha-ai-voice-uploads")
        try:
            self.transcribe = boto3.client("transcribe", region_name=self.region)
            self.s3 = boto3.client("s3", region_name=self.region)
        except Exception as e:
            print(f"Warning: Could not initialize Voice clients: {e}")
            self.transcribe = None
            self.s3 = None

    def transcribe_audio(self, audio_bytes: bytes) -> str:
        """
        Transcribe audio using Amazon Transcribe. 
        Supports multi-dialect Indian English and Hindi.
        """
        if not self.transcribe:
            return "Speech-to-text service not configured. (Simulated: High fever and headache)"

        job_name = f"transcription_{uuid.uuid4()}"
        file_key = f"voice/{job_name}.webm"
        
        try:
            # 1. Upload to S3 (Transcribe requires S3 URI)
            self.s3.put_object(Bucket=self.s3_bucket, Key=file_key, Body=audio_bytes)
            file_uri = f"s3://{self.s3_bucket}/{file_key}"
            
            # 2. Start Transcribe Job
            # LanguageCode='hi-IN' for Hindi, 'en-IN' for Indian English, or use LanguageIdentification
            self.transcribe.start_transcription_job(
                TranscriptionJobName=job_name,
                Media={'MediaFileUri': file_uri},
                MediaFormat='webm',
                IdentifyLanguage=True 
            )
            
            # 3. Poll for completion (In a real enterprise app, use EventBridge/Webhooks)
            while True:
                status = self.transcribe.get_transcription_job(TranscriptionJobName=job_name)
                if status['TranscriptionJob']['TranscriptionJobStatus'] in ['COMPLETED', 'FAILED']:
                    break
                time.sleep(2)
                
            if status['TranscriptionJob']['TranscriptionJobStatus'] == 'COMPLETED':
                import requests
                transcript_url = status['TranscriptionJob']['Transcript']['TranscriptFileUri']
                data = requests.get(transcript_url).json()
                return data['results']['transcripts'][0]['transcript']
            
            return "Transcription failed. (Simulated fallback: Severe body pain and nausea)"
            
        except Exception as e:
            print(f"Voice Error: {e}")
            return f"Voice processing failed: {str(e)}"

voice_service = VoiceService()
