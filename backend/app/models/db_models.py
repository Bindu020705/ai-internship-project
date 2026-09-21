import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, Integer, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from app.core.db import Base

def generate_uuid():
    return str(uuid.uuid4())

class Dataset(Base):
    __tablename__ = "datasets"

    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, nullable=False)
    source = Column(String, nullable=False, default="upload") # upload, demo, manual
    row_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    records = relationship("ConsumptionRecord", back_populates="dataset", cascade="all, delete-orphan")
    analyses = relationship("Analysis", back_populates="dataset", cascade="all, delete-orphan")
    recommendations = relationship("Recommendation", back_populates="dataset", cascade="all, delete-orphan")

class ConsumptionRecord(Base):
    __tablename__ = "consumption_records"

    id = Column(String, primary_key=True, default=generate_uuid)
    dataset_id = Column(String, ForeignKey("datasets.id"), nullable=False)
    date = Column(String, nullable=False)
    bathing = Column(Float, default=0.0)
    laundry = Column(Float, default=0.0)
    cleaning = Column(Float, default=0.0)
    cooking = Column(Float, default=0.0)
    gardening = Column(Float, default=0.0)
    drinking = Column(Float, default=0.0)
    toilet = Column(Float, default=0.0)
    other = Column(Float, default=0.0)
    total = Column(Float, default=0.0)

    dataset = relationship("Dataset", back_populates="records")

class Analysis(Base):
    __tablename__ = "analyses"

    id = Column(String, primary_key=True, default=generate_uuid)
    dataset_id = Column(String, ForeignKey("datasets.id"), nullable=False)
    summary_json = Column(JSON, nullable=True)
    statistics_json = Column(JSON, nullable=True)
    trend_data_json = Column(JSON, nullable=True)
    activity_distribution_json = Column(JSON, nullable=True)
    anomalies_json = Column(JSON, nullable=True)
    sustainability_index = Column(Float, default=75.0)
    created_at = Column(DateTime, default=datetime.utcnow)

    dataset = relationship("Dataset", back_populates="analyses")

class Recommendation(Base):
    __tablename__ = "recommendations"

    id = Column(String, primary_key=True, default=generate_uuid)
    dataset_id = Column(String, ForeignKey("datasets.id"), nullable=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    priority = Column(String, default="Medium") # High, Medium, Low
    difficulty = Column(String, default="Easy") # Easy, Moderate, Advanced
    reason = Column(Text, nullable=True)
    status = Column(String, default="Suggested") # Suggested, Added, Completed
    created_at = Column(DateTime, default=datetime.utcnow)

    dataset = relationship("Dataset", back_populates="recommendations")

class ActionPlanItem(Base):
    __tablename__ = "action_plan_items"

    id = Column(String, primary_key=True, default=generate_uuid)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    priority = Column(String, default="Medium")
    difficulty = Column(String, default="Easy")
    status = Column(String, default="Not Started") # Not Started, In Progress, Completed
    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)

class ChatSession(Base):
    __tablename__ = "chat_sessions"

    id = Column(String, primary_key=True, default=generate_uuid)
    created_at = Column(DateTime, default=datetime.utcnow)

    messages = relationship("ChatMessage", back_populates="session", cascade="all, delete-orphan")

class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(String, primary_key=True, default=generate_uuid)
    session_id = Column(String, ForeignKey("chat_sessions.id"), nullable=False)
    role = Column(String, nullable=False) # user, assistant, system
    content = Column(Text, nullable=False)
    sources_json = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    session = relationship("ChatSession", back_populates="messages")

class KnowledgeDocument(Base):
    __tablename__ = "knowledge_documents"

    id = Column(String, primary_key=True, default=generate_uuid)
    title = Column(String, nullable=False)
    source = Column(String, nullable=False)
    url = Column(String, nullable=True)
    topic = Column(String, nullable=True)
    chunk_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
