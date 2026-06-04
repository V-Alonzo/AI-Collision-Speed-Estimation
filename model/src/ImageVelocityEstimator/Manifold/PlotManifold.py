# Import libraries and required modules
from model.config.libraries import *
from model.src.ImageVelocityEstimator.VelocityEstimator import VelocityEstimator
from model.src.ImageVelocityEstimator.DataModule.VelocityEstimatorDatasetWithPaths import VelocityEstimatorDatasetWithPaths
from model.src.ImageVelocityEstimator.DataModule import Transformations
from model.config.ImageVelocityEstimator.config import CONFIG


# Create dataloader over the complete dataset
def full_dataloader():

    dataset = VelocityEstimatorDatasetWithPaths(
        annotations_file=CONFIG.IO_DATASET_MAP_LOCAL_PATH,
        transform=Transformations.test_transform,
    )

    return DataLoader(
        dataset,
        batch_size=CONFIG.BATCH_SIZE,
        shuffle=False,
        num_workers=CONFIG.NUM_WORKERS,
        pin_memory=True
    )

# Extract embeddings, ground-truth labels and predictions
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

# Compute embedding dimensionality reduction 
def compute_manifold(
        embeddings,
        method="tsne"
    ):

    method = method.lower()

    if method == "tsne":

        reducer = TSNE(
            n_components=2,
            perplexity=30,
            learning_rate="auto",
            init="pca",
            random_state=42
        )

    elif method == "umap":

        reducer = umap.UMAP(
            n_components=2,
            n_neighbors=15,
            min_dist=0.1,
            metric="euclidean",
            random_state=42
        )

    elif method == "pca":

        reducer = PCA(
            n_components=2,
            random_state=42
        )

    elif method == "isomap":

        reducer = Isomap(
            n_components=2,
            n_neighbors=15
        )

    else:
        raise ValueError(
            f"Unknown method: {method}"
        )

    return reducer.fit_transform(
        embeddings
    )

# Plot a 2D manifold colored by a target value
def plot_manifold(
        embeddings_2d,
        values,
        title,
        output_name,
        method
    ):

    plt.figure(
        figsize=(12,8)
    )

    scatter = plt.scatter(
        embeddings_2d[:,0],
        embeddings_2d[:,1],
        c=values,
        cmap="viridis",
        s=15,
        alpha=0.8
    )

    # Add color scale
    plt.colorbar(
        scatter,
        label="Speed (km/h)"
    )

    plt.title(title)

    plt.xlabel(f"{method} 1")
    plt.ylabel(f"{method} 2")

    plt.tight_layout()

    # Save plot
    output_path = os.path.join(
        CONFIG.METRICS_PLOTS_OUTPUT_DIR_PATH,
        output_name
    )

    plt.savefig(
        output_path,
        dpi=300
    )

    plt.close()

    print(
        f"Saved manifold at {output_path}"
    )

# Plot a manifold with plotly
def plot_manifold_interactive(
        embeddings_2d,
        color_values,
        true_labels,
        predictions,
        image_paths,
        title,
        output_name
    ):

    df = pd.DataFrame({

        "tsne_x": embeddings_2d[:, 0],
        "tsne_y": embeddings_2d[:, 1],

        "true_speed": true_labels,
        "predicted_speed": predictions,

        "absolute_error": np.abs(
            true_labels - predictions
        ),

        "image_path": image_paths,

        "color_value": color_values
    })

    fig = px.scatter(

        df,

        x="tsne_x",
        y="tsne_y",

        color="color_value",

        color_continuous_scale="Viridis",

        hover_data={
            "true_speed": True,
            "predicted_speed": True,
            "absolute_error": True,
            "image_path": True,
            "tsne_x": False,
            "tsne_y": False,
            "color_value": False
        },

        title=title
    )

    fig.update_traces(
        marker=dict(size=6)
    )

    output_path = os.path.join(
        CONFIG.METRICS_PLOTS_OUTPUT_DIR_PATH,
        output_name
    )

    fig.write_html(
        output_path
    )

    print(
        f"Saved interactive manifold at {output_path}"
    )

# Plot automation
def generate_visualizations(
        embeddings,
        true_labels,
        predictions,
        image_paths,
        method
    ):

    # Compute absolute prediction error
    absolute_error = np.abs(
        true_labels - predictions
    )


    # Plot manifold colored by true speed
    plot_manifold_interactive(
        embeddings,
        true_labels,
        true_labels,
        predictions,
        image_paths,
        f"{method.upper()} - True Speed",
        f"{method}_true_speed.html"
    )
    plot_manifold(
        embeddings,
        true_labels,
        f"{method.upper()} - True Speed",
        f"{method}_true_speed.png",
        method
    )

    # Plot manifold colored by predicted speed
    plot_manifold_interactive(
        embeddings,
        predictions,
        true_labels,
        predictions,
        image_paths,
        f"{method.upper()} - Predicted Speed",
        f"{method}_predicted_speed.html"
    )
    plot_manifold(
        embeddings,
        predictions,
        f"{method.upper()} - Predicted Speed",
        f"{method}_predicted_speed.png",
        method
    )

    # Plot manifold colored by prediction error
    plot_manifold_interactive(
        embeddings,
        absolute_error,
        true_labels,
        predictions,
        image_paths,
        f"{method.upper()} - Absolute Error",
        f"{method}_error.html"
    )
    plot_manifold(
        embeddings,
        absolute_error,
        f"{method.upper()} - Absolute Error",
        f"{method}_error.png",
        method
    )


# Generate t-SNE visualizations
def main():
    print("\033[0;34m" + "[Loading Model...] \033[0m" + "\n")
    # Load trained model
    velocityEstimator = VelocityEstimator(
        load_dm=False
    )

    velocityEstimator.load_model(
        CONFIG.MODEL_SERIALIZED_PATH
    )

    print("\033[0;34m" + "[Generating Embeddings...] \033[0m" + "\n")
    # Extract embeddings and labels
    embeddings, true_labels, predictions, image_paths = (
        extract_all_embeddings(
            velocityEstimator
        )
    )

    print("\033[0;34m" + "[Computing and Plotting Manifolds...] \033[0m" + "\n")

    methods = [
        "pca",
        "tsne",
        "umap",
        "isomap"
    ]

    for method in tqdm(methods):

        print( f"\n [Computing {method.upper()} manifold...]")
        # Compute method projection
        embeddings_2d = compute_manifold(
            embeddings,
            method=method
        )

        generate_visualizations(
            embeddings_2d,
            true_labels,
            predictions,
            image_paths,
            method
        )

# Entry point
if __name__ == "__main__":
    start = datetime.datetime.now()
    print("\n" + "\033[0;34m" + "[start] " + str(start) + "\033[0m" + "\n")
    main()
    end = datetime.datetime.now()
    print("\n" + "\033[0;34m" + "[end] "+ str(end) + "\033[0m" + "\n")

    exectime= end - start
    print("Exectime: ",exectime.total_seconds() )
