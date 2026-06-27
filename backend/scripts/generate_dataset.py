"""Generate 500+ realistic internship listings for InternPath."""

from __future__ import annotations

import json
import random
from pathlib import Path

OUTPUT = Path(__file__).resolve().parents[1] / "data" / "internships.json"

COMPANIES = [
    "Infosys", "TCS", "Wipro", "HCLTech", "Tech Mahindra", "Capgemini", "Accenture",
    "Flipkart", "Swiggy", "Zomato", "Paytm", "Razorpay", "PhonePe", "CRED", "Meesho",
    "Freshworks", "Zoho", "Postman", "RazorpayX", "Unacademy", "BYJU'S", "Dream11",
    "Ola", "Uber India", "Amazon India", "Microsoft India", "Google India", "Adobe India",
    "SAP Labs India", "Oracle India", "IBM India", "Deloitte India", "EY India", "KPMG India",
    "Nykaa", "Myntra", "BigBasket", "Lenskart", "PolicyBazaar", "Groww", "Zerodha",
    "ShareChat", "InMobi", "BrowserStack", "Razorpay Software", "Thoughtworks", "HashedIn",
    "Mindtree", "LTIMindtree", "Mu Sigma", "Fractal Analytics", "Tiger Analytics",
]

CITIES = [
    "Bangalore", "Hyderabad", "Pune", "Chennai", "Mumbai", "Delhi NCR", "Gurgaon",
    "Noida", "Kolkata", "Ahmedabad", "Remote", "Hybrid - Bangalore", "Hybrid - Pune",
]

DOMAINS = {
    "Software Engineering": {
        "titles": [
            "Software Engineering Intern", "Backend Developer Intern", "Full Stack Intern",
            "Java Developer Intern", "C++ Developer Intern", "Systems Programming Intern",
        ],
        "skills": [["Python", "Git", "Data Structures"], ["Java", "Spring Boot", "SQL"], ["C++", "Algorithms", "Linux"]],
        "preferred": [["Docker", "AWS"], ["Microservices", "Redis"], ["System Design", "Networking"]],
    },
    "Web Development": {
        "titles": [
            "Frontend Developer Intern", "React Developer Intern", "Web Developer Intern",
            "Next.js Developer Intern", "UI Engineer Intern",
        ],
        "skills": [["JavaScript", "React", "HTML/CSS"], ["TypeScript", "React", "Git"], ["Node.js", "Express", "MongoDB"]],
        "preferred": [["Tailwind CSS", "GraphQL"], ["Next.js", "Testing"], ["REST APIs", "Figma"]],
    },
    "Data Science": {
        "titles": [
            "Data Science Intern", "Data Analyst Intern", "Business Analytics Intern",
            "Analytics Engineer Intern", "BI Analyst Intern",
        ],
        "skills": [["Python", "SQL", "Excel"], ["Python", "Pandas", "Data Analysis"], ["SQL", "Tableau", "Statistics"]],
        "preferred": [["Power BI", "A/B Testing"], ["Spark", "ETL"], ["Storytelling", "Communication"]],
    },
    "Machine Learning": {
        "titles": [
            "Machine Learning Intern", "ML Engineer Intern", "AI Research Intern",
            "Computer Vision Intern", "NLP Intern",
        ],
        "skills": [["Python", "Machine Learning", "NumPy"], ["Python", "Deep Learning", "TensorFlow"], ["Python", "NLP", "PyTorch"]],
        "preferred": [["MLOps", "Docker"], ["Research Papers", "Statistics"], ["Transformers", "LLMs"]],
    },
    "DevOps": {
        "titles": [
            "DevOps Intern", "Cloud Engineer Intern", "Platform Engineering Intern",
            "Site Reliability Intern", "Infrastructure Intern",
        ],
        "skills": [["Linux", "Docker", "Git"], ["AWS", "Kubernetes", "CI/CD"], ["Python", "Terraform", "Monitoring"]],
        "preferred": [["Prometheus", "Grafana"], ["Azure", "GCP"], ["Shell Scripting", "Networking"]],
    },
    "Mobile Development": {
        "titles": [
            "Android Developer Intern", "iOS Developer Intern", "Flutter Developer Intern",
            "React Native Intern", "Mobile App Intern",
        ],
        "skills": [["Kotlin", "Android", "Git"], ["Swift", "iOS", "Xcode"], ["Flutter", "Dart", "Firebase"]],
        "preferred": [["REST APIs", "UI/UX"], ["App Store Deployment"], ["State Management", "Testing"]],
    },
    "Cybersecurity": {
        "titles": [
            "Cybersecurity Intern", "Security Analyst Intern", "SOC Analyst Intern",
            "Application Security Intern", "Penetration Testing Intern",
        ],
        "skills": [["Networking", "Linux", "Cybersecurity"], ["Python", "Security Tools", "SIEM"], ["OWASP", "Web Security", "Scripting"]],
        "preferred": [["CEH", "Cloud Security"], ["Incident Response"], ["Threat Hunting"]],
    },
    "UI/UX Design": {
        "titles": [
            "UI/UX Design Intern", "Product Design Intern", "Visual Design Intern",
            "UX Research Intern", "Interaction Design Intern",
        ],
        "skills": [["Figma", "UI/UX Design", "Prototyping"], ["User Research", "Wireframing", "Figma"], ["Adobe XD", "Design Systems", "Typography"]],
        "preferred": [["Accessibility", "Usability Testing"], ["Motion Design"], ["Portfolio", "Communication"]],
    },
    "Product Management": {
        "titles": [
            "Product Management Intern", "Associate PM Intern", "Technical PM Intern",
            "Growth PM Intern", "Platform PM Intern",
        ],
        "skills": [["Communication", "Analytics", "Excel"], ["Product Management", "SQL", "Roadmapping"], ["User Research", "Agile", "Presentation"]],
        "preferred": [["A/B Testing", "Metrics"], ["Jira", "Stakeholder Management"], ["Market Research"]],
    },
    "Digital Marketing": {
        "titles": [
            "Digital Marketing Intern", "SEO Intern", "Content Marketing Intern",
            "Social Media Intern", "Performance Marketing Intern",
        ],
        "skills": [["SEO", "Google Analytics", "Content Writing"], ["Social Media", "Canva", "Communication"], ["Meta Ads", "Campaign Management", "Excel"]],
        "preferred": [["Copywriting", "Email Marketing"], ["Influencer Marketing"], ["Growth Hacking"]],
    },
    "Finance": {
        "titles": [
            "Finance Intern", "Financial Analyst Intern", "Investment Research Intern",
            "Risk Analyst Intern", "FinTech Intern",
        ],
        "skills": [["Excel", "Financial Modeling", "Accounting"], ["Python", "Finance", "Statistics"], ["Valuation", "PowerPoint", "Research"]],
        "preferred": [["Bloomberg", "SQL"], ["FinTech APIs"], ["CFA Level 1 prep"]],
    },
    "Blockchain": {
        "titles": [
            "Blockchain Developer Intern", "Web3 Intern", "Smart Contract Intern",
            "Crypto Research Intern", "DeFi Intern",
        ],
        "skills": [["Solidity", "Blockchain", "JavaScript"], ["Ethereum", "Smart Contracts", "Git"], ["Python", "Cryptography", "Web3"]],
        "preferred": [["Hardhat", "Security Audits"], ["Tokenomics"], ["Rust"]],
    },
}

DESCRIPTIONS = [
    "Work with cross-functional teams to build scalable features used by millions of users across India.",
    "Contribute to production codebases while learning modern engineering practices and code review workflows.",
    "Analyze large datasets, build dashboards, and present actionable insights to business stakeholders.",
    "Design and train ML models for real-world problems with mentorship from senior data scientists.",
    "Support cloud infrastructure automation, monitoring, and deployment pipelines in agile sprints.",
    "Collaborate with designers and PMs to ship polished user experiences on web and mobile platforms.",
    "Assist security operations, vulnerability assessments, and compliance initiatives for enterprise clients.",
    "Create marketing campaigns, track KPIs, and optimize conversion funnels across digital channels.",
    "Research market trends, prepare financial models, and support strategic decision-making processes.",
    "Prototype blockchain solutions and integrate smart contracts with frontend decentralized applications.",
]

WORK_MODES = ["Remote", "Hybrid", "On-site"]
EDUCATION = ["High School", "Undergraduate", "Postgraduate", "Diploma"]
DURATIONS = ["2 months", "3 months", "4 months", "6 months"]
STIPENDS = ["₹10,000/month", "₹15,000/month", "₹20,000/month", "₹25,000/month", "₹30,000/month", "₹35,000/month", "₹40,000/month", "Unpaid"]


def generate_internships(count: int = 520) -> list[dict]:
    internships: list[dict] = []
    domain_names = list(DOMAINS.keys())

    for index in range(1, count + 1):
        domain = domain_names[index % len(domain_names)]
        config = DOMAINS[domain]
        title = random.choice(config["titles"])
        company = random.choice(COMPANIES)
        city = random.choice(CITIES)
        skill_set = random.choice(config["skills"])
        preferred = random.choice(config["preferred"])
        work_mode = random.choice(WORK_MODES)
        location = city if city.startswith(("Remote", "Hybrid")) else f"{city}, {work_mode}"

        internships.append(
            {
                "id": f"int-{index:04d}",
                "title": title,
                "company": company,
                "location": location,
                "domain": domain,
                "description": random.choice(DESCRIPTIONS),
                "required_skills": skill_set,
                "preferred_skills": preferred,
                "stipend": random.choice(STIPENDS),
                "duration": random.choice(DURATIONS),
                "work_mode": work_mode,
                "education_level": random.choice(EDUCATION),
            }
        )
    return internships


def main() -> None:
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    data = generate_internships()
    with OUTPUT.open("w", encoding="utf-8") as handle:
        json.dump(data, handle, indent=2, ensure_ascii=False)
    print(f"Generated {len(data)} internships -> {OUTPUT}")


if __name__ == "__main__":
    main()
