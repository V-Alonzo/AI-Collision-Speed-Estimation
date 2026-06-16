from model.config.libraries import *

import joblib

from sklearn.model_selection import train_test_split

from model.config.TabularVelocityEstimator_XGBoost.config import CONFIG

from model.src.TabularVelocityEstimator_XGBoost.model import build_model

from model.src.TabularVelocityEstimator_XGBoost.Evaluation.Metrics import MetricsPlotter


class TabularVelocityTrainer:
    def __init__(self, config=CONFIG):
        self.config = config
        self.model = None

    def load_data(self):
        X = pd.read_csv(self.config.TABULAR_FEATURES_PATH)
        y = pd.read_csv(self.config.TABULAR_TARGET_PATH).iloc[:, 0]
        return X, y

    def split_data(self, X, y):
        return train_test_split(
            X,
            y,
            train_size=self.config.TRAIN_PROPORTION,
            random_state=self.config.SEED
        )

    def build_model(self):
        self.model = build_model()
        return self.model

    def train(self, X_train, y_train, X_val, y_val):
        if self.model is None:
            self.build_model()

        self.model.fit(
            X_train,
            y_train,
            eval_set=[(X_val, y_val)],
            verbose=50,
        )

        return self.model

    def evaluate(self, X_val, y_val):
        y_val = y_val.to_numpy()
        preds = self.model.predict(X_val)
        
        metrics_plotter = MetricsPlotter(self.config)
        
        metrics = metrics_plotter.run(
            true_labels=y_val,
            predictions=preds,
            model=self.model
        )

        return metrics

    def save_model(self, path):
        path = Path(path)
        
        path.parent.mkdir(parents=True, exist_ok=True)

        joblib.dump(self.model, path)

        print(f"[INFO] Model saved at: {path}")

    def run(self, save_path=None):
        X, y = self.load_data()
        X_train, X_val, y_train, y_val = self.split_data(X, y)

        self.train(X_train, y_train, X_val, y_val)

        metrics = self.evaluate(X_val, y_val)

        return self.model, metrics