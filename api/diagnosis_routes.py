# api/diagnosis_routes.py
from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import JSONResponse
from typing import List, Dict, Any, Optional
from utils.diagnosis_storage import get_user_diagnosis_history, get_diagnosis_by_id

diagnosis_router = APIRouter(prefix="/diagnosis", tags=["diagnosis"])

async def get_current_user(request: Request) -> Optional[str]:
    return request.headers.get("X-User-Id")

@diagnosis_router.get("/")
async def list_diagnoses(request: Request, limit: int = 10):
    try:
        user_id = await get_current_user(request)
        
        if not user_id:
            return JSONResponse(content={"diagnoses": [], "message": "No authenticated user found"})
        
        history = await get_user_diagnosis_history(user_id, limit)
        return JSONResponse(content={"diagnoses": history})
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@diagnosis_router.get("/{diagnosis_id}")
async def get_diagnosis_details(diagnosis_id: str, request: Request):
    try:
        user_id = await get_current_user(request)
        
        diagnosis = await get_diagnosis_by_id(diagnosis_id, user_id)
        
        if not diagnosis:
            diagnosis = await get_diagnosis_by_id(diagnosis_id)
            
        if diagnosis:
            result = dict(diagnosis)
            
            if user_id and result.get("user_id") == user_id:
                result["is_own"] = True
            else:
                result["is_own"] = False
                
            return JSONResponse(content=result)
        else:
            raise HTTPException(status_code=404, detail="Diagnosis not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@diagnosis_router.get("/stats/summary")
async def get_diagnosis_stats(request: Request):
    try:
        user_id = await get_current_user(request)
        
        if not user_id:
            return JSONResponse(content={"message": "No authenticated user found"})
        
        import httpx
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{os.environ.get('DATABASE_API_URL', 'http://localhost:5001/api/diagnosis')}/stats/user",
                     headers={"Content-Type": "application/json"}
                )
                
                if response.status_code == 200:
                    return JSONResponse(content=response.json())
        except Exception as e:
            print(f"Error retrieving stats from database: {str(e)}")
        
        history = await get_user_diagnosis_history(user_id, limit=100)
        
        if not history:
            return JSONResponse(content={"total_diagnoses": 0})
        
        stats = {
            "total_diagnoses": len(history),
            "first_diagnosis_date": min([item.get("timestamp", "") for item in history]),
            "latest_diagnosis_date": max([item.get("timestamp", "") for item in history]),
            "most_common_diagnoses": []
        }
        
        diagnoses_count = {}
        for item in history:
            main_diagnosis = item.get("main_diagnosis", "Unknown")
            if main_diagnosis in diagnoses_count:
                diagnoses_count[main_diagnosis] += 1
            else:
                diagnoses_count[main_diagnosis] = 1
        
        sorted_diagnoses = sorted(diagnoses_count.items(), key=lambda x: x[1], reverse=True)
        stats["most_common_diagnoses"] = [{"name": name, "count": count} for name, count in sorted_diagnoses[:5]]
        
        return JSONResponse(content=stats)
    except Exception as e:
        print(f"ОШИБКА при получении статистики: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@diagnosis_router.delete("/{diagnosis_id}")
async def delete_diagnosis(diagnosis_id: str, request: Request):
    try:
        user_id = await get_current_user(request)
        
        if not user_id:
            raise HTTPException(status_code=401, detail="Authentication required")
        
        import httpx
        try:
            async with httpx.AsyncClient() as client:
                response = await client.delete(
                    f"{os.environ.get('DATABASE_API_URL', 'http://localhost:5001/api/diagnosis')}/{diagnosis_id}",
                    headers={"Content-Type": "application/json"}
                )
                
                if response.status_code == 200:
                    storage_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "data", "diagnoses")
                    file_path = os.path.join(storage_dir, user_id, f"{diagnosis_id}.json")
                    if os.path.exists(file_path):
                        os.remove(file_path)
                    
                    return JSONResponse(content=response.json())
        except Exception as e:
            print(f"Error deleting from database: {str(e)}")
        
        diagnosis = await get_diagnosis_by_id(diagnosis_id, user_id)
        
        if not diagnosis:
            raise HTTPException(status_code=404, detail="Diagnosis not found or does not belong to you")
        
        # Get the file path
        storage_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "data", "diagnoses")
        file_path = os.path.join(storage_dir, user_id, f"{diagnosis_id}.json")
        
        # Delete the file
        if os.path.exists(file_path):
            os.remove(file_path)
            return JSONResponse(content={"message": "Diagnosis deleted successfully"})
        else:
            raise HTTPException(status_code=404, detail="Diagnosis file not found")
    except Exception as e:
        print(f"ОШИБКА при удалении диагноза: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))