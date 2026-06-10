# Import libraries and required modules
from model.config.libraries import *
from model.config.HybridVelocityEstimator.config import CONFIG
from model.src.HybridVelocityEstimator.DataModule.VelocityEstimatorDataset import full_dataloader
from model.src.HybridVelocityEstimator.VelocityEstimator import VelocityEstimator


# Extract embeddings, ground-truth labels and predictions with full dataset dataloader
def extract_all_predictions(
    velocityEstimator
):
    all_true_labels = []
    all_predictions = []

    model = velocityEstimator.lightningModel
    model.eval()

    dataloader = full_dataloader()

    with torch.no_grad():

        for images, tabular_features, labels in tqdm(dataloader):

            images = images.to(CONFIG.DEVICE)

            tabular_features = (
                tabular_features
                .float()
                .to(CONFIG.DEVICE)
            )

            predictions = model(
                images,
                tabular_features
            )

            all_true_labels.append(
                labels.cpu()
            )

            all_predictions.append(
                predictions.squeeze(1).cpu()
            )

    true_labels = torch.cat(
        all_true_labels,
        dim=0
    ).numpy()

    predictions = torch.cat(
        all_predictions,
        dim=0
    ).numpy()

    return (
        true_labels,
        predictions
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