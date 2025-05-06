# vision_utils.py
from google.cloud import vision, translate_v2 as translate
from google.oauth2 import service_account
import os
from typing import List, Dict
from config.settings import settings  
from functools import lru_cache

vision_client = None
translate_client = None

@lru_cache()
def init_vision_api():
    global vision_client, translate_client
    try:
        if settings.google_credentials_path:  
            credentials = service_account.Credentials.from_service_account_file(settings.google_credentials_path)
            vision_client = vision.ImageAnnotatorClient(credentials=credentials)
            translate_client = translate.Client(credentials=credentials)
            print(f"Google Vision API и Translate API настроены через файл {settings.google_credentials_path}")
        else:
            print("ПРЕДУПРЕЖДЕНИЕ: Переменная окружения GOOGLE_APPLICATION_CREDENTIALS не установлена!")
            print("ПРЕДУПРЕЖДЕНИЕ: Google Vision API и Translate API не настроены!")
    except Exception as e:
        print(f"ОШИБКА при настройке Google API: {str(e)}")
        vision_client = None
        translate_client = None
        print("ПРЕДУПРЕЖДЕНИЕ: Продолжение работы без Google API. Некоторые функции могут быть недоступны.")

init_vision_api()

def translate_text(text: str, target_language: str = 'ru') -> str:
    global translate_client

    if not translate_client or not text:
        return text

    try:
        result = translate_client.translate(text, target_language=target_language)
        return result['translatedText']
    except Exception as e:
        print(f"Ошибка при переводе текста: {str(e)}")
        return text

def find_medical_terms(text: str, keywords: List[Dict[str, str]], input_lang: str = 'en') -> List[Dict[str, str]]:
    """
    Enhanced medical term detection with context and confidence

    Returns a list of dictionaries with term information instead of just strings
    """
    if not text or not keywords:
        return []

    output_lang = 'ru' if input_lang == 'en' else 'ru'

    found_terms = []
    text_lower = text.lower()

    for keyword in keywords:
        search_term = keyword.get(input_lang, '')
        if search_term and search_term.lower() in text_lower:
            # Get the surrounding context for the term
            try:
                # Find position of the term in the text
                term_pos = text_lower.find(search_term.lower())
                # Get some context (50 chars before and after)
                start = max(0, term_pos - 50)
                end = min(len(text), term_pos + len(search_term) + 50)
                context = text[start:end]

                found_terms.append({
                    "term": keyword.get(output_lang, search_term),
                    "original": search_term,
                    "context": context,
                    "confidence": "high" if text_lower.count(search_term.lower()) > 1 else "medium"
                })
            except:
                # Fallback if context extraction fails
                found_terms.append({
                    "term": keyword.get(output_lang, search_term),
                    "original": search_term,
                    "context": "",
                    "confidence": "medium"
                })

    # Remove duplicates based on the term
    unique_terms = []
    term_set = set()
    for term in found_terms:
        if term["term"] not in term_set:
            term_set.add(term["term"])
            unique_terms.append(term)

    return unique_terms

# 2. Improve the analyze_image_with_vision function to include a medical assessment section
async def analyze_image_with_vision(image_content):
    global vision_client, translate_client

    if vision_client is None:
        return {
            "en_description": "Анализ изображения недоступен: Google Vision API не настроен.",
            "ru_description": "Анализ изображения недоступен: Google Vision API не настроен.",
            "medical_terms": [],
            "raw_text": "",
            "medical_relevance": "unknown"
        }

    try:
        image = vision.Image(content=image_content)

        features = [
            vision.Feature(type_=vision.Feature.Type.LABEL_DETECTION, max_results=10),
            vision.Feature(type_=vision.Feature.Type.TEXT_DETECTION),
            vision.Feature(type_=vision.Feature.Type.FACE_DETECTION),
            vision.Feature(type_=vision.Feature.Type.OBJECT_LOCALIZATION, max_results=10),
            vision.Feature(type_=vision.Feature.Type.IMAGE_PROPERTIES)
        ]

        response = vision_client.annotate_image({'image': image, 'features': features})

        en_analysis = {
            "text": "",
            "labels": [],
            "faces": [],
            "objects": [],
            "colors": [],
            "raw_text": ""
        }

        ru_analysis = {
            "text": "",
            "labels": [],
            "faces": [],
            "objects": [],
            "colors": [],
            "raw_text": ""
        }

        # Medical relevance indicators
        medical_indicators = {
            "has_medical_text": False,
            "has_body_part": False,
            "has_medical_object": False,
            "medical_keywords_count": 0
        }

        # Medical-related keywords to check in labels and objects
        medical_objects = ["pill", "medication", "syringe", "bandage", "thermometer", "medical", "health",
                           "hospital", "medicine", "doctor", "drug", "blood", "injury", "wound"]
        body_parts = ["skin", "hand", "foot", "eye", "leg", "arm", "face", "head", "neck", "chest",
                       "back", "shoulder", "elbow", "knee", "ankle", "toe", "finger", "mouth", "nose",
                       "ear", "throat", "forehead", "chin"]

        if response.text_annotations:
            en_analysis["raw_text"] = response.text_annotations[0].description
            en_analysis["text"] = "Text in image: " + response.text_annotations[0].description.replace('\n', ' ')

            ru_text = translate_text(en_analysis["raw_text"], 'ru')
            ru_analysis["raw_text"] = ru_text
            ru_analysis["text"] = "Текст на изображении: " + ru_text.replace('\n', ' ')

            # Check if text contains medical terms
            for med_term in ["doctor", "medicine", "symptom", "pain", "disorder", "disease", "treatment", "diagnosis"]:
                if med_term in en_analysis["raw_text"].lower():
                    medical_indicators["has_medical_text"] = True
                    break

        if response.label_annotations:
            for label in response.label_annotations:
                # Convert confidence score to percentage
                confidence_percent = int(label.score * 100)
                en_label = f"{label.description} ({confidence_percent}%)"
                en_analysis["labels"].append(en_label)

                # Check for medical relevance in labels
                label_lower = label.description.lower()
                for med_obj in medical_objects:
                    if med_obj in label_lower:
                        medical_indicators["has_medical_object"] = True

                for body_part in body_parts:
                    if body_part in label_lower:
                        medical_indicators["has_body_part"] = True

                ru_label_text = translate_text(label.description, 'ru')
                ru_label = f"{ru_label_text} ({confidence_percent}%)"
                ru_analysis["labels"].append(ru_label)

            if response.face_annotations:
                face_count = len(response.face_annotations)
                for i, face in enumerate(response.face_annotations):
                    # Convert confidence score to percentage
                    confidence_percent = int(face.detection_confidence * 100)

                    # Add face emotion analysis if available
                    emotions = []
                    if hasattr(face, 'joy_likelihood') and face.joy_likelihood > 1:
                        emotions.append("joy")
                    if hasattr(face, 'sorrow_likelihood') and face.sorrow_likelihood > 1:
                        emotions.append("sorrow")
                    if hasattr(face, 'anger_likelihood') and face.anger_likelihood > 1:
                        emotions.append("anger")
                    if hasattr(face, 'surprise_likelihood') and face.surprise_likelihood > 1:
                        emotions.append("surprise")

                    emotion_str = f" with {', '.join(emotions)}" if emotions else ""

                    en_face = f"face {i+1}{emotion_str} ({confidence_percent}%)"
                    en_analysis["faces"].append(en_face)

                    # Translate emotions to Russian
                    ru_emotions = []
                    for emotion in emotions:
                        if emotion == "joy":
                            ru_emotions.append("радость")
                        elif emotion == "sorrow":
                            ru_emotions.append("печаль")
                        elif emotion == "anger":
                            ru_emotions.append("гнев")
                        elif emotion == "surprise":
                            ru_emotions.append("удивление")

                    ru_emotion_str = f" с эмоциями: {', '.join(ru_emotions)}" if ru_emotions else ""
                    ru_face = f"лицо {i+1}{ru_emotion_str} ({confidence_percent}%)"
                    ru_analysis["faces"].append(ru_face)

            if response.localized_object_annotations:
                for obj in response.localized_object_annotations:
                    # Convert confidence score to percentage
                    confidence_percent = int(obj.score * 100)
                    en_object = f"{obj.name} ({confidence_percent}%)"
                    en_analysis["objects"].append(en_object)

                    # Check for medical objects
                    obj_lower = obj.name.lower()
                    for med_obj in medical_objects:
                        if med_obj in obj_lower:
                            medical_indicators["has_medical_object"] = True

                    for body_part in body_parts:
                        if body_part in obj_lower:
                            medical_indicators["has_body_part"] = True

                    ru_obj_name = translate_text(obj.name, 'ru')
                    ru_object = f"{ru_obj_name} ({confidence_percent}%)"
                    ru_analysis["objects"].append(ru_object)

            if response.image_properties_annotation:
                colors = response.image_properties_annotation.dominant_colors.colors
                for i, color in enumerate(colors[:3]):
                    r, g, b = color.color.red, color.color.green, color.color.blue
                    # Convert score to percentage
                    score_percent = int(color.score * 100)

                    # Add color name approximation
                    color_name = get_color_name(r, g, b)
                    en_color = f"Color #{i+1}: {color_name} RGB({r},{g},{b}) ({score_percent}%)"
                    en_analysis["colors"].append(en_color)

                    # Translate color name to Russian
                    ru_color_name = translate_text(color_name, 'ru')
                    ru_color = f"Цвет #{i+1}: {ru_color_name} RGB({r},{g},{b}) ({score_percent}%)"
                    ru_analysis["colors"].append(ru_color)

            # Improve the output formatting with clearer section headers
            en_description = []
            ru_description = []

            if en_analysis["text"]:
                en_description.append("📝 TEXT CONTENT:")
                en_description.append(en_analysis["text"])

                ru_description.append("📝 ТЕКСТОВОЕ СОДЕРЖАНИЕ:")
                ru_description.append(ru_analysis["text"])

            if en_analysis["labels"]:
                en_description.append("\n🔍 DETECTED LABELS:")
                en_description.append(", ".join(en_analysis["labels"]))

                ru_description.append("\n🔍 РАСПОЗНАННЫЕ МЕТКИ:")
                ru_description.append(", ".join(ru_analysis["labels"]))

            if en_analysis["faces"]:
                en_description.append("\n👤 DETECTED FACES:")
                en_description.append(f"Total: {len(en_analysis['faces'])}. " + ", ".join(en_analysis["faces"]))

                ru_description.append("\n👤 ОБНАРУЖЕННЫЕ ЛИЦА:")
                ru_description.append(f"Всего: {len(ru_analysis['faces'])}. " + ", ".join(ru_analysis["faces"]))

            if en_analysis["objects"]:
                en_description.append("\n🧩 DETECTED OBJECTS:")
                en_description.append(", ".join(en_analysis["objects"]))

                ru_description.append("\n🧩 ОБНАРУЖЕННЫЕ ОБЪЕКТЫ:")
                ru_description.append(", ".join(ru_analysis["objects"]))

            if en_analysis["colors"]:
                en_description.append("\n🎨 DOMINANT COLORS:")
                en_description.append(", ".join(en_analysis["colors"]))

                ru_description.append("\n🎨 ДОМИНИРУЮЩИЕ ЦВЕТА:")
                ru_description.append(", ".join(ru_analysis["colors"]))

            # Use enhanced medical term detection
            medical_terms_result = find_medical_terms(" ".join([item for sublist in en_description for item in sublist]), settings.medical_keywords, 'en')
            medical_terms_en = [item["term"] for item in medical_terms_result]
            medical_terms_ru = [item["term"] for item in medical_terms_result]

            medical_indicators["medical_keywords_count"] = len(medical_terms_result)

            if medical_terms_result:
                en_description.append("\n⚕️ MEDICAL TERMS DETECTED:")
                terms_with_confidence = [f"{term['term']} ({term['confidence']})" for term in medical_terms_result]
                en_description.append(", ".join(terms_with_confidence))

                ru_description.append("\n⚕️ ОБНАРУЖЕННЫЕ МЕДИЦИНСКИЕ ТЕРМИНЫ:")
                ru_terms_with_confidence = [f"{term['term']} ({translate_text(term['confidence'], 'ru')})" for term in medical_terms_result]
                ru_description.append(", ".join(ru_terms_with_confidence))

            # Determine medical relevance
            medical_relevance = "low"
            if medical_indicators["has_medical_text"] or medical_indicators["medical_keywords_count"] > 2:
                medical_relevance = "high"
            elif medical_indicators["has_medical_object"] or medical_indicators["has_body_part"] or medical_indicators["medical_keywords_count"] > 0:
                medical_relevance = "medium"

            # Add medical relevance assessment
            en_description.append(f"\n🏥 MEDICAL RELEVANCE: {medical_relevance.upper()}")
            ru_description.append(f"\n🏥 МЕДИЦИНСКАЯ РЕЛЕВАНТНОСТЬ: {translate_text(medical_relevance, 'ru').upper()}")

            result = {
                "en_description": "\n".join(en_description),
                "ru_description": "\n".join(ru_description),
                "medical_terms": medical_terms_ru,
                "raw_text": ru_analysis["raw_text"],
                "medical_relevance": medical_relevance,
                "medical_indicators": medical_indicators
            }

            return result
    except Exception as e:
        print(f"Ошибка при анализе изображения через Vision API: {str(e)}")
        return {
            "en_description": f"Failed to analyze image: {str(e)}",
            "ru_description": f"Не удалось проанализировать изображение: {str(e)}",
            "medical_terms": [],
            "raw_text": "",
            "medical_relevance": "unknown"
        }

# Add a helper function to determine color names based on RGB values
def get_color_name(r: int, g: int, b: int) -> str:
    """Return a simple color name based on RGB values"""
    # Simple color detection
    if r > 200 and g > 200 and b > 200:
        return "White"
    elif r < 50 and g < 50 and b < 50:
        return "Black"
    elif r > 200 and g < 100 and b < 100:
        return "Red"
    elif r < 100 and g > 200 and b < 100:
        return "Green"
    elif r < 100 and g < 100 and b > 200:
        return "Blue"
    elif r > 200 and g > 200 and b < 100:
        return "Yellow"
    elif r > 200 and g < 100 and b > 200:
        return "Magenta"
    elif r < 100 and g > 200 and b > 200:
        return "Cyan"
    elif r > 200 and g > 100 and b < 100:
        return "Orange"
    elif r > 100 and g < 100 and b > 100:
        return "Purple"
    elif r > 150 and g > 100 and b > 150:
        return "Pink"
    elif r > 100 and g > 75 and b < 75:
        return "Brown"
    elif r > 150 and g > 150 and b > 150:
        return "Gray"
    else:
        return "Unknown"