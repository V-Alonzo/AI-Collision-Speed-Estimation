# == Main for model's training phase

# Import libraries and required modules
from model.src.TabularVelocityEstimator.VelocityEstimator import VelocityEstimator 
from model.config.TabularVelocityEstimator.config import MODEL_SERIALIZED_PATH, BATCH_SIZE, NUM_WORKERS, TRAIN_PROPORTION, VAL_PROPORTION
from model.config.TabularVelocityEstimator.config import N_EPOCHS, LEARNING_RATE
from model.config.libraries import *


# Main file for VelocityEstimator model training execution
def main():
    # Force Python's garbage collector to run
    gc.collect()

    # Clear the PyTorch CUDA cache
    torch.cuda.empty_cache()

    # Create model
    model = VelocityEstimator(
        batch_size = BATCH_SIZE,
        num_workers = NUM_WORKERS,
        train_proportion = TRAIN_PROPORTION,
        val_proportion = VAL_PROPORTION
    )

    # Train model
    model.train(
        epochs = N_EPOCHS,
        learning_rate = LEARNING_RATE
    )

    # Save model
    model.save_model(serialized_object_path_destination = MODEL_SERIALIZED_PATH)
    print("Model was saved in : ", MODEL_SERIALIZED_PATH)

    # Model Test
    model.test()

if __name__ == "__main__":
    start = datetime.datetime.now()
    print("\n" + "\033[0;34m" + "[start] " + str(start) + "\033[0m" + "\n");
    main();
    end = datetime.datetime.now()
    print("\n" + "\033[0;34m" + "[end] "+ str(end) + "\033[0m" + "\n");

    exectime= end - start
    print("Exectime: ",exectime.total_seconds() )
