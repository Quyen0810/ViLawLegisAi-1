# rag_with_gemini.py
from google import genai
import json
import numpy as np
import faiss
from typing import List
import time
from dotenv import load_dotenv
import os

# Optional GUI
import gradio as gr

# Lightweight HTTP server for integration
try:
    from fastapi import FastAPI
    from pydantic import BaseModel
    from fastapi.middleware.cors import CORSMiddleware
    import uvicorn
except Exception:
    FastAPI = None  # type: ignore
    BaseModel = object  # type: ignore
    uvicorn = None  # type: ignore

load_dotenv()
MAX_CHARS = 2000
api_key = os.getenv("GENAI_API_KEY") or os.getenv("GEMINI_API_KEY")
def truncate_prompt(prompt: str):
    if len(prompt) > MAX_CHARS:
        return prompt[:MAX_CHARS] + "..."
    return prompt

#Client
client = genai.Client(api_key = api_key)  

# Data
with open("data.json", "r", encoding="utf-8") as f:
    docs = json.load(f)  # list of {id, dialect, text, norm, ...}

with open("law_data.json", "r", encoding="utf-8") as f:
    laws = json.load(f)  # list of {Source, text}

# padding
for law in laws:
    law["dialect"] = law["Source"]  
    law["meaning"] = ""             
    law["is_law"] = True

# padding
for d in docs:
    d["is_law"] = False

# 
all_data = docs + laws

texts = []
for d in all_data:
    if d.get("is_law", False):
        # Embed
        texts.append(f"Law Source: {d['Source']} ||| Text: {d['text']} ||| Type: {d.get('Type','')}")
    else:
        # Embed
        texts.append(f"Dialect: {d['dialect']} ||| Text: {d['text']} ||| Meaning: {d.get('meaning','')}")


# 3) embeddings (batch)
def embed_texts(text_list: List[str], batch_size=100):
    embeddings = []
    for i in range(0, len(text_list), batch_size):
        batch = text_list[i:i+batch_size]
        res = client.models.embed_content(
            model="models/embedding-001",
            contents=batch
        )
        embeddings.extend([e.values for e in res.embeddings])
    return embeddings

embs = embed_texts(texts)

# 4) build FAISS index (L2 / cosine -> normalize for cosine)
d = len(embs[0])
arr = np.array(embs).astype("float32")
# normalize for cosine similarity
faiss.normalize_L2(arr)
index = faiss.IndexFlatIP(d)  # inner product on normalized vectors = cosine
index.add(arr)

# keep mapping id -> original doc
id_map = {i: all_data[i] for i in range(len(all_data))}

# 5) query + retrieval
def retrieve(query: str, k=3):
    q_emb = embed_texts([query])[0]
    q = np.array([q_emb]).astype("float32")
    faiss.normalize_L2(q)
    D, I = index.search(q, k)
    hits = [id_map[idx] for idx in I[0] if idx != -1]
    return hits

def print_typing_effect(text, delay=0.03):
    for ch in text:
        print(ch, end="", flush=True)
        time.sleep(delay)

# Helper: Detect if question needs lawyer suggestion
def needs_lawyer_suggestion(user_q: str) -> tuple[bool, str]:
    """
    Returns (needs_lawyer: bool, lawyer_type: str)
    lawyer_type: 'civil', 'criminal', 'business', 'general'
    """
    q_lower = user_q.lower()
    
    # Keywords cho từng loại luật sư
    criminal_keywords = ['hình sự', 'bị tố cáo', 'bị bắt', 'điều tra', 'truy tố', 'án tù', 'tội danh', 
                         'công an', 'viện kiểm sát', 'bào chữa', 'kháng cáo', 'tù giam']
    
    civil_keywords = ['kiện', 'tranh chấp', 'sa thải', 'thừa kế', 'ly hôn', 'chia tài sản', 
                     'mua bán nhà', 'hợp đồng', 'bồi thường', 'tòa án', 'đơn kiện', 'đại diện']
    
    business_keywords = ['thành lập công ty', 'doanh nghiệp', 'hợp đồng thương mại', 'm&a', 
                        'sáp nhập', 'mua lại', 'giấy phép kinh doanh', 'đầu tư', 'thuế doanh nghiệp']
    
    direct_keywords = ['tìm luật sư', 'cần luật sư', 'liên hệ luật sư', 'giới thiệu luật sư', 
                      'có luật sư nào', 'thuê luật sư', 'tư vấn luật sư', 'số điện thoại luật sư']
    
    complex_question_keywords = ['phải làm gì', 'nên làm gì', 'xử lý thế nào', 'giải quyết như thế nào',
                                'quyền gì', 'quyền lợi', 'bị xâm phạm', 'khiếu nại', 'tố cáo', 
                                'kiện được không', 'bị lừa', 'lừa đảo', 'đòi nợ', 'không trả tiền']

    # Check direct request first
    if any(kw in q_lower for kw in direct_keywords):
        return (True, 'general')
    
    # Check criminal
    if any(kw in q_lower for kw in criminal_keywords):
        return (True, 'criminal')
    
    # Check business
    if any(kw in q_lower for kw in business_keywords):
        return (True, 'business')
    
    # Check complex or serious civil cases
    if any(kw in q_lower for kw in civil_keywords) or any(kw in q_lower for kw in complex_question_keywords):
        if 'đồng nai' in q_lower or 'biên hòa' in q_lower:
            return (True, 'civil_dongnai')
        return (True, 'civil')
    
    return (False, '')

# 6) call LLM with retrieved context
def answer_with_context(user_q: str):
    try:
        # Detect if needs lawyer BEFORE calling API
        needs_lawyer, lawyer_type = needs_lawyer_suggestion(user_q)
        
        hits = retrieve(user_q, k=5)  # Giảm từ 10 → 5 để xử lý nhanh hơn
        if not hits:
            print("Xin lỗi, mình chưa có dữ liệu để trả lời câu hỏi này.")
            return
        
        context = "\n\n".join(
            [
                (
                    f"Source: {h['Source']}\nText: {h['text']}\nType: {h.get('Type','')}"
                    if h.get("is_law")
                    else f"Dialect: {h['dialect']}\nText: {h['text']}\nMeaning: {h.get('meaning','')}"
                )
                for h in hits
            ]
        )

        # Build prompt with lawyer suggestion if needed
        lawyer_section = ""
        if needs_lawyer:
            if lawyer_type == 'criminal':
                lawyer_section = """
        
        **BẮT BUỘC - Thêm phần này vào cuối câu trả lời:**
        
        ---
        📞 **Tư vấn chuyên sâu**
        
        Vụ việc của bạn thuộc lĩnh vực hình sự, rất cần sự hỗ trợ từ luật sư chuyên nghiệp:
        
        👨‍⚖️ **Luật sư Lê Văn Tiến** (Chuyên hình sự, tranh chấp phức tạp)
        ☎️ **02513 741 041**
        
        💡 Luật sư sẽ giúp bạn: Bào chữa, đại diện tại cơ quan điều tra, tư vấn quyền lợi và chiến lược pháp lý tốt nhất.
        """
            elif lawyer_type == 'business':
                lawyer_section = """
        
        **BẮT BUỘC - Thêm phần này vào cuối câu trả lời:**
        
        ---
        📞 **Tư vấn chuyên sâu**
        
        Vấn đề doanh nghiệp cần được xử lý chuyên nghiệp và chính xác:
        
        👨‍⚖️ **Luật sư Tiến Đỗ (Pascal)** (Tư vấn doanh nghiệp, hợp đồng thương mại)
        ☎️ **090 391 8681**
        
        💡 Luật sư sẽ giúp bạn: Thành lập công ty, soạn thảo hợp đồng, tư vấn pháp lý doanh nghiệp, M&A.
        """
            elif lawyer_type == 'civil_dongnai':
                lawyer_section = """
        
        **BẮT BUỘC - Thêm phần này vào cuối câu trả lời:**
        
        ---
        📞 **Tư vấn chuyên sâu**
        
        Với vấn đề tại Đồng Nai, tôi giới thiệu luật sư địa phương:
        
        👨‍⚖️ **Luật sư Hoàng Anh** (Đồng Nai - Chuyên tranh chấp dân sự, hợp đồng)
        ☎️ **094 5909 068**
        📍 Khu vực: Đồng Nai và các tỉnh lân cận
        
        💡 Luật sư sẽ giúp bạn: Đại diện kiện tụng, soạn thảo hợp đồng, giải quyết tranh chấp dân sự.
        """
            else:  # civil or general
                lawyer_section = """
        
        **BẮT BUỘC - Thêm phần này vào cuối câu trả lời:**
        
        ---
        📞 **Tư vấn chuyên sâu**
        
        Vụ việc của bạn có thể cần sự hỗ trợ trực tiếp từ luật sư. Tôi đề xuất:
        
        👨‍⚖️ **Luật sư Hoàng Anh** (Chuyên tranh chấp dân sự, hợp đồng)
        ☎️ **094 5909 068** (Đồng Nai)
        
        👨‍⚖️ **Luật sư Lê Văn Tiến** (Chuyên hình sự, tranh chấp phức tạp)
        ☎️ **02513 741 041**
        
        💡 Luật sư sẽ giúp bạn: Tư vấn pháp lý chi tiết, đại diện tại tòa, bảo vệ quyền lợi hợp pháp.
        """

        user_prompt = f"""
        Bạn là trợ lý AI chuyên về pháp luật Việt Nam - ViLaw.
        Người dùng hỏi: {user_q}

        Thông tin được cung cấp (lấy từ cơ sở dữ liệu, đây là nguồn thông tin giúp bạn trả lời câu hỏi):
        {context}

        Yêu cầu:
        1. Nếu câu hỏi không hỏi hay bàn về vấn đề pháp luật. Trả lời "Tôi chỉ giải quyết các vấn đề về pháp luật"
        2. Nếu người dùng hỏi về tín đúng đắn hay sai trái của luật thì đưa ra các cách kiểm tra cho người dùng. Không trả lời 1 cách chắc chắn
        3. Nếu người dùng hỏi về nội dung luật pháp về vấn đề gì thì sử dụng dữ liệu trong Ngữ cảnh. Không sửa đổi hay bổ sung thêm
        4. Không thêm bất kì lưu ý hay nhắc nhờ về nội dung trong Ngữ cảnh
        5. Nếu không thấy dữ liệu trong Thông tin được cung cấp thì trả lời là "Mặc dù dữ liệu chưa được cung cấp theo tôi biết..." rồi thêm ý của bạn vào
        6. Đừng nhắc đến "Thông tin được cung cấp" mà tôi đã gửi cho bạn trong câu trả lời
        {lawyer_section}
        """
        user_prompt = truncate_prompt(user_prompt)

        # print(user_prompt)

        stream = client.models.generate_content_stream(
            model="gemini-2.0-flash-exp",  # Flash-exp nhanh hơn 2.5-flash
            contents=user_prompt
        )
        response = ""

        for chunk in stream:
            response += chunk.text

        return response
    except Exception as e:
        print(f"Lỗi khi gọi API: {e}")
        return "Xin lỗi, mình gặp lỗi khi xử lý câu hỏi của bạn."


#Run with GUI 
with gr.Blocks() as demo:
    gr.Markdown("# 🤖")
    chatbot = gr.Chatbot()
    msg = gr.Textbox(placeholder="Nhập câu hỏi về pháp luật...")
    clear = gr.Button("Xóa hội thoại")

    def user_message(user_input, chat_history):
        response = answer_with_context(user_input)
        chat_history.append((user_input, response))
        return "", chat_history

    msg.submit(user_message, [msg, chatbot], [msg, chatbot])
    clear.click(lambda: [], None, chatbot, queue=False)

def create_app():
    if FastAPI is None:
        return None

    app = FastAPI()

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    class Query(BaseModel):
        question: str

    @app.post("/answer")
    def answer(q: Query):
        try:
            text = answer_with_context(q.question) or ""
            return {"answer": text}
        except Exception as e:
            return {"answer": f"Lỗi: {e}"}

    @app.get("/health")
    def health():
        return {"status": "ok"}

    return app


if __name__ == "__main__":
    mode = os.getenv("GEMINI_MODE", "api")  # api | gradio | both
    if mode in ("gradio", "both"):
        demo.launch(server_name="0.0.0.0", server_port=int(os.getenv("GRADIO_PORT", "7860")))
    if mode in ("api", "both") and FastAPI is not None:
        app = create_app()
        uvicorn.run(app, host="0.0.0.0", port=int(os.getenv("GEMINI_PORT", "7861")))