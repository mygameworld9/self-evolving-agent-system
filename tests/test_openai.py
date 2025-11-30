import os
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("OPENAI_API_KEY")
base_url = os.getenv("OPENAI_BASE_URL")
model = os.getenv("OPENAI_MODEL", "gpt-4o")

print(f"Testing OpenAI API...")
print(f"Base URL: {base_url}")
print(f"Model: {model}")

if not api_key:
    print("Error: OPENAI_API_KEY not found in environment variables.")
    exit(1)

client = OpenAI(api_key=api_key, base_url=base_url)

try:
    response = client.chat.completions.create(
        model=model,
        messages=[
            {"role": "user", "content": "Hello, are you working?"}
        ]
    )
    print("Success!")
    print("Response:", response.choices[0].message.content)
except Exception as e:
    print("Error:", e)
