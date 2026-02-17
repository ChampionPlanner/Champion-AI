from fastapi import FastAPI, APIRouter, HTTPException, Query, Header, Request, Response, Cookie
from fastapi.responses import StreamingResponse, RedirectResponse, JSONResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta
from emergentintegrations.llm.openai import LlmChat, UserMessage
from emergentintegrations.llm.openai.image_generation import OpenAIImageGeneration
import base64
import secrets
import io
import json
import hashlib
import requests
import httpx

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Get Emergent LLM Key
EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY')

# PayPal Configuration
PAYPAL_CLIENT_ID = os.environ.get('PAYPAL_CLIENT_ID')
PAYPAL_CLIENT_SECRET = os.environ.get('PAYPAL_CLIENT_SECRET')
PAYPAL_MODE = os.environ.get('PAYPAL_MODE', 'sandbox')
PAYPAL_BASE_URL = "https://api-m.paypal.com" if PAYPAL_MODE == "live" else "https://api-m.sandbox.paypal.com"

# Admin credentials (you can change this password)
ADMIN_PASSWORD = os.environ.get('ADMIN_PASSWORD', 'ChampionAdmin2025!')
ADMIN_USERNAME = os.environ.get('ADMIN_USERNAME', 'admin')
ADMIN_TOKENS = {}  # Simple in-memory token store

# Create the main app
app = FastAPI(title="Champion AI Studio API", version="2.0")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# =============================================================================
# LANGUAGES SUPPORT
# =============================================================================
SUPPORTED_LANGUAGES = {
    "en": "English",
    "es": "Spanish",
    "fr": "French",
    "de": "German",
    "it": "Italian",
    "pt": "Portuguese",
    "nl": "Dutch",
    "ru": "Russian",
    "zh": "Chinese",
    "ja": "Japanese",
    "ko": "Korean",
    "ar": "Arabic",
    "hi": "Hindi",
    "tr": "Turkish",
    "pl": "Polish",
    "vi": "Vietnamese",
    "th": "Thai",
    "id": "Indonesian",
    "sv": "Swedish",
    "da": "Danish"
}

# =============================================================================
# TEMPLATES LIBRARY
# =============================================================================
TEMPLATES = {
    "real_estate": {
        "name": "Real Estate",
        "icon": "Home",
        "templates": [
            {"id": "re_listing", "name": "Property Listing", "prompt": "Create a compelling property listing for: {topic}. Include key features, neighborhood highlights, and a strong call-to-action."},
            {"id": "re_email", "name": "Open House Invite", "prompt": "Write an engaging open house invitation email for: {topic}. Include date, time, property highlights, and RSVP details."},
            {"id": "re_social", "name": "Just Listed Post", "prompt": "Create 3 social media posts announcing a new listing: {topic}. Include emojis, hashtags, and excitement."}
        ]
    },
    "fitness": {
        "name": "Fitness & Health",
        "icon": "Dumbbell",
        "templates": [
            {"id": "fit_program", "name": "Workout Program", "prompt": "Create a detailed workout program description for: {topic}. Include benefits, target audience, and what's included."},
            {"id": "fit_motivation", "name": "Motivation Post", "prompt": "Write 5 motivational fitness social media posts about: {topic}. Make them inspiring and shareable."},
            {"id": "fit_nutrition", "name": "Nutrition Guide", "prompt": "Create a nutrition guide introduction for: {topic}. Include key principles and benefits."}
        ]
    },
    "saas": {
        "name": "SaaS & Tech",
        "icon": "Laptop",
        "templates": [
            {"id": "saas_landing", "name": "Landing Page Copy", "prompt": "Write conversion-focused landing page copy for: {topic}. Include hero, features, benefits, testimonials placeholder, and CTA."},
            {"id": "saas_email_sequence", "name": "Onboarding Emails", "prompt": "Create a 5-email onboarding sequence for: {topic}. Welcome, feature highlights, tips, success story, and upgrade prompt."},
            {"id": "saas_changelog", "name": "Product Update", "prompt": "Write an engaging product update announcement for: {topic}. Make it exciting and highlight user benefits."}
        ]
    },
    "ecommerce": {
        "name": "E-Commerce",
        "icon": "ShoppingCart",
        "templates": [
            {"id": "ec_product", "name": "Product Description", "prompt": "Write a compelling product description for: {topic}. Include features, benefits, specifications, and urgency."},
            {"id": "ec_sale", "name": "Sale Announcement", "prompt": "Create sale announcement content for: {topic}. Include social posts, email subject lines, and ad copy."},
            {"id": "ec_review_response", "name": "Review Response", "prompt": "Write professional responses to customer reviews about: {topic}. Include positive and negative review templates."}
        ]
    },
    "agency": {
        "name": "Marketing Agency",
        "icon": "Briefcase",
        "templates": [
            {"id": "ag_proposal", "name": "Client Proposal", "prompt": "Create a marketing proposal outline for: {topic}. Include objectives, strategy, deliverables, and timeline."},
            {"id": "ag_case_study", "name": "Case Study", "prompt": "Write a case study structure for: {topic}. Include challenge, solution, results, and testimonial placeholder."},
            {"id": "ag_pitch", "name": "Pitch Deck Content", "prompt": "Create pitch deck content for: {topic}. Include slides for problem, solution, market, traction, and ask."}
        ]
    }
}

# =============================================================================
# CONTENT TYPES
# =============================================================================
CONTENT_TYPES = {
    "blog_post": {
        "name": "Blog Post",
        "description": "SEO-optimized blog article",
        "credits": 2,
        "icon": "FileText"
    },
    "social_media": {
        "name": "Social Media",
        "description": "Engaging posts for any platform",
        "credits": 1,
        "icon": "Share2"
    },
    "product_description": {
        "name": "Product Description",
        "description": "Compelling product copy",
        "credits": 1,
        "icon": "ShoppingBag"
    },
    "email": {
        "name": "Email Copy",
        "description": "Professional email templates",
        "credits": 1,
        "icon": "Mail"
    },
    "ad_copy": {
        "name": "Ad Copy",
        "description": "High-converting advertisements",
        "credits": 1,
        "icon": "Megaphone"
    },
    "landing_page": {
        "name": "Landing Page",
        "description": "Conversion-focused web copy",
        "credits": 3,
        "icon": "Layout"
    },
    "web_app_design": {
        "name": "Component Code",
        "description": "Generate React + Tailwind code",
        "credits": 3,
        "icon": "Palette"
    },
    "wireframe": {
        "name": "Full App Code",
        "description": "Complete multi-page app structure",
        "credits": 4,
        "icon": "Layers"
    },
    "image": {
        "name": "AI Image",
        "description": "Generate custom images",
        "credits": 2,
        "icon": "Image"
    },
    "repurpose": {
        "name": "Content Repurpose",
        "description": "Turn 1 piece into 10+",
        "credits": 3,
        "icon": "RefreshCw"
    }
}

PRICING_PLANS = {
    "free": {"name": "Free Trial", "credits": 3, "price": 0},
    "starter": {"name": "Starter", "credits": 50, "price": 9.99, "features": ["50 credits/month", "Email support", "All content types"]},
    "pro": {"name": "Pro", "credits": 200, "price": 29.99, "features": ["200 credits/month", "Priority support", "API access", "Advanced templates"]},
    "business": {"name": "Business", "credits": 500, "price": 79.99, "features": ["500 credits/month", "Dedicated support", "API access", "Custom templates", "Team features"]}
}

# =============================================================================
# MODELS
# =============================================================================
class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: str
    name: str
    picture: Optional[str] = None  # Profile picture URL (from Google OAuth)
    auth_provider: str = "email"  # "email" or "google"
    credits: int = 3
    plan: str = "free"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    generations: List[str] = []
    referral_code: Optional[str] = Field(default_factory=lambda: secrets.token_urlsafe(8))
    referred_by: Optional[str] = None
    referral_credits_earned: int = 0
    brand_voices: List[Dict] = []
    api_key: Optional[str] = None
    favorites: List[str] = []  # List of generation IDs
    last_daily_credit: Optional[str] = None  # Date string of last daily credit claim
    subscription_id: Optional[str] = None  # Stripe subscription ID
    subscription_status: Optional[str] = None  # active, canceled, past_due

class UserCreate(BaseModel):
    email: str
    name: str
    password: str
    referral_code: Optional[str] = None

class UserLogin(BaseModel):
    email: str
    password: str

class BrandVoice(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    tone: str
    style: str
    keywords: List[str] = []
    avoid_words: List[str] = []
    example_content: Optional[str] = None

class ContentGeneration(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    content_type: str
    topic: str
    tone: str = "professional"
    language: str = "en"
    generated_content: str
    credits_used: int
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    image_url: Optional[str] = None

class GenerateRequest(BaseModel):
    user_id: str
    content_type: str
    topic: str
    tone: str = "professional"
    language: str = "en"
    additional_info: Optional[str] = None
    brand_voice_id: Optional[str] = None
    template_id: Optional[str] = None

class BulkGenerateRequest(BaseModel):
    user_id: str
    content_type: str
    topics: List[str]
    tone: str = "professional"
    language: str = "en"

class RepurposeRequest(BaseModel):
    user_id: str
    original_content: str
    output_formats: List[str]  # ["social_media", "email", "ad_copy", "thread"]
    language: str = "en"

class ImageGenerateRequest(BaseModel):
    user_id: str
    prompt: str
    style: str = "realistic"  # realistic, illustration, 3d, artistic

class PurchaseCreditsRequest(BaseModel):
    user_id: str
    plan: str

# =============================================================================
# API ROUTES
# =============================================================================
@api_router.get("/")
async def root():
    return {"message": "Champion AI Studio API", "version": "2.0"}

@api_router.get("/content-types")
async def get_content_types():
    return CONTENT_TYPES

@api_router.get("/pricing")
async def get_pricing():
    return PRICING_PLANS

@api_router.get("/languages")
async def get_languages():
    return SUPPORTED_LANGUAGES

@api_router.get("/templates")
async def get_templates():
    return TEMPLATES

# =============================================================================
# USER ROUTES
# =============================================================================
def hash_password(password: str) -> str:
    """Hash a password using SHA256"""
    return hashlib.sha256(password.encode()).hexdigest()

@api_router.post("/users", response_model=User)
async def create_user(input: UserCreate):
    """Register a new user"""
    existing = await db.users.find_one({"email": input.email}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered. Please login instead.")
    
    # Hash password
    password_hash = hash_password(input.password)
    
    # Create user data
    user_data = {"email": input.email, "name": input.name}
    
    # Handle referral
    bonus_credits = 0
    if input.referral_code:
        referrer = await db.users.find_one({"referral_code": input.referral_code}, {"_id": 0})
        if referrer:
            user_data['referred_by'] = referrer['id']
            bonus_credits = 2  # Bonus credits for new user who was referred
            # Give referrer 5 credits
            await db.users.update_one(
                {"id": referrer['id']},
                {"$inc": {"credits": 5, "referral_credits_earned": 5}}
            )
    
    user = User(**user_data)
    user.credits += bonus_credits
    
    doc = user.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    doc['password_hash'] = password_hash  # Store password hash
    await db.users.insert_one(doc)
    return user

@api_router.post("/login", response_model=User)
async def login_user(input: UserLogin):
    """Login with email and password"""
    user = await db.users.find_one({"email": input.email}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    # Verify password
    password_hash = hash_password(input.password)
    stored_hash = user.get('password_hash', '')
    
    # For users created before password system, allow any password and set it
    if not stored_hash:
        # Migrate old user - set their password
        await db.users.update_one(
            {"email": input.email},
            {"$set": {"password_hash": password_hash}}
        )
    elif stored_hash != password_hash:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    if isinstance(user['created_at'], str):
        user['created_at'] = datetime.fromisoformat(user['created_at'])
    
    # Remove password_hash from response
    user.pop('password_hash', None)
    return User(**user)

# =============================================================================
# GOOGLE OAUTH AUTHENTICATION
# REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
# =============================================================================
EMERGENT_AUTH_URL = "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data"

class GoogleAuthSession(BaseModel):
    session_id: str

@api_router.post("/auth/google/session")
async def process_google_session(data: GoogleAuthSession, response: Response):
    """Process Google OAuth session_id and create user session"""
    try:
        # Call Emergent Auth to get user data
        async with httpx.AsyncClient() as client:
            auth_response = await client.get(
                EMERGENT_AUTH_URL,
                headers={"X-Session-ID": data.session_id}
            )
            
            if auth_response.status_code != 200:
                raise HTTPException(status_code=401, detail="Invalid session")
            
            auth_data = auth_response.json()
        
        email = auth_data.get("email")
        name = auth_data.get("name")
        picture = auth_data.get("picture")
        session_token = auth_data.get("session_token")
        
        if not email or not session_token:
            raise HTTPException(status_code=400, detail="Invalid auth data")
        
        # Check if user exists
        existing_user = await db.users.find_one({"email": email}, {"_id": 0})
        
        if existing_user:
            # Update existing user with Google data
            await db.users.update_one(
                {"email": email},
                {"$set": {"picture": picture, "name": name}}
            )
            user_id = existing_user.get("id")
            if isinstance(existing_user['created_at'], str):
                existing_user['created_at'] = datetime.fromisoformat(existing_user['created_at'])
            existing_user.pop('password_hash', None)
            existing_user['picture'] = picture
            existing_user['name'] = name
            user = User(**existing_user)
        else:
            # Create new user
            user = User(
                email=email,
                name=name,
                picture=picture,
                auth_provider="google",
                credits=3
            )
            doc = user.model_dump()
            doc['created_at'] = doc['created_at'].isoformat()
            await db.users.insert_one(doc)
            user_id = user.id
        
        # Store session in database
        expires_at = datetime.now(timezone.utc) + timedelta(days=7)
        await db.user_sessions.update_one(
            {"user_id": user_id},
            {
                "$set": {
                    "user_id": user_id,
                    "session_token": session_token,
                    "expires_at": expires_at.isoformat(),
                    "created_at": datetime.now(timezone.utc).isoformat()
                }
            },
            upsert=True
        )
        
        # Set httpOnly cookie
        response.set_cookie(
            key="session_token",
            value=session_token,
            httponly=True,
            secure=True,
            samesite="none",
            path="/",
            max_age=7 * 24 * 60 * 60  # 7 days
        )
        
        return {"success": True, "user": user.model_dump()}
        
    except httpx.RequestError as e:
        logging.error(f"Auth request error: {e}")
        raise HTTPException(status_code=500, detail="Authentication service unavailable")

@api_router.get("/auth/me")
async def get_current_user(
    request: Request,
    session_token: Optional[str] = Cookie(default=None),
    authorization: Optional[str] = Header(default=None)
):
    """Get current authenticated user from session"""
    # Get token from cookie or header
    token = session_token
    if not token and authorization:
        if authorization.startswith("Bearer "):
            token = authorization[7:]
        else:
            token = authorization
    
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    # Find session
    session_doc = await db.user_sessions.find_one({"session_token": token}, {"_id": 0})
    if not session_doc:
        raise HTTPException(status_code=401, detail="Invalid session")
    
    # Check expiry
    expires_at = session_doc.get("expires_at")
    if isinstance(expires_at, str):
        expires_at = datetime.fromisoformat(expires_at)
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    if expires_at < datetime.now(timezone.utc):
        # Clean up expired session
        await db.user_sessions.delete_one({"session_token": token})
        raise HTTPException(status_code=401, detail="Session expired")
    
    # Get user
    user = await db.users.find_one({"id": session_doc["user_id"]}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if isinstance(user['created_at'], str):
        user['created_at'] = datetime.fromisoformat(user['created_at'])
    user.pop('password_hash', None)
    
    return User(**user)

@api_router.post("/auth/logout")
async def logout(response: Response, session_token: Optional[str] = Cookie(default=None)):
    """Logout user and clear session"""
    if session_token:
        await db.user_sessions.delete_one({"session_token": session_token})
    
    response.delete_cookie(key="session_token", path="/", samesite="none", secure=True)
    return {"success": True, "message": "Logged out successfully"}

# Password Reset
PASSWORD_RESET_TOKENS = {}  # In-memory store for reset tokens

class PasswordResetRequest(BaseModel):
    email: str

class PasswordResetConfirm(BaseModel):
    email: str
    token: str
    new_password: str

@api_router.post("/forgot-password")
async def forgot_password(request: PasswordResetRequest):
    """Request password reset - generates a 6-digit code"""
    user = await db.users.find_one({"email": request.email}, {"_id": 0})
    if not user:
        # Don't reveal if email exists or not for security
        return {"success": True, "message": "If this email exists, a reset code has been generated"}
    
    # Generate 6-digit reset code
    reset_code = ''.join([str(secrets.randbelow(10)) for _ in range(6)])
    expires = datetime.now(timezone.utc) + timedelta(minutes=15)
    
    PASSWORD_RESET_TOKENS[request.email] = {
        "code": reset_code,
        "expires": expires
    }
    
    # In production, you would email this code
    # For now, we'll return it (you can remove this in production)
    return {
        "success": True, 
        "message": "Reset code generated. Check your email.",
        "code": reset_code,  # Remove this line in production - only for testing
        "expires_in": "15 minutes"
    }

@api_router.post("/reset-password")
async def reset_password(request: PasswordResetConfirm):
    """Reset password with the code"""
    if request.email not in PASSWORD_RESET_TOKENS:
        raise HTTPException(status_code=400, detail="No reset code found. Please request a new one.")
    
    token_data = PASSWORD_RESET_TOKENS[request.email]
    
    # Check if expired
    if datetime.now(timezone.utc) > token_data["expires"]:
        del PASSWORD_RESET_TOKENS[request.email]
        raise HTTPException(status_code=400, detail="Reset code has expired. Please request a new one.")
    
    # Verify code
    if token_data["code"] != request.token:
        raise HTTPException(status_code=400, detail="Invalid reset code")
    
    # Validate new password
    if len(request.new_password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")
    
    # Update password
    new_hash = hash_password(request.new_password)
    result = await db.users.update_one(
        {"email": request.email},
        {"$set": {"password_hash": new_hash}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Remove used token
    del PASSWORD_RESET_TOKENS[request.email]
    
    return {"success": True, "message": "Password has been reset successfully"}

@api_router.get("/users/{user_id}", response_model=User)
async def get_user(user_id: str):
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if isinstance(user['created_at'], str):
        user['created_at'] = datetime.fromisoformat(user['created_at'])
    user.pop('password_hash', None)
    return User(**user)

@api_router.get("/users/email/{email}", response_model=User)
async def get_user_by_email(email: str):
    user = await db.users.find_one({"email": email}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if isinstance(user['created_at'], str):
        user['created_at'] = datetime.fromisoformat(user['created_at'])
    user.pop('password_hash', None)
    return User(**user)

# =============================================================================
# BRAND VOICE ROUTES
# =============================================================================
@api_router.post("/users/{user_id}/brand-voice")
async def create_brand_voice(user_id: str, brand_voice: BrandVoice):
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    voice_data = brand_voice.model_dump()
    await db.users.update_one(
        {"id": user_id},
        {"$push": {"brand_voices": voice_data}}
    )
    return {"success": True, "brand_voice": voice_data}

@api_router.get("/users/{user_id}/brand-voices")
async def get_brand_voices(user_id: str):
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user.get('brand_voices', [])

@api_router.delete("/users/{user_id}/brand-voice/{voice_id}")
async def delete_brand_voice(user_id: str, voice_id: str):
    await db.users.update_one(
        {"id": user_id},
        {"$pull": {"brand_voices": {"id": voice_id}}}
    )
    return {"success": True}

# =============================================================================
# API KEY MANAGEMENT
# =============================================================================
@api_router.post("/users/{user_id}/api-key")
async def generate_api_key(user_id: str):
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    api_key = f"cai_{secrets.token_urlsafe(32)}"
    await db.users.update_one(
        {"id": user_id},
        {"$set": {"api_key": api_key}}
    )
    return {"api_key": api_key}

@api_router.get("/users/{user_id}/api-key")
async def get_api_key(user_id: str):
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {"api_key": user.get('api_key')}

# =============================================================================
# DAILY FREE CREDIT
# =============================================================================
@api_router.post("/users/{user_id}/claim-daily-credit")
async def claim_daily_credit(user_id: str):
    """Claim 1 free credit per day"""
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    last_claim = user.get('last_daily_credit')
    
    if last_claim == today:
        raise HTTPException(status_code=400, detail="Daily credit already claimed today. Come back tomorrow!")
    
    await db.users.update_one(
        {"id": user_id},
        {"$inc": {"credits": 1}, "$set": {"last_daily_credit": today}}
    )
    
    return {"success": True, "message": "You got 1 free credit!", "new_credits": user['credits'] + 1}

# =============================================================================
# FAVORITES
# =============================================================================
@api_router.post("/users/{user_id}/favorites/{generation_id}")
async def add_favorite(user_id: str, generation_id: str):
    """Add a generation to favorites"""
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    favorites = user.get('favorites', [])
    if generation_id in favorites:
        raise HTTPException(status_code=400, detail="Already in favorites")
    
    await db.users.update_one(
        {"id": user_id},
        {"$push": {"favorites": generation_id}}
    )
    return {"success": True, "message": "Added to favorites"}

@api_router.delete("/users/{user_id}/favorites/{generation_id}")
async def remove_favorite(user_id: str, generation_id: str):
    """Remove a generation from favorites"""
    await db.users.update_one(
        {"id": user_id},
        {"$pull": {"favorites": generation_id}}
    )
    return {"success": True, "message": "Removed from favorites"}

@api_router.get("/users/{user_id}/favorites")
async def get_favorites(user_id: str):
    """Get user's favorite generations"""
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    favorite_ids = user.get('favorites', [])
    if not favorite_ids:
        return []
    
    favorites = await db.generations.find(
        {"id": {"$in": favorite_ids}}, 
        {"_id": 0}
    ).to_list(100)
    
    return favorites

# =============================================================================
# PUBLIC GALLERY
# =============================================================================
@api_router.post("/generations/{generation_id}/publish")
async def publish_to_gallery(generation_id: str, user_id: str = Query(...)):
    """Publish a generation to the public gallery"""
    generation = await db.generations.find_one({"id": generation_id, "user_id": user_id}, {"_id": 0})
    if not generation:
        raise HTTPException(status_code=404, detail="Generation not found")
    
    await db.generations.update_one(
        {"id": generation_id},
        {"$set": {"is_public": True, "published_at": datetime.now(timezone.utc).isoformat()}}
    )
    return {"success": True, "message": "Published to gallery!"}

@api_router.delete("/generations/{generation_id}/unpublish")
async def unpublish_from_gallery(generation_id: str, user_id: str = Query(...)):
    """Remove a generation from the public gallery"""
    await db.generations.update_one(
        {"id": generation_id, "user_id": user_id},
        {"$set": {"is_public": False}}
    )
    return {"success": True, "message": "Removed from gallery"}

@api_router.get("/gallery")
async def get_public_gallery(limit: int = Query(20, le=50), skip: int = Query(0)):
    """Get public gallery items"""
    gallery = await db.generations.find(
        {"is_public": True},
        {"_id": 0, "generated_content": {"$slice": 500}}  # Truncate content
    ).sort("published_at", -1).skip(skip).limit(limit).to_list(limit)
    
    # Get user names for each item
    for item in gallery:
        user = await db.users.find_one({"id": item.get("user_id")}, {"_id": 0, "name": 1})
        item["author_name"] = user.get("name", "Anonymous") if user else "Anonymous"
    
    return gallery

# =============================================================================
# RESUME BUILDER
# =============================================================================
class ResumeRequest(BaseModel):
    user_id: str
    name: str
    email: str
    phone: str = ""
    location: str = ""
    linkedin: str = ""
    summary: str = ""
    experience: List[Dict] = []  # [{company, title, start_date, end_date, description}]
    education: List[Dict] = []  # [{school, degree, field, start_date, end_date}]
    skills: List[str] = []
    template: str = "modern"  # modern, classic, minimal
    enhance_with_ai: bool = True

@api_router.post("/generate-resume")
async def generate_resume(request: ResumeRequest):
    """Generate a professional resume with AI enhancement"""
    user = await db.users.find_one({"id": request.user_id}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Build the resume content
    enhanced_summary = request.summary
    enhanced_experiences = request.experience
    
    # Use AI to enhance content if requested
    if request.enhance_with_ai and (request.summary or request.experience):
        try:
            llm_client = LlmChat(
                api_key=EMERGENT_LLM_KEY,
                session_id=str(uuid.uuid4()),
                system_message="You are a professional resume writer. Enhance the content to be more impactful and professional while keeping it concise. Use action verbs and quantify achievements where possible."
            )
            llm_client = llm_client.with_model("openai", "gpt-4o-mini")
            
            # Enhance summary
            if request.summary:
                summary_prompt = f"Enhance this professional summary to be more impactful (keep it under 100 words):\n\n{request.summary}"
                user_msg = UserMessage(text=summary_prompt)
                enhanced_summary = await llm_client.send_message(user_msg)
            
            # Enhance experience descriptions
            for i, exp in enumerate(request.experience):
                if exp.get('description'):
                    exp_prompt = f"Enhance this job description with action verbs and impact (keep it under 80 words):\nJob: {exp.get('title')} at {exp.get('company')}\nDescription: {exp.get('description')}"
                    user_msg = UserMessage(text=exp_prompt)
                    enhanced_experiences[i]['description'] = await llm_client.send_message(user_msg)
        except Exception as e:
            logging.error(f"AI enhancement error: {e}")
    
    # Generate HTML resume based on template
    template_styles = {
        "modern": {
            "header_bg": "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            "accent": "#667eea",
            "font": "'Poppins', sans-serif"
        },
        "classic": {
            "header_bg": "#2c3e50",
            "accent": "#2c3e50",
            "font": "'Georgia', serif"
        },
        "minimal": {
            "header_bg": "#1a1a1a",
            "accent": "#1a1a1a",
            "font": "'Inter', sans-serif"
        }
    }
    
    style = template_styles.get(request.template, template_styles["modern"])
    
    # Build experience HTML
    exp_html = ""
    for exp in enhanced_experiences:
        exp_html += f"""
        <div class="experience-item">
            <div class="exp-header">
                <div>
                    <h3>{exp.get('title', '')}</h3>
                    <p class="company">{exp.get('company', '')}</p>
                </div>
                <span class="dates">{exp.get('start_date', '')} - {exp.get('end_date', 'Present')}</span>
            </div>
            <p class="description">{exp.get('description', '')}</p>
        </div>
        """
    
    # Build education HTML
    edu_html = ""
    for edu in request.education:
        edu_html += f"""
        <div class="education-item">
            <div class="edu-header">
                <div>
                    <h3>{edu.get('degree', '')} in {edu.get('field', '')}</h3>
                    <p class="school">{edu.get('school', '')}</p>
                </div>
                <span class="dates">{edu.get('start_date', '')} - {edu.get('end_date', '')}</span>
            </div>
        </div>
        """
    
    # Build skills HTML
    skills_html = "".join([f'<span class="skill-tag">{skill}</span>' for skill in request.skills])
    
    html_resume = f"""
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
    <title>{request.name} - Resume</title>
    <style>
        * {{ margin: 0; padding: 0; box-sizing: border-box; }}
        body {{ font-family: {style['font']}; line-height: 1.6; color: #333; background: #f5f5f5; }}
        .resume {{ max-width: 800px; margin: 20px auto; background: white; box-shadow: 0 10px 40px rgba(0,0,0,0.1); }}
        .header {{ background: {style['header_bg']}; color: white; padding: 40px; text-align: center; }}
        .header h1 {{ font-size: 2.5em; margin-bottom: 10px; font-weight: 700; }}
        .header .contact {{ display: flex; justify-content: center; gap: 20px; flex-wrap: wrap; font-size: 0.9em; opacity: 0.9; }}
        .header .contact span {{ display: flex; align-items: center; gap: 5px; }}
        .content {{ padding: 40px; }}
        .section {{ margin-bottom: 30px; }}
        .section-title {{ color: {style['accent']}; font-size: 1.3em; font-weight: 600; border-bottom: 2px solid {style['accent']}; padding-bottom: 8px; margin-bottom: 20px; text-transform: uppercase; letter-spacing: 1px; }}
        .summary {{ font-size: 1.05em; color: #555; line-height: 1.8; }}
        .experience-item, .education-item {{ margin-bottom: 25px; }}
        .exp-header, .edu-header {{ display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px; }}
        .exp-header h3, .edu-header h3 {{ color: #333; font-size: 1.1em; }}
        .company, .school {{ color: {style['accent']}; font-weight: 500; }}
        .dates {{ color: #888; font-size: 0.9em; white-space: nowrap; }}
        .description {{ color: #555; font-size: 0.95em; }}
        .skills {{ display: flex; flex-wrap: wrap; gap: 10px; }}
        .skill-tag {{ background: {style['accent']}15; color: {style['accent']}; padding: 8px 16px; border-radius: 20px; font-size: 0.9em; font-weight: 500; }}
        @media print {{
            body {{ background: white; }}
            .resume {{ box-shadow: none; margin: 0; }}
        }}
    </style>
</head>
<body>
    <div class="resume">
        <div class="header">
            <h1>{request.name}</h1>
            <div class="contact">
                <span>📧 {request.email}</span>
                {f'<span>📱 {request.phone}</span>' if request.phone else ''}
                {f'<span>📍 {request.location}</span>' if request.location else ''}
                {f'<span>💼 {request.linkedin}</span>' if request.linkedin else ''}
            </div>
        </div>
        <div class="content">
            {f'<div class="section"><h2 class="section-title">Professional Summary</h2><p class="summary">{enhanced_summary}</p></div>' if enhanced_summary else ''}
            
            {f'<div class="section"><h2 class="section-title">Experience</h2>{exp_html}</div>' if exp_html else ''}
            
            {f'<div class="section"><h2 class="section-title">Education</h2>{edu_html}</div>' if edu_html else ''}
            
            {f'<div class="section"><h2 class="section-title">Skills</h2><div class="skills">{skills_html}</div></div>' if skills_html else ''}
        </div>
    </div>
</body>
</html>
"""
    
    # Save to generations
    generation = {
        "id": str(uuid.uuid4()),
        "user_id": request.user_id,
        "content_type": "resume",
        "topic": f"Resume - {request.name}",
        "generated_content": html_resume,
        "credits_used": 0,  # Free feature
        "language": "en",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.generations.insert_one(generation)
    await db.users.update_one(
        {"id": request.user_id},
        {"$push": {"generations": generation["id"]}}
    )
    
    return {
        "success": True,
        "html": html_resume,
        "generation_id": generation["id"]
    }

# =============================================================================
# SEO ANALYZER
# =============================================================================
@api_router.post("/analyze-seo")
async def analyze_seo(content: str = Query(...), keyword: str = Query(...), user_id: str = Query(...)):
    """Analyze content for SEO and get improvement suggestions"""
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Basic SEO analysis
    word_count = len(content.split())
    keyword_count = content.lower().count(keyword.lower())
    keyword_density = (keyword_count / word_count * 100) if word_count > 0 else 0
    
    # Calculate score
    score = 0
    suggestions = []
    
    # Word count check
    if word_count >= 300:
        score += 25
    else:
        suggestions.append(f"Add more content. Current: {word_count} words. Aim for 300+ words.")
    
    # Keyword density check (ideal: 1-3%)
    if 1 <= keyword_density <= 3:
        score += 25
    elif keyword_density < 1:
        suggestions.append(f"Use your keyword '{keyword}' more often. Current density: {keyword_density:.1f}%")
    else:
        suggestions.append(f"Reduce keyword usage to avoid stuffing. Current density: {keyword_density:.1f}%")
    
    # Keyword in first 100 words
    first_100 = ' '.join(content.split()[:100]).lower()
    if keyword.lower() in first_100:
        score += 25
    else:
        suggestions.append(f"Include '{keyword}' in the first 100 words for better SEO.")
    
    # Has headings (markdown)
    if '#' in content or content.count('\n\n') >= 3:
        score += 25
    else:
        suggestions.append("Add headings and break content into sections for better readability.")
    
    return {
        "score": score,
        "word_count": word_count,
        "keyword_count": keyword_count,
        "keyword_density": round(keyword_density, 2),
        "suggestions": suggestions,
        "verdict": "Excellent!" if score >= 75 else "Good" if score >= 50 else "Needs Improvement"
    }

# =============================================================================
# SUBSCRIPTION PLANS
# =============================================================================
@api_router.get("/pricing-plans")
async def get_pricing_plans():
    """Get all available pricing plans"""
    return PRICING_PLANS

# =============================================================================
# CONTENT GENERATION
# =============================================================================
@api_router.post("/generate", response_model=ContentGeneration)
async def generate_content(request: GenerateRequest):
    user = await db.users.find_one({"id": request.user_id}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if request.content_type not in CONTENT_TYPES:
        raise HTTPException(status_code=400, detail="Invalid content type")
    
    credits_needed = CONTENT_TYPES[request.content_type]["credits"]
    
    if user['credits'] < credits_needed:
        raise HTTPException(status_code=402, detail="Insufficient credits. Please purchase more.")
    
    # Get language name
    lang_name = SUPPORTED_LANGUAGES.get(request.language, "English")
    lang_instruction = f"Write the response in {lang_name}." if request.language != "en" else ""
    
    # Get brand voice if specified
    brand_instruction = ""
    if request.brand_voice_id:
        for voice in user.get('brand_voices', []):
            if voice['id'] == request.brand_voice_id:
                brand_instruction = f"""
Follow this brand voice:
- Tone: {voice['tone']}
- Style: {voice['style']}
- Use these keywords when appropriate: {', '.join(voice.get('keywords', []))}
- Avoid these words: {', '.join(voice.get('avoid_words', []))}
"""
                break
    
    # Check for template
    template_prompt = None
    if request.template_id:
        for category in TEMPLATES.values():
            for template in category['templates']:
                if template['id'] == request.template_id:
                    template_prompt = template['prompt'].replace("{topic}", request.topic)
                    break
    
    # Build prompts
    prompts = {
        "blog_post": f"Write a comprehensive, SEO-optimized blog post about: {request.topic}. Tone: {request.tone}. Include an engaging title, introduction, main sections with subheadings, and conclusion. {lang_instruction} {brand_instruction} {request.additional_info or ''}",
        "social_media": f"Create 5 engaging social media posts about: {request.topic}. Tone: {request.tone}. Include hashtags and call-to-action for each. {lang_instruction} {brand_instruction} {request.additional_info or ''}",
        "product_description": f"Write a compelling product description for: {request.topic}. Tone: {request.tone}. Highlight benefits, features, and include a persuasive CTA. {lang_instruction} {brand_instruction} {request.additional_info or ''}",
        "email": f"Write a professional email about: {request.topic}. Tone: {request.tone}. Include subject line, greeting, body, and sign-off. {lang_instruction} {brand_instruction} {request.additional_info or ''}",
        "ad_copy": f"Create high-converting ad copy for: {request.topic}. Tone: {request.tone}. Include headline, body, and strong CTA. Create versions for Facebook, Google, and Instagram. {lang_instruction} {brand_instruction} {request.additional_info or ''}",
        "landing_page": f"Write conversion-focused landing page copy for: {request.topic}. Tone: {request.tone}. Include hero section, benefits, features, testimonial placeholder, and CTA sections. {lang_instruction} {brand_instruction} {request.additional_info or ''}",
        "web_app_design": f"""Generate production-ready React code with Tailwind CSS for: {request.topic}. 
Create a complete, functional React component with Tailwind styling, responsive design, and interactive elements.
{request.additional_info or ''}""",
        "wireframe": f"""Generate a complete multi-page React application for: {request.topic}.
Include multiple components, routing structure, and state management.
{request.additional_info or ''}"""
    }
    
    # Use template prompt if available
    final_prompt = template_prompt if template_prompt else prompts.get(request.content_type, prompts["blog_post"])
    
    # Select system message
    if request.content_type in ["web_app_design", "wireframe"]:
        system_msg = "You are an expert React developer. Generate clean, production-ready React code with Tailwind CSS. Use functional components with hooks."
    else:
        system_msg = f"You are a professional content writer. Create high-quality, engaging content. {lang_instruction}"
    
    try:
        llm_client = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=str(uuid.uuid4()),
            system_message=system_msg
        )
        llm_client = llm_client.with_model("openai", "gpt-4o-mini")
        
        user_msg = UserMessage(text=final_prompt)
        generated_text = await llm_client.send_message(user_msg)
    except Exception as e:
        logging.error(f"AI generation error: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate content. Please try again.")
    
    # Deduct credits
    await db.users.update_one(
        {"id": request.user_id},
        {"$inc": {"credits": -credits_needed}}
    )
    
    # Save generation
    generation = ContentGeneration(
        user_id=request.user_id,
        content_type=request.content_type,
        topic=request.topic,
        tone=request.tone,
        language=request.language,
        generated_content=generated_text,
        credits_used=credits_needed
    )
    
    doc = generation.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.generations.insert_one(doc)
    
    await db.users.update_one(
        {"id": request.user_id},
        {"$push": {"generations": generation.id}}
    )
    
    return generation

# =============================================================================
# FREE AI CHAT
# =============================================================================
class ChatRequest(BaseModel):
    user_id: str
    message: str
    history: List[Dict] = []

@api_router.post("/chat")
async def chat_with_ai(request: ChatRequest):
    """Free AI chat - like ChatGPT, answers any real-world question"""
    user = await db.users.find_one({"id": request.user_id}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Build conversation history for context
    messages_text = ""
    for msg in request.history[-10:]:
        role = "User" if msg.get("role") == "user" else "Assistant"
        messages_text += f"{role}: {msg.get('content', '')}\n"
    
    # Simple prompt - just the conversation
    if messages_text:
        prompt = f"{messages_text}User: {request.message}"
    else:
        prompt = request.message

    try:
        llm_client = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=str(uuid.uuid4()),
            system_message="You are a highly knowledgeable AI assistant, similar to ChatGPT. You can answer any question about any topic - science, history, math, coding, creative writing, philosophy, current events, recipes, health, finance, relationships, and everything else. Be helpful, accurate, thorough, and engaging. If you don't know something, say so honestly. Format your responses nicely with bullet points or numbered lists when appropriate."
        )
        llm_client = llm_client.with_model("openai", "gpt-4o-mini")
        
        user_msg = UserMessage(text=prompt)
        response = await llm_client.send_message(user_msg)
        
        # Log the chat for admin viewing
        chat_log = {
            "id": str(uuid.uuid4()),
            "user_id": request.user_id,
            "user_email": user.get("email", "Unknown"),
            "user_name": user.get("name", "Unknown"),
            "question": request.message,
            "response": response[:500] if len(response) > 500 else response,  # Truncate long responses
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.chat_logs.insert_one(chat_log)
        
        return {"success": True, "response": response}
    except Exception as e:
        logging.error(f"Chat error: {e}")
        raise HTTPException(status_code=500, detail="Failed to get AI response")

# =============================================================================
# IMAGE GENERATION
# =============================================================================
@api_router.post("/generate-image")
async def generate_image(request: ImageGenerateRequest):
    user = await db.users.find_one({"id": request.user_id}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    credits_needed = 2
    if user['credits'] < credits_needed:
        raise HTTPException(status_code=402, detail="Insufficient credits.")
    
    style_prompts = {
        "realistic": "photorealistic, high quality, detailed",
        "illustration": "digital illustration, vector art style, clean lines",
        "3d": "3D rendered, CGI, professional lighting",
        "artistic": "artistic, creative, unique style, expressive"
    }
    
    enhanced_prompt = f"{request.prompt}, {style_prompts.get(request.style, '')}"
    
    try:
        # Use OpenAIImageGeneration class
        image_gen = OpenAIImageGeneration(api_key=EMERGENT_LLM_KEY)
        image_bytes_list = await image_gen.generate_images(
            prompt=enhanced_prompt,
            model="gpt-image-1"
        )
        
        if not image_bytes_list or len(image_bytes_list) == 0:
            raise Exception("No image generated")
        
        # Convert bytes to base64 data URL
        image_bytes = image_bytes_list[0]
        image_base64 = base64.b64encode(image_bytes).decode('utf-8')
        image_url = f"data:image/png;base64,{image_base64}"
        
    except Exception as e:
        logging.error(f"Image generation error: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate image.")
    
    # Deduct credits
    await db.users.update_one(
        {"id": request.user_id},
        {"$inc": {"credits": -credits_needed}}
    )
    
    # Save generation
    generation = ContentGeneration(
        user_id=request.user_id,
        content_type="image",
        topic=request.prompt,
        tone=request.style,
        generated_content=f"Image generated: {request.prompt}",
        credits_used=credits_needed,
        image_url=image_url
    )
    
    doc = generation.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.generations.insert_one(doc)
    
    return {"success": True, "image_url": image_url, "generation_id": generation.id}

# =============================================================================
# CONTENT REPURPOSING
# =============================================================================
@api_router.post("/repurpose")
async def repurpose_content(request: RepurposeRequest):
    user = await db.users.find_one({"id": request.user_id}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    credits_needed = 3
    if user['credits'] < credits_needed:
        raise HTTPException(status_code=402, detail="Insufficient credits.")
    
    lang_name = SUPPORTED_LANGUAGES.get(request.language, "English")
    
    format_instructions = {
        "social_media": "5 social media posts with hashtags",
        "email": "an email newsletter version",
        "ad_copy": "Facebook and Google ad copy versions",
        "thread": "a Twitter/X thread (10 tweets)",
        "linkedin": "a LinkedIn article version",
        "summary": "a brief summary/abstract",
        "quotes": "10 quotable snippets for social sharing"
    }
    
    formats_text = "\n".join([f"- {format_instructions.get(f, f)}" for f in request.output_formats])
    
    prompt = f"""Take this content and repurpose it into multiple formats.

ORIGINAL CONTENT:
{request.original_content}

Create the following versions (in {lang_name}):
{formats_text}

For each format, maintain the core message but adapt the tone and length appropriately.
Clearly label each section."""

    try:
        llm_client = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=str(uuid.uuid4()),
            system_message="You are an expert content repurposing specialist. Transform content into multiple engaging formats while maintaining the core message."
        )
        llm_client = llm_client.with_model("openai", "gpt-4o-mini")
        
        user_msg = UserMessage(text=prompt)
        generated_text = await llm_client.send_message(user_msg)
    except Exception as e:
        logging.error(f"Repurpose error: {e}")
        raise HTTPException(status_code=500, detail="Failed to repurpose content.")
    
    await db.users.update_one(
        {"id": request.user_id},
        {"$inc": {"credits": -credits_needed}}
    )
    
    generation = ContentGeneration(
        user_id=request.user_id,
        content_type="repurpose",
        topic=f"Repurposed: {request.original_content[:50]}...",
        language=request.language,
        generated_content=generated_text,
        credits_used=credits_needed
    )
    
    doc = generation.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.generations.insert_one(doc)
    
    return {"success": True, "content": generated_text, "generation_id": generation.id}

# =============================================================================
# BULK GENERATION
# =============================================================================
@api_router.post("/generate-bulk")
async def generate_bulk(request: BulkGenerateRequest):
    user = await db.users.find_one({"id": request.user_id}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if request.content_type not in CONTENT_TYPES:
        raise HTTPException(status_code=400, detail="Invalid content type")
    
    credits_per_item = CONTENT_TYPES[request.content_type]["credits"]
    total_credits = credits_per_item * len(request.topics)
    
    if user['credits'] < total_credits:
        raise HTTPException(status_code=402, detail=f"Insufficient credits. Need {total_credits}, have {user['credits']}.")
    
    if len(request.topics) > 20:
        raise HTTPException(status_code=400, detail="Maximum 20 items per bulk request.")
    
    lang_name = SUPPORTED_LANGUAGES.get(request.language, "English")
    
    # Generate all at once for efficiency
    topics_list = "\n".join([f"{i+1}. {t}" for i, t in enumerate(request.topics)])
    
    prompt = f"""Generate {request.content_type.replace('_', ' ')} content for each of these topics.
Tone: {request.tone}
Language: {lang_name}

TOPICS:
{topics_list}

For each topic, create complete, high-quality content. Clearly number and separate each piece."""

    try:
        llm_client = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=str(uuid.uuid4()),
            system_message="You are a professional content writer. Create high-quality content for multiple topics efficiently."
        )
        llm_client = llm_client.with_model("openai", "gpt-4o-mini")
        
        user_msg = UserMessage(text=prompt)
        generated_text = await llm_client.send_message(user_msg)
    except Exception as e:
        logging.error(f"Bulk generation error: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate bulk content.")
    
    await db.users.update_one(
        {"id": request.user_id},
        {"$inc": {"credits": -total_credits}}
    )
    
    generation = ContentGeneration(
        user_id=request.user_id,
        content_type=request.content_type,
        topic=f"Bulk: {len(request.topics)} items",
        tone=request.tone,
        language=request.language,
        generated_content=generated_text,
        credits_used=total_credits
    )
    
    doc = generation.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.generations.insert_one(doc)
    
    return {
        "success": True,
        "content": generated_text,
        "items_generated": len(request.topics),
        "credits_used": total_credits,
        "generation_id": generation.id
    }

# =============================================================================
# EXPORT
# =============================================================================
@api_router.get("/export/{generation_id}")
async def export_content(generation_id: str, format: str = Query("txt", enum=["txt", "md", "json", "html"])):
    generation = await db.generations.find_one({"id": generation_id}, {"_id": 0})
    if not generation:
        raise HTTPException(status_code=404, detail="Generation not found")
    
    content = generation['generated_content']
    topic = generation['topic']
    
    if format == "txt":
        return StreamingResponse(
            io.BytesIO(content.encode()),
            media_type="text/plain",
            headers={"Content-Disposition": f"attachment; filename={topic[:30]}.txt"}
        )
    elif format == "md":
        md_content = f"# {topic}\n\n{content}"
        return StreamingResponse(
            io.BytesIO(md_content.encode()),
            media_type="text/markdown",
            headers={"Content-Disposition": f"attachment; filename={topic[:30]}.md"}
        )
    elif format == "json":
        json_content = json.dumps({"topic": topic, "content": content, "type": generation['content_type']}, indent=2)
        return StreamingResponse(
            io.BytesIO(json_content.encode()),
            media_type="application/json",
            headers={"Content-Disposition": f"attachment; filename={topic[:30]}.json"}
        )
    elif format == "html":
        html_content = f"""<!DOCTYPE html>
<html><head><title>{topic}</title>
<style>body{{font-family:system-ui;max-width:800px;margin:0 auto;padding:20px;line-height:1.6}}</style>
</head><body><h1>{topic}</h1><div>{content.replace(chr(10), '<br>')}</div></body></html>"""
        return StreamingResponse(
            io.BytesIO(html_content.encode()),
            media_type="text/html",
            headers={"Content-Disposition": f"attachment; filename={topic[:30]}.html"}
        )

# =============================================================================
# REFERRAL SYSTEM
# =============================================================================
@api_router.get("/referral/{user_id}")
async def get_referral_info(user_id: str):
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    referral_count = await db.users.count_documents({"referred_by": user_id})
    
    return {
        "referral_code": user.get('referral_code'),
        "referral_link": f"https://championaistudio.com?ref={user.get('referral_code')}",
        "total_referrals": referral_count,
        "credits_earned": user.get('referral_credits_earned', 0)
    }

# =============================================================================
# HISTORY & STATS
# =============================================================================
@api_router.get("/generations/{user_id}", response_model=List[ContentGeneration])
async def get_user_generations(user_id: str):
    generations = await db.generations.find(
        {"user_id": user_id}, 
        {"_id": 0}
    ).sort("created_at", -1).to_list(100)
    
    for gen in generations:
        if isinstance(gen['created_at'], str):
            gen['created_at'] = datetime.fromisoformat(gen['created_at'])
    
    return generations

# =============================================================================
# PAYPAL PAYMENT ENDPOINTS
# =============================================================================
def get_paypal_access_token():
    """Get PayPal OAuth access token"""
    url = f"{PAYPAL_BASE_URL}/v1/oauth2/token"
    auth = (PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET)
    data = {"grant_type": "client_credentials"}
    response = requests.post(url, auth=auth, data=data)
    if response.status_code == 200:
        return response.json()["access_token"]
    raise HTTPException(status_code=500, detail="Failed to connect to PayPal")

class CreatePaymentRequest(BaseModel):
    user_id: str
    plan: str

@api_router.post("/create-payment")
async def create_payment(request: CreatePaymentRequest):
    """Create a PayPal payment order"""
    if request.plan not in PRICING_PLANS:
        raise HTTPException(status_code=400, detail="Invalid plan")
    
    plan = PRICING_PLANS[request.plan]
    
    # Get PayPal access token
    token = get_paypal_access_token()
    
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    # Create PayPal order
    payment_data = {
        "intent": "CAPTURE",
        "purchase_units": [{
            "amount": {
                "currency_code": "USD",
                "value": f"{plan['price']:.2f}"
            },
            "description": f"Champion AI Studio - {plan['name']} ({plan['credits']} credits)",
            "custom_id": f"{request.user_id}|{request.plan}"  # Store user_id and plan for later
        }],
        "application_context": {
            "brand_name": "Champion AI Studio",
            "landing_page": "NO_PREFERENCE",
            "user_action": "PAY_NOW",
            "return_url": f"{os.environ.get('REACT_APP_BACKEND_URL', 'http://localhost:8001')}/api/payment-success",
            "cancel_url": f"{os.environ.get('REACT_APP_BACKEND_URL', 'http://localhost:8001')}/api/payment-cancel"
        }
    }
    
    response = requests.post(
        f"{PAYPAL_BASE_URL}/v2/checkout/orders",
        headers=headers,
        json=payment_data
    )
    
    if response.status_code == 201:
        order = response.json()
        approval_url = next((link["href"] for link in order["links"] if link["rel"] == "approve"), None)
        return {
            "success": True,
            "order_id": order["id"],
            "approval_url": approval_url
        }
    
    raise HTTPException(status_code=400, detail="Failed to create PayPal order")

@api_router.get("/payment-success")
async def payment_success(token: str = Query(...)):
    """Handle successful PayPal payment - capture the order"""
    try:
        # Get PayPal access token
        access_token = get_paypal_access_token()
        
        headers = {
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json"
        }
        
        # Get order details first
        order_response = requests.get(
            f"{PAYPAL_BASE_URL}/v2/checkout/orders/{token}",
            headers=headers
        )
        
        if order_response.status_code != 200:
            return RedirectResponse(url="/?payment=error")
        
        order_data = order_response.json()
        
        # Capture the payment
        capture_response = requests.post(
            f"{PAYPAL_BASE_URL}/v2/checkout/orders/{token}/capture",
            headers=headers
        )
        
        if capture_response.status_code in [200, 201]:
            capture_data = capture_response.json()
            
            # Extract user_id and plan from custom_id
            custom_id = order_data.get("purchase_units", [{}])[0].get("custom_id", "")
            if "|" in custom_id:
                user_id, plan_key = custom_id.split("|")
                
                if plan_key in PRICING_PLANS:
                    plan = PRICING_PLANS[plan_key]
                    
                    # Update user credits
                    await db.users.update_one(
                        {"id": user_id},
                        {
                            "$inc": {"credits": plan["credits"]},
                            "$set": {"plan": plan_key}
                        }
                    )
                    
                    # Log the payment
                    await db.payments.insert_one({
                        "id": str(uuid.uuid4()),
                        "user_id": user_id,
                        "plan": plan_key,
                        "amount": plan["price"],
                        "credits": plan["credits"],
                        "paypal_order_id": token,
                        "status": "completed",
                        "created_at": datetime.now(timezone.utc).isoformat()
                    })
            
            # Redirect to success page
            return RedirectResponse(url="/?payment=success")
        
        return RedirectResponse(url="/?payment=error")
        
    except Exception as e:
        logging.error(f"Payment error: {e}")
        return RedirectResponse(url="/?payment=error")

@api_router.get("/payment-cancel")
async def payment_cancel():
    """Handle cancelled PayPal payment"""
    return RedirectResponse(url="/?payment=cancelled")

@api_router.post("/purchase-credits")
async def purchase_credits(request: PurchaseCreditsRequest):
    """Legacy endpoint - redirects to PayPal flow"""
    if request.plan not in PRICING_PLANS:
        raise HTTPException(status_code=400, detail="Invalid plan")
    
    # Return info to trigger PayPal flow on frontend
    plan = PRICING_PLANS[request.plan]
    return {
        "success": False,
        "use_paypal": True,
        "message": f"Please use PayPal to purchase {plan['name']} plan",
        "price": plan["price"],
        "credits": plan["credits"]
    }

@api_router.get("/stats")
async def get_stats():
    total_users = await db.users.count_documents({})
    total_generations = await db.generations.count_documents({})
    
    return {
        "total_users": total_users,
        "total_generations": total_generations,
        "content_types_available": len(CONTENT_TYPES)
    }

# =============================================================================
# PUBLIC API (for API key users)
# =============================================================================
@api_router.post("/v1/generate")
async def api_generate(
    request: GenerateRequest,
    api_key: str = Query(..., description="Your API key")
):
    """Public API endpoint for external integrations"""
    user = await db.users.find_one({"api_key": api_key}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid API key")
    
    request.user_id = user['id']
    return await generate_content(request)

# =============================================================================
# ADMIN ENDPOINTS
# =============================================================================
def verify_admin_token(token: str):
    """Verify admin token is valid"""
    if not token or token not in ADMIN_TOKENS:
        raise HTTPException(status_code=401, detail="Invalid or expired admin session")
    # Check token expiry (24 hours)
    token_data = ADMIN_TOKENS[token]
    if datetime.now(timezone.utc) > token_data['expires']:
        del ADMIN_TOKENS[token]
        raise HTTPException(status_code=401, detail="Session expired, please login again")

class AdminLoginRequest(BaseModel):
    username: str
    password: str

@api_router.post("/admin/login")
async def admin_login(request: AdminLoginRequest):
    """Admin login with username and password - returns auth token"""
    if request.username == ADMIN_USERNAME and request.password == ADMIN_PASSWORD:
        # Generate a secure token
        token = str(uuid.uuid4()) + "-" + str(uuid.uuid4())
        expires = datetime.now(timezone.utc) + timedelta(hours=24)
        ADMIN_TOKENS[token] = {
            'username': request.username,
            'created': datetime.now(timezone.utc).isoformat(),
            'expires': expires
        }
        return {
            "success": True, 
            "message": "Admin authenticated",
            "token": token,
            "expires": expires.isoformat()
        }
    raise HTTPException(status_code=401, detail="Invalid username or password")

@api_router.post("/admin/logout")
async def admin_logout(token: str = Query(...)):
    """Admin logout - invalidate token"""
    if token in ADMIN_TOKENS:
        del ADMIN_TOKENS[token]
    return {"success": True, "message": "Logged out successfully"}

@api_router.get("/admin/dashboard")
async def admin_dashboard(token: str = Query(...)):
    """Get full admin dashboard data"""
    verify_admin_token(token)
    
    # Get counts
    total_users = await db.users.count_documents({})
    total_generations = await db.generations.count_documents({})
    
    # Get all users
    users = await db.users.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    
    # Calculate total credits in circulation
    total_credits = sum(u.get('credits', 0) for u in users)
    total_referral_credits = sum(u.get('referral_credits_earned', 0) for u in users)
    
    # Get users by plan
    plan_counts = {}
    for u in users:
        plan = u.get('plan', 'free')
        plan_counts[plan] = plan_counts.get(plan, 0) + 1
    
    # Get recent generations
    recent_generations = await db.generations.find(
        {}, {"_id": 0}
    ).sort("created_at", -1).to_list(50)
    
    # Content type usage
    content_type_usage = {}
    all_generations = await db.generations.find({}, {"content_type": 1}).to_list(10000)
    for gen in all_generations:
        ct = gen.get('content_type', 'unknown')
        content_type_usage[ct] = content_type_usage.get(ct, 0) + 1
    
    # Get today's stats
    today = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
    today_users = await db.users.count_documents({"created_at": {"$gte": today.isoformat()}})
    today_generations = await db.generations.count_documents({"created_at": {"$gte": today.isoformat()}})
    
    # Get this week's stats
    week_ago = today - timedelta(days=7)
    week_users = await db.users.count_documents({"created_at": {"$gte": week_ago.isoformat()}})
    week_generations = await db.generations.count_documents({"created_at": {"$gte": week_ago.isoformat()}})
    
    return {
        "overview": {
            "total_users": total_users,
            "total_generations": total_generations,
            "total_credits_in_circulation": total_credits,
            "total_referral_credits_earned": total_referral_credits,
            "today_new_users": today_users,
            "today_generations": today_generations,
            "week_new_users": week_users,
            "week_generations": week_generations
        },
        "users_by_plan": plan_counts,
        "content_type_usage": content_type_usage,
        "recent_users": [{
            "id": u.get('id'),
            "email": u.get('email'),
            "name": u.get('name'),
            "credits": u.get('credits', 0),
            "plan": u.get('plan', 'free'),
            "generations_count": len(u.get('generations', [])),
            "referral_credits": u.get('referral_credits_earned', 0),
            "created_at": u.get('created_at')
        } for u in users[:50]],
        "recent_generations": recent_generations,
        "all_users": [{
            "id": u.get('id'),
            "email": u.get('email'),
            "name": u.get('name'),
            "credits": u.get('credits', 0),
            "plan": u.get('plan', 'free'),
            "generations_count": len(u.get('generations', [])),
            "referral_code": u.get('referral_code'),
            "referred_by": u.get('referred_by'),
            "referral_credits": u.get('referral_credits_earned', 0),
            "created_at": u.get('created_at')
        } for u in users],
        "chat_logs": await db.chat_logs.find({}, {"_id": 0}).sort("created_at", -1).to_list(100)
    }

@api_router.post("/admin/add-credits")
async def admin_add_credits(
    user_id: str = Query(...),
    credits: int = Query(...),
    token: str = Query(...)
):
    """Add credits to a user (admin only) - accepts user_id or email"""
    verify_admin_token(token)
    
    # Try to find user by ID first, then by email
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    if not user:
        # Try finding by email
        user = await db.users.find_one({"email": user_id}, {"_id": 0})
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found. Enter a valid User ID or Email.")
    
    result = await db.users.update_one(
        {"id": user["id"]},
        {"$inc": {"credits": credits}}
    )
    
    return {"success": True, "message": f"Added {credits} credits to {user['name']} ({user['email']})"}

@api_router.delete("/admin/user/{user_id}")
async def admin_delete_user(user_id: str, token: str = Query(...)):
    """Delete a user (admin only)"""
    verify_admin_token(token)
    
    await db.users.delete_one({"id": user_id})
    await db.generations.delete_many({"user_id": user_id})
    
    return {"success": True, "message": f"Deleted user {user_id}"}

# =============================================================================
# APP SETUP
# =============================================================================
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
