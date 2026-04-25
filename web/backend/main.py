from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes import auth, chats, deadlines, stats

app = FastAPI(title="StudyBot API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(deadlines.router)
app.include_router(chats.router)
app.include_router(stats.router)


@app.get("/health")
def health():
    return {"status": "ok"}
