from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Habilita CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # ou ["https://vitorjpg.github.io"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class DadosAluno(BaseModel):
    nota1: float
    nota2: float
    frequencia: float

@app.get("/")
def home():
    return {"message": "API SmartGrades está rodando 🚀"}

@app.post("/")
def analisar(dados: DadosAluno):
    media = (dados.nota1 + dados.nota2) / 2

    if media < 5 or dados.frequencia < 75:
        status = "CRÍTICO"
        risco = 80
    elif media < 7:
        status = "ALERTA"
        risco = 40
    else:
        status = "SEGURO"
        risco = 10

    cronograma = """
    <ul>
        <li>Revisar conteúdos semanalmente</li>
        <li>Participar de grupos de estudo</li>
        <li>Praticar exercícios extras</li>
    </ul>
    """

    return {
        "status": status,
        "risco": risco,
        "media": round(media, 1),
        "cronograma": cronograma
    }
