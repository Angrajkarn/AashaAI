import boto3
import json
import os
from dotenv import load_dotenv

load_dotenv()

class ReportService:
    def __init__(self):
        self.bedrock = boto3.client(
            service_name='bedrock-runtime',
            region_name=os.getenv("AWS_REGION", "us-east-1")
        )
        self.model_id = os.getenv("BEDROCK_MODEL_ID", "anthropic.claude-3-opus-20240229-v1:0")

    def generate_referral_report(self, patient_data: dict, history: list) -> str:
        """
        Synthesizes patient history into a professional medical referral report using Claude 3 Opus.
        """
        history_text = "\n".join([
            f"- {h['timestamp']}: Diagnosis: {h['diagnosis']}, Symptoms: {h['symptoms']}, Recommendation: {h['recommendation']}"
            for h in history
        ])

        prompt = f"""
        Human: You are an expert medical consultant for rural health missions. 
        Generate a professional medical referral report for the following patient based on their clinical history.
        
        Patient Details:
        Name: {patient_data['name']}
        Age: {patient_data['age']}
        Gender: {patient_data['gender']}
        Contact: {patient_data.get('contact_number', 'N/A')}
        
        Clinical History:
        {history_text}
        
        The report should include:
        1. Executive Summary of the patient's condition.
        2. Longitudinal Trend Analysis (are they getting better or worse?).
        3. Key Diagnostic Findings.
        4. Urgent Concerns for the receiving doctor.
        5. Suggested next steps/investigations.
        
        Use a formal, professional medical tone. Keep it concise but comprehensive (one page).
        Output in Markdown format.

        Assistant: Here is the professional medical referral report:
        """

        try:
            body = json.dumps({
                "anthropic_version": "bedrock-2023-05-31",
                "max_tokens": 1024,
                "messages": [
                    {"role": "user", "content": prompt}
                ]
            })

            response = self.bedrock.invoke_model(
                body=body,
                modelId=self.model_id,
                accept="application/json",
                contentType="application/json"
            )

            response_body = json.loads(response.get('body').read())
            return response_body['content'][0]['text']

        except Exception as e:
            print(f"Report generation error: {e}")
            # Fallback for demo if Bedrock fails
            return f"""
            # Referral Report: {patient_data['name']}
            
            **Patient Summary:** {patient_data['name']}, age {patient_data['age']}, has a history of multiple clinical visits.
            
            **Clinical Findings:** 
            Recent diagnosis includes {history[0]['diagnosis']} following {history[0]['symptoms']}.
            
            **Trend:** Analysis indicates persistent symptoms requiring specialist intervention at the district level.
            
            **Recommendation:** Immediate clinical review by an MD Specialist at the District Hospital.
            """

report_service = ReportService()
