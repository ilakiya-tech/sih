#!/usr/bin/env python3
"""Smoke tests for the InternPath FastAPI backend."""

import json
import sys

import requests

BASE_URL = "http://127.0.0.1:8000/api"
TEST_EMAIL = "apitest@internpath.dev"
TEST_PASSWORD = "test12345"


def test_health() -> bool:
    print("\n=== Health ===")
    response = requests.get(f"{BASE_URL}/health", timeout=30)
    print(response.status_code, response.json())
    return response.status_code == 200


def test_auth_flow() -> str | None:
    print("\n=== Auth ===")
    requests.post(
        f"{BASE_URL}/auth/register",
        json={"email": TEST_EMAIL, "password": TEST_PASSWORD, "full_name": "API Test"},
        timeout=30,
    )
    response = requests.post(
        f"{BASE_URL}/auth/login",
        json={"email": TEST_EMAIL, "password": TEST_PASSWORD},
        timeout=30,
    )
    print("login", response.status_code)
    if response.status_code != 200:
        return None
    return response.json()["access_token"]


def test_profile(token: str) -> bool:
    print("\n=== Profile ===")
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.put(
        f"{BASE_URL}/profile",
        headers=headers,
        json={
            "education": "undergraduate",
            "skills": "Python, React, JavaScript, SQL",
            "interests": "AI, web development",
            "domains": ["tech"],
            "location": "Bangalore, Remote",
        },
        timeout=30,
    )
    print(response.status_code, response.json())
    return response.status_code == 200


def test_recommendations(token: str) -> bool:
    print("\n=== Recommendations ===")
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.post(
        f"{BASE_URL}/recommendations",
        headers=headers,
        json={"top_k": 5},
        timeout=120,
    )
    data = response.json()
    print("status", response.status_code)
    if response.status_code == 200:
        print("matches", len(data["recommendations"]))
        print("top match", data["recommendations"][0]["title"])
    return response.status_code == 200


def main() -> int:
    if not test_health():
        return 1
    token = test_auth_flow()
    if not token:
        return 1
    if not test_profile(token):
        return 1
    if not test_recommendations(token):
        return 1
    print("\nAll API tests passed.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
