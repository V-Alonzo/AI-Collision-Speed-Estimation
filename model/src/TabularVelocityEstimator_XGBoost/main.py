from model.src.TabularVelocityEstimator_XGBoost.Trainer.TabularVelocityTrainer import TabularVelocityTrainer

from model.config.TabularVelocityEstimator_XGBoost.config import CONFIG


def main():
    CONFIG.save()

    trainer = TabularVelocityTrainer()

    model, metrics = trainer.run()
    trainer.save_model(CONFIG.MODEL_SERIALIZED_PATH) 

    print(" TRAINING COMPLETED")
    print("==============================\n")

    print("FINAL METRICS:")
    for k, v in metrics.items():
        print(f"{k}: {v:.4f}")

if __name__ == "__main__":
    main()