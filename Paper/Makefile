# 1. Detecta el único archivo .tex en la carpeta
MAIN_TEX := $(wildcard *.tex)
FILENAME := $(basename $(MAIN_TEX))

# Extensiones de archivos temporales para limpiar
TEMP_EXTS := aux bbl blg log out toc fls fdb_latexmk snm nav xml bcf-stats.txt bcf synctex.gz

.DEFAULT_GOAL := help

# --- Targets ---

.PHONY: all clean distclean help compile

help: ## Muestra esta ayuda
	@echo "Uso: make [target]"
	@echo ""
	@echo "Targets disponibles:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-15s\033[0m %s\n", $$1, $$2}'

all: compile clean ## Compila LaTeX (latexmk o manual) y limpia temporales después

compile: ## Solo compila el documento (sin borrar temporales)
	@if [ -z "$(MAIN_TEX)" ]; then echo "Error: No se encontró archivo .tex."; exit 1; fi
	@if [ $(words $(MAIN_TEX)) -gt 1 ]; then echo "Error: Más de un archivo .tex encontrado."; exit 1; fi
	@echo "Compilando: $(MAIN_TEX)..."
	@if command -v latexmk > /dev/null; then \
		latexmk -pdf -interaction=nonstopmode $(MAIN_TEX); \
	else \
		pdflatex -interaction=nonstopmode $(MAIN_TEX); \
		bibtex $(FILENAME); \
		pdflatex -interaction=nonstopmode $(MAIN_TEX); \
		pdflatex -interaction=nonstopmode $(MAIN_TEX); \
	fi

clean: ## Elimina todos los archivos temporales de compilación
	@echo "Limpiando archivos auxiliares..."
	@for ext in $(TEMP_EXTS); do rm -f *.$$ext; done

distclean: clean ## Elimina temporales y también el PDF final
	@echo "Eliminando PDF..."
	@rm -f $(FILENAME).pdf
