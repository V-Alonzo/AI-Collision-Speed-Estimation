import fitz  # PyMuPDF



def cropPDf(filepath, imgName, pageID, cropCoords):
    # Abrir PDF
    doc = fitz.open(filepath)

    # Seleccionar la primera página
    page = doc[pageID]

    # Definir el área de recorte (rectángulo)
    rect = fitz.Rect(**cropCoords)

    # Renderizar la página recortada como imagen
    pix = page.get_pixmap(clip=rect)

    # Guardar como PNG
    pix.save(imgName)

    doc.close()
