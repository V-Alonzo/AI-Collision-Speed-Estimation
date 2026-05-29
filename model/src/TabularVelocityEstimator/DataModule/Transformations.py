# Import libraries and required modules
from torchvision import transforms
from model.config.libraries import *
from model.config.TabularVelocityEstimator.config import CONFIG

# Apply transformations to improve generalization

# Crop parameters
crop_height = int(np.floor(CONFIG.IMAGE_HEIGHTS_MEDIAN * 0.8))
crop_width = int(np.floor(CONFIG.IMAGE_WIDTHS_MEDIAN * 0.8))

# Training transformations
train_transform = transforms.Compose([
    transforms.Resize((CONFIG.IMAGE_HEIGHTS_MEDIAN, CONFIG.IMAGE_WIDTHS_MEDIAN)),
    # transforms.RandomCrop((crop_height, crop_width)),
    # transforms.RandomHorizontalFlip(p=0.2),
    # transforms.RandomRotation(20),
    # transforms.ColorJitter(brightness=0.1, contrast=0.1, saturation=0.1, hue=0.1),
    transforms.ToTensor(),
    #transforms.Normalize(mean=CONFIG.IMAGE_MEAN, std=CONFIG.IMAGE_STD),
])

# Test Transformations
test_transform = transforms.Compose([
    transforms.Resize((CONFIG.IMAGE_HEIGHTS_MEDIAN, CONFIG.IMAGE_WIDTHS_MEDIAN)),
    # transforms.CenterCrop((crop_height, crop_width)),
    transforms.ToTensor(),
    #transforms.Normalize(mean=CONFIG.IMAGE_MEAN, std=CONFIG.IMAGE_STD),
])