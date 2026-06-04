# Import libraries and required modules
from model.config.libraries import *
from model.config.ImageVelocityEstimator.config import CONFIG
from model.src.ImageVelocityEstimator.DataModule.VelocityEstimatorDatasetWithPaths import full_dataloader
from model.src.ImageVelocityEstimator.VelocityEstimator import VelocityEstimator


# Extract embeddings, ground-truth labels and predictions with full dataset dataloader
def extract_all_embeddings(
        velocityEstimator
    ):

    all_embeddings = []
    all_true_labels = []
    all_predictions = []
    all_image_paths = []

    model = velocityEstimator.lightningModel

    # Set model to evaluation mode
    model.eval()

    dataloader = full_dataloader()

    # Disable gradient computation
    with torch.no_grad():

        for images, speeds, image_paths in tqdm(dataloader):

            # Move batch to device
            images = images.to(CONFIG.DEVICE)

            # Extract normalized embeddings
            embeddings = model.get_embedding(
                images
            )

            # Predict impact speed
            predictions = model(
                images
            )

            # Store batch outputs
            all_embeddings.append(
                embeddings.cpu()
            )

            all_true_labels.append(
                speeds.cpu()
            )

            all_predictions.append(
                predictions.squeeze(1).cpu()
            )

            all_image_paths.extend(
                image_paths
            )

    # Merge all batches
    embeddings = torch.cat(
        all_embeddings,
        dim=0
    ).numpy()

    true_labels = torch.cat(
        all_true_labels,
        dim=0
    ).numpy()

    predictions = torch.cat(
        all_predictions,
        dim=0
    ).numpy()

    return (
        embeddings,
        true_labels,
        predictions,
        all_image_paths
    )

# Load model
def load_model():
    print("\033[0;34m" + "[Loading Model...] \033[0m" + "\n")
    # Load trained model
    velocityEstimator = VelocityEstimator(
        load_dm=False
    )

    velocityEstimator.load_model(
        CONFIG.MODEL_SERIALIZED_PATH
    )

    return velocityEstimator