from fastapi import FastAPI, APIRouter, HTTPException, Query
from fastapi.responses import StreamingResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone
from emergentintegrations.llm.openai import LlmChat, UserMessage
from emergentintegrations.llm.openai import image_generation
import secrets
import io
import json

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Get Emergent LLM Key
EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY')

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
    "starter": {"name": "Starter", "credits": 50, "price": 9},
    "pro": {"name": "Pro", "credits": 200, "price": 29},
    "unlimited": {"name": "Unlimited", "credits": 999999, "price": 49}
}

# =============================================================================
# MODELS
# =============================================================================
class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: str
    name: str
    credits: int = 3
    plan: str = "free"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    generations: List[str] = []
    referral_code: str = Field(default_factory=lambda: secrets.token_urlsafe(8))
    referred_by: Optional[str] = None
    referral_credits_earned: int = 0
    brand_voices: List[Dict] = []
    api_key: Optional[str] = None

class UserCreate(BaseModel):
    email: str
    name: str
    referral_code: Optional[str] = None

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
@api_router.post("/users", response_model=User)
async def create_user(input: UserCreate):
    existing = await db.users.find_one({"email": input.email}, {"_id": 0})
    if existing:
        if isinstance(existing.get('created_at'), str):
            existing['created_at'] = datetime.fromisoformat(existing['created_at'])
        return User(**existing)
    
    user_data = input.model_dump()
    
    # Handle referral
    bonus_credits = 0
    if input.referral_code:
        referrer = await db.users.find_one({"referral_code": input.referral_code}, {"_id": 0})
        if referrer:
            user_data['referred_by'] = referrer['id']
            bonus_credits = 5  # Bonus for being referred
            # Give referrer credits too
            await db.users.update_one(
                {"id": referrer['id']},
                {"$inc": {"credits": 10, "referral_credits_earned": 10}}
            )
    
    user = User(**user_data)
    user.credits += bonus_credits
    
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
        image_result = await image_generation(
            api_key=EMERGENT_LLM_KEY,
            prompt=enhanced_prompt,
            model="gpt-image-1",
            size="1024x1024"
        )
        image_url = image_result if isinstance(image_result, str) else image_result.get('url', '')
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

@api_router.post("/purchase-credits")
async def purchase_credits(request: PurchaseCreditsRequest):
    if request.plan not in PRICING_PLANS:
        raise HTTPException(status_code=400, detail="Invalid plan")
    
    plan = PRICING_PLANS[request.plan]
    
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
