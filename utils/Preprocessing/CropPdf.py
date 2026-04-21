import fitz  # PyMuPDF
import json, os


def cropPDf(filepath, imgName, pageID, cropCoords):
    # Abrir PDF
    doc = fitz.open(filepath)

    # Seleccionar la primera página
    page = doc[pageID]

    # Definir el área de recorte (rectángulo)
    rect = fitz.Rect(*cropCoords)

    # Renderizar la página recortada como imagen
    pix = page.get_pixmap(clip=rect)

    # Guardar como PNG
    pix.save(imgName)

    doc.close()

def extraer_imagenes_pdf(path_pdf, output_dir_path):
    doc = fitz.open(path_pdf)
    
    for i in range(len(doc)):
        for img in doc.get_page_images(i):
            xref = img[0]
            pix = fitz.Pixmap(doc, xref)
            
            if pix.n < 5:
                pix.save(output_dir_path +f"/pagina_{i}_img_{xref}.png")
            else:
                pix1 = fitz.Pixmap(fitz.csRGB, pix)
                pix1.save(output_dir_path +f"/pagina_{i}_img_{xref}.png")
                pix1 = None
            pix = None


# Pdf de origen
pdf_path = "../../Recursos/Reportes/Subidos/6.pdf" 

# Archivo con objetos json
schema_path = "../../Recursos/Reportes/Preprocesados/JSONs/6.pdf.txt" 

# Lista para objetos
json_objs = []

# DIrectorio de imagenes resultantes
output_dir_path = "../../Recursos/Reportes/Preprocesados/images/6" 

# Verificar y crear si no existe
if not os.path.exists(output_dir_path):
    os.makedirs(output_dir_path)
    print(f"output_dir_path '{output_dir_path}' creado.")
else:
    print(f"El output_dir_path '{output_dir_path}' ya existe.")

# Leer objetos json
with open(schema_path, 'r', encoding='utf-8') as file:
    content = file.read().strip()

    decoder = json.JSONDecoder()
    pos = 0
    
    while pos < len(content):
        content = content.lstrip()
        if not content:
            break
            
        try:
            obj, pos = decoder.raw_decode(content)
            json_objs.append(obj)
            content = content[pos:].lstrip()
        except json.JSONDecodeError as e:
            print(f"Error cerca de la posición {pos}: {e}")
            break

# Leer Catalogo de Imagenes y extraer imagenes
for i_img in range(len(json_objs[0]["Siniestro"]["CatalogoImagenes"])):
    img = json_objs[0]["Siniestro"]["CatalogoImagenes"][i_img]
    
    # Atributos
    id_imagen = img["id_imagen"]
    PaginaPDF = img["PaginaPDF"]
    TipoFoto = img["TipoFoto"]
    Coordenadas_BBox = img["Coordenadas_BBox"]
    ConfianzaModelo = img["ConfianzaModelo"]

    # Recortar imagen
    cropPDf(
        pdf_path, 
        output_dir_path+"/"+id_imagen+"_"+pdf_path.split("/")[-1]+".jpg", 
        PaginaPDF,
        Coordenadas_BBox
    )

# extraer_imagenes_pdf(pdf_path, output_dir_path)