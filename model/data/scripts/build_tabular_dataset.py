import pandas as pd

from utils.Preprocessing.HuggingFaceExtraction.HF_DB_Pipeline import (
    PreprocessingHuggingFaceDB
)

from model.config.TabularVelocityEstimator.config import CONFIG

TARGET_COLUMN = CONFIG.TARGET_COLUMN

def export_processed_tabular_dataset():
    """
    Executes the tabular preprocessing pipeline and exports the
    processed features and target datasets to CSV files.
    """

    print("Starting tabular dataset preprocessing pipeline...")

    # Run preprocessing pipeline
    X_processed, y, feature_names = PreprocessingHuggingFaceDB()

    # Remove automatic prefixes added by ColumnTransformer
    feature_names = [
        col.split("__")[-1]
        for col in feature_names
    ]

    # Features dataframe
    X_processed_df = pd.DataFrame(
        X_processed,
        columns=feature_names
    )

    # Target dataframe
    y_df = pd.DataFrame(
        y,
        columns=[TARGET_COLUMN]
    )

    # Export datasets
    X_processed_df.to_csv(
        CONFIG.TABULAR_FEATURES_PATH,
        index=False
    )

    y_df.to_csv(
        CONFIG.TABULAR_TARGET_PATH,
        index=False
    )

    print("Processed datasets exported successfully.")

    return (
        X_processed_df,
        y_df
    )


if __name__ == "__main__":
    export_processed_tabular_dataset()