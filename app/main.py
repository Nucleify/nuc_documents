from enum import Enum
from io import BytesIO
from typing import BinaryIO, Callable

import tabula
from borb import pdf
from borb.pdf.layout_element.table.table_util import TableUtil
from docx import Document
from fastapi import FastAPI, Response, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from odf.opendocument import load
from odf.table import Table, TableCell, TableRow
from odf.teletype import extractText
from pandas import DataFrame, concat, read_csv, read_json, read_xml

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
    PDF = "pdf"


class ValidExtensions(Enum):
    CSV = "csv"
    XML = "xml"
    JSON = "json"
    PDF = "pdf"
    DOC = "doc"
    DOCX = "docx"
    ODT = "odt"


def to_pdf(df: DataFrame) -> Response:
    _pdf = pdf.Document()

    page = pdf.Page()
    _pdf.append_page(page)

    layout = pdf.SingleColumnLayout(page)

    tabular = []
    tabular.append(df.keys().tolist())
    for row in df.values.tolist():
        tabular.append(row)

    table = TableUtil.from_2d_data(tabular)

    layout.append_layout_element(table)
    buffered = BytesIO()
    pdf.PDF.write(_pdf, buffered)
    return Response(
        content=buffered.getvalue(),
        headers={"content-disposition": "attachment; filename=result.pdf"},
        media_type="application/pdf",
    )


FUNCTIONS: dict[Formats, Callable[[DataFrame], Response]] = {
    Formats.CSV: lambda df: Response(content=df.to_csv(index=False), media_type="text/csv"),
    Formats.JSON: lambda df: Response(content=df.to_json(orient="records"), media_type="application/json"),
    Formats.XML: lambda df: Response(content=df.to_xml(index=False), media_type="application/xml"),
    Formats.PDF: to_pdf,
}


def from_odt(file: BinaryIO) -> DataFrame:
    """
    Extracts tables from an ODT file and returns a concatenated DataFrame.
    """
    doc = load(file)
    dfs = []
    for table in doc.getElementsByType(Table):
        data = []
        for row in table.getElementsByType(TableRow):
            row_data = []
            for cell in row.getElementsByType(TableCell):
                cell_text = extractText(cell)
                row_data.append(cell_text)
            data.append(row_data)
        if data:
            header = data[0]
            df = DataFrame(data[1:], columns=header)
            dfs.append(df)
    if not dfs:
        return DataFrame()
    return concat(dfs, ignore_index=True)


def from_pdf(file: BinaryIO) -> DataFrame:
    """
    Extracts tables from a PDF file and returns a concatenated DataFrame.
    """
    try:
        tables = tabula.read_pdf(file, pages="all", multiple_tables=True)
    except Exception:
        return DataFrame()
    if not tables:
        return DataFrame()
    return concat(tables, ignore_index=True)


def from_docx(file: BinaryIO) -> DataFrame:
    """
    Extracts tables from a DOCX file and returns a concatenated DataFrame.
    """
    doc = Document(file)
    dfs = []
    for table in doc.tables:
        data = []
        for row in table.rows:
            data.append([cell.text for cell in row.cells])
        if data:
            header = data[0]
            df = DataFrame(data[1:], columns=header)
            dfs.append(df)
    if not dfs:
        return DataFrame()
    return concat(dfs, ignore_index=True)


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
    elif extension == "docx":
        df = from_docx(file.file)
    elif extension == "odt":
        df = from_odt(file.file)
    elif extension == "pdf":
        df = from_pdf(file.file)
    elif extension == "doc":
        return Response(
            content="ERROR: .doc format is not supported for in-memory structured data extraction without external tools.",
            status_code=400,
        )
    else:
        return Response(content=f"Unsupported file extension: {extension}", status_code=400)

    if df.empty:
        return Response(content="Could not extract data from file.", status_code=400)

    if func := FUNCTIONS.get(format):
        return func(df)
    return Response(content=f"Unsupported output format: {format.value}", status_code=400)
