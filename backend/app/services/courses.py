"""Curated course suggestions mapped to common internship skills."""

COURSE_CATALOG: dict[str, list[dict[str, str]]] = {
    "python": [
        {"platform": "NPTEL", "title": "Programming in Python", "url": "https://nptel.ac.in/courses/106106145"},
        {"platform": "Coursera", "title": "Python for Everybody Specialization", "url": "https://www.coursera.org/specializations/python"},
        {"platform": "YouTube", "title": "Python Full Course for Beginners", "url": "https://www.youtube.com/watch?v=_uQrJ0TkZlc"},
    ],
    "javascript": [
        {"platform": "Coursera", "title": "Programming with JavaScript", "url": "https://www.coursera.org/learn/programming-with-javascript"},
        {"platform": "YouTube", "title": "JavaScript Full Course", "url": "https://www.youtube.com/watch?v=PkZNo7MFNFg"},
    ],
    "react": [
        {"platform": "Coursera", "title": "React Basics", "url": "https://www.coursera.org/learn/react-basics"},
        {"platform": "YouTube", "title": "React JS Full Course", "url": "https://www.youtube.com/watch?v=bMknfKXIFA8"},
    ],
    "java": [
        {"platform": "NPTEL", "title": "Programming in Java", "url": "https://nptel.ac.in/courses/106106144"},
        {"platform": "Coursera", "title": "Java Programming and Software Engineering", "url": "https://www.coursera.org/specializations/java-programming"},
    ],
    "machine learning": [
        {"platform": "NPTEL", "title": "Introduction to Machine Learning", "url": "https://nptel.ac.in/courses/106106129"},
        {"platform": "Coursera", "title": "Machine Learning Specialization", "url": "https://www.coursera.org/specializations/machine-learning-introduction"},
        {"platform": "YouTube", "title": "Machine Learning Course for Beginners", "url": "https://www.youtube.com/watch?v=NWONeJKn6kc"},
    ],
    "deep learning": [
        {"platform": "NPTEL", "title": "Deep Learning", "url": "https://nptel.ac.in/courses/106106184"},
        {"platform": "Coursera", "title": "Deep Learning Specialization", "url": "https://www.coursera.org/specializations/deep-learning"},
    ],
    "data analysis": [
        {"platform": "Coursera", "title": "Google Data Analytics Certificate", "url": "https://www.coursera.org/professional-certificates/google-data-analytics"},
        {"platform": "YouTube", "title": "Data Analysis with Python", "url": "https://www.youtube.com/watch?v=r-uOLxNrNk8"},
    ],
    "sql": [
        {"platform": "Coursera", "title": "SQL for Data Science", "url": "https://www.coursera.org/learn/sql-for-data-science"},
        {"platform": "YouTube", "title": "SQL Tutorial Full Course", "url": "https://www.youtube.com/watch?v=HXV3zeQKqGY"},
    ],
    "docker": [
        {"platform": "Coursera", "title": "Docker Essentials", "url": "https://www.coursera.org/learn/docker-essentials"},
        {"platform": "YouTube", "title": "Docker Tutorial for Beginners", "url": "https://www.youtube.com/watch?v=fqMOX6JJhGo"},
    ],
    "kubernetes": [
        {"platform": "Coursera", "title": "Introduction to Kubernetes", "url": "https://www.coursera.org/learn/introduction-to-kubernetes"},
        {"platform": "YouTube", "title": "Kubernetes Course for Beginners", "url": "https://www.youtube.com/watch?v=X48G2SZq50E"},
    ],
    "aws": [
        {"platform": "Coursera", "title": "AWS Cloud Technical Essentials", "url": "https://www.coursera.org/learn/aws-cloud-tech-essentials"},
        {"platform": "YouTube", "title": "AWS Full Course", "url": "https://www.youtube.com/watch?v=ulprqHHWGSY"},
    ],
    "git": [
        {"platform": "YouTube", "title": "Git and GitHub for Beginners", "url": "https://www.youtube.com/watch?v=RGOj5lP9Z9A"},
    ],
    "figma": [
        {"platform": "Coursera", "title": "UI/UX Design Specialization", "url": "https://www.coursera.org/specializations/ui-ux-design"},
        {"platform": "YouTube", "title": "Figma UI Design Tutorial", "url": "https://www.youtube.com/watch?v=FTFaQetLopM"},
    ],
    "communication": [
        {"platform": "Coursera", "title": "Improving Communication Skills", "url": "https://www.coursera.org/learn/wharton-communication-skills"},
        {"platform": "YouTube", "title": "Communication Skills Masterclass", "url": "https://www.youtube.com/watch?v=HAnw168huqA"},
    ],
    "excel": [
        {"platform": "Coursera", "title": "Excel Skills for Business", "url": "https://www.coursera.org/specializations/excel"},
        {"platform": "YouTube", "title": "Microsoft Excel Full Course", "url": "https://www.youtube.com/watch?v=Vl0H-tfUIjE"},
    ],
    "node.js": [
        {"platform": "Coursera", "title": "Server-side JavaScript with Node.js", "url": "https://www.coursera.org/learn/server-side-nodejs"},
        {"platform": "YouTube", "title": "Node.js Full Course", "url": "https://www.youtube.com/watch?v=Oe421EPjeBE"},
    ],
    "typescript": [
        {"platform": "YouTube", "title": "TypeScript Full Course", "url": "https://www.youtube.com/watch?v=30LWjhZzg50"},
    ],
    "c++": [
        {"platform": "NPTEL", "title": "Programming in C++", "url": "https://nptel.ac.in/courses/106106143"},
    ],
    "cybersecurity": [
        {"platform": "Coursera", "title": "Google Cybersecurity Certificate", "url": "https://www.coursera.org/professional-certificates/google-cybersecurity"},
        {"platform": "NPTEL", "title": "Introduction to Cyber Security", "url": "https://nptel.ac.in/courses/106106146"},
    ],
    "android": [
        {"platform": "Coursera", "title": "Android App Development Specialization", "url": "https://www.coursera.org/specializations/android-app-development"},
    ],
    "ios": [
        {"platform": "Coursera", "title": "iOS App Development with Swift", "url": "https://www.coursera.org/specializations/app-development-swift"},
    ],
    "tensorflow": [
        {"platform": "Coursera", "title": "TensorFlow Developer Certificate", "url": "https://www.coursera.org/professional-certificates/tensorflow-in-practice"},
    ],
    "pytorch": [
        {"platform": "YouTube", "title": "PyTorch Tutorial", "url": "https://www.youtube.com/watch?v=c36lUUr864M"},
    ],
    "nlp": [
        {"platform": "NPTEL", "title": "Natural Language Processing", "url": "https://nptel.ac.in/courses/106106155"},
        {"platform": "Coursera", "title": "Natural Language Processing Specialization", "url": "https://www.coursera.org/specializations/natural-language-processing"},
    ],
    "power bi": [
        {"platform": "Coursera", "title": "Microsoft Power BI Data Analyst", "url": "https://www.coursera.org/professional-certificates/microsoft-power-bi-data-analyst"},
    ],
    "tableau": [
        {"platform": "Coursera", "title": "Data Visualization with Tableau", "url": "https://www.coursera.org/specializations/data-visualization-tableau"},
    ],
    "mongodb": [
        {"platform": "Coursera", "title": "MongoDB Basics", "url": "https://www.coursera.org/learn/mongodb-basics"},
    ],
    "redis": [
        {"platform": "YouTube", "title": "Redis Crash Course", "url": "https://www.youtube.com/watch?v=jgpVdJB2sKQ"},
    ],
    "graphql": [
        {"platform": "YouTube", "title": "GraphQL Full Course", "url": "https://www.youtube.com/watch?v=ed8SzALpx1Q"},
    ],
    "spring boot": [
        {"platform": "Coursera", "title": "Building Scalable Java Microservices", "url": "https://www.coursera.org/learn/google-cloud-java-spring"},
    ],
    "flutter": [
        {"platform": "YouTube", "title": "Flutter Course for Beginners", "url": "https://www.youtube.com/watch?v=VPvVD8t02U8"},
    ],
    "blockchain": [
        {"platform": "Coursera", "title": "Blockchain Specialization", "url": "https://www.coursera.org/specializations/blockchain"},
    ],
    "seo": [
        {"platform": "Coursera", "title": "Search Engine Optimization", "url": "https://www.coursera.org/specializations/seo"},
    ],
    "social media": [
        {"platform": "Coursera", "title": "Meta Social Media Marketing", "url": "https://www.coursera.org/professional-certificates/facebook-social-media-marketing"},
    ],
    "project management": [
        {"platform": "Coursera", "title": "Google Project Management Certificate", "url": "https://www.coursera.org/professional-certificates/google-project-management"},
    ],
}

DEFAULT_COURSES = [
    {"platform": "Coursera", "title": "Career Skills for the 21st Century", "url": "https://www.coursera.org/learn/career-skills-21st-century"},
    {"platform": "YouTube", "title": "How to Get an Internship", "url": "https://www.youtube.com/watch?v=LT_QX8E9B1Y"},
]
