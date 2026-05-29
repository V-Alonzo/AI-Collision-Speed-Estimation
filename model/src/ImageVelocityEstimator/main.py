# == Main for model's training phase

# Import libraries and required modules
from model.src.ImageVelocityEstimator.VelocityEstimator import VelocityEstimator 
from model.config.ImageVelocityEstimator.config import CONFIG
from model.config.libraries import *

def test_inference():
    
    print("\033[0;34m" + "[Starting Inference Execution...] \033[0m" + "\n")

    velocityEstimator = VelocityEstimator(load_dm=False)

    velocityEstimator.load_model(
        "model/experiments/ImagVelEst_augmented_Modifiedfc/serialized/ImagVelEst_augmented_Modifiedfc_weights.pth"
    )

    BASE_VALIDATION_IMAGE_PATH = "model/data/ExtraValidationData/Images/"

    validation_images_path = [
        "43-kmph-27-mph_4-Severe_019_Vehicle4.jpg",
        "test_conf_1.jpeg",
        "test_conf_2.jpeg"  
    ] 

    for path in validation_images_path:
        path = BASE_VALIDATION_IMAGE_PATH + path

        prediction = velocityEstimator.inference(
            path
        )

        print(f"\n    [Inference] Predicted speed: {prediction:.2f} km/h  for image: {path}")

# Main file for VelocityEstimator model training execution
def main():
    # Save training parameters
    CONFIG.save()

    # Load Training Params
    # config = TrainingConfig.load(
    #     "model/experiments/VelocityEstimator_640_691_4559samples/config.json"
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
    if not CONFIG.INFERENCE_MODE:
        # Train model
        model.train(
            epochs = CONFIG.N_EPOCHS,
            learning_rate = CONFIG.LEARNING_RATE
        )
    else:
        print(" Warning: Active Inference Mode, Training phase can't start...")
        return

    # Save model
    model.save_model(serialized_object_path_destination = CONFIG.MODEL_SERIALIZED_PATH)
    print("\033[0;34m" + f"[Serialized model was saved in: {CONFIG.MODEL_SERIALIZED_PATH}] \033[0m" + "\n")

    # Model Test
    print("\033[0;34m" + "[Starting testing phase...] \033[0m" + "\n")
    model.test()

if __name__ == "__main__":
    start = datetime.datetime.now()
    print("\n" + "\033[0;34m" + "[start] " + str(start) + "\033[0m" + "\n");
    #main();
    test_inference()
    end = datetime.datetime.now()
    print("\n" + "\033[0;34m" + "[end] "+ str(end) + "\033[0m" + "\n");

    exectime= end - start
    print("Exectime: ",exectime.total_seconds() )
