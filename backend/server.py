from fastapi import FastAPI, APIRouter, HTTPException
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
from emergentintegrations.llm.openai import LlmChat, UserMessage

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Get Emergent LLM Key
EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY')

# Create the main app
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Content Types and Templates
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
        "name": "Web & App Design",
        "description": "AI-powered UI/UX design specs",
        "credits": 3,
        "icon": "Palette"
    },
    "wireframe": {
        "name": "Wireframe & Flow",
        "description": "App structure and user flows",
        "credits": 2,
        "icon": "Layers"
    }
}

PRICING_PLANS = {
    "free": {"name": "Free Trial", "credits": 3, "price": 0},
    "starter": {"name": "Starter", "credits": 50, "price": 9},
    "pro": {"name": "Pro", "credits": 200, "price": 29},
    "unlimited": {"name": "Unlimited", "credits": 999999, "price": 49}
}

# Models
class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: str
    name: str
    credits: int = 3
    plan: str = "free"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    generations: List[str] = []

class UserCreate(BaseModel):
    email: str
    name: str

class ContentGeneration(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    content_type: str
    topic: str
    tone: str = "professional"
    generated_content: str
    credits_used: int
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class GenerateRequest(BaseModel):
    user_id: str
    content_type: str
    topic: str
    tone: str = "professional"
    additional_info: Optional[str] = None

class PurchaseCreditsRequest(BaseModel):
    user_id: str
    plan: str

# API Routes
@api_router.get("/")
async def root():
    return {"message": "Champion AI Studio API"}

@api_router.get("/content-types")
async def get_content_types():
    return CONTENT_TYPES

@api_router.get("/pricing")
async def get_pricing():
    return PRICING_PLANS

@api_router.post("/users", response_model=User)
async def create_user(input: UserCreate):
    # Check if user exists
    existing = await db.users.find_one({"email": input.email}, {"_id": 0})
    if existing:
        if isinstance(existing.get('created_at'), str):
            existing['created_at'] = datetime.fromisoformat(existing['created_at'])
        return User(**existing)
    
    user = User(**input.model_dump())
    doc = user.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.users.insert_one(doc)
    return user

@api_router.get("/users/{user_id}", response_model=User)
async def get_user(user_id: str):
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if isinstance(user['created_at'], str):
        user['created_at'] = datetime.fromisoformat(user['created_at'])
    return User(**user)

@api_router.get("/users/email/{email}", response_model=User)
async def get_user_by_email(email: str):
    user = await db.users.find_one({"email": email}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if isinstance(user['created_at'], str):
        user['created_at'] = datetime.fromisoformat(user['created_at'])
    return User(**user)

@api_router.post("/generate", response_model=ContentGeneration)
async def generate_content(request: GenerateRequest):
    # Get user
    user = await db.users.find_one({"id": request.user_id}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Check content type
    if request.content_type not in CONTENT_TYPES:
        raise HTTPException(status_code=400, detail="Invalid content type")
    
    credits_needed = CONTENT_TYPES[request.content_type]["credits"]
    
    # Check credits
    if user['credits'] < credits_needed:
        raise HTTPException(status_code=402, detail="Insufficient credits. Please purchase more.")
    
    # Generate content with AI
    prompts = {
        "blog_post": f"Write a comprehensive, SEO-optimized blog post about: {request.topic}. Tone: {request.tone}. Include an engaging title, introduction, main sections with subheadings, and conclusion. {request.additional_info or ''}",
        "social_media": f"Create 3 engaging social media posts about: {request.topic}. Tone: {request.tone}. Include hashtags and call-to-action. {request.additional_info or ''}",
        "product_description": f"Write a compelling product description for: {request.topic}. Tone: {request.tone}. Highlight benefits, features, and include a persuasive CTA. {request.additional_info or ''}",
        "email": f"Write a professional email about: {request.topic}. Tone: {request.tone}. Include subject line, greeting, body, and sign-off. {request.additional_info or ''}",
        "ad_copy": f"Create high-converting ad copy for: {request.topic}. Tone: {request.tone}. Include headline, body, and strong CTA. {request.additional_info or ''}",
        "landing_page": f"Write conversion-focused landing page copy for: {request.topic}. Tone: {request.tone}. Include hero section, benefits, features, testimonial placeholder, and CTA sections. {request.additional_info or ''}"
    }
    
    try:
        # Create a new LlmChat instance for each request
        llm_client = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=str(uuid.uuid4()),
            system_message="You are a professional content writer and copywriter. Create high-quality, engaging content that drives results. Format your output nicely with proper structure."
        )
        llm_client = llm_client.with_model("openai", "gpt-4o-mini")
        
        user_msg = UserMessage(text=prompts[request.content_type])
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
        generated_content=generated_text,
        credits_used=credits_needed
    )
    
    doc = generation.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.generations.insert_one(doc)
    
    # Add to user's generations list
    await db.users.update_one(
        {"id": request.user_id},
        {"$push": {"generations": generation.id}}
    )
    
    return generation

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

@api_router.post("/purchase-credits")
async def purchase_credits(request: PurchaseCreditsRequest):
    if request.plan not in PRICING_PLANS:
        raise HTTPException(status_code=400, detail="Invalid plan")
    
    plan = PRICING_PLANS[request.plan]
    
    # In production, integrate with Stripe here
    # For demo, we just add the credits
    
    await db.users.update_one(
        {"id": request.user_id},
        {
            "$inc": {"credits": plan["credits"]},
            "$set": {"plan": request.plan}
        }
    )
    
    return {
        "success": True,
        "message": f"Successfully purchased {plan['name']} plan!",
        "credits_added": plan["credits"],
        "price": plan["price"]
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
