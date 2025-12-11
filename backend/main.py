from fastapi import FastAPI

app = FastAPI()

@app.get("/todo")
def get_todos():
    return {"data": [{"id": "1", "item": "Sample todo"}]}
