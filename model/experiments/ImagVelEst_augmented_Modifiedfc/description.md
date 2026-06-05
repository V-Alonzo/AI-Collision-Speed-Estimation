# Image Velocity Estimator trained with augmented data (15513 samples) and 60 Epochs and Custom FC

The main purpose of this experiment is training with the resnet50 backbone with the following arq configuration and custom fully connected arquitecture


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
 
  (fc): Sequential(    # FC Unfreezed
          Linear(in_features=2048, 512),
          BatchNorm1d(512),
          GELU(),
          Dropout(0.3),
          Linear(512, 128),
          BatchNorm1d(128),
          GELU(),
          Dropout(0.2),

          Linear(128, 1)
      ) 
)


