# import tensorflow as tf
# from tensorflow import keras 

# import numpy as np
# import matplotlib.pyplot as plt

# fashion_mnist = keras.datasets.fashion_mnist
# (train_images, train_labels), (test_images, test_labels) = fashion_mnist.load_data()

# class_names = ['T-shirt/top', 'Trouser', 'Pullover', 'Dress', 'Coat',
#     'Sandal', 'Shirt', 'Sneaker', 'Bag', 'Ankle boot']

# # plt.figure()
# # plt.imshow(train_images[0])
# # plt.colorbar()
# # plt.grid(True)
# # plt.show()

# train_images = train_images / 255.0

# test_images = test_images / 255.0

# # plt.figure(figsize=(10,10))
# # for i in range(25):
# #     plt.subplot(5,5,i+1)
# #     plt.xticks([])
# #     plt.yticks([])
# #     plt.grid(False)
# #     plt.imshow(train_images[i], cmap=plt.cm.binary)
# #     plt.xlabel(class_names[train_labels[i]])
# # plt.show()



# model = keras.Sequential([
#     keras.layers.Flatten(input_shape=(28, 28)),
#     keras.layers.Dense(128, activation='relu'),
#     keras.layers.Dense(10)
# ])


# model.compile(optimizer='adam',
#     loss=tf.keras.losses.SparseCategoricalCrossentropy(from_logits=True),
#     metrics=['accuracy'])

# model.fit(train_images, train_labels, epochs=10)

# test_loss, test_acc = model.evaluate(test_images,  test_labels, verbose=2)

# print('\nTest accuracy:', test_acc)

# probability_model = tf.keras.Sequential([model, 
#     tf.keras.layers.Softmax()])

# predictions = probability_model.predict(test_images)

# print(predictions[0]);
# print(np.argmax(predictions[0]));
# print(test_labels[0]);


# def plot_image(i, predictions_array, true_label, img):
#   predictions_array, true_label, img = predictions_array, true_label[i], img[i]
#   plt.grid(False)
#   plt.xticks([])
#   plt.yticks([])

#   plt.imshow(img, cmap=plt.cm.binary)

#   predicted_label = np.argmax(predictions_array)
#   if predicted_label == true_label:
#     color = 'blue'
#   else:
#     color = 'red'

#   plt.xlabel("{} {:2.0f}% ({})".format(class_names[predicted_label],
#                                 100*np.max(predictions_array),
#                                 class_names[true_label]),
#                                 color=color)

# def plot_value_array(i, predictions_array, true_label):
#   predictions_array, true_label = predictions_array, true_label[i]
#   plt.grid(False)
#   plt.xticks(range(10))
#   plt.yticks([])
#   thisplot = plt.bar(range(10), predictions_array, color="#777777")
#   plt.ylim([0, 1])
#   predicted_label = np.argmax(predictions_array)

#   thisplot[predicted_label].set_color('red')
#   thisplot[true_label].set_color('blue')


# # plt.figure(figsize=(6,3))
# # plt.subplot(1,2,1)
# # plot_image(0, predictions[0], test_labels, test_images)
# # plt.subplot(1,2,2)
# # plot_value_array(0, predictions[0],  test_labels)
# # plt.show()





# # Plot the first X test images, their predicted labels, and the true labels.
# # Color correct predictions in blue and incorrect predictions in red.
# num_rows = 5
# num_cols = 3
# num_images = num_rows*num_cols
# plt.figure(figsize=(2*2*num_cols, 2*num_rows))
# for i in range(num_images):
#   plt.subplot(num_rows, 2*num_cols, 2*i+1)
#   plot_image(i, predictions[i], test_labels, test_images)
#   plt.subplot(num_rows, 2*num_cols, 2*i+2)
#   plot_value_array(i, predictions[i], test_labels)
# plt.tight_layout()
# plt.show()












# 注入依赖
# 注入依赖
# 注入依赖
# TensorFlow and tf.keras
import tensorflow as tf
from tensorflow import keras
# Helper libraries
import numpy as np
import matplotlib.pyplot as plt



# 获取fashion_mnist图像库
fashion_mnist = keras.datasets.fashion_mnist
# 获取train_images, train_labels test_images, test_labels信息
(train_images, train_labels), (test_images, test_labels) = fashion_mnist.load_data()



class_names = ['T-shirt/top', 'Trouser', 'Pullover', 'Dress', 'Coat',
    'Sandal', 'Shirt', 'Sneaker', 'Bag', 'Ankle boot']

# 归一化处理
train_images = train_images / 255.0
test_images = test_images / 255.0

# 创建模型
model = keras.Sequential([
    # 该网络的第一层 tf.keras.layers.Flatten 将图像格式从二维数组（28 x 28 像素）
    # 转换成一维数组（28 x 28 = 784 像素）。将该层视为图像中未堆叠的像素行并将其排列起来。
    # 该层没有要学习的参数，它只会重新格式化数据。
    keras.layers.Flatten(input_shape=(28, 28)),
    # 展平像素后，网络会包括两个 tf.keras.layers.Dense 层的序列。
    # 它们是密集连接或全连接神经层。
    # 第一个 Dense 层有 128 个节点（或神经元）。
    # 第二个（也是最后一个）层会返回一个长度为 10 的 logits 数组。
    # 每个节点都包含一个得分，用来表示当前图像属于 10 个类中的哪一类。
    keras.layers.Dense(128, activation='relu'),
    keras.layers.Dense(10)
])

# 编译模型
# optimizer 优化器， 根据loss 损失函数进行更新模型
# loss 损失函数， 用于测量准确率，越小越准确
# metrics 指标 用于监控流程节点 以下示例使用了准确率，即被正确分类的图像的比率。
model.compile(optimizer='adam',
    loss=tf.keras.losses.SparseCategoricalCrossentropy(from_logits=True),
    metrics=['accuracy'])

# 训练模型
# 训练神经网络模型需要执行以下步骤：
# 1.将训练数据馈送给模型。在本例中，训练数据位于 train_images 和 train_labels 数组中。
# 2.模型学习将图像和标签关联起来。
# 3.要求模型对测试集（在本例中为 test_images 数组）进行预测。
# 4.验证预测是否与 test_labels 数组中的标签相匹配。

# 要开始训练，请调用 model.fit 方法，这样命名是因为该方法会将模型与训练数据进行“拟合”
# train_images 输入,用于传入模型拟合预期输出
# train_labels 预期输出,用于训练模型
# epochs 周期,全数据用于训练的次数
model.fit(train_images, train_labels, epochs=5)

# 评估模型准确率
# model.evaluate 用于评估您训练的模型。它的输出是准确度或损失，而不是对输入数据的预测。
# model.predict 实际预测，其输出是目标值，根据输入数据预测。
test_loss, test_acc = model.evaluate(test_images,  test_labels, verbose=2)

# 进行预测
# 生成预测模型
probability_model = tf.keras.Sequential([model, 
    tf.keras.layers.Softmax()])
# 对测试数据test_images进行预测,获得结果
predictions = probability_model.predict(test_images)


# 绘制结果
def plot_image(i, predictions_array, true_label, img):
  predictions_array, true_label, img = predictions_array, true_label[i], img[i]
  plt.grid(False)
  plt.xticks([])
  plt.yticks([])

  plt.imshow(img, cmap=plt.cm.binary)

  predicted_label = np.argmax(predictions_array)
  if predicted_label == true_label:
    color = 'blue'
  else:
    color = 'red'

  plt.xlabel("{} {:2.0f}% ({})".format(class_names[predicted_label],
                                100*np.max(predictions_array),
                                class_names[true_label]),
                                color=color)

def plot_value_array(i, predictions_array, true_label):
  predictions_array, true_label = predictions_array, true_label[i]
  plt.grid(False)
  plt.xticks(range(10))
  plt.yticks([])
  thisplot = plt.bar(range(10), predictions_array, color="#777777")
  plt.ylim([0, 1])
  predicted_label = np.argmax(predictions_array)

  thisplot[predicted_label].set_color('red')
  thisplot[true_label].set_color('blue')

# 预测结果显示单个
# i = 5
# plt.figure(figsize=(6,3))
# plt.subplot(1,2,1)
# plot_image(i, predictions[i], test_labels, test_images)
# plt.subplot(1,2,2)
# plot_value_array(i, predictions[i],  test_labels)
# plt.show()

# 预测结果显示多个
# Plot the first X test images, their predicted labels, and the true labels.
# Color correct predictions in blue and incorrect predictions in red.
# num_rows = 10
# num_cols = 10
# num_images = num_rows*num_cols
# plt.figure(figsize=(2*2*num_cols, 2*num_rows))
# for i in range(num_images):
#   plt.subplot(num_rows, 2*num_cols, 2*i+1)
#   plot_image(i, predictions[i], test_labels, test_images)
#   plt.subplot(num_rows, 2*num_cols, 2*i+2)
#   plot_value_array(i, predictions[i], test_labels)
# plt.tight_layout()
# plt.show()



# 使用模型
# Grab an image from the test dataset.
img = test_images[1]
label = test_labels[1]
# Add the image to a batch where it's the only member.
img = (np.expand_dims(img,0))

predictions_single = probability_model.predict(img)

plot_value_array(1, predictions_single[0], test_labels)
_ = plt.xticks(range(10), class_names, rotation=45)

np.argmax(predictions_single[0])