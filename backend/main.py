from fastapi import FastAPI, HTTPException
from typing import List, Optional
from pydantic import BaseModel
from datetime import date, timedelta

app = FastAPI(
    title="EclesIA Backend API",
    description="API para integração entre EclesIA e sistemas externos como o sysigreja.",
    version="0.3.0"
)

# --- MODELS ---

class Event(BaseModel):
    id: int
    title: str
    date: str
    location: str
    description: str
    total_slots: int
    available_slots: int

class EventCreate(BaseModel):
    title: str
    date: str
    location: str
    description: str
    total_slots: int

class CalendarEvent(BaseModel):
    id: int
    title: str
    date: str
    location: str

# --- MOCK DATABASE (em memória) ---
events_db = [
    Event(id=1, title="Culto Dominical", date="2024-07-07", location="Catedral da Reconciliação", description="Culto de celebração aberto a todos.", total_slots=200, available_slots=120),
    Event(id=2, title="Encontro de Jovens", date="2024-07-13", location="Colégio GGE", description="Evento especial para a juventude da igreja.", total_slots=80, available_slots=15),
    Event(id=3, title="EJC", date="2024-08-10", location="Colégio GGE", description="Encontro de Jovens com Cristo.", total_slots=50, available_slots=10),
    Event(id=4, title="Imersão", date="2024-09-05", location="Rancho Pitanga", description="Retiro de imersão espiritual.", total_slots=40, available_slots=5),
    Event(id=5, title="Realidade", date="2024-10-12", location="Espaço Colonial", description="Seminário Realidade.", total_slots=100, available_slots=60),
    Event(id=6, title="Eu sou", date="2024-11-02", location="Espaço Colonial", description="Conferência Eu Sou.", total_slots=120, available_slots=80),
    Event(id=7, title="Viva!", date="2024-12-01", location="Olinda/Recife Antigo", description="Celebração Viva!", total_slots=150, available_slots=100),
]

# --- ENDPOINTS ---

@app.get("/", tags=["Root"])
def read_root():
    return {"message": "EclesIA backend is running"}

@app.get("/events", response_model=List[Event], tags=["Eventos"])
def get_events():
    """
    Lista todos os eventos cadastrados.
    """
    return events_db

@app.get("/events/{event_id}", response_model=Event, tags=["Eventos"])
def get_event(event_id: int):
    """
    Busca detalhes de um evento específico.
    """
    for event in events_db:
        if event.id == event_id:
            return event
    raise HTTPException(status_code=404, detail="Evento não encontrado")

@app.post("/events", response_model=Event, tags=["Eventos"])
def create_event(event: EventCreate):
    """
    Cria um novo evento (mock, pronto para integração futura).
    """
    new_id = max(e.id for e in events_db) + 1 if events_db else 1
    new_event = Event(
        id=new_id,
        available_slots=event.total_slots,
        **event.dict()
    )
    events_db.append(new_event)
    return new_event

@app.put("/events/{event_id}", response_model=Event, tags=["Eventos"])
def update_event(event_id: int, event: EventCreate):
    """
    Atualiza um evento existente.
    """
    for idx, e in enumerate(events_db):
        if e.id == event_id:
            updated_event = Event(
                id=event_id,
                available_slots=e.available_slots,  # mantém as vagas atuais
                **event.dict()
            )
            events_db[idx] = updated_event
            return updated_event
    raise HTTPException(status_code=404, detail="Evento não encontrado")

@app.delete("/events/{event_id}", tags=["Eventos"])
def delete_event(event_id: int):
    """
    Remove um evento.
    """
    for idx, e in enumerate(events_db):
        if e.id == event_id:
            del events_db[idx]
            return {"detail": "Evento removido"}
    raise HTTPException(status_code=404, detail="Evento não encontrado")

@app.get("/events/{event_id}/slots", tags=["Eventos"])
def get_event_slots(event_id: int):
    """
    Retorna o número de vagas disponíveis para um evento.
    """
    for event in events_db:
        if event.id == event_id:
            return {"event_id": event_id, "title": event.title, "available_slots": event.available_slots, "total_slots": event.total_slots}
    raise HTTPException(status_code=404, detail="Evento não encontrado")

@app.post("/events/{event_id}/register", tags=["Eventos"])
def register_for_event(event_id: int):
    """
    Simula o registro em um evento, reduzindo o número de vagas disponíveis.
    """
    for event in events_db:
        if event.id == event_id:
            if event.available_slots > 0:
                event.available_slots -= 1
                return {"detail": f"Inscrição realizada para {event.title}. Vagas restantes: {event.available_slots}"}
            else:
                raise HTTPException(status_code=400, detail="Não há vagas disponíveis para este evento.")
    raise HTTPException(status_code=404, detail="Evento não encontrado")

@app.get("/calendar/weekly", response_model=List[CalendarEvent], tags=["Calendário"])
def get_weekly_calendar(start_date: Optional[str] = None):
    """
    Retorna os eventos da semana a partir de uma data (YYYY-MM-DD). Se não informado, usa a data de hoje.
    """
    today = date.today() if not start_date else date.fromisoformat(start_date)
    week_end = today + timedelta(days=6)
    result = [
        CalendarEvent(id=e.id, title=e.title, date=e.date, location=e.location)
        for e in events_db
        if today <= date.fromisoformat(e.date) <= week_end
    ]
    return result

@app.get("/calendar/monthly", response_model=List[CalendarEvent], tags=["Calendário"])
def get_monthly_calendar(month: Optional[int] = None, year: Optional[int] = None):
    """
    Retorna os eventos do mês/ano especificados. Se não informado, usa o mês/ano atual.
    """
    today = date.today()
    m = month if month else today.month
    y = year if year else today.year
    result = [
        CalendarEvent(id=e.id, title=e.title, date=e.date, location=e.location)
        for e in events_db
        if date.fromisoformat(e.date).month == m and date.fromisoformat(e.date).year == y
    ]
    return result

@app.post("/sync/sysigreja", tags=["Integração"])
def sync_sysigreja():
    """
    Endpoint para sincronizar eventos do sysigreja (simulado).
    No futuro, conecte-se à API do sysigreja e atualize events_db.
    """
    # Aqui você pode implementar a lógica de integração real.
    # Por enquanto, apenas retorna uma mensagem simulada.
    return {"detail": "Sincronização com sysigreja simulada com sucesso."}

# --- AUTENTICAÇÃO (para uso futuro) ---
# from fastapi.security import OAuth2PasswordBearer
# oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")
# Adicione autenticação JWT ou OAuth2 para proteger endpoints sensíveis.

# --- OUTRAS POSSIBILIDADES FUTURAS ---
# - Integração com sistemas de membros, ministérios, escalas, etc.
# - Webhooks para notificações em tempo real no app
# - Dashboard administrativo para gestão dos dados
# - Exportação de relatórios para a liderança da igreja
