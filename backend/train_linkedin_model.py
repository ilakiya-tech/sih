#!/usr/bin/env python3
"""
InternPath ML Model Training - LinkedIn Job Postings Dataset
Specifically designed for the relational dataset structure you have
"""

import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import pickle
import json
import re
import os
from datetime import datetime

class LinkedInDatasetTrainer:
    """
    ML Training pipeline for LinkedIn job postings dataset
    Handles the relational structure with multiple CSV files
    """
    
    def __init__(self, data_path='data'):
        self.data_path = data_path
        self.model_path = 'models'
        os.makedirs(self.model_path, exist_ok=True)
        
        # Initialize TF-IDF vectorizer
        self.tfidf_vectorizer = TfidfVectorizer(
            max_features=1000,
            ngram_range=(1, 2),
            stop_words='english',
            min_df=2,
            max_df=0.8
        )
        
        # Store loaded dataframes
        self.df_postings = None
        self.df_skills = None
        self.df_companies = None
        self.df_job_skills = None
        self.df_industries = None
        
    def load_all_data(self):
        """
        Load all CSV files from the dataset
        """
        print("="*70)
        print("📂 LOADING LINKEDIN DATASET FILES")
        print("="*70)
        
        try:
            # Load main postings file
            print("📄 Loading postings.csv...")
            self.df_postings = pd.read_csv(f'{self.data_path}/postings.csv')
            print(f"   ✅ Loaded {len(self.df_postings)} job postings")
            print(f"   📊 Columns: {self.df_postings.columns.tolist()}\n")
            
            # Load job-skills mapping
            print("📄 Loading jobs/job_skills.csv...")
            self.df_job_skills = pd.read_csv(f'{self.data_path}/jobs/job_skills.csv')
            print(f"   ✅ Loaded {len(self.df_job_skills)} job-skill mappings\n")
            
            # Load skills reference
            print("📄 Loading mappings/skills.csv...")
            self.df_skills = pd.read_csv(f'{self.data_path}/mappings/skills.csv')
            print(f"   ✅ Loaded {len(self.df_skills)} unique skills\n")
            
            # Load companies
            print("📄 Loading companies/companies.csv...")
            self.df_companies = pd.read_csv(f'{self.data_path}/companies/companies.csv')
            print(f"   ✅ Loaded {len(self.df_companies)} companies\n")
            
            # Load industries (optional)
            try:
                print("📄 Loading mappings/industries.csv...")
                self.df_industries = pd.read_csv(f'{self.data_path}/mappings/industries.csv')
                print(f"   ✅ Loaded {len(self.df_industries)} industries\n")
            except:
                print("   ⚠️  Industries file not found (optional)\n")
                self.df_industries = None
            
            print("✅ ALL FILES LOADED SUCCESSFULLY!\n")
            return True
            
        except FileNotFoundError as e:
            print(f"❌ Error: File not found - {e}")
            print("\n📋 Expected folder structure:")
            print("   data/")
            print("   ├── postings.csv")
            print("   ├── jobs/job_skills.csv")
            print("   ├── mappings/skills.csv")
            print("   └── companies/companies.csv")
            return False
    
    def merge_skills_to_postings(self):
        """
        Join job_skills and skills tables to get actual skill names for each job
        """
        print("="*70)
        print("🔗 MERGING SKILLS DATA")
        print("="*70)
        
        # Join job_skills with skills to get skill names
        job_skills_merged = self.df_job_skills.merge(
            self.df_skills,
            left_on='skill_abr',
            right_on='skill_abr',
            how='left'
        )
        
        # Group by job_id to get all skills for each job
        job_skills_grouped = job_skills_merged.groupby('job_id')['skill_name'].apply(
            lambda x: ', '.join(x.dropna().astype(str))
        ).reset_index()
        
        job_skills_grouped.columns = ['job_id', 'required_skills']
        
        print(f"✅ Merged skills for {len(job_skills_grouped)} jobs")
        print(f"   Sample: {job_skills_grouped['required_skills'].iloc[0][:100]}...\n")
        
        # Merge with postings
        self.df_postings = self.df_postings.merge(
            job_skills_grouped,
            on='job_id',
            how='left'
        )
        
        # Fill missing skills
        self.df_postings['required_skills'] = self.df_postings['required_skills'].fillna('General skills')
        
        print("✅ Skills merged to postings table\n")
    
    def filter_for_internships(self):
        """
        Filter postings to get only internships
        """
        print("="*70)
        print("🔍 FILTERING FOR INTERNSHIPS")
        print("="*70)
        
        initial_count = len(self.df_postings)
        
        # Filter by title containing 'intern'
        self.df_postings = self.df_postings[
            self.df_postings['title'].str.contains('intern', case=False, na=False)
        ]
        
        print(f"✅ Found {len(self.df_postings)} internships out of {initial_count} total postings")
        print(f"   Filtered: {initial_count - len(self.df_postings)} non-internship jobs\n")
    
    def clean_and_preprocess(self):
        """
        Clean and preprocess the data
        """
        print("="*70)
        print("🧹 CLEANING AND PREPROCESSING")
        print("="*70)
        
        # Remove duplicates
        print("🗑️  Removing duplicates...")
        initial_len = len(self.df_postings)
        self.df_postings = self.df_postings.drop_duplicates(subset=['job_id'], keep='first')
        print(f"   ✅ Removed {initial_len - len(self.df_postings)} duplicates\n")
        
        # Clean text fields
        print("✨ Cleaning text fields...")
        self.df_postings['description'] = self.df_postings['description'].fillna('Not specified')
        self.df_postings['title'] = self.df_postings['title'].fillna('Internship')
        self.df_postings['company_name'] = self.df_postings['company_name'].fillna('Company')
        
        # Clean description text
        self.df_postings['description'] = self.df_postings['description'].apply(self.clean_text)
        self.df_postings['title'] = self.df_postings['title'].apply(self.clean_text)
        
        print("   ✅ Text cleaning complete\n")
        
        # Extract location (if available)
        print("📍 Processing location data...")
        if 'location' in self.df_postings.columns:
            self.df_postings['location'] = self.df_postings['location'].fillna('Remote')
        else:
            self.df_postings['location'] = 'Remote'  # Default if no location column
        print("   ✅ Location data processed\n")
        
        # Categorize domains based on title and description
        print("🏷️  Categorizing domains...")
        self.df_postings['domain'] = self.df_postings.apply(self.categorize_domain, axis=1)
        print(f"   ✅ Domains assigned")
        print(f"   📊 Domain distribution:")
        print(self.df_postings['domain'].value_counts().to_dict())
        print()
        
        # Estimate education level
        print("🎓 Estimating education levels...")
        self.df_postings['education_level'] = self.df_postings.apply(
            self.estimate_education_level, axis=1
        )
        print("   ✅ Education levels assigned\n")
        
        # Process salary information
        print("💰 Processing salary data...")
        self.df_postings['stipend'] = self.df_postings.apply(self.format_salary, axis=1)
        print("   ✅ Salary data formatted\n")
        
        # Estimate duration
        print("⏱️  Estimating internship duration...")
        self.df_postings['duration'] = self.df_postings['description'].apply(self.extract_duration)
        print("   ✅ Duration estimated\n")
        
        # Determine work type
        print("🏢 Determining work type...")
        self.df_postings['type'] = self.df_postings['description'].apply(self.determine_work_type)
        print("   ✅ Work type assigned\n")
        
        print(f"✅ PREPROCESSING COMPLETE!")
        print(f"📊 Final dataset: {len(self.df_postings)} internships ready for training\n")
    
    def clean_text(self, text):
        """Clean text data"""
        if pd.isna(text):
            return ""
        
        text = str(text)
        text = re.sub(r'<[^>]+>', '', text)  # Remove HTML
        text = re.sub(r'http\S+', '', text)  # Remove URLs
        text = re.sub(r'[^\w\s\.,\-]', ' ', text)  # Remove special chars
        text = ' '.join(text.split())  # Remove extra whitespace
        
        return text
    
    def categorize_domain(self, row):
        """Categorize internship into domain"""
        text = (str(row.get('title', '')) + ' ' + 
                str(row.get('description', '')) + ' ' + 
                str(row.get('required_skills', ''))).lower()
        
        domain_keywords = {
            'tech': ['software', 'developer', 'programming', 'coding', 'engineer', 'tech', 
                    'data', 'ai', 'ml', 'web', 'app', 'python', 'java', 'javascript'],
            'marketing': ['marketing', 'social media', 'seo', 'content', 'digital', 
                         'brand', 'campaign', 'advertising'],
            'design': ['design', 'ui', 'ux', 'graphic', 'creative', 'visual', 'figma', 
                      'photoshop', 'illustrator'],
            'business': ['business', 'management', 'operations', 'strategy', 'sales', 
                        'analyst', 'consulting'],
            'finance': ['finance', 'accounting', 'investment', 'banking', 'financial', 
                       'economics', 'audit'],
            'healthcare': ['health', 'medical', 'clinical', 'hospital', 'healthcare', 
                          'pharmaceutical', 'biotech']
        }
        
        for domain, keywords in domain_keywords.items():
            if any(keyword in text for keyword in keywords):
                return domain
        
        return 'other'
    
    def estimate_education_level(self, row):
        """Estimate required education level"""
        text = str(row.get('description', '')).lower()
        
        if any(word in text for word in ['graduate', 'master', 'mba', 'postgraduate']):
            return 'postgraduate'
        elif any(word in text for word in ['diploma', 'certificate']):
            return 'diploma'
        else:
            return 'undergraduate'  # Default for internships
    
    def format_salary(self, row):
        """Format salary information"""
        try:
            if 'max_salary' in row and pd.notna(row['max_salary']):
                salary = float(row['max_salary'])
                currency = row.get('currency', 'USD')
                pay_period = row.get('pay_period', 'YEARLY')
                
                # Convert to monthly for consistency
                if pay_period == 'YEARLY':
                    monthly = salary / 12
                elif pay_period == 'HOURLY':
                    monthly = salary * 160  # Assume 160 hours/month
                else:
                    monthly = salary
                
                # Format based on currency
                if currency == 'USD':
                    return f"${int(monthly)}/month"
                else:
                    return f"₹{int(monthly * 80)}/month"  # Rough conversion
            
            return "Not disclosed"
        except:
            return "Not disclosed"
    
    def extract_duration(self, text):
        """Extract internship duration"""
        text = str(text).lower()
        
        if 'month' in text:
            duration_pattern = r'(\d+)\s*month'
            matches = re.findall(duration_pattern, text)
            if matches:
                return f'{matches[0]} months'
        
        return '3-6 months'  # Default
    
    def determine_work_type(self, text):
        """Determine if remote, hybrid, or onsite"""
        text = str(text).lower()
        
        if 'remote' in text:
            return 'remote'
        elif 'hybrid' in text:
            return 'hybrid'
        else:
            return 'onsite'
    
    def prepare_for_training(self):
        """
        Prepare final dataset for ML training
        """
        print("="*70)
        print("📝 PREPARING DATA FOR ML TRAINING")
        print("="*70)
        
        # Select only necessary columns
        required_columns = [
            'job_id', 'title', 'company_name', 'description', 
            'required_skills', 'domain', 'location', 'education_level',
            'stipend', 'duration', 'type'
        ]
        
        # Keep only required columns that exist
        available_columns = [col for col in required_columns if col in self.df_postings.columns]
        self.df_postings = self.df_postings[available_columns]
        
        # Rename for consistency
        self.df_postings = self.df_postings.rename(columns={
            'job_id': 'id',
            'company_name': 'company'
        })
        
        # Create combined text for TF-IDF
        self.df_postings['combined_text'] = (
            self.df_postings['title'] + ' ' +
            self.df_postings['description'] + ' ' +
            self.df_postings['required_skills'] + ' ' +
            self.df_postings['domain']
        )
        
        print(f"✅ Data prepared for training")
        print(f"📊 Final shape: {self.df_postings.shape}")
        print(f"📋 Columns: {self.df_postings.columns.tolist()}\n")
    
    def train_model(self):
        """
        Train the TF-IDF model
        """
        print("="*70)
        print("🤖 TRAINING ML MODEL")
        print("="*70)
        
        print("🔢 Fitting TF-IDF vectorizer...")
        self.internship_features = self.tfidf_vectorizer.fit_transform(
            self.df_postings['combined_text']
        )
        
        print(f"✅ Model trained successfully!")
        print(f"   Feature matrix shape: {self.internship_features.shape}")
        print(f"   Vocabulary size: {len(self.tfidf_vectorizer.vocabulary_)}\n")
        
        # Convert to dictionary format
        self.internship_data = self.df_postings.drop(columns=['combined_text']).to_dict('records')
        
        print(f"✅ {len(self.internship_data)} internships ready for recommendations\n")
    
    def save_model(self):
        """
        Save trained model and data
        """
        print("="*70)
        print("💾 SAVING MODEL")
        print("="*70)
        
        # Save TF-IDF vectorizer
        with open(f'{self.model_path}/tfidf_vectorizer.pkl', 'wb') as f:
            pickle.dump(self.tfidf_vectorizer, f)
        print("✅ TF-IDF vectorizer saved")
        
        # Save feature matrix
        with open(f'{self.model_path}/internship_features.pkl', 'wb') as f:
            pickle.dump(self.internship_features, f)
        print("✅ Feature matrix saved")
        
        # Save internship data
        with open(f'{self.model_path}/internship_data.pkl', 'wb') as f:
            pickle.dump(self.internship_data, f)
        print("✅ Internship data saved")
        
        # Save first 100 as JSON for inspection
        with open(f'{self.model_path}/internship_data.json', 'w') as f:
            json.dump(self.internship_data[:100], f, indent=2)
        print("✅ Sample data saved as JSON")
        
        # Save metadata
        metadata = {
            'training_date': datetime.now().isoformat(),
            'num_internships': len(self.internship_data),
            'feature_dimensions': self.internship_features.shape[1],
            'vocabulary_size': len(self.tfidf_vectorizer.vocabulary_),
            'domains': list(self.df_postings['domain'].value_counts().to_dict().keys()),
            'dataset': 'LinkedIn Job Postings (Relational)',
            'source': 'Kaggle'
        }
        
        with open(f'{self.model_path}/model_metadata.json', 'w') as f:
            json.dump(metadata, f, indent=2)
        print("✅ Metadata saved\n")
        
        print("="*70)
        print("🎉 MODEL TRAINING COMPLETE!")
        print("="*70)
        print(f"📊 Total internships: {metadata['num_internships']}")
        print(f"📐 Feature dimensions: {metadata['feature_dimensions']}")
        print(f"📚 Vocabulary size: {metadata['vocabulary_size']}")
        print(f"🏷️  Domains: {metadata['domains']}")
        print("="*70)
    
    def run_full_pipeline(self):
        """
        Run the complete training pipeline
        """
        print("\n")
        print("╔═══════════════════════════════════════════════════════════════════╗")
        print("║                                                                   ║")
        print("║        🚀 INTERNPATH ML TRAINING - LINKEDIN DATASET 🚀           ║")
        print("║                                                                   ║")
        print("╚═══════════════════════════════════════════════════════════════════╝")
        print("\n")
        
        # Step 1: Load all data
        if not self.load_all_data():
            print("❌ Failed to load data. Please check file paths.")
            return False
        
        # Step 2: Merge skills
        self.merge_skills_to_postings()
        
        # Step 3: Filter for internships
        self.filter_for_internships()
        
        if len(self.df_postings) == 0:
            print("❌ No internships found in dataset!")
            return False
        
        # Step 4: Clean and preprocess
        self.clean_and_preprocess()
        
        # Step 5: Prepare for training
        self.prepare_for_training()
        
        # Step 6: Train model
        self.train_model()
        
        # Step 7: Save everything
        self.save_model()
        
        print("\n✅ TRAINING PIPELINE COMPLETED SUCCESSFULLY!")
        print("\n📝 Next steps:")
        print("   1. Replace your main.py with the trained model version")
        print("   2. Start backend: uvicorn main:app --reload --port 8000")
        print("   3. Test recommendations!")
        print("\n")
        
        return True

# Main execution
if __name__ == "__main__":
    trainer = LinkedInDatasetTrainer(data_path='data')
    success = trainer.run_full_pipeline()
    
    if success:
        print("🎉 Ready to run your InternPath backend with real data!")
    else:
        print("⚠️  Training failed. Please check errors above.")