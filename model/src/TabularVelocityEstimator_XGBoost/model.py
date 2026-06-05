from model.config.libraries import *

from model.config.TabularVelocityEstimator_XGBoost.config import CONFIG


def build_model():

    model = XGBRegressor(
        n_estimators=CONFIG.N_ESTIMATORS,
        max_depth=CONFIG.MAX_DEPTH,
        learning_rate=CONFIG.LEARNING_RATE,
        subsample=CONFIG.SUBSAMPLE,
        colsample_bytree=CONFIG.COLSAMPLE_BYTREE,
        objective=CONFIG.OBJECTIVE,
        eval_metric=CONFIG.EVAL_METRIC,
        random_state=CONFIG.SEED,
        early_stopping_rounds=CONFIG.EARLY_STOPPING_ROUNDS
    )

    return model