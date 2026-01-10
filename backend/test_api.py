#!/usr/bin/env python3
"""
Test script for InternPath API
Run this after starting your backend to verify everything works
"""

import requests
import json
from pprint import pprint

BASE_URL = "http://localhost:8000"

def test_health():
    """Test health endpoint"""
    print("\n" + "="*50)
    print("Testing Health Endpoint")
    print("="*50)
    
    response = requests.get(f"{BASE_URL}/health")
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
    
    return response.status_code == 200

def test_get_internships():
    """Test get all internships"""
    print("\n" + "="*50)
    print("Testing Get All Internships")
    print("="*50)
    
    response = requests.get(f"{BASE_URL}/api/internships")
    data = response.json()
    
    print(f"Status: {response.status_code}")
    print(f"Total internships: {data['count']}")
    print("\nFirst internship:")
    pprint(data['internships'][0])
    
    return response.status_code == 200

def test_recommendations():
    """Test recommendation engine"""
    print("\n" + "="*50)
    print("Testing Recommendation Engine")
    print("="*50)
    
    # Sample profile
    profile = {
        "education": "undergraduate",
        "skills": "JavaScript, React, Communication, Problem Solving",
        "interests": "Web Development, User Interface Design, Creating Interactive Experiences",
        "domains": ["tech", "design"],
        "location": "Mumbai"
    }
    
    print("\nTest Profile:")
    pprint(profile)
    
    response = requests.post(
        f"{BASE_URL}/api/recommend",
        json=profile,
        headers={"Content-Type": "application/json"}
    )
    
    data = response.json()
    
    print(f"\nStatus: {response.status_code}")
    print(f"Success: {data.get('success', False)}")
    print(f"Recommendations found: {data.get('count', 0)}")
    
    if data.get('recommendations'):
        print("\n" + "-"*50)
        print("TOP 3 RECOMMENDATIONS:")
        print("-"*50)
        
        for i, rec in enumerate(data['recommendations'][:3], 1):
            print(f"\n{i}. {rec['title']} at {rec['company']}")
            print(f"   Match: {rec['match_percentage']}")
            print(f"   Why: {rec['why_matched']}")
            print(f"   Skill Gaps: {', '.join(rec['skill_gaps'][:3]) if rec['skill_gaps'] else 'None'}")
            print(f"   Location: {rec['location']}")
            print(f"   Stipend: {rec['stipend']}")
    
    return response.status_code == 200

def test_resume_generation():
    """Test resume generation"""
    print("\n" + "="*50)
    print("Testing Resume Generation")
    print("="*50)
    
    profile = {
        "education": "undergraduate",
        "skills": "JavaScript, React, Communication, Problem Solving",
        "interests": "Web Development, User Interface Design",
        "domains": ["tech", "design"],
        "location": "Mumbai"
    }
    
    response = requests.post(
        f"{BASE_URL}/api/generate-resume",
        json=profile,
        headers={"Content-Type": "application/json"}
    )
    
    data = response.json()
    
    print(f"Status: {response.status_code}")
    print(f"Success: {data.get('success', False)}")
    print(f"Filename: {data.get('filename', 'N/A')}")
    
    if data.get('pdf_base64'):
        print("✅ PDF generated successfully!")
        pdf_size = len(data['pdf_base64'])
        print(f"PDF size (base64): {pdf_size} characters (~{pdf_size * 3 // 4} bytes)")
    else:
        print("❌ No PDF data received")
    
    return response.status_code == 200 and data.get('success', False)

def run_all_tests():
    """Run all tests"""
    print("\n" + "="*70)
    print("🚀 INTERNPATH API TEST SUITE")
    print("="*70)
    
    tests = [
        ("Health Check", test_health),
        ("Get Internships", test_get_internships),
        ("Recommendations", test_recommendations),
        ("Resume Generation", test_resume_generation)
    ]
    
    results = {}
    
    for name, test_func in tests:
        try:
            results[name] = test_func()
        except Exception as e:
            print(f"\n❌ Error in {name}: {str(e)}")
            results[name] = False
    
    # Summary
    print("\n" + "="*70)
    print("TEST SUMMARY")
    print("="*70)
    
    for name, passed in results.items():
        status = "✅ PASSED" if passed else "❌ FAILED"
        print(f"{name:.<50} {status}")
    
    total = len(results)
    passed = sum(results.values())
    
    print(f"\nTotal: {passed}/{total} tests passed")
    
    if passed == total:
        print("\n🎉 All tests passed! Your API is working perfectly!")
    else:
        print("\n⚠️  Some tests failed. Check the output above for details.")

if __name__ == "__main__":
    try:
        run_all_tests()
    except requests.exceptions.ConnectionError:
        print("\n❌ ERROR: Could not connect to the API")
        print("Make sure the backend is running on http://localhost:8000")
        print("\nTo start the backend, run:")
        print("  cd backend")
        print("  source venv/bin/activate  (or venv\\Scripts\\activate on Windows)")
        print("  uvicorn main:app --reload")
    except KeyboardInterrupt:
        print("\n\n⚠️  Tests interrupted by user")
    except Exception as e:
        print(f"\n❌ Unexpected error: {str(e)}")