import requests
import sys
import json
import base64
from datetime import datetime

class E1UtilitySuiteTester:
    def __init__(self, base_url="https://utility-box-dark.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []

    def run_test(self, name, method, endpoint, expected_status, data=None, files=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'} if not files else {}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers)
            elif method == 'POST':
                if files:
                    response = requests.post(url, files=files)
                else:
                    response = requests.post(url, json=data, headers=headers)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                if response.text:
                    try:
                        result = response.json()
                        if isinstance(result, dict) and len(str(result)) < 200:
                            print(f"   Response: {result}")
                    except:
                        pass
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                if response.text:
                    print(f"   Error: {response.text[:200]}")
                self.failed_tests.append({
                    "test": name,
                    "endpoint": endpoint,
                    "expected": expected_status,
                    "actual": response.status_code,
                    "error": response.text[:200] if response.text else "No response"
                })

            return success, response.json() if success and response.text else {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            self.failed_tests.append({
                "test": name,
                "endpoint": endpoint,
                "expected": expected_status,
                "actual": "Exception",
                "error": str(e)
            })
            return False, {}

    def test_api_root(self):
        """Test API root endpoint"""
        success, response = self.run_test("API Root", "GET", "", 200)
        return success

    def test_status_endpoints(self):
        """Test status check endpoints"""
        # Create status check
        success, response = self.run_test(
            "Create Status Check",
            "POST", 
            "status",
            200,
            data={"client_name": "test_client"}
        )
        
        if success:
            # Get status checks
            self.run_test("Get Status Checks", "GET", "status", 200)
        
        return success

    def test_qr_generator(self):
        """Test QR code batch generation with is.gd integration"""
        # Test single QR code (backward compatibility)
        success1, response1 = self.run_test(
            "Generate Single QR Code",
            "POST",
            "qr/generate",
            200,
            data={
                "items": [{"content": "https://example.com", "content_type": "url"}],
                "fg_color": "#22c55e",
                "bg_color": "#0a0a0c",
                "size": 256,
                "use_isgd": True
            }
        )
        
        # Test batch QR generation with multiple types
        success2, response2 = self.run_test(
            "Generate Batch QR Codes",
            "POST",
            "qr/generate",
            200,
            data={
                "items": [
                    {"content": "https://www.google.com", "content_type": "url"},
                    {"content": "test@example.com", "content_type": "email"},
                    {"content": "TestWiFi,password123,WPA", "content_type": "wifi"},
                    {"content": "Hello World!", "content_type": "text"}
                ],
                "fg_color": "#000000",
                "bg_color": "#FFFFFF",
                "size": 300,
                "use_isgd": True
            }
        )
        
        # Verify response structure for batch
        if success2 and response2:
            if 'results' not in response2:
                print("❌ Missing 'results' array in batch QR response")
                return False
            if len(response2['results']) != 4:
                print(f"❌ Expected 4 results, got {len(response2['results'])}")
                return False
            # Check if at least one result has success=True
            successful_results = [r for r in response2['results'] if r.get('success')]
            if not successful_results:
                print("❌ No successful QR code generation in batch")
                return False
            print(f"✅ Batch QR: {len(successful_results)}/4 successful")
        
        # Test is.gd integration OFF
        success3, response3 = self.run_test(
            "Generate QR without is.gd",
            "POST",
            "qr/generate",
            200,
            data={
                "items": [{"content": "https://example.com", "content_type": "url"}],
                "use_isgd": False
            }
        )
        
        return success1 and success2 and success3

    def test_shortlinks(self):
        """Test shortlink functionality"""
        # Create shortlink
        success1, response1 = self.run_test(
            "Create Shortlink",
            "POST",
            "shortlinks/create",
            200,
            data={
                "original_url": "https://www.example.com/very/long/url/path",
                "custom_slug": None
            }
        )
        
        shortlink_id = None
        short_code = None
        if success1 and response1:
            shortlink_id = response1.get('id')
            short_code = response1.get('short_code')
        
        # Get all shortlinks
        success2, response2 = self.run_test("Get Shortlinks", "GET", "shortlinks", 200)
        
        # Test redirect (if we have a short code)
        success3 = True
        if short_code:
            success3, response3 = self.run_test(
                "Redirect Shortlink",
                "GET",
                f"shortlinks/{short_code}",
                200
            )
        
        # Delete shortlink (if we have an ID)
        success4 = True
        if shortlink_id:
            success4, response4 = self.run_test(
                "Delete Shortlink",
                "DELETE",
                f"shortlinks/{shortlink_id}",
                200
            )
        
        return success1 and success2 and success3 and success4

    def test_text_to_html(self):
        """Test text to HTML conversion"""
        # Basic conversion
        success1, response1 = self.run_test(
            "Text to HTML (Basic)",
            "POST",
            "text-to-html",
            200,
            data={
                "text": "Hello world!\n\nThis is a test paragraph.",
                "format_type": "basic"
            }
        )
        
        # Markdown conversion
        success2, response2 = self.run_test(
            "Text to HTML (Markdown)",
            "POST",
            "text-to-html",
            200,
            data={
                "text": "# Header\n\n**Bold text** and *italic text*\n\n- List item 1\n- List item 2",
                "format_type": "markdown"
            }
        )
        
        return success1 and success2

    def test_password_generator(self):
        """Test password generation"""
        # Standard password
        success1, response1 = self.run_test(
            "Generate Standard Password",
            "POST",
            "password/generate",
            200,
            data={
                "length": 16,
                "uppercase": True,
                "lowercase": True,
                "numbers": True,
                "symbols": True
            }
        )
        
        # Numbers only password
        success2, response2 = self.run_test(
            "Generate Numbers Only Password",
            "POST",
            "password/generate",
            200,
            data={
                "length": 8,
                "uppercase": False,
                "lowercase": False,
                "numbers": True,
                "symbols": False
            }
        )
        
        # Test invalid (no character types)
        success3, response3 = self.run_test(
            "Generate Invalid Password",
            "POST",
            "password/generate",
            400,
            data={
                "length": 16,
                "uppercase": False,
                "lowercase": False,
                "numbers": False,
                "symbols": False
            }
        )
        
        return success1 and success2 and success3

    def test_word_counter(self):
        """Test word counter functionality"""
        success, response = self.run_test(
            "Count Words",
            "POST",
            "word-counter",
            200,
            data={
                "text": "This is a test sentence. This is another sentence!\n\nThis is a new paragraph with more words."
            }
        )
        
        if success and response:
            expected_fields = ['characters', 'characters_no_spaces', 'words', 'sentences', 'paragraphs', 'reading_time_minutes']
            for field in expected_fields:
                if field not in response:
                    print(f"❌ Missing field in response: {field}")
                    return False
            print(f"   Word count results: {response}")
        
        return success

    def test_base64(self):
        """Test Base64 encoding/decoding"""
        test_text = "Hello, World! This is a test string."
        
        # Encode
        success1, response1 = self.run_test(
            "Base64 Encode",
            "POST",
            "base64",
            200,
            data={
                "text": test_text,
                "operation": "encode"
            }
        )
        
        encoded_result = response1.get('result') if success1 else None
        
        # Decode
        success2, response2 = self.run_test(
            "Base64 Decode",
            "POST",
            "base64",
            200,
            data={
                "text": encoded_result,
                "operation": "decode"
            }
        ) if encoded_result else (False, {})
        
        # Verify round-trip
        if success1 and success2:
            decoded_result = response2.get('result')
            if decoded_result == test_text:
                print(f"✅ Base64 round-trip successful")
            else:
                print(f"❌ Base64 round-trip failed: {decoded_result} != {test_text}")
                return False
        
        return success1 and success2

def main():
    print("🚀 Starting E1 Utility Suite API Tests")
    print("=" * 50)
    
    tester = E1UtilitySuiteTester()
    
    # Run all tests
    tests = [
        ("API Root", tester.test_api_root),
        ("Status Endpoints", tester.test_status_endpoints),
        ("QR Generator", tester.test_qr_generator),
        ("Shortlinks", tester.test_shortlinks),
        ("Text to HTML", tester.test_text_to_html),
        ("Password Generator", tester.test_password_generator),
        ("Word Counter", tester.test_word_counter),
        ("Base64 Tool", tester.test_base64)
    ]
    
    print(f"\n📝 Running {len(tests)} test categories...")
    
    for test_name, test_func in tests:
        print(f"\n{'='*20} {test_name} {'='*20}")
        try:
            success = test_func()
            if not success:
                print(f"❌ {test_name} tests failed")
        except Exception as e:
            print(f"❌ {test_name} tests crashed: {str(e)}")
    
    # Print summary
    print(f"\n{'='*50}")
    print(f"📊 Final Results:")
    print(f"   Tests Run: {tester.tests_run}")
    print(f"   Tests Passed: {tester.tests_passed}")
    print(f"   Success Rate: {(tester.tests_passed/tester.tests_run)*100:.1f}%" if tester.tests_run > 0 else "No tests run")
    
    if tester.failed_tests:
        print(f"\n❌ Failed Tests ({len(tester.failed_tests)}):")
        for i, test in enumerate(tester.failed_tests, 1):
            print(f"   {i}. {test['test']} - Expected {test['expected']}, got {test['actual']}")
            if test['error']:
                print(f"      Error: {test['error']}")
    
    return 0 if tester.tests_passed == tester.tests_run else 1

if __name__ == "__main__":
    sys.exit(main())