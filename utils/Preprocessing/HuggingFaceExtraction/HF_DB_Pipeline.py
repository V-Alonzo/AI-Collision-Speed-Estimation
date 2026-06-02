import pandas as pd
import numpy as np
import dotenv
import os
from sklearn.base import BaseEstimator, TransformerMixin
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder, StandardScaler, OrdinalEncoder, TargetEncoder
from sklearn.impute import SimpleImputer
from datasets import load_dataset

from PATHS import *
from configurations import HF_DATASET_NAME, HF_SPLIT

dotenv.load_dotenv()

def load_hf_dataset():
    """Descarga y convierte el dataset de Hugging Face a Pandas DataFrame."""
    print(f"Loading HuggingFace dataset: {HF_DATASET_NAME} ({HF_SPLIT})...")
    HF_TOKEN = os.getenv("HF_TOKEN")
    dataset = load_dataset(
        HF_DATASET_NAME,
        split=HF_SPLIT,
        token=HF_TOKEN
    )
    df = dataset.to_pandas()
    print(f"Dataset loaded: {df.shape}")
    return df

# 1. Transformadores Personalizados para la limpieza específica

class TextNumberExtractor(BaseEstimator, TransformerMixin):
    def __init__(self, replace_unknown_with_nan=False):
        self.replace_unknown_with_nan = replace_unknown_with_nan

    def fit(self, X, y=None):
        return self

    def transform(self, X):
        X_copy = pd.DataFrame(X).copy()
        for col in X_copy.columns:
            extracted = X_copy[col].astype(str).str.extract(r'(\d+)')[0]
            if self.replace_unknown_with_nan:
                extracted = np.where(extracted == '9', np.nan, extracted)
            X_copy[col] = pd.to_numeric(extracted, errors='coerce')
        return X_copy
    
    def get_feature_names_out(self, input_features=None):
        return input_features

class CyclicalTransformer(BaseEstimator, TransformerMixin):
    def __init__(self, max_value):
        self.max_value = max_value

    def fit(self, X, y=None):
        return self

    def transform(self, X):
        X_copy = pd.DataFrame(X).copy()
        transformed = pd.DataFrame(index=X_copy.index)
        for col in X_copy.columns:
            transformed[f'{col}_sin'] = np.sin(2 * np.pi * X_copy[col] / self.max_value)
            transformed[f'{col}_cos'] = np.cos(2 * np.pi * X_copy[col] / self.max_value)
        return transformed

    def get_feature_names_out(self, input_features=None):
        if input_features is None:
            return None
        out_features = []
        for col in input_features:
            out_features.extend([f'{col}_sin', f'{col}_cos'])
        return np.array(out_features)

class BinaryRolloverEncoder(BaseEstimator, TransformerMixin):
    def fit(self, X, y=None):
        return self

    def transform(self, X):
        X_copy = pd.DataFrame(X).copy()
        for col in X_copy.columns:
            X_copy[col] = X_copy[col].astype(str).apply(
                lambda x: 0 if 'No rollover' in x else 1
            )
        return X_copy
        
    def get_feature_names_out(self, input_features=None):
        return input_features

# 2. Definición del Pipeline Principal

def HuggingFacePipeline():
    """
    Construye y retorna el pipeline de preprocesamiento de Scikit-Learn.
    """
    
    # Pipelines por tipo de dato
    
    # A. Numéricos estándar (Pesos)
    numeric_features = ['curbWeightKg', 'cargoWeightKg']
    numeric_transformer = Pipeline(steps=[
        ('imputer', SimpleImputer(strategy='median')),
        ('scaler', StandardScaler())
    ])

    # B. Categóricos Nominales (One-Hot Encoding)
    categorical_features = ['vehicleClass', 'damagePlaneDescription']
    categorical_transformer = Pipeline(steps=[
        ('imputer', SimpleImputer(strategy='constant', fill_value='Unknown')),
        #('ohe', OneHotEncoder(handle_unknown='ignore', sparse_output=False)),
        ('target_encoder', TargetEncoder(smooth='auto', cv=5, target_type='continuous')),
    ])

    # C. Categóricos Ordinales (Severidad)
    ordinal_features = ['severityDescription']
    # Mapeo manual para asegurar el orden correcto
    severity_categories = [['Unknown', 'Light', 'Moderate', 'Severe']] 
    ordinal_transformer = Pipeline(steps=[
        ('imputer', SimpleImputer(strategy='constant', fill_value='Unknown')),
        ('ordinal', OrdinalEncoder(categories=severity_categories, handle_unknown='use_encoded_value', unknown_value=-1)),
        ('scaler', StandardScaler())
    ])

    # D. Gravedad MAIS (Extracción de número)
    mais_features = ['mais']
    mais_transformer = Pipeline(steps=[
        ('extractor', TextNumberExtractor(replace_unknown_with_nan=True)),
        ('imputer', SimpleImputer(strategy='median')),
        ('scaler', StandardScaler())
    ])

    # E. Transformaciones Cíclicas (Fuerza y Reloj)
    force_dir_features = ['forceDirection']
    force_transformer = Pipeline(steps=[
        ('extractor', TextNumberExtractor()),
        ('imputer', SimpleImputer(strategy='median')), # Imputar nulos antes del cálculo
        ('cyclical', CyclicalTransformer(max_value=360.0))
    ])
    
    clock_dir_features = ['clockDirection']
    clock_transformer = Pipeline(steps=[
        ('extractor', TextNumberExtractor()),
        ('imputer', SimpleImputer(strategy='median')),
        ('cyclical', CyclicalTransformer(max_value=12.0))
    ])

    # F. Volcadura (Binario)
    rollover_features = ['rolloverStatus']
    rollover_transformer = Pipeline(steps=[
        ('imputer', SimpleImputer(strategy='constant', fill_value='No rollover (no overturning)')),
        ('binarizer', BinaryRolloverEncoder())
    ])
    # Ensamblar el ColumnTransformer
    preprocessor = ColumnTransformer(
        transformers=[
            ('num', numeric_transformer, numeric_features),
            ('cat', categorical_transformer, categorical_features),
            ('ord', ordinal_transformer, ordinal_features),
            ('mais', mais_transformer, mais_features),
            ('force_cyc', force_transformer, force_dir_features),
            ('clock_cyc', clock_transformer, clock_dir_features),
            ('rollover', rollover_transformer, rollover_features)
        ],
        remainder='drop', # Ignora columnas como 'cdc', 'primaryVehicleNumber', strings de peso crudo, etc.
        verbose_feature_names_out=False # Para evitar nombres de columnas excesivamente largos
    )

    return preprocessor

# 3. Función auxiliar para preparar el DataFrame inicial
def prepareDataset(df):
    """Realiza la limpieza inicial a nivel de fila antes de pasar por el pipeline."""
    df_clean = df.copy()
    
    # Eliminar filas donde el target es nulo en ambas columnas
    df_clean = df_clean.dropna(subset=['totalDeltaVKph', 'dvBarrierEquivalentSpeedDescription'], how='all')
    df_clean['dvBarrierEquivalentSpeedDescription'] = TextNumberExtractor().fit_transform(df_clean[['dvBarrierEquivalentSpeedDescription']])
    
    # Combinar ambas columnas para crear una única variable objetivo, dando prioridad a totalDeltaVKph
    df_clean['targetVariable'] = df_clean['totalDeltaVKph'].combine_first(df_clean['dvBarrierEquivalentSpeedDescription'])
    
    # Forzar que el target sea numérico continuo (float)
    df_clean['targetVariable'] = pd.to_numeric(df_clean['targetVariable'], errors='coerce').astype(float)
    
    df_clean = df_clean.dropna(subset=['targetVariable']) # Asegurar que no queden filas sin target
    
    df_clean = df_clean.drop_duplicates(subset="cirenId") # Verificar que no haya duplicados en cirenId después de la limpieza
    df_clean = df_clean.reset_index(drop=True) # Resetear índices después de la limpieza
    print(df_clean["cirenId"])
    print(df_clean.shape)
    
    # Separar features (X) y target (y)
    X = df_clean.drop(columns=['totalDeltaVKph', 'totalDeltaVMph', 'dvBarrierEquivalentSpeedDescription'])
    y = df_clean['targetVariable'].values
    
    return X, y

def PreprocessingHuggingFaceDB():
    # 1. Cargar el dataset crudo desde Hugging Face
    df_raw = load_hf_dataset()
    
    # 2. Limpiar filas nulas en el target y separar variables independientes (X) y dependiente (y)
    print("Preparando el dataset inicial...")
    X, y = prepareDataset(df_raw)
    
    # 3. Instanciar el pipeline
    print("Inicializando el pipeline de preprocesamiento...")
    preprocessor = HuggingFacePipeline()
    
    # 4. Ajustar (fit) y transformar (transform) los datos
    print("Aplicando transformaciones...")
    X_processed = preprocessor.fit_transform(X, y)
    
    final_columns = preprocessor.get_feature_names_out()
    
    print(f"Preprocesamiento completado.")
    print(f"Dimensiones originales de X: {X.shape}")
    print(f"Columnas originales de X: {X.columns.tolist()}")
    print(f"Dimensiones de X preprocesado: {X_processed.shape}")
    print(f"Dimensiones de y: {y.shape}")
    
    print(f"\nColumnas preprocesadas ({len(final_columns)} en total):")
    for col in final_columns:
        print(f" - {col}")