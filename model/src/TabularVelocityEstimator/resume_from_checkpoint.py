# == Main for resuming a model's training phase from lightning's checkpoint

# Import libraries and required modules
from model.src.ImageVelocityEstimator.VelocityEstimator import VelocityEstimator
from model.config.config import MODEL_SERIALIZED_PATH, BATCH_SIZE, NUM_WORKERS, TRAIN_PROPORTION, VAL_PROPORTION
from model.config.config import N_EPOCHS, LEARNING_RATE
from model.config.libraries import *


# Resume Training from loaded pretrained model
def resume_training():
     # Create model
    model = VelocityEstimator(
        batch_size = BATCH_SIZE,
        num_workers = NUM_WORKERS,
        train_proportion = TRAIN_PROPORTION,
        val_proportion = VAL_PROPORTION
    )

    # Load Model from checkpoint
    model.load_from_checkpoint("src/model/ModelCheckpoints/best_model.ckpt")
    print("Model was succesfully loaded...")

    # Start training phase
    model.train(
        epochs = N_EPOCHS,
        learning_rate = LEARNING_RATE
    )

    # Save model
    model.save_model(serialized_object_path_destination = MODEL_SERIALIZED_PATH)
    print("Model was saved in : ", MODEL_SERIALIZED_PATH)    

if __name__ == "__main__":
    start = datetime.datetime.now()
    print("\n" + "\033[0;34m" + "[start] " + str(start) + "\033[0m" + "\n");
    resume_training()
    end = datetime.datetime.now()
    print("\n" + "\033[0;34m" + "[end] "+ str(end) + "\033[0m" + "\n");

    exectime= end - start
    print("Exectime: ",exectime.total_seconds() )
