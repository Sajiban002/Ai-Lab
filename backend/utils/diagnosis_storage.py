# utils/diagnosis_storage.py
import os
import json
import uuid
from datetime import datetime
from typing import Dict, List, Optional, Any
from fastapi import Request
import httpx
import asyncio

STORAGE_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "diagnoses")
os.makedirs(STORAGE_DIR, exist_ok=True)

DATABASE_API_URL = os.environ.get("DATABASE_API_URL", "http://localhost:5001/api/diagnosis")

def get_user_id_from_request(request: Request) -> Optional[str]:
    try:
        user_id = request.headers.get("X-User-Id")
        return user_id
    except:
        return None

async def save_to_database(data: Dict[str, Any]) -> Dict[str, Any]:
    try:
        async with httpx.AsyncClient() as client:
            request_data = {
                "diagnosis_id": data["diagnosis_id"],
                "symptoms": data["symptoms"],
                "diagnosis_data": data,
                "user_id": data.get("user_id")
            }

            response = await client.post(
                DATABASE_API_URL,
                json=request_data,
                headers={"Content-Type": "application/json"}
            )

            if response.status_code != 200:
                return {"success": False, "error": f"Database API returned status {response.status_code}"}
            response_data = response.json()
            return response_data

    except httpx.RequestError as e:
        return {"success": False, "error": f"Network error connecting to database API: {str(e)}"}
    except Exception as e:
        return {"success": False, "error": str(e)}

def save_diagnosis_result(
    request: Request,
    diagnosis_predictions: List[Dict[str, Any]],
    recommended_medications: List[Dict[str, Any]],
    generated_text: str,
    symptoms: str
) -> Dict[str, Any]:
    user_id = get_user_id_from_request(request)
    diagnosis_id = str(uuid.uuid4())
    timestamp = datetime.now().isoformat()

    data = {
        "diagnosis_id": diagnosis_id,
        "timestamp": timestamp,
        "symptoms": symptoms,
        "diagnosis_predictions": diagnosis_predictions,
        "recommended_medications": recommended_medications,
        "generated_text": generated_text,
        "user_id": user_id
    }

    if user_id:
        user_dir = os.path.join(STORAGE_DIR, str(user_id))
        os.makedirs(user_dir, exist_ok=True)
        file_path = os.path.join(user_dir, f"{diagnosis_id}.json")
    else:
        anon_dir = os.path.join(STORAGE_DIR, "anonymous")
        os.makedirs(anon_dir, exist_ok=True)
        file_path = os.path.join(anon_dir, f"{diagnosis_id}.json")

    asyncio.create_task(save_to_database(data))

    try:
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
    except Exception as e:
        print(f"Error saving diagnosis backup to file: {str(e)}")

    return data

async def get_user_diagnosis_history(user_id: str, limit: int = 10) -> List[Dict[str, Any]]:
    if not user_id:
        return []

    try:
        async with httpx.AsyncClient() as client:
            headers = {"Content-Type": "application/json"}

            response = await client.get(
                f"{DATABASE_API_URL}?limit={limit}&offset=0",
                headers=headers
            )

            if response.status_code == 200:
                response_data = response.json()
                return response_data.get("rows", [])
            else:
                 print(f"Warning: Database API (history) returned status code {response.status_code}")
                 print(f"Response body: {response.text}")
    except Exception as e:
        print(f"Error retrieving history from database API: {str(e)}")

    # Fallback to JSON files
    history = []
    user_dir = os.path.join(STORAGE_DIR, str(user_id))
    if not os.path.exists(user_dir):
        print(f"User directory not found for fallback: {user_dir}")
        return []

    try:
        filenames = sorted(
            [f for f in os.listdir(user_dir) if f.endswith('.json')],
            key=lambda fname: os.path.getmtime(os.path.join(user_dir, fname)),
            reverse=True
        )

        for filename in filenames[:limit]:
            try:
                with open(os.path.join(user_dir, filename), 'r', encoding='utf-8') as f:
                    file_data = json.load(f)
                    history.append({
                        "diagnosis_id": file_data.get("diagnosis_id"),
                        "created_at": file_data.get("timestamp"),
                        "symptoms": file_data.get("symptoms"),
                        "main_diagnosis": file_data.get("diagnosis_predictions", [{}])[0].get("name", "Unknown")
                                        if file_data.get("diagnosis_predictions") else "Unknown",
                    })
            except Exception as e:
                print(f"Error reading diagnosis file {filename}: {str(e)}")

    except Exception as e:
         print(f"Error listing or processing files in {user_dir}: {str(e)}")

    return history

async def get_diagnosis_by_id(diagnosis_id: str, user_id: Optional[str] = None) -> Optional[Dict[str, Any]]:
    try:
        async with httpx.AsyncClient() as client:
            headers = {"Content-Type": "application/json"}
            response = await client.get(
                f"{DATABASE_API_URL}/{diagnosis_id}",
                headers=headers
            )

            if response.status_code == 200:
                return response.json()
            elif response.status_code == 404:
                 print(f"Diagnosis {diagnosis_id} not found in database API (status 404). Trying fallback.")
            elif response.status_code == 403:
                 print(f"Access denied (403) for diagnosis {diagnosis_id} in API. Trying fallback for anonymous.")
                 user_id = None
            else:
                 print(f"Error retrieving diagnosis {diagnosis_id} from database API: Status {response.status_code}")
                 print(f"Response body: {response.text}")

    except Exception as e:
        print(f"Error retrieving diagnosis {diagnosis_id} from database API: {str(e)}")

    # Fallback to JSON files
    file_path_to_check = None
    if user_id:
        user_dir = os.path.join(STORAGE_DIR, str(user_id))
        potential_path = os.path.join(user_dir, f"{diagnosis_id}.json")
        if os.path.exists(potential_path):
            print(f"Found potential file in user directory: {potential_path}")
            file_path_to_check = potential_path
    if not file_path_to_check:
        anon_path = os.path.join(STORAGE_DIR, "anonymous", f"{diagnosis_id}.json")
        if os.path.exists(anon_path):
            print(f"Found potential file in anonymous directory: {anon_path}")
            file_path_to_check = anon_path

    # 3. Читаем найденный файл
    if file_path_to_check:
        try:
            with open(file_path_to_check, 'r', encoding='utf-8') as f:
                print(f"Successfully read diagnosis {diagnosis_id} from file: {file_path_to_check}")
                return json.load(f)
        except Exception as e:
            print(f"Error reading diagnosis file {file_path_to_check}: {str(e)}")
            return None
    print(f"Diagnosis {diagnosis_id} definitively not found.")
    return None