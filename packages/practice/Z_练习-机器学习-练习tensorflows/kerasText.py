import tensorflow as tf
from tensorflow import keras

import numpy as np

# 下载数据
imdb = keras.datasets.imdb
(train_data, train_labels), (test_data, test_labels) = imdb.load_data(num_words=10000)

# print("Training entries: {}, labels: {}".format(len(train_data), len(train_labels)))





# 将整数转换回单词
# 一个映射单词到整数索引的词典
word_index = imdb.get_word_index()
# 保留第一个索引
word_index = {k:(v+3) for k,v in word_index.items()}
word_index["<PAD>"] = 0
word_index["<START>"] = 1
word_index["<UNK>"] = 2  # unknown
word_index["<UNUSED>"] = 3

reverse_word_index = dict([(value, key) for (key, value) in word_index.items()])

def decode_review(text):
    return ' '.join([reverse_word_index.get(i, '?') for i in text])






# 将数据长度调整为等长一致的
train_data = keras.preprocessing.sequence.pad_sequences(train_data,
  value=word_index["<PAD>"],
  padding='post',
  maxlen=256)

test_data = keras.preprocessing.sequence.pad_sequences(test_data,
  value=word_index["<PAD>"],
  padding='post',
  maxlen=256)



# 输入形状是用于电影评论的词汇数目（10,000 词） 即上述的10000单词的数据集
# 所以形状可以认为即是用于分类的特征点
vocab_size = 10000

model = keras.Sequential()
# 第一层是嵌入（Embedding）层。
# 该层采用整数编码的词汇表，
# 并查找每个词索引的嵌入向量（embedding vector）。
# 这些向量是通过模型训练学习到的。
# 向量向输出数组增加了一个维度。
# 得到的维度为：(batch, sequence, embedding)。
# 不理解
model.add(keras.layers.Embedding(vocab_size, 16))
# 接下来，GlobalAveragePooling1D 
# 将通过对序列维度求平均值来为每个样本返回一个定长输出向量。
# 这允许模型以尽可能最简单的方式处理变长输入。
model.add(keras.layers.GlobalAveragePooling1D())
# 该定长输出向量通过一个有 16 个隐层单元的全连接（Dense）层传输。
model.add(keras.layers.Dense(16, activation='relu'))
# 最后一层与单个输出结点密集连接。使用 Sigmoid 激活函数，其函数值为介于 0 与 1 之间的浮点数，表示概率或置信度。
model.add(keras.layers.Dense(1, activation='sigmoid'))

model.summary()


# 配置优化器与损失函数
model.compile(optimizer='adam',
  loss='binary_crossentropy',
  metrics=['accuracy'])

# 创建验证集
x_val = train_data[:10000]
partial_x_train = train_data[10000:]
y_val = train_labels[:10000]
partial_y_train = train_labels[10000:]


history = model.fit(partial_x_train,
  partial_y_train,
  epochs=60,
  batch_size=512,
  validation_data=(x_val, y_val),
  verbose=1)


results = model.evaluate(test_data,  test_labels, verbose=2)



history_dict = history.history
history_dict.keys()









import matplotlib.pyplot as plt

acc = history_dict['accuracy']
val_acc = history_dict['val_accuracy']
loss = history_dict['loss']
val_loss = history_dict['val_loss']

epochs = range(1, len(acc) + 1)

# # “bo”代表 "蓝点"
# plt.plot(epochs, loss, 'bo', label='Training loss')
# # b代表“蓝色实线”
# plt.plot(epochs, val_loss, 'b', label='Validation loss')
# plt.title('Training and validation loss')
# plt.xlabel('Epochs')
# plt.ylabel('Loss')
# plt.legend()

# plt.show()



plt.clf()   # 清除数字

plt.plot(epochs, acc, 'bo', label='Training acc')
plt.plot(epochs, val_acc, 'b', label='Validation acc')
plt.title('Training and validation accuracy')
plt.xlabel('Epochs')
plt.ylabel('Accuracy')
plt.legend()

plt.show()