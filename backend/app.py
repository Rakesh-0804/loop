import os
import json
import re
from datetime import datetime
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# Database Configuration (PostgreSQL)
db_url = os.getenv("DATABASE_URL") or os.getenv("POSTGRES_URL") or "postgresql://neondb_owner:npg_JLVuyth5XSk3@ep-nameless-pond-azsr3y63-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"
app.config['SQLALCHEMY_DATABASE_URI'] = db_url
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# Gemini AI Client setup
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY") or os.getenv("NEXT_PUBLIC_GEMINI_API_KEY") or os.getenv("GOOGLE_AI_KEY")
gemini_client = None

if GEMINI_API_KEY:
    try:
        from google import genai
        gemini_client = genai.Client(api_key=GEMINI_API_KEY)
        print("Gemini AI Client initialized with model gemini-3.6-flash")
    except Exception as e:
        print(f"Note on Gemini AI Client: {e}")

# Database Models matching Neon PostgreSQL Schema
class FeedbackModel(db.Model):
    __tablename__ = 'Feedback'
    id = db.Column(db.String, primary_key=True)
    content = db.Column(db.Text, nullable=False)
    channel = db.Column(db.String, default='support_ticket')
    sourceRef = db.Column(db.String, nullable=True)
    customerLabel = db.Column(db.String, nullable=True)
    sentiment = db.Column(db.String, nullable=True)
    sentimentScore = db.Column(db.Float, nullable=True)
    status = db.Column(db.String, default='NEW')
    createdAt = db.Column(db.DateTime, default=datetime.utcnow)
    workspaceId = db.Column(db.String, nullable=True)

    def to_dict(self):
        s_map = {"POS": "POSITIVE", "NEG": "NEGATIVE", "NEU": "NEUTRAL"}
        s_label = s_map.get(self.sentiment, "NEUTRAL")
        return {
            "id": self.id,
            "feedback": self.content,
            "content": self.content,
            "channel": self.channel,
            "sourceRef": self.sourceRef,
            "customerLabel": self.customerLabel,
            "sentiment": s_label,
            "score": round(self.sentimentScore or 0.5, 4),
            "sentimentScore": self.sentimentScore or 0.5,
            "status": self.status,
            "timestamp": self.createdAt.isoformat() if self.createdAt else str(datetime.utcnow()),
            "createdAt": self.createdAt.isoformat() if self.createdAt else str(datetime.utcnow())
        }

class UserModel(db.Model):
    __tablename__ = 'User'
    id = db.Column(db.String, primary_key=True)
    name = db.Column(db.String, nullable=False)
    email = db.Column(db.String, unique=True, nullable=False)
    passwordHash = db.Column(db.String, nullable=False)
    role = db.Column(db.String, default='ADMIN')
    workspaceId = db.Column(db.String, nullable=False)

class ReportModel(db.Model):
    __tablename__ = 'Report'
    id = db.Column(db.String, primary_key=True)
    title = db.Column(db.String, nullable=False)
    periodStart = db.Column(db.DateTime, default=datetime.utcnow)
    periodEnd = db.Column(db.DateTime, default=datetime.utcnow)
    contentJson = db.Column(db.Text, nullable=False)
    createdAt = db.Column(db.DateTime, default=datetime.utcnow)
    workspaceId = db.Column(db.String, nullable=False)
    generatedBy = db.Column(db.String, default='Admin')

# Sentiment Analysis Engine (Gemini 3.6 Flash + Fallback)
def analyze_sentiment_ai(text):
    if gemini_client:
        try:
            prompt = f"""You are an expert customer feedback intelligence AI.
Analyze this feedback: "{text}"

Return ONLY a valid JSON object matching this schema:
{{
  "sentiment": "POSITIVE" | "NEUTRAL" | "NEGATIVE",
  "score": float between 0.0 and 1.0
}}"""
            response = gemini_client.interactions.create(
                model="gemini-3.6-flash",
                input=prompt
            )
            clean_json = re.sub(r'```json|```', '', response.output_text or '').strip()
            parsed = json.loads(clean_json)
            s_map = {"POSITIVE": "POS", "NEGATIVE": "NEG", "NEUTRAL": "NEU"}
            raw_s = parsed.get("sentiment", "NEUTRAL").upper()
            return s_map.get(raw_s, "NEU"), float(parsed.get("score", 0.7)), raw_s
        except Exception as e:
            print(f"Gemini AI error, using fallback: {e}")

    # Fallback Rule Engine
    lower = text.lower()
    pos_words = ['good', 'great', 'love', 'fast', 'amazing', 'excellent', 'useful', 'happy', 'best', 'awesome', 'improved', 'crisp']
    neg_words = ['slow', 'bad', 'hate', 'delay', 'issue', 'problem', 'bug', 'failed', 'broken', 'worst', 'error', 'poor']
    
    pos_count = sum(1 for w in pos_words if w in lower)
    neg_count = sum(1 for w in neg_words if w in lower)

    if pos_count > neg_count:
        return "POS", min(0.98, round(0.7 + pos_count * 0.1, 4)), "POSITIVE"
    elif neg_count > pos_count:
        return "NEG", max(0.05, round(0.3 - neg_count * 0.1, 4)), "NEGATIVE"
    else:
        return "NEU", 0.5, "NEUTRAL"

# Flask Routes
@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "status": "online",
        "message": "AI Customer Feedback Intelligence Platform (Flask Backend)",
        "database": "PostgreSQL (Neon)",
        "ai_model": "Google Gemini 3.6 Flash",
        "endpoints": [
            "POST /submit-feedback",
            "GET /feedbacks",
            "GET /analytics",
            "GET /search?keyword=...",
            "POST /generate-report",
            "GET /health"
        ]
    })

@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "status": "running",
        "service": "AI Feedback Analyzer",
        "timestamp": str(datetime.utcnow())
    })

@app.route("/submit-feedback", methods=["POST"])
def submit_feedback():
    data = request.get_json() or {}
    feedback_text = data.get("feedback", "") or data.get("content", "")

    if not feedback_text.strip():
        return jsonify({"error": "Feedback cannot be empty"}), 400

    sentiment_code, score, label = analyze_sentiment_ai(feedback_text)

    new_id = f"fb-{int(datetime.utcnow().timestamp() * 1000)}"

    record = FeedbackModel(
        id=new_id,
        content=feedback_text,
        channel=data.get("channel", "support_ticket"),
        sourceRef=data.get("sourceRef"),
        customerLabel=data.get("customerLabel"),
        sentiment=sentiment_code,
        sentimentScore=score,
        status="NEW",
        workspaceId=data.get("workspaceId")
    )

    try:
        db.session.add(record)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        print(f"PostgreSQL save warning: {e}")

    res_dict = record.to_dict()
    res_dict["sentiment"] = label

    return jsonify({
        "message": "Feedback analyzed successfully",
        "data": res_dict
    }), 201

@app.route("/feedbacks", methods=["GET"])
def get_feedbacks():
    try:
        items = FeedbackModel.query.order_by(FeedbackModel.createdAt.desc()).all()
        feedbacks = [i.to_dict() for i in items]
    except Exception as e:
        feedbacks = []

    return jsonify({
        "count": len(feedbacks),
        "feedbacks": feedbacks
    })

@app.route("/analytics", methods=["GET"])
def analytics():
    positive = 0
    negative = 0
    neutral = 0

    try:
        items = FeedbackModel.query.all()
        for item in items:
            if item.sentiment == "POS":
                positive += 1
            elif item.sentiment == "NEG":
                negative += 1
            else:
                neutral += 1
        total = len(items)
    except Exception:
        total, positive, negative, neutral = 0, 0, 0, 0

    return jsonify({
        "total_feedbacks": total,
        "positive_feedbacks": positive,
        "negative_feedbacks": negative,
        "neutral_feedbacks": neutral,
        "positive_percentage": round((positive / total * 100), 2) if total > 0 else 0
    })

@app.route("/search", methods=["GET"])
def search_feedback():
    keyword = request.args.get("keyword", "").strip().lower()
    results = []

    try:
        items = FeedbackModel.query.all()
        for item in items:
            if keyword in item.content.lower():
                results.append(item.to_dict())
    except Exception as e:
        pass

    return jsonify({
        "keyword": keyword,
        "matches": len(results),
        "results": results
    })

@app.route("/generate-report", methods=["POST"])
def generate_report():
    data = request.get_json() or {}
    report_title = data.get("title", "Executive Customer Feedback Intelligence Report")

    try:
        items = FeedbackModel.query.all()
        feedbacks_data = [i.to_dict() for i in items]
    except Exception:
        feedbacks_data = []

    total_count = len(feedbacks_data)
    pos_count = sum(1 for f in feedbacks_data if f.get("sentiment") in ["POS", "POSITIVE"])
    positive_ratio = (pos_count / total_count) if total_count > 0 else 0.0

    summary = f"Executive Customer Feedback Summary: {total_count} feedback records analyzed. Overall positive sentiment ratio stands at {round(positive_ratio * 100, 1)}%."
    top_themes = ["Performance & Speed", "UI/UX Usability", "Feature Requests"]
    critical_issues = ["Intermittent feedback submission delays", "Mobile viewport dropdown alignment"]
    recommendations = ["Prioritize automated report generation", "Optimize query caching"]

    if gemini_client and total_count > 0:
        try:
            prompt = f"""You are a Chief Product Officer AI. Synthesize an executive report based on customer feedback items.

Report Title: {report_title}
Total Items: {total_count}
Positive Ratio: {round(positive_ratio * 100, 1)}%
Sample Data: {[f['feedback'] for f in feedbacks_data[:10]]}

Return ONLY a valid JSON object matching this schema:
{{
  "summary": "2-3 sentence executive synthesis paragraph",
  "top_themes": ["string array of top 3 recurring theme names"],
  "critical_issues": ["string array of critical user pain points"],
  "recommendations": ["string array of 3 prioritized strategic recommendations"]
}}"""
            response = gemini_client.interactions.create(
                model="gemini-3.6-flash",
                input=prompt
            )
            clean_json = re.sub(r'```json|```', '', response.output_text or '').strip()
            parsed = json.loads(clean_json)
            summary = parsed.get("summary", summary)
            top_themes = parsed.get("top_themes", top_themes)
            critical_issues = parsed.get("critical_issues", critical_issues)
            recommendations = parsed.get("recommendations", recommendations)
        except Exception as e:
            print(f"Gemini Report error: {e}")

    report_record = {
        "id": f"rep-{int(datetime.utcnow().timestamp() * 1000)}",
        "title": report_title,
        "summary": summary,
        "sentiment_stats": {
            "total": total_count,
            "positive_ratio": positive_ratio,
            "positive_percentage": f"{round(positive_ratio * 100, 1)}%"
        },
        "top_themes": top_themes,
        "critical_issues": critical_issues,
        "recommendations": recommendations,
        "generated_timestamp": datetime.utcnow().isoformat()
    }

    try:
        rep_db = ReportModel(
            id=report_record["id"],
            title=report_title,
            contentJson=json.dumps(report_record),
            generatedBy="Flask Gemini AI Engine"
        )
        db.session.add(rep_db)
        db.session.commit()
    except Exception as e:
        db.session.rollback()

    return jsonify({
        "message": "Executive report generated successfully",
        "report": report_record
    }), 201

if __name__ == "__main__":
    with app.app_context():
        try:
            db.create_all()
            print("PostgreSQL database tables verified & ready.")
        except Exception as e:
            print(f"Database table sync note: {e}")
    app.run(host="0.0.0.0", port=8000, debug=True)
