# == Main for model's training phase

# Import libraries and required modules
from model.src.TabularVelocityEstimator.VelocityEstimator import VelocityEstimator 
from model.config.TabularVelocityEstimator.config import CONFIG
from model.config.libraries import *

# Main file for VelocityEstimator model training execution
def main():
    # Save training parameters
    CONFIG.save()

    # Load Training Params
    # config = TrainingConfig.load(
    #     "model/src/ExperimentConfigs/xxx.json"
    # )
    
    # Force Python's garbage collector to run
    gc.collect()

    # Clear the PyTorch CUDA cache
    torch.cuda.empty_cache()

    # Create model
    model = VelocityEstimator(
        batch_size = CONFIG.BATCH_SIZE,
        num_workers = CONFIG.NUM_WORKERS,
        train_proportion = CONFIG.TRAIN_PROPORTION,
        val_proportion = CONFIG.VAL_PROPORTION
    )

    print("\033[0;34m" + "[Starting training phase...] \033[0m" + "\n")
    # Train model
    model.train(
        epochs = CONFIG.N_EPOCHS,
        learning_rate = CONFIG.LEARNING_RATE
    )

    # Save model
    model.save_model(serialized_object_path_destination = CONFIG.MODEL_SERIALIZED_PATH)
    print("\033[0;34m" + f"[Serialized model was saved in: {CONFIG.MODEL_SERIALIZED_PATH}] \033[0m" + "\n")

    # Model Test
    print("\033[0;34m" + "[Starting testing phase...] \033[0m" + "\n")
    model.test()

if __name__ == "__main__":
    start = datetime.datetime.now()
    print("\n" + "\033[0;34m" + "[start] " + str(start) + "\033[0m" + "\n");
    main();
    end = datetime.datetime.now()
    print("\n" + "\033[0;34m" + "[end] "+ str(end) + "\033[0m" + "\n");

    exectime= end - start
    print("Exectime: ",exectime.total_seconds() )
