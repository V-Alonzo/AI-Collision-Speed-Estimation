# Image Velocity Estimator trained with augmented data (15513 samples) and 60 Epochs

The main purpose of this experiment is training with the resnet50 backbone with the following arq configuration


```python
ResNet(
  (conv1): Conv2d(3, 64, kernel_size=(7, 7), stride=(2, 2), padding=(3, 3), bias=False)  # Freezed

  (bn1): BatchNorm2d(64)  # Freezed
 
  (relu): ReLU(inplace=True)  # Freezed
 
  (maxpool): MaxPool2d(  # Freezeds
      kernel_size=3,
      stride=2,
      padding=1,
      dilation=1,
      ceil_mode=False
  )

  (layer1): Sequential(  # Freezed
    (0): Bottleneck(
      (conv1): Conv2d(64, 64, kernel_size=(1, 1), stride=(1, 1), bias=False)
      (bn1): BatchNorm2d(64)

      (conv2): Conv2d(
          64, 64,
          kernel_size=(3, 3),
          stride=(1, 1),
          padding=(1, 1),
          bias=False
      )
      (bn2): BatchNorm2d(64)

      (conv3): Conv2d(64, 256, kernel_size=(1, 1), stride=(1, 1), bias=False)
      (bn3): BatchNorm2d(256)

      (relu): ReLU(inplace=True)

      (downsample): Sequential(
        (0): Conv2d(64, 256, kernel_size=(1, 1), stride=(1, 1), bias=False)
        (1): BatchNorm2d(256)
      )
    )

    (1): Bottleneck(...)
    (2): Bottleneck(...)
  )

  (layer2): Sequential(  # Freezed
    (0): Bottleneck(
      (conv1): Conv2d(256, 128, kernel_size=(1, 1), stride=(1, 1), bias=False)

      (conv2): Conv2d(
          128, 128,
          kernel_size=(3, 3),
          stride=(2, 2),
          padding=(1, 1),
          bias=False
      )

      (conv3): Conv2d(128, 512, kernel_size=(1, 1), stride=(1, 1), bias=False)

      (downsample): Sequential(
        (0): Conv2d(256, 512, kernel_size=(1, 1), stride=(2, 2), bias=False)
        (1): BatchNorm2d(512)
      )
    )

    (1): Bottleneck(...)
    (2): Bottleneck(...)
    (3): Bottleneck(...)
  )

  (layer3): Sequential(  # Freezed
    (0): Bottleneck(
      (conv1): Conv2d(512, 256, kernel_size=(1, 1), stride=(1, 1), bias=False)

      (conv2): Conv2d(
          256, 256,
          kernel_size=(3, 3),
          stride=(2, 2),
          padding=(1, 1),
          bias=False
      )

      (conv3): Conv2d(256, 1024, kernel_size=(1, 1), stride=(1, 1), bias=False)

      (downsample): Sequential(
        (0): Conv2d(512, 1024, kernel_size=(1, 1), stride=(2, 2), bias=False)
        (1): BatchNorm2d(1024)
      )
    )

    (1): Bottleneck(...)
    (2): Bottleneck(...)
    (3): Bottleneck(...)
    (4): Bottleneck(...)
    (5): Bottleneck(...)
  )

  (layer4): Sequential( # Freezed
    (0): Bottleneck(
      (conv1): Conv2d(1024, 512, kernel_size=(1, 1), stride=(1, 1), bias=False)

      (conv2): Conv2d(
          512, 512,
          kernel_size=(3, 3),
          stride=(2, 2),
          padding=(1, 1),
          bias=False
      )

      (conv3): Conv2d(512, 2048, kernel_size=(1, 1), stride=(1, 1), bias=False)

      (downsample): Sequential(
        (0): Conv2d(1024, 2048, kernel_size=(1, 1), stride=(2, 2), bias=False)
        (1): BatchNorm2d(2048)
      )
    )

    (1): Bottleneck(...)
    (2): Bottleneck(...)
  )

  (avgpool): AdaptiveAvgPool2d(output_size=(1, 1))

  (fc): Linear(in_features=2048, out_features=1, bias=True)  # FC Unfreezed
)



# ==== Backbone model (Existant arq or custom one) 
resnet50_model = self.build_backbone_model(weights="IMAGENET1K_V2")

# freeze layers as default
for param in resnet50_model.parameters():
    param.requires_grad = False

# Unfreeze resnet fc
for param in resnet50_model.fc.parameters():
    param.requires_grad = True

# Get number of features
in_features = resnet50_model.fc.in_features

# Replace final layer
resnet50_model.fc = nn.Linear(
    in_features,
    1
)