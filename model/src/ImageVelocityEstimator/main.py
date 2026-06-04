# == Main file

# Import libraries and required modules
from model.src.ImageVelocityEstimator.VelocityEstimator import VelocityEstimator 
from model.config.ImageVelocityEstimator.config import CONFIG
from model.config.libraries import *


# Function for loading custom model and print its arquitecture
def load_model(model_name, print_model_arq = False):
    velocityEstimator = VelocityEstimator(load_dm=False)

    velocityEstimator.load_model(
        f"model/experiments/{model_name}/serialized/{model_name}_weights.pth"
    )

    if print_model_arq: 
        model_arq_string = None # Model Arq as json for its storage in Config file
        print(velocityEstimator.lightningModel)

    return velocityEstimator

# Save model
def save_model_architecture(model:VelocityEstimator, output_path):

    architecture = model.get_model_architecture()

    with open(output_path, "w") as f:
        json.dump(
            architecture,
            f,
            indent=4
        )

    print(
        f"[INFO] Model architecture saved at: {output_path}"
    )

# Function for executing model custom inference
def test_inference():
    
    print("\033[0;34m" + "[Loading Model...] \033[0m" + "\n")
    # Load Model  ImagVelEst_augmented_Modifiedfc
    velocityEstimator = load_model(CONFIG.MODEL_PREFIX, print_model_arq= False)

    BASE_VALIDATION_IMAGE_PATH = "model/data/ExtraValidationData/Images/"

    # Validation images for inference testing
    validation_images_path = [
        "43-kmph-27-mph_4-Severe_019_Vehicle4.jpg",
        "test_conf_1.jpeg",
        "test_conf_2.jpeg"  
    ]

    print("\033[0;34m" + "[Starting Inference Execution...] \033[0m" + "\n")
    for path in validation_images_path:
        # Get full sample path
        path = BASE_VALIDATION_IMAGE_PATH + path

        # Get inference
        embedding, prediction = velocityEstimator.inference(path, return_embedding=True)

        print(f"\n    [Inference] Predicted speed: {prediction:.2f} km/h  for image: {path}")
        print(embedding)


# Main file for VelocityEstimator model training execution
def main():
    
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

        # Save model architecture
        save_model_architecture(
            model,
            f"{CONFIG.EXPERIMENT_DIR}/model_architecture.json"
        )

        print("\033[0;34m" + "[Model architecture...] \033[0m" + "\n") 
        print(model.lightningModel)
        
    else:
        print(" Warning: Active Inference Mode, Training phase can't start...")
        return

    # Save model
    model.save_model(serialized_object_path_destination = CONFIG.MODEL_SERIALIZED_PATH)
    print("\033[0;34m" + f"[Serialized model was saved in: {CONFIG.MODEL_SERIALIZED_PATH}] \033[0m" + "\n")

    # Model Test
    print("\033[0;34m" + "[Starting testing phase...] \033[0m" + "\n")
    model.test()

    # Save training parameters
    CONFIG.save()



if __name__ == "__main__":
    start = datetime.datetime.now()
    print("\n" + "\033[0;34m" + "[start] " + str(start) + "\033[0m" + "\n")
    #main()
    test_inference()
    end = datetime.datetime.now()
    print("\n" + "\033[0;34m" + "[end] "+ str(end) + "\033[0m" + "\n")

    exectime= end - start
    print("Exectime: ",exectime.total_seconds() )
