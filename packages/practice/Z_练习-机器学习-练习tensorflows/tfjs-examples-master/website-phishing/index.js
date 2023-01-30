import * as tf from '@tensorflow/tfjs';
import * as Papa from 'papaparse';
import * as tfvis from '@tensorflow/tfjs-vis';

const TRAIN_DATA = 'train-data';
const TRAIN_TARGET = 'train-target';
const TEST_DATA = 'test-data';
const TEST_TARGET = 'test-target';
const BASE_URL =
    'https://gist.githubusercontent.com/ManrajGrover/6589d3fd3eb9a0719d2a83128741dfc1/raw/d0a86602a87bfe147c240e87e6a9641786cafc19/';
const rocValues = [];
const rocSeries = [];









// 参数次序随机化
async function utilsshuffle(data, label) {
  let counter = data.length;
  let temp = 0;
  let index = 0;
  while (counter > 0) {
    index = (Math.random() * counter) | 0;
    counter--;
    // data:
    temp = data[counter];
    data[counter] = data[index];
    data[index] = temp;
    // label:
    temp = label[counter];
    label[counter] = label[index];
    label[index] = temp;
  }
};








// 标准化数据
const normalizeVector = (vector, vectorMean, vectorStddev) => {
  // 标准化参数 即 参数减去平均数得到平均数为0的区域，除以标准差
  // 得出上下为1到-1的，标准差为单位标准差的参数
  return vector.map(x => (x - vectorMean) / vectorStddev);
};


// 计算平均数
function mean(vector) {
  let sum = 0;
  for (const x of vector) {
    sum += x;
  }
  return sum / vector.length;
};



function stddev(vector) {
  // 定义参数的平方和
  let squareSum = 0;
  // 计算平均数
  const vectorMean = mean(vector);
  // 计算参数的平方和
  for (const x of vector) {
    squareSum += (x - vectorMean) * (x - vectorMean);
  }
  // Math.sqrt() 函数返回一个数的平方根
  // 即返回标准差
  return Math.sqrt(squareSum / (vector.length - 1));
};




async function parseCsv (data) {
  return new Promise(resolve => {
    data = data.map((row) => {
      return Object.keys(row).sort().map(key => parseFloat(row[key]));
    });
    resolve(data);
  });
};



async function utilsloadCsv(filename) {
  return new Promise(resolve => {
    const url = `${BASE_URL}${filename}.csv`;

    // console.log(`  * Downloading data from: ${url}`);
    Papa.parse(url, {
      download: true,
      header: true,
      complete: (results) => {
        resolve(parseCsv(results['data']));
      }
    })
  });
};






function utilsnormalizeDataset(
  dataset,
  isTrainData = true,
  vectorMeans = [],
  vectorStddevs = []) {
      const numFeatures = dataset[0].length;
      let vectorMean;
      let vectorStddev;
      // 对每一个特征值进行操作
      for (let i = 0; i < numFeatures; i++) {
        const vector = dataset.map(row => row[i]);
        // 如果是从原始数据来源
        if (isTrainData) {
          // 计算同一特征值的平均数
          vectorMean = mean(vector);
          // 计算同一特征值的标准差
          vectorStddev = stddev(vector);
          // 保存特征值的平均数
          vectorMeans.push(vectorMean);
          // 保存特征值的标准差
          vectorStddevs.push(vectorStddev);
        } else {
          // 直接复制对应特征值的平均数
          vectorMean = vectorMeans[i];
          // 直接复制对应特征值的标准差
          vectorStddev = vectorStddevs[i];
        }

        // 获取标准化的参数
        const vectorNormalized =
            normalizeVector(vector, vectorMean, vectorStddev);

        // 这一步是做什么
        vectorNormalized.forEach((value, index) => {
          dataset[index][i] = value;
        });
      }
      // 返回整理好的数据、特征平均值数据、特征标准差数据
      return {dataset, vectorMeans, vectorStddevs};
    };










class WebsitePhishingDataset {
  constructor() {
    this.dataset = null; // 清理好的数据
    this.trainSize = 0; // 训练集长度
    this.testSize = 0; // 测试集长度
    this.trainBatchIndex = 0;
    this.testBatchIndex = 0;
    this.NUM_FEATURES = 30;
    this.NUM_CLASSES = 2;
  }

  get numFeatures() {
    return this.NUM_FEATURES;
  }


  /** Loads training and test data. */
  async loadData() {
    this.dataset = await Promise.all([
      utilsloadCsv(TRAIN_DATA), utilsloadCsv(TRAIN_TARGET),
      utilsloadCsv(TEST_DATA), utilsloadCsv(TEST_TARGET)
    ]);
    // 获取训练数据的标准化数据、特征平均值数据、特征标准差数据
    let {dataset: trainDataset, vectorMeans, vectorStddevs} =
        utilsnormalizeDataset(this.dataset[0]);

    // 更新训练集数据
    this.dataset[0] = trainDataset;

    // 获取测试数据的标准化数据
    let {dataset: testDataset} = utilsnormalizeDataset(
        this.dataset[2], false, vectorMeans, vectorStddevs);

    // 更新测试集数据
    this.dataset[2] = testDataset;

    // 获取训练集长度
    this.trainSize = this.dataset[0].length;
    // 获取测试集长度
    this.testSize = this.dataset[2].length;

    // 随机训练集次序
    utilsshuffle(this.dataset[0], this.dataset[1]);
    // 随机测试集次序
    utilsshuffle(this.dataset[2], this.dataset[3]);
  }

  // 获取训练数据
  getTrainData() {
    const dataShape = [this.trainSize, this.NUM_FEATURES];

    // 转换Float32Array格式
    const trainData = Float32Array.from([].concat.apply([], this.dataset[0]));
    const trainTarget = Float32Array.from([].concat.apply([], this.dataset[1]));

    // 返回张量化的数据
    return {
      data: tf.tensor2d(trainData, dataShape),
      target: tf.tensor1d(trainTarget)
    };
  }

  // 获取测试数据
  // 同上
  getTestData() {
    const dataShape = [this.testSize, this.NUM_FEATURES];

    const testData = Float32Array.from([].concat.apply([], this.dataset[2]));
    const testTarget = Float32Array.from([].concat.apply([], this.dataset[3]));

    return {
      data: tf.tensor2d(testData, dataShape),
      target: tf.tensor1d(testTarget)
    };
  }
}






const epochs = 400;
const batchSize = 350;
const statusElement = document.getElementById('status');

const data = new WebsitePhishingDataset();


function uiupdateStatus(message) {
  statusElement.innerText = message;
};












function utilsbinarize(y, threshold) {
  if (threshold == null) {
    threshold = 0.5;
  }
  // tf.util.assert 断言
  // 即threshold要处于0到1间
  tf.util.assert(
      threshold >= 0 && threshold <= 1,
      `Expected threshold to be >=0 and <=1, but got ${threshold}`);
  return tf.tidy(() => {
    // tf.scalar
    // tf.scalar()函数用于创建张量均值的标量类型。定标器是zero-dimension数组
    // 即将对应的threshold数值转换为tf标量
    // tf.greater(a,b)
    // 功能：比较a、b两个值的大小
    // 返回值:一个列表,元素值都是true和false
    // 即返回了当前数据里大于当前threshold的数据
    const condition = y.greater(tf.scalar(threshold));
    // tf.where()定义如下：
    // where(condition, x=None, y=None,name=None)
    // condition:一个Tensor,数据类型为tf.bool类型
    // 如果x、y均为空，那么返回condition中值为True的位置的Tensor：例如：x就是condition，y是返回值
    // 如果x、y不为空，那么x、y必须有相同的形状。如果x、y是标量，那么condition参数也必须是标量。如果x、y是向量，那么condition必须和x的第一维有相同的形状或者和x形状一致。
    // 返回值：如果x、y不为空的话，返回值和x、y有相同的形状，如果condition对应位置值为True那么返回Tensor对应位置为x的值，否则为y的值.

    // tf.onesLike
    // 创建一个将所有元素都设置为1的张量.
    // 给定一个张量(tensor),此操作返回与所有元素设置为1的张量相同的类型和形状的张量.可选地,可以为返回的张量指定一个新的类型(dtype).

    // tf.zerosLike
    // 创建一个将所有元素都设置为0的张量.
    // 给定一个张量(tensor),此操作返回与所有元素设置为1的张量相同的类型和形状的张量.可选地,可以为返回的张量指定一个新的类型(dtype).
    // 返回了所有大于当前threshold的0，1对比量
    return tf.where(condition, tf.onesLike(y), tf.zerosLike(y));
  });
}










function falsePositives(yTrue, yPred) {
  return tf.tidy(() => {
    const one = tf.scalar(1);
    const zero = tf.scalar(0);
    return tf.logicalAnd(yTrue.equal(zero), yPred.equal(one))
        .sum()
        .cast('float32');
  });
}

function trueNegatives(yTrue, yPred) {
  return tf.tidy(() => {
    const zero = tf.scalar(0);
    return tf.logicalAnd(yTrue.equal(zero), yPred.equal(zero))
        .sum()
        .cast('float32');
  });
}









function falsePositiveRate(yTrue, yPred) {
  return tf.tidy(() => {
    const fp = falsePositives(yTrue, yPred);
    const tn = trueNegatives(yTrue, yPred);
    return fp.div(fp.add(tn));
  });
}












async function uiplotROC(fprs, tprs, epoch) {
  epoch++;  // Convert zero-based to one-based.

  // Store the series name in the list of series
  const seriesName = 'epoch ' +
      (epoch < 10 ? `00${epoch}` : (epoch < 100 ? `0${epoch}` : `${epoch}`))
  rocSeries.push(seriesName);

  const newSeries = [];
  for (let i = 0; i < fprs.length; i++) {
    newSeries.push({
      x: fprs[i],
      y: tprs[i],
    });
  }
  rocValues.push(newSeries);

  return tfvis.render.linechart(
      document.getElementById('rocCurve'),
      {values: rocValues, series: rocSeries},
      {
        width: 450,
        height: 320,
      },
  );
}









// 渲染ROC图
function drawROC(targets, probs, epoch) {
  // tf.tidy 训练使用后·销毁模型 释放内存
  return tf.tidy(() => {
    // 定义水平线坐标
    const thresholds = [
      0.0, 0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.35, 0.4,  0.45, 0.5,  0.55,
      0.6, 0.65, 0.7, 0.75, 0.8, 0.85, 0.9, 0.92, 0.94, 0.96, 0.98, 1.0
    ];
    // 定义正确集
    const tprs = [];  // True positive rates.
    // 定义错误集
    const fprs = [];  // False positive rates.
    // 定义空间
    let area = 0;


    for (let i = 0; i < thresholds.length; ++i) {

      const threshold = thresholds[i];
      // 不知道干嘛用
      const threshPredictions = utilsbinarize(probs, threshold).as1D();
      const fpr = falsePositiveRate(targets, threshPredictions).dataSync()[0];
      const tpr = tf.metrics.recall(targets, threshPredictions).dataSync()[0];
      fprs.push(fpr);
      tprs.push(tpr);

      // Accumulate to area for AUC calculation.
      if (i > 0) {
        area += (tprs[i] + tprs[i - 1]) * (fprs[i - 1] - fprs[i]) / 2;
      }
    }
    uiplotROC(fprs, tprs, epoch);
    return area;
  });
}






async function uiplotLosses(trainLogs) {
  return tfvis.show.history(
      document.getElementById('plotLoss'), trainLogs, ['loss', 'val_loss'], {
        width: 450,
        height: 320,
        xLabel: 'Epoch',
        yLabel: 'Loss',
      });
}


async function uiplotAccuracies(trainLogs) {
  tfvis.show.history(
      document.getElementById('plotAccuracy'), trainLogs, ['acc', 'val_acc'], {
        width: 450,
        height: 320,
        xLabel: 'Epoch',
        yLabel: 'Accuracy',
      });
}



data.loadData().then(async () => {
  await uiupdateStatus('Getting training and testing data...');
  // 定义训练数据
  const trainData = data.getTrainData();
  // 定义测试数据
  const testData = data.getTestData();
  await uiupdateStatus('Building model...');

  // 创建模型
  // tf.sequential 序列化建模
  const model = tf.sequential();
  // 创建隐藏层,入口模型,输入为30,即30个特征值
  // 输出为100个节点，采用非线性建模，即 30 * 100
  model.add(tf.layers.dense(
      {inputShape: [data.numFeatures], units: 100, activation: 'sigmoid'}));
  // 创建隐藏层
  model.add(tf.layers.dense({units: 100, activation: 'sigmoid'}));
  // 创建隐藏层
  model.add(tf.layers.dense({units: 1, activation: 'sigmoid'}));
  // 添加优化器以及损失函数
  // 参数后补充
  model.compile(
      {optimizer: 'adam', loss: 'binaryCrossentropy', metrics: ['accuracy']});
  // 创建日志对象
  const trainLogs = [];
  let auc;
  await uiupdateStatus('Training starting...');
  await model.fit(trainData.data, trainData.target, {
    batchSize, // 批次参数
    epochs, // 周期参数
    validationSplit: 0.2, // 验证集参数
    callbacks: {
      // 每周期开始时触发
      onEpochBegin: async (epoch) => {
        // Draw ROC every a few epochs.
        // 周期为1、 100、 200、 300、 400 时触发
        if ((epoch + 1) % 100 === 0 || epoch === 0 || epoch === 2 ||
            epoch === 4) {
          // 使用测试集预览模型
          const probs = model.predict(testData.data);
          // 渲染roc曲线 测试输入 测试输出 周期
          auc = drawROC(testData.target, probs, epoch);
        }
      },
      // 每周期结束时触发
      onEpochEnd: async (epoch, logs) => {
        await uiupdateStatus(`Epoch ${epoch + 1} of ${epochs} completed.`);
        trainLogs.push(logs);
        uiplotLosses(trainLogs);
        uiplotAccuracies(trainLogs);
      }
    }
  });

  await uiupdateStatus('Running on test data...');
  tf.tidy(() => {
    const result =
        model.evaluate(testData.data, testData.target, {batchSize: batchSize});

    const lastTrainLog = trainLogs[trainLogs.length - 1];
    const testLoss = result[0].dataSync()[0];
    const testAcc = result[1].dataSync()[0];

    const probs = model.predict(testData.data);
    const predictions = utilsbinarize(probs).as1D();

    const precision =
    // tf.metrics.precision(yTrue, yPred) 函數用於計算參考名稱的期望精度。
    // Parameters:
    // yTrue:它是規定的基本事實張量，它應該保持從 0 到 1 的值，它可以是 tf.Tensor 類型。
    // yPred:它是規定的預測張量，它應該保存從 0 到 1 的值，它可以是 tf.Tensor 類型。
    // 返回值：它返回tf.Tensor對象。
        tf.metrics.precision(testData.target, predictions).dataSync()[0];
    const recall =
        // tf.metrics.recall() 函数用于计算关于标签的预测的召回率。 “召回”是机器学习的指标之一。你可以在这里读更多关于它的内容。
        // tf.metrics.recall (yTrue, yPred)
        // 参数：
        // yTrue (tensor):它包含 0 或 1 的真值。
        // yPred (tensor):它只包含 0 或 1 的预测值。
        // 返回值：它返回一个张量(tf.tensor)。
        tf.metrics.recall(testData.target, predictions).dataSync()[0];
    const fpr = falsePositiveRate(testData.target, predictions).dataSync()[0];
    uiupdateStatus(
        `Final train-set loss: ${lastTrainLog.loss.toFixed(4)} accuracy: ${
            lastTrainLog.acc.toFixed(4)}\n` +
        `Final validation-set loss: ${
            lastTrainLog.val_loss.toFixed(
                4)} accuracy: ${lastTrainLog.val_acc.toFixed(4)}\n` +
        `Test-set loss: ${testLoss.toFixed(4)} accuracy: ${
            testAcc.toFixed(4)}\n` +
        `Precision: ${precision.toFixed(4)}\n` +
        `Recall: ${recall.toFixed(4)}\n` +
        `False positive rate (FPR): ${fpr.toFixed(4)}\n` +
        `Area under the curve (AUC): ${auc.toFixed(4)}`);
  });
});
