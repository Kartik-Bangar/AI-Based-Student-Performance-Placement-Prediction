# 🎓 AI-Based Student Performance & Placement Prediction

> A machine learning project developed using **IBM watsonx.ai AutoAI** and **IBM Cloud** to predict whether a student is likely to get placed based on academic, technical, and skill-related attributes.

---

## 📌 Project Overview

Student placement is an important aspect of higher education. Identifying the factors that influence placement outcomes can help students understand the areas in which they need improvement.

This project uses **IBM watsonx.ai AutoAI** to build, evaluate, and deploy a machine learning model for student placement prediction. The model analyzes student-related attributes such as attendance, CGPA, projects, internship experience, certifications, aptitude score, communication skills, coding skills, and mock interview performance.

The trained model is deployed as an online deployment on IBM Cloud and tested using student input data to generate a placement prediction.

---

## 🎯 Problem Statement

Develop a machine learning solution that predicts whether a student is likely to be placed based on academic performance, technical skills, internship experience, certifications, aptitude scores, communication skills, coding skills, and other relevant parameters.

---

## 💡 Proposed Solution

The project uses IBM Cloud and IBM watsonx.ai AutoAI to perform the machine learning workflow.

The solution includes:

- Uploading and preparing the student placement dataset
- Creating an AutoAI experiment
- Automatically generating and comparing multiple machine learning pipelines
- Selecting the best-performing pipeline
- Saving the selected pipeline as a machine learning model
- Deploying the model as an online deployment
- Testing the deployed model with student data
- Generating a placement prediction

---

## 🚀 Key Features

- Student placement prediction
- Automated machine learning using IBM watsonx.ai AutoAI
- Multiple machine learning pipeline generation
- Automatic pipeline comparison
- Model evaluation
- Online model deployment
- REST API endpoint generation
- Prediction testing using new student data

---

## 🛠️ Technologies and Services Used

- IBM Cloud
- IBM Cloud Pak for Data
- IBM watsonx.ai AutoAI
- IBM Cloud Object Storage
- IBM Machine Learning
- IBM Deployment Space
- CSV Dataset

---

## 🧠 Machine Learning Workflow

1. Create an IBM Cloud project
2. Upload the student placement dataset
3. Create an AutoAI experiment
4. Select `Placement` as the prediction column
5. Run the AutoAI experiment
6. Generate multiple machine learning pipelines
7. Compare pipeline performance
8. Select the best-performing pipeline
9. Save the selected pipeline as a model
10. Create a deployment space
11. Deploy the model as an online deployment
12. Test the deployed model
13. Generate placement predictions

---

## 📊 Dataset Features

| Feature | Description |
|---|---|
| Attendance | Student attendance percentage |
| Study_Hours | Average study hours |
| CGPA | Academic performance |
| Projects | Number of completed projects |
| Internship | Internship experience |
| Certifications | Number of certifications |
| Aptitude_Score | Student aptitude score |
| Communication_Skills | Communication skill level |
| Coding_Skills | Programming skill level |
| Mock_Interview_Score | Mock interview performance |
| Placement | Target variable indicating placement outcome |

---

## 🤖 Model Information

| Parameter | Details |
|---|---|
| Problem Type | Binary Classification |
| Prediction Column | Placement |
| Training Platform | IBM watsonx.ai AutoAI |
| Best Pipeline | Pipeline 9 |
| Algorithm | Batched Tree Ensemble Classifier (Snap Random Forest Classifier) |
| Cross-Validation Accuracy | 0.970 |
| Holdout Accuracy | 0.960 |
| Deployment Type | Online |
| Prediction Output | Yes / No |

---

## 📈 Results

The AutoAI experiment generated **9 machine learning pipelines** using different algorithms and optimization techniques.

The top-ranked pipeline was **Pipeline 9**, which used a **Batched Tree Ensemble Classifier (Snap Random Forest Classifier)**.

The experiment achieved:

- **Cross-validation accuracy: 0.970**
- **Holdout accuracy: 0.960**

The selected model was successfully saved as **Student Placement Predictor** and deployed as an online deployment named **Student Placement API**.

The deployed model was successfully tested and generated a placement prediction of **Yes** for the test input.

---

# 📸 Project Screenshots

## 1. Project Overview

![Project Overview](Screenshots/Project_Overview.png)

---

## 2. Project Assets

![Project Assets](Screenshots/Assets_List.png)

---

## 3. Dataset Preview

![Dataset Preview](Screenshots/Dataset_Preview.png)

---

## 4. AutoAI Relationship Map

![AutoAI Relationship Map](Screenshots/AutoAI_Relationship_Map.png)

---

## 5. Pipeline Leaderboard

![Pipeline Leaderboard](Screenshots/Pipeline_Leaderboard.png)

---

## 6. Model Evaluation

![Model Evaluation ROC](Screenshots/Model_Evaluation_ROC.png)

---

## 7. Deployment Space

![Deployment Space](Screenshots/Deployment_Space.png)

---

## 8. API Deployment

![API Deployment](Screenshots/API_Deployment.png)

---

## 9. Prediction Result

![Prediction Result](Screenshots/Prediction_Result.png)

---

## 10. Deployment Dashboard

![Deployment Dashboard](Screenshots/Deployment_Dashboard.png)

---

## ⚙️ Project Implementation

### Step 1: Create the Project

A new project named **AI-Based Student Performance & Placement Prediction** was created in IBM Cloud Pak for Data.

### Step 2: Upload the Dataset

The `Student_Performance_Placement_Dataset.csv` file was uploaded to the project.

### Step 3: Create an AutoAI Experiment

An AutoAI experiment named **Student Placement Prediction** was created using the uploaded dataset, with `Placement` selected as the target prediction column.

### Step 4: Train the Model

AutoAI automatically processed the dataset and generated multiple machine learning pipelines.

### Step 5: Select the Best Pipeline

The generated pipelines were compared based on their performance. **Pipeline 9** was the top-ranked pipeline.

### Step 6: Save the Model

The selected pipeline was saved as a machine learning model named:

`Student Placement Predictor`

### Step 7: Create the Deployment

A deployment space named:

`Student Placement Space`

was used to create an online deployment named:

`Student Placement API`

### Step 8: Test the Deployment

The deployed model was tested using student input data. The model successfully returned a placement prediction.

---

## 📁 Repository Structure

```text
AI-Based-Student-Performance-and-Placement-Prediction/
│
├── README.md
├── Problem_Statement.pdf
├── IBM_Project_Report.docx
├── AI-Based Student Placement Prediction.pptx
├── Student_Performance_Placement_Dataset.csv
│
└── Screenshots/
    ├── API_Deployment.png
    ├── Assets_List.png
    ├── AutoAI_Relationship_Map.png
    ├── Dataset_Preview.png
    ├── Deployment_Dashboard.png
    ├── Deployment_Space.png
    ├── Model_Evaluation_ROC.png
    ├── Pipeline_Leaderboard.png
    ├── Prediction_Result.png
    └── Project_Overview.png
```

---

## ⚙️ How to Reproduce the Project

1. Log in to IBM Cloud.
2. Open IBM Cloud Pak for Data.
3. Create a new project.
4. Upload `Student_Performance_Placement_Dataset.csv`.
5. Create a new AutoAI experiment.
6. Select the uploaded dataset as the data source.
7. Select `Placement` as the prediction column.
8. Run the AutoAI experiment.
9. Compare the generated pipelines.
10. Select and save the best-performing pipeline as a model.
11. Create or select a deployment space.
12. Promote the saved model to the deployment space.
13. Create an online deployment.
14. Test the deployed model using student input data.

---

## 🔮 Future Scope

The project can be further extended with:

- Web application integration
- Student performance dashboard
- College placement analytics
- Career recommendation system
- Resume analysis
- Interview preparation recommendations
- Student guidance chatbot
- Integration with real-time institutional data

---

## 🎓 Applications

### For Students

- Understand factors affecting placement readiness
- Identify areas for improvement
- Support career preparation

### For Educational Institutions

- Analyze student placement readiness
- Identify students who may require additional support
- Support data-driven placement preparation

---

## 👨‍💻 Developed By

**Kartik Bangar**

B.Tech – Electronics & Telecommunication Engineering  
MIT Academy of Engineering (MITAOE)

**IBM SkillsBuild AICTE Internship 2026**

---

## 📄 Project Files

This repository contains:

- Project Problem Statement
- Project Report
- Project Presentation
- Student Placement Dataset
- Project Implementation Screenshots
- Project README Documentation

---

## 🙏 Acknowledgements

- IBM SkillsBuild
- IBM watsonx.ai
- IBM Cloud
- AICTE
- MIT Academy of Engineering
