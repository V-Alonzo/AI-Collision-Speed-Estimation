# Import libraries and required modules
from model.config.libraries import *
from model.config.ImageVelocityEstimator.config import CONFIG
from model.src.ImageVelocityEstimator.Evaluation.Inference import load_model, extract_all_embeddings


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

# Plot manifold automation
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

# Generate dim reduction visualizations
def main():
    # Load model
    velocityEstimator = load_model()

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
