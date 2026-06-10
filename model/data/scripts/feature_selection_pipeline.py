from model.config.libraries import *
from sklearn.feature_selection import mutual_info_regression
from model.config.TabularVelocityEstimator.config import CONFIG

def feature_selection_pipeline(X, y, feature_names, corr_threshold=0.90, mi_threshold=0.001):
    """
    Feature selection pipeline with:
    - constant removal
    - mutual information filtering
    - group-based selection (force vs clock)
    - correlation redundancy removal
    """

    df = pd.DataFrame(X, columns=feature_names)

    # 1. Remove constant / near-constant features
    nunique = df.nunique()
    df = df.loc[:, nunique > 1]

    # 2. Mutual Information (relevance filtering)
    mi = mutual_info_regression(df, y, random_state=42)
    mi_series = pd.Series(mi, index=df.columns)

    df = df[mi_series[mi_series > mi_threshold].index]

    # Recompute MI after filtering
    mi = mutual_info_regression(df, y, random_state=42)
    mi_series = pd.Series(mi, index=df.columns)

    # 3. GROUP SELECTION: force vs clock
    force_group = ["forceDirection_sin", "forceDirection_cos"]
    clock_group = ["clockDirection_sin", "clockDirection_cos"]

    force_group = [c for c in force_group if c in df.columns]
    clock_group = [c for c in clock_group if c in df.columns]

    def group_score(cols):
        if len(cols) == 0:
            return -np.inf
        return mi_series[cols].mean()

    if force_group and clock_group:
        force_score = group_score(force_group)
        clock_score = group_score(clock_group)

        if force_score >= clock_score:
            df = df.drop(columns=clock_group)
        else:
            df = df.drop(columns=force_group)

    # 4. Correlation-based redundancy removal
    corr = df.corr().abs()

    upper = corr.where(np.triu(np.ones(corr.shape), k=1).astype(bool))

    to_drop = set()

    for col in upper.columns:
        high_corr = upper[col][upper[col] > corr_threshold].index.tolist()

        if len(high_corr) > 0:
            group = [col] + high_corr

            # keep feature with highest MI
            best = max(group, key=lambda x: mi_series.get(x, 0))

            for f in group:
                if f != best:
                    to_drop.add(f)

    df = df.drop(columns=list(to_drop))

    # 5. Final ranking
    final_mi = mutual_info_regression(df, y, random_state=42)
    final_scores = pd.Series(final_mi, index=df.columns).sort_values(ascending=False)

    return df, final_scores



def main():

    # Load data
    X = pd.read_csv(CONFIG.TABULAR_FEATURES_PATH)
    y_df = pd.read_csv(CONFIG.TABULAR_TARGET_PATH)

    # Preserve image path column
    image_relpath = None

    if "image_relpath" in X.columns:
        image_relpath = X["image_relpath"].copy()
        X_features = X.drop(columns=["image_relpath"])
    else:
        X_features = X

    # If y is a dataframe with one column
    y = y_df.iloc[:, 0]

    # Feature selection
    X_selected, feature_ranking = feature_selection_pipeline(
        X_features.values,
        y.values,
        X_features.columns
    )

    # Reattach image_relpath as first column
    if image_relpath is not None:
        X_selected.insert(
            0,
            "image_relpath",
            image_relpath.loc[X_selected.index]
        )

    # Append target column(s) at the end
    final_df = pd.concat(
        [
            X_selected.reset_index(drop=True),
            y_df.reset_index(drop=True)
        ],
        axis=1
    )

    # Print ranking
    print("\n=== FEATURE RANKING ===")
    print(feature_ranking)

    print("\nSelected features:")
    print(list(X_selected.columns))

    # Save selected dataset
    output_path = CONFIG.TABULAR_FEATURES_PATH.replace(
        ".csv",
        "_selected.csv"
    )

    final_df.to_csv(output_path, index=False)

    print(f"\nSaved selected dataset to: {output_path}")

# ENTRY POINT
if __name__ == "__main__":
    main()