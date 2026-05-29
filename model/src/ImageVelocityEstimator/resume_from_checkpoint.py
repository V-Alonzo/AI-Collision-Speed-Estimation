# == Main for resuming a model's training phase from lightning's checkpoint

# Import libraries and required modules
from model.src.ImageVelocityEstimator.VelocityEstimator import VelocityEstimator
from model.config.ImageVelocityEstimator.config import CONFIG
from model.config.libraries import *


# Resume Training from loaded pretrained model
def resume_training():
     # Create model
    model = VelocityEstimator(
        batch_size = CONFIG.BATCH_SIZE,
        num_workers = CONFIG.NUM_WORKERS,
        train_proportion = CONFIG.TRAIN_PROPORTION,
        val_proportion = CONFIG.VAL_PROPORTION
    )

    # Load Model from checkpoint
    model.load_from_checkpoint("src/model/ModelCheckpoints/best_model.ckpt")
    print("Model was succesfully loaded...")

    # Start training phase
    model.train(
        epochs = CONFIG.N_EPOCHS,
        learning_rate = CONFIG.LEARNING_RATE
    )

    # Save model
    model.save_model(serialized_object_path_destination = CONFIG.MODEL_SERIALIZED_PATH)
    print("Model was saved in : ", CONFIG.MODEL_SERIALIZED_PATH)    

if __name__ == "__main__":
    start = datetime.datetime.now()
    print("\n" + "\033[0;34m" + "[start] " + str(start) + "\033[0m" + "\n");
    resume_training()
    end = datetime.datetime.now()
    print("\n" + "\033[0;34m" + "[end] "+ str(end) + "\033[0m" + "\n");

    exectime= end - start
    print("Exectime: ",exectime.total_seconds() )
