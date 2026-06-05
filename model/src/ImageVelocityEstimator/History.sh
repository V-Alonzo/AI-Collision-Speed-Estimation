# Execute Model Training (Execute the following from project root 'AI-COLLISION-SPEED-ESTIMATION-CESVI/' )
python -m model.src.main

# Execute model metrics generation
python -m model.src.ImageVelocityEstimator.Evaluation.Metrics

# Execute manifol plotting
python -m model.src.ImageVelocityEstimator.Manifold.PlotManifold
