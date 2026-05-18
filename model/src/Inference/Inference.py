# Inference

# == Main for model's inference phase

# Import libraries and required modules
from model.src.VelocityEstimator import VelocityEstimator 
from model.config.config import MODEL_SERIALIZED_PATH, MODEL_NAME, N_INFERENCES_2_EXEC, OUTPUT_INFERENCES_DIR
from model.config.config import BATCH_SIZE, NUM_WORKERS, TRAIN_PROPORTION, VAL_PROPORTION
from model.config.libraries import *


# Function for model's inference execution
def execute_inference():
    # Create model
    model = VelocityEstimator(
        batch_size = BATCH_SIZE,
        num_workers = NUM_WORKERS,
        train_proportion = TRAIN_PROPORTION,
        val_proportion = VAL_PROPORTION
    )

    # Save model
    model.load_model( MODEL_SERIALIZED_PATH)
    print("Model was correctly loaded from " +MODEL_SERIALIZED_PATH+ " ...")

    # Get n number of Inferences
    generated_imgs = []
    for i in tqdm(range(N_INFERENCES_2_EXEC)):
        xt = model.inference()      # (1, C, H, W) en [0,1]
        generated_imgs.append(img)

    # Plot inferences
    fig, axes = plt.subplots(3, 3, figsize=(10, 10))

    # Subplot iteration for ploting generated images
    for i, ax in enumerate(axes.flat):
        if i >= len(generated_imgs):
            ax.axis("off")
            continue
        
        # Generated image as (C, H, W)
        img = generated_imgs[i] 

        # Detect image channels
        if img.shape[0] == 1:
            # Grayscale
            ax.imshow(img[0], cmap="gray")
        else:
            # RGB and tensor transformation for a correct plot
            ax.imshow(np.transpose(img, (1, 2, 0)))

        ax.axis('off')

    plt.tight_layout()
    
    # Store figure
    output_path = os.path.join(OUTPUT_INFERENCES_DIR, MODEL_NAME + "_inference_"+str(N_INFERENCES_2_EXEC)+"_grid.png")
    plt.savefig(output_path, dpi=300)
    plt.close(fig)
    print("Inference phase finished, grid saves in "+output_path+ "...")

if __name__ == "__main__":
    execute_inference()