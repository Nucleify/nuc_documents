from enum import Enum
from typing import Callable

from fastapi import FastAPI, Response, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pandas import DataFrame, read_csv, read_json, read_xml

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Formats(Enum):
    CSV = "csv"
    XML = "xml"
    JSON = "json"

class ValidExtensions(Enum):
    CSV = "csv"
    XML = "xml"
    JSON = "json"

FUNCTIONS: dict[Formats, Callable[[DataFrame], Response]] = {
    Formats.CSV: lambda df: Response(content=df.to_csv(index=False), media_type="text/csv"),
    Formats.JSON: lambda df: Response(content=df.to_json(orient="records"), media_type="application/json"),
    Formats.XML: lambda df: Response(content=df.to_xml(index=False), media_type="application/xml"),
}

@app.post("/")
def transform(format: Formats, file: UploadFile):
    """
    Transforms given file to another format
    Parameters
    ----------
    format:
        Destination format to use
    file:
        File to transform. Requires valid extension
    """
    extension = file.filename.split(".")[-1] if file.filename else ""

    if extension == "csv":
        df = read_csv(file.file)
    elif extension == "xml":
        df = read_xml(file.file)
    elif extension == "json":
        df = read_json(file.file)
    elif extension in {"doc", "docx", "odt", "pdf"}:
        return Response(content=f"Unsupported file extension: {extension}", status_code=400)
    else:
        return Response(content=f"Unsupported file extension: {extension}", status_code=400)

    if df.empty:
        return Response(content="Could not extract data from file.", status_code=400)

    if func := FUNCTIONS.get(format):
        return func(df)
    return Response(content=f"Unsupported output format: {format.value}", status_code=400)
