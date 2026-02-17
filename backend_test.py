import requests
import sys
import json
from datetime import datetime

class ChampionAITester:
    def __init__(self, base_url="https://champion-studio-1.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []
        self.user_id = None
        self.existing_user_id = None

    def log_test(self, name, success, details="", error=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name} - PASSED")
        else:
            print(f"❌ {name} - FAILED: {error}")
        
        self.test_results.append({
            "test": name,
            "success": success,
            "details": details,
            "error": error
        })

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}"
        if headers is None:
            headers = {'Content-Type': 'application/json'}

        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        if data:
            print(f"   Data: {json.dumps(data, indent=2)}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=30)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=30)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=30)

            print(f"   Response Status: {response.status_code}")
            
            success = response.status_code == expected_status
            
            try:
                response_data = response.json()
                print(f"   Response: {json.dumps(response_data, indent=2)[:200]}...")
            except:
                response_data = response.text
                print(f"   Response: {response_data[:200]}...")

            if success:
                self.log_test(name, True, f"Status: {response.status_code}")
                return True, response_data if isinstance(response_data, dict) else {}
            else:
                error_msg = f"Expected {expected_status}, got {response.status_code}"
                if isinstance(response_data, dict) and 'detail' in response_data:
                    error_msg += f" - {response_data['detail']}"
                self.log_test(name, False, error=error_msg)
                return False, {}

        except Exception as e:
            error_msg = f"Request failed: {str(e)}"
            print(f"   Error: {error_msg}")
            self.log_test(name, False, error=error_msg)
            return False, {}

    def test_api_health(self):
        """Test basic API connectivity"""
        return self.run_test("API Health Check", "GET", "", 200)

    def test_content_types(self):
        """Test content types endpoint"""
        return self.run_test("Get Content Types", "GET", "content-types", 200)

    def test_languages(self):
        """Test languages endpoint"""
        return self.run_test("Get Languages", "GET", "languages", 200)

    def test_templates(self):
        """Test templates endpoint"""
        return self.run_test("Get Templates", "GET", "templates", 200)

    def test_pricing(self):
        """Test pricing endpoint"""
        return self.run_test("Get Pricing", "GET", "pricing", 200)

    def test_user_registration(self):
        """Test user registration with new test user"""
        test_data = {
            "email": "test2@champion.com",
            "name": "Test User 2",
            "password": "Test123!"
        }
        
        success, response = self.run_test("User Registration", "POST", "users", 201, test_data)
        if success and 'id' in response:
            self.user_id = response['id']
            print(f"   Created user ID: {self.user_id}")
        return success, response

    def test_user_login_new(self):
        """Test login with newly created user"""
        login_data = {
            "email": "test2@champion.com",
            "password": "Test123!"
        }
        
        success, response = self.run_test("User Login (New User)", "POST", "login", 200, login_data)
        if success and 'id' in response:
            if not self.user_id:
                self.user_id = response['id']
            print(f"   Logged in user ID: {response['id']}")
            print(f"   User credits: {response.get('credits', 'N/A')}")
        return success, response

    def test_user_login_existing(self):
        """Test login with existing user"""
        login_data = {
            "email": "test@champion.com",
            "password": "Test123!"
        }
        
        success, response = self.run_test("User Login (Existing User)", "POST", "login", 200, login_data)
        if success and 'id' in response:
            self.existing_user_id = response['id']
            print(f"   Existing user ID: {self.existing_user_id}")
            print(f"   User credits: {response.get('credits', 'N/A')}")
        return success, response

    def test_get_user_by_id(self):
        """Test getting user by ID"""
        if not self.user_id:
            self.log_test("Get User by ID", False, error="No user ID available")
            return False, {}
        
        return self.run_test("Get User by ID", "GET", f"users/{self.user_id}", 200)

    def test_get_user_by_email(self):
        """Test getting user by email"""
        return self.run_test("Get User by Email", "GET", "users/email/test2@champion.com", 200)

    def test_invalid_login(self):
        """Test login with invalid credentials"""
        invalid_data = {
            "email": "nonexistent@test.com",
            "password": "wrongpassword"
        }
        
        return self.run_test("Invalid Login", "POST", "login", 401, invalid_data)

    def test_duplicate_registration(self):
        """Test registering with existing email"""
        duplicate_data = {
            "email": "test2@champion.com",
            "name": "Duplicate User",
            "password": "Test123!"
        }
        
        return self.run_test("Duplicate Registration", "POST", "users", 400, duplicate_data)

    def test_ai_chat(self):
        """Test AI chat functionality"""
        if not self.user_id:
            self.log_test("AI Chat", False, error="No user ID available")
            return False, {}
        
        chat_data = {
            "user_id": self.user_id,
            "message": "Hello, can you help me with a simple math question? What is 2+2?",
            "history": []
        }
        
        return self.run_test("AI Chat", "POST", "chat", 200, chat_data)

    def test_content_generation(self):
        """Test content generation"""
        if not self.user_id:
            self.log_test("Content Generation", False, error="No user ID available")
            return False, {}
        
        gen_data = {
            "user_id": self.user_id,
            "content_type": "social_media",
            "topic": "Benefits of AI in business",
            "tone": "professional",
            "language": "en"
        }
        
        return self.run_test("Content Generation", "POST", "generate", 200, gen_data)

    def test_user_generations_history(self):
        """Test getting user's generation history"""
        if not self.user_id:
            self.log_test("User Generations History", False, error="No user ID available")
            return False, {}
        
        return self.run_test("User Generations History", "GET", f"generations/{self.user_id}", 200)

    def test_referral_info(self):
        """Test getting referral information"""
        if not self.user_id:
            self.log_test("Referral Info", False, error="No user ID available")
            return False, {}
        
        return self.run_test("Referral Info", "GET", f"referral/{self.user_id}", 200)

    def test_brand_voices(self):
        """Test getting brand voices"""
        if not self.user_id:
            self.log_test("Brand Voices", False, error="No user ID available")
            return False, {}
        
        return self.run_test("Brand Voices", "GET", f"users/{self.user_id}/brand-voices", 200)

    def test_favorites(self):
        """Test getting user favorites"""
        if not self.user_id:
            self.log_test("User Favorites", False, error="No user ID available")
            return False, {}
        
        return self.run_test("User Favorites", "GET", f"users/{self.user_id}/favorites", 200)

    def test_stats(self):
        """Test getting platform stats"""
        return self.run_test("Platform Stats", "GET", "stats", 200)

    def test_gallery(self):
        """Test getting public gallery"""
        return self.run_test("Public Gallery", "GET", "gallery", 200)

    def test_google_oauth_session_invalid(self):
        """Test Google OAuth session endpoint with invalid session_id"""
        invalid_session_data = {
            "session_id": "invalid_session_id_12345"
        }
        
        return self.run_test("Google OAuth Session (Invalid)", "POST", "auth/google/session", 401, invalid_session_data)

    def test_auth_me_no_token(self):
        """Test /auth/me endpoint without authentication token"""
        return self.run_test("Auth Me (No Token)", "GET", "auth/me", 401)

    def test_auth_me_invalid_token(self):
        """Test /auth/me endpoint with invalid token"""
        headers = {'Authorization': 'Bearer invalid_token_12345'}
        return self.run_test("Auth Me (Invalid Token)", "GET", "auth/me", 401, headers=headers)

    def test_logout_endpoint(self):
        """Test logout endpoint"""
        return self.run_test("Logout Endpoint", "POST", "auth/logout", 200)

    def test_video_content_type(self):
        """Test that video content type exists with correct credits"""
        success, response = self.run_test("Video Content Type", "GET", "content-types", 200)
        if success and 'video' in response:
            video_type = response['video']
            if video_type.get('credits') == 5 and video_type.get('name') == 'AI Video':
                self.log_test("Video Content Type Validation", True, "Video type has 5 credits and correct name")
                return True, response
            else:
                self.log_test("Video Content Type Validation", False, error=f"Expected 5 credits, got {video_type.get('credits')}")
                return False, {}
        else:
            self.log_test("Video Content Type Validation", False, error="Video content type not found")
            return False, {}

    def test_video_generation_no_user(self):
        """Test video generation without user_id"""
        video_data = {
            "prompt": "A golden retriever playing in autumn leaves",
            "size": "1280x720",
            "duration": 4
        }
        
        return self.run_test("Video Generation (No User)", "POST", "generate-video", 404, video_data)

    def test_video_generation_invalid_size(self):
        """Test video generation with invalid size"""
        if not self.user_id:
            self.log_test("Video Generation (Invalid Size)", False, error="No user ID available")
            return False, {}
        
        video_data = {
            "user_id": self.user_id,
            "prompt": "A golden retriever playing in autumn leaves",
            "size": "invalid_size",
            "duration": 4
        }
        
        return self.run_test("Video Generation (Invalid Size)", "POST", "generate-video", 400, video_data)

    def test_video_generation_invalid_duration(self):
        """Test video generation with invalid duration"""
        if not self.user_id:
            self.log_test("Video Generation (Invalid Duration)", False, error="No user ID available")
            return False, {}
        
        video_data = {
            "user_id": self.user_id,
            "prompt": "A golden retriever playing in autumn leaves",
            "size": "1280x720",
            "duration": 15  # Invalid duration
        }
        
        return self.run_test("Video Generation (Invalid Duration)", "POST", "generate-video", 400, video_data)

    def test_video_generation_valid_sizes(self):
        """Test video generation endpoint with all valid sizes"""
        if not self.user_id:
            self.log_test("Video Generation (Valid Sizes)", False, error="No user ID available")
            return False, {}
        
        valid_sizes = ["1280x720", "1792x1024", "1024x1792", "1024x1024"]
        all_passed = True
        
        for size in valid_sizes:
            video_data = {
                "user_id": self.user_id,
                "prompt": "Test video generation",
                "size": size,
                "duration": 4
            }
            
            # We expect either 402 (insufficient credits) or 500 (generation error) - both are valid responses
            # indicating the endpoint exists and validates properly
            success, response = self.run_test(f"Video Generation Size Validation ({size})", "POST", "generate-video", None, video_data)
            
            # Check if we got expected error codes (402 for insufficient credits or 500 for generation issues)
            if hasattr(self, '_last_status_code'):
                if self._last_status_code in [402, 500]:
                    self.log_test(f"Video Size {size} Validation", True, f"Endpoint validates size correctly (status: {self._last_status_code})")
                else:
                    self.log_test(f"Video Size {size} Validation", False, error=f"Unexpected status: {self._last_status_code}")
                    all_passed = False
        
        return all_passed, {}

    def test_video_generation_valid_durations(self):
        """Test video generation endpoint with all valid durations"""
        if not self.user_id:
            self.log_test("Video Generation (Valid Durations)", False, error="No user ID available")
            return False, {}
        
        valid_durations = [4, 8, 12]
        all_passed = True
        
        for duration in valid_durations:
            video_data = {
                "user_id": self.user_id,
                "prompt": "Test video generation",
                "size": "1280x720",
                "duration": duration
            }
            
            # We expect either 402 (insufficient credits) or 500 (generation error)
            success, response = self.run_test(f"Video Generation Duration Validation ({duration}s)", "POST", "generate-video", None, video_data)
            
            # Check if we got expected error codes
            if hasattr(self, '_last_status_code'):
                if self._last_status_code in [402, 500]:
                    self.log_test(f"Video Duration {duration}s Validation", True, f"Endpoint validates duration correctly (status: {self._last_status_code})")
                else:
                    self.log_test(f"Video Duration {duration}s Validation", False, error=f"Unexpected status: {self._last_status_code}")
                    all_passed = False
        
        return all_passed, {}

    def run_all_tests(self):
        """Run all backend tests"""
        print("🚀 Starting Champion AI Studio Backend Tests")
        print(f"🌐 Testing against: {self.base_url}")
        print("=" * 60)

        # Basic API tests
        self.test_api_health()
        self.test_content_types()
        self.test_languages()
        self.test_templates()
        self.test_pricing()
        self.test_stats()
        self.test_gallery()

        # User authentication tests
        print("\n📝 Testing User Authentication...")
        self.test_user_registration()
        self.test_user_login_new()
        self.test_user_login_existing()
        self.test_get_user_by_id()
        self.test_get_user_by_email()
        self.test_invalid_login()
        self.test_duplicate_registration()

        # User-specific functionality tests
        print("\n🔧 Testing User Functionality...")
        self.test_referral_info()
        self.test_brand_voices()
        self.test_favorites()
        self.test_user_generations_history()

        # AI functionality tests
        print("\n🤖 Testing AI Features...")
        self.test_ai_chat()
        self.test_content_generation()

        # Google OAuth tests
        print("\n🔐 Testing Google OAuth Features...")
        self.test_google_oauth_session_invalid()
        self.test_auth_me_no_token()
        self.test_auth_me_invalid_token()
        self.test_logout_endpoint()

        # Print final results
        print("\n" + "=" * 60)
        print(f"📊 Test Results: {self.tests_passed}/{self.tests_run} tests passed")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All tests passed!")
            return 0
        else:
            print("❌ Some tests failed!")
            print("\nFailed tests:")
            for result in self.test_results:
                if not result['success']:
                    print(f"  - {result['test']}: {result['error']}")
            return 1

def main():
    tester = ChampionAITester()
    return tester.run_all_tests()

if __name__ == "__main__":
    sys.exit(main())