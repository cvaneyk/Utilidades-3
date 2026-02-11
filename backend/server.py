from fastapi import FastAPI, APIRouter, UploadFile, File, HTTPException, Response
from fastapi.responses import StreamingResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone
import qrcode
from qrcode.image.styledpil import StyledPilImage
from qrcode.image.styles.moduledrawers import RoundedModuleDrawer
import io
import base64
from PIL import Image
import shortuuid
import string
import secrets
import re
import httpx

ROOT_DIR = Path(__file__).parent

# is.gd API helper
async def shorten_with_isgd(url: str) -> dict:
    """Shorten URL using is.gd API"""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                "https://is.gd/create.php",
                params={"format": "json", "url": url},
                timeout=10.0
            )
            if response.status_code == 200:
                data = response.json()
                if "shorturl" in data:
                    return {"success": True, "short_url": data["shorturl"]}
                else:
                    return {"success": False, "error": data.get("errormessage", "Unknown error")}
            return {"success": False, "error": f"HTTP {response.status_code}"}
    except Exception as e:
        return {"success": False, "error": str(e)}
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# ============== MODELS ==============

class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StatusCheckCreate(BaseModel):
    client_name: str

# QR Code Models
class QRCodeItem(BaseModel):
    content: str
    content_type: str = "url"  # url, text, email, phone, wifi

class QRCodeRequest(BaseModel):
    items: List[QRCodeItem]  # Support multiple QR codes
    fg_color: str = "#000000"
    bg_color: str = "#FFFFFF"
    size: int = 300
    use_isgd: bool = True  # Use is.gd for URL shortening

class QRCodeResultItem(BaseModel):
    original_content: str
    final_content: str
    image_base64: str
    success: bool
    error: Optional[str] = None

class QRCodeResponse(BaseModel):
    results: List[QRCodeResultItem]

# Shortlink Models
class ShortlinkCreate(BaseModel):
    urls: List[str]  # Support multiple URLs
    use_isgd: bool = True  # Use is.gd API

class ShortlinkItem(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    original_url: str
    short_url: str
    short_code: str
    provider: str  # "isgd" or "local"
    clicks: int = 0
    created_at: str

class Shortlink(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    original_url: str
    short_code: str
    short_url: Optional[str] = None
    provider: str = "local"
    clicks: int = 0
    created_at: str

# Text to HTML Models
class TextToHTMLRequest(BaseModel):
    text: str
    format_type: str = "basic"  # basic, markdown

class TextToHTMLResponse(BaseModel):
    html: str

# Password Generator Models
class PasswordRequest(BaseModel):
    length: int = 16
    uppercase: bool = True
    lowercase: bool = True
    numbers: bool = True
    symbols: bool = True

class PasswordResponse(BaseModel):
    password: str
    strength: str

# Word Counter Models
class WordCountRequest(BaseModel):
    text: str

class WordCountResponse(BaseModel):
    characters: int
    characters_no_spaces: int
    words: int
    sentences: int
    paragraphs: int
    reading_time_minutes: float

# Base64 Models
class Base64Request(BaseModel):
    text: str
    operation: str = "encode"  # encode or decode

class Base64Response(BaseModel):
    result: str
    success: bool
    error: Optional[str] = None

# ============== ROUTES ==============

@api_router.get("/")
async def root():
    return {"message": "E1 Utility Suite API"}

# Status endpoints
@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.model_dump()
    status_obj = StatusCheck(**status_dict)
    doc = status_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    _ = await db.status_checks.insert_one(doc)
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find({}, {"_id": 0}).to_list(1000)
    for check in status_checks:
        if isinstance(check['timestamp'], str):
            check['timestamp'] = datetime.fromisoformat(check['timestamp'])
    return status_checks

# ============== QR CODE ==============

@api_router.post("/qr/generate", response_model=QRCodeResponse)
async def generate_qr_code(request: QRCodeRequest):
    try:
        # Prepare content based on type
        content = request.content
        if request.content_type == "email":
            content = f"mailto:{request.content}"
        elif request.content_type == "phone":
            content = f"tel:{request.content}"
        elif request.content_type == "wifi":
            # Expected format: SSID,password,encryption(WPA/WEP/nopass)
            parts = request.content.split(",")
            if len(parts) >= 2:
                ssid = parts[0]
                password = parts[1] if len(parts) > 1 else ""
                encryption = parts[2] if len(parts) > 2 else "WPA"
                content = f"WIFI:T:{encryption};S:{ssid};P:{password};;"
        
        # Generate QR code
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_H,
            box_size=10,
            border=4,
        )
        qr.add_data(content)
        qr.make(fit=True)
        
        # Create image with colors
        img = qr.make_image(fill_color=request.fg_color, back_color=request.bg_color)
        
        # Resize to requested size
        img = img.resize((request.size, request.size), Image.Resampling.LANCZOS)
        
        # Convert to base64
        buffer = io.BytesIO()
        img.save(buffer, format='PNG')
        buffer.seek(0)
        img_base64 = base64.b64encode(buffer.getvalue()).decode()
        
        return QRCodeResponse(image_base64=img_base64, content=content)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# ============== SHORTLINKS ==============

@api_router.post("/shortlinks/create", response_model=Shortlink)
async def create_shortlink(request: ShortlinkCreate):
    try:
        # Generate or use custom slug
        if request.custom_slug:
            short_code = request.custom_slug
            # Check if custom slug already exists
            existing = await db.shortlinks.find_one({"short_code": short_code})
            if existing:
                raise HTTPException(status_code=400, detail="Custom slug already in use")
        else:
            short_code = shortuuid.uuid()[:7]
        
        # Create shortlink document
        shortlink_id = str(uuid.uuid4())
        shortlink_doc = {
            "id": shortlink_id,
            "original_url": request.original_url,
            "short_code": short_code,
            "clicks": 0,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        
        await db.shortlinks.insert_one(shortlink_doc)
        
        return Shortlink(
            id=shortlink_id,
            original_url=request.original_url,
            short_code=short_code,
            clicks=0,
            created_at=shortlink_doc["created_at"]
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@api_router.get("/shortlinks", response_model=List[Shortlink])
async def get_shortlinks():
    shortlinks = await db.shortlinks.find({}, {"_id": 0}).to_list(100)
    return [Shortlink(**sl) for sl in shortlinks]

@api_router.get("/shortlinks/{short_code}")
async def redirect_shortlink(short_code: str):
    shortlink = await db.shortlinks.find_one({"short_code": short_code})
    if not shortlink:
        raise HTTPException(status_code=404, detail="Shortlink not found")
    
    # Increment clicks
    await db.shortlinks.update_one(
        {"short_code": short_code},
        {"$inc": {"clicks": 1}}
    )
    
    return {"original_url": shortlink["original_url"]}

@api_router.delete("/shortlinks/{shortlink_id}")
async def delete_shortlink(shortlink_id: str):
    result = await db.shortlinks.delete_one({"id": shortlink_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Shortlink not found")
    return {"message": "Shortlink deleted"}

# ============== IMAGE CONVERTER ==============

@api_router.post("/images/convert-to-webp")
async def convert_images_to_webp(files: List[UploadFile] = File(...)):
    if len(files) > 10:
        raise HTTPException(status_code=400, detail="Maximum 10 images allowed per batch")
    
    converted_images = []
    
    for file in files:
        try:
            # Check file size (5MB limit)
            content = await file.read()
            if len(content) > 5 * 1024 * 1024:
                converted_images.append({
                    "original_name": file.filename,
                    "success": False,
                    "error": "File exceeds 5MB limit"
                })
                continue
            
            # Convert to WebP
            image = Image.open(io.BytesIO(content))
            
            # Convert to RGB if necessary (for PNG with transparency, etc.)
            if image.mode in ('RGBA', 'LA', 'P'):
                background = Image.new('RGB', image.size, (255, 255, 255))
                if image.mode == 'P':
                    image = image.convert('RGBA')
                background.paste(image, mask=image.split()[-1] if image.mode == 'RGBA' else None)
                image = background
            elif image.mode != 'RGB':
                image = image.convert('RGB')
            
            # Save as WebP with 75% quality for smaller files
            buffer = io.BytesIO()
            image.save(buffer, format='WEBP', quality=75)
            buffer.seek(0)
            
            # Convert to base64
            webp_base64 = base64.b64encode(buffer.getvalue()).decode()
            
            original_name = file.filename or "image"
            new_name = os.path.splitext(original_name)[0] + ".webp"
            
            converted_images.append({
                "original_name": original_name,
                "new_name": new_name,
                "success": True,
                "webp_base64": webp_base64,
                "size_bytes": len(buffer.getvalue())
            })
            
        except Exception as e:
            converted_images.append({
                "original_name": file.filename,
                "success": False,
                "error": str(e)
            })
    
    return {"images": converted_images}

# ============== TEXT TO HTML ==============

@api_router.post("/text-to-html", response_model=TextToHTMLResponse)
async def convert_text_to_html(request: TextToHTMLRequest):
    text = request.text
    
    if request.format_type == "markdown":
        # Simple markdown conversion
        html = text
        
        # Headers
        html = re.sub(r'^### (.+)$', r'<h3>\1</h3>', html, flags=re.MULTILINE)
        html = re.sub(r'^## (.+)$', r'<h2>\1</h2>', html, flags=re.MULTILINE)
        html = re.sub(r'^# (.+)$', r'<h1>\1</h1>', html, flags=re.MULTILINE)
        
        # Bold and italic
        html = re.sub(r'\*\*\*(.+?)\*\*\*', r'<strong><em>\1</em></strong>', html)
        html = re.sub(r'\*\*(.+?)\*\*', r'<strong>\1</strong>', html)
        html = re.sub(r'\*(.+?)\*', r'<em>\1</em>', html)
        
        # Code blocks
        html = re.sub(r'```(.+?)```', r'<pre><code>\1</code></pre>', html, flags=re.DOTALL)
        html = re.sub(r'`(.+?)`', r'<code>\1</code>', html)
        
        # Links
        html = re.sub(r'\[(.+?)\]\((.+?)\)', r'<a href="\2">\1</a>', html)
        
        # Lists
        lines = html.split('\n')
        in_list = False
        new_lines = []
        for line in lines:
            if line.strip().startswith('- '):
                if not in_list:
                    new_lines.append('<ul>')
                    in_list = True
                new_lines.append(f'<li>{line.strip()[2:]}</li>')
            else:
                if in_list:
                    new_lines.append('</ul>')
                    in_list = False
                new_lines.append(line)
        if in_list:
            new_lines.append('</ul>')
        html = '\n'.join(new_lines)
        
        # Paragraphs
        paragraphs = html.split('\n\n')
        html = ''.join([f'<p>{p}</p>' if not p.startswith('<') else p for p in paragraphs if p.strip()])
        
    else:
        # Basic conversion - escape HTML and preserve formatting
        html = text.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
        html = html.replace('\n\n', '</p><p>')
        html = html.replace('\n', '<br>')
        html = f'<p>{html}</p>'
    
    return TextToHTMLResponse(html=html)

# ============== PASSWORD GENERATOR ==============

@api_router.post("/password/generate", response_model=PasswordResponse)
async def generate_password(request: PasswordRequest):
    characters = ""
    
    if request.lowercase:
        characters += string.ascii_lowercase
    if request.uppercase:
        characters += string.ascii_uppercase
    if request.numbers:
        characters += string.digits
    if request.symbols:
        characters += "!@#$%^&*()_+-=[]{}|;:,.<>?"
    
    if not characters:
        raise HTTPException(status_code=400, detail="At least one character type must be selected")
    
    length = max(4, min(128, request.length))
    password = ''.join(secrets.choice(characters) for _ in range(length))
    
    # Calculate strength
    strength_score = 0
    if request.lowercase:
        strength_score += 1
    if request.uppercase:
        strength_score += 1
    if request.numbers:
        strength_score += 1
    if request.symbols:
        strength_score += 1
    
    if length >= 16:
        strength_score += 2
    elif length >= 12:
        strength_score += 1
    
    if strength_score >= 5:
        strength = "strong"
    elif strength_score >= 3:
        strength = "medium"
    else:
        strength = "weak"
    
    return PasswordResponse(password=password, strength=strength)

# ============== WORD COUNTER ==============

@api_router.post("/word-counter", response_model=WordCountResponse)
async def count_words(request: WordCountRequest):
    text = request.text
    
    # Characters
    characters = len(text)
    characters_no_spaces = len(text.replace(' ', '').replace('\n', '').replace('\t', ''))
    
    # Words
    words = len(text.split()) if text.strip() else 0
    
    # Sentences (rough estimate)
    sentences = len(re.findall(r'[.!?]+', text)) or (1 if text.strip() else 0)
    
    # Paragraphs
    paragraphs = len([p for p in text.split('\n\n') if p.strip()]) or (1 if text.strip() else 0)
    
    # Reading time (average 200 words per minute)
    reading_time_minutes = round(words / 200, 2)
    
    return WordCountResponse(
        characters=characters,
        characters_no_spaces=characters_no_spaces,
        words=words,
        sentences=sentences,
        paragraphs=paragraphs,
        reading_time_minutes=reading_time_minutes
    )

# ============== BASE64 ==============

@api_router.post("/base64", response_model=Base64Response)
async def process_base64(request: Base64Request):
    try:
        if request.operation == "encode":
            result = base64.b64encode(request.text.encode()).decode()
            return Base64Response(result=result, success=True)
        elif request.operation == "decode":
            result = base64.b64decode(request.text).decode()
            return Base64Response(result=result, success=True)
        else:
            return Base64Response(result="", success=False, error="Invalid operation")
    except Exception as e:
        return Base64Response(result="", success=False, error=str(e))

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
