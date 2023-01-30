import * as tf from "@tensorflow/tfjs"
import * as tfvis from "@tensorflow/tfjs-vis"
// 导入 papaparse 模块 用于加载csv文件
const Papa = require('papaparse');

// 定义周期数量
const NUM_EPOCHS = 30;
// 定义批次数量
const BATCH_SIZE = 40;
// 定义学习跨度
const LEARNING_RATE = 0.01;

const NUM_TOP_WEIGHTS_TO_DISPLAY = 5;
const trainSimpleLinearRegression = document.getElementById('simple-mlr');
const bootData = {}
const tensors = {}
const baselineStatusElement = document.getElementById('baselineStatus');
const statusElement = document.getElementById('status');
const featureDescriptions = [
  'Crime rate', 'Land zone size', 'Industrial proportion', 'Next to river',
  'Nitric oxide concentration', 'Number of rooms per house', 'Age of housing',
  'Distance to commute', 'Distance to highway', 'Tax rate', 'School class size',
  'School drop-out rate'
];


// const trainNeuralNetworkLinearRegression1Hidden =
//     document.getElementById('nn-mlr-1hidden');
// const trainNeuralNetworkLinearRegression2Hidden =
//     document.getElementById('nn-mlr-2hidden');




























// 将数据清洗成按索引对其的数组
// 即将[a:1,b:2,c:3,d:4,e:5]清洗为[1,2,3,4,5]
function parseCsv(data){
  // parseFloat 解析字符串并返回浮点数
  return data.map((row)=>Object.keys(row).map(key => parseFloat(row[key])))
}
// 获取清洗后的数据
function getData(url){
  return new Promise((resolve, reject) => {
    Papa.parse(url, {
      download: true,
      header: true,
      complete: (results) => {
        // 返回清洗后的数据
        resolve(parseCsv(results['data']));
      }
    })
  })
}
// 长度不变的情况下对输入参数进行乱序
function shuffle(data, target) {
  // 定义数据长度
  let counter = data.length;
  let temp = 0;
  let index = 0;
  // 次数循环解析
  // counter随次数下降
  // 其更换位置的函数 Math.random() * counter
  // 依次数增加其最大值不断递减，即会生成 最小为0 最大为 当前counter的值进行换位
  // 存在重复可能
  while (counter > 0) {
    index = (Math.random() * counter) | 0;
    counter--;
    // data:
    // 将data[counter]给到temp
    temp = data[counter];
    // 将data[index]给到data[counter]
    data[counter] = data[index];
    // 将temp给到data[index]
    data[index] = temp;
    // target:
    temp = target[counter];
    target[counter] = target[index];
    target[index] = temp;
  }
};
// 更新文字显示
function updateStatus(message) {
  statusElement.innerText = message;
};
// 进行朴素计算
function normalizationdetermineMeanAndStddev(data){
  // data.mean 即是tf.mean 
  // 作用为合并每一项对应的列的值并取得其平均值
  const dataMean = data.mean(0);
  // TODO(bileschi): Simplify when and if tf.var / tf.std added to the API.
  
  // data.sub即是tf.sub
  // 作用为 tf1.sub(tf2)
  // 即把tf1中对应维度的每项减去tf2中对应维度的每项
  const diffFromMean = data.sub(dataMean);

  // 计算标准差
  // 标准差即总体各单位标准值与其平均数的离差的平方的算术平均数的平方根
  // 意义： 反映了组内个体间的离散程度，如果较大，则代表了大多数个体与平均数的差值相差较大，即抖动太大
  // data.square即是tf.square
  // 作用为 tf1.square
  // 即把tf1中对应维度的每项计算出平方
  const squaredDiffFromMean = diffFromMean.square();
  const variance = squaredDiffFromMean.mean(0);
  // data.square即是tf.square
  // 作用为 tf1.square
  // 即把tf1中对应维度的每项计算出平方根
  const dataStd = variance.sqrt();

  // dataMean：每项dataitem的平均值
  // dataStd：每项dataitem的值 减去 每项dataitem的平均值 => 获得每项的差值 
  //          计算每项差值的平方 得出每类差值的平均值 得出每类的差值的平方的平方根
  // 即是标准差，
  return {dataMean, dataStd};
}
// 进行朴素计算
function normalizationnormalizeTensor(data, dataMean, dataStd) {
  // data 原始数据
  // dataMean 原始数据的类维度的平均值
  // dataStd 原始数据的类维度的差值平均值的平方的平方根
  // （ data 中的每项 减去 dataMean 对应维度的 每项 ）除以 dataStd 中的每项
  // （ 原始数据 中的每项 减去 对应每类的平均值 ）除以 每类差值的平方的平方根
  // 即[均分差值] 用于线性回归问题
  // 即 反映估计量与被估计量之间差异程度的一种度量。
  //
  // 数学定义
  // 设t是根据子样确定的总体参数θ的一个估计量
  // (θ-t)2的数学期望，称为估计量t的均方误差。它等于σ2+b2，其中σ2与b分别是t的方差与偏倚。
  //
  // 编程意义
  // 表示预测数据和原始数据对应点误差的平方和的均值，常用于线性回归问题。
  return data.sub(dataMean).div(dataStd);
}

// 将数据转换为张量并且进行朴素计算
// 需要补充，没明白
function arraysToTensors(){
  // 生成训练输入的张量表示
  tensors.rowTrainFeatures = tf.tensor2d(bootData.trainFeatures);
  // 生成训练预期输出的张量表示
  tensors.trainTarget = tf.tensor2d(bootData.trainTarget);
  // 生成测试输入的张量表示
  tensors.rawTestFeatures = tf.tensor2d(bootData.testFeatures);
  // 生成测试预期输出的张量表示
  tensors.testTarget = tf.tensor2d(bootData.testTarget);
  
  // 将数据进行归一化
  // 即进行标准变换 或 z-score标准化
  // 即 计算每个特征的平均值，然后从原始值减去平均值，得出每个特征的基于平均数为0的差数
  // 将差数除以标准差，得出标准化后的特征值
  // 获得训练张量的平均值和标准差
  let {dataMean, dataStd} =
    normalizationdetermineMeanAndStddev(tensors.rowTrainFeatures);
  // 获得训练输入的标准值
  tensors.trainFeatures = normalizationnormalizeTensor(tensors.rowTrainFeatures, dataMean, dataStd);
  // 获得测试输入的标准值
  tensors.testFeatures = normalizationnormalizeTensor(tensors.rawTestFeatures, dataMean, dataStd);
}
// 显示朴素计算结果
function updateBaselineStatus(message) {
  baselineStatusElement.innerText = message;
};
function computeBaseline(){
  const avgPrice = tensors.trainTarget.mean();
  // console.log(`Average price: ${avgPrice.dataSync()}`);
  // 测试输入减去平均差价后得出平方根再进行每类平均值计算
  const baseline = tensors.testTarget.sub(avgPrice).square().mean();
  // console.log(`Baseline loss: ${baseline.dataSync()}`);
  const baselineMsg = `Baseline loss (meanSquaredError) is ${
      baseline.dataSync()[0].toFixed(2)}`;
  updateBaselineStatus(baselineMsg);
}
// 创建模型
function linearRegressionModel() {
  // 定义线性回归模型
  const model = tf.sequential();
  const num = bootData.trainFeatures[0].length;
  // 输入标量为12， 输出量为1
  model.add(tf.layers.dense({inputShape: [num], units: 1}));
  // model.add(tf.layers.dense({inputShape: [bostonData.numFeatures], units: 1}));

  // model.summary();
  return model;
};
// 实时更新训练周期
function updateModelStatus(message, modelName) {
  const statElement = document.querySelector(`#${modelName} .status`);
  statElement.innerText = message;
};




async function run(model, modelName, weightsIllustration) {
  console.info(`BATCH_SIZE:${BATCH_SIZE}`)
  console.info(`NUM_EPOCHS:${NUM_EPOCHS}`)
  tensors.trainFeatures.print(true)
  let a = [0,0]
  // model 模型
  // modelName 模型名称
  // weightsIllustration 模型

  // 添加优化器以及损失函数
  // 损失函数为meanSquaredError,即均方误差
  // 优化器为自定义的随机梯度下降法
  model.compile(
      {optimizer: tf.train.sgd( ), loss: 'meanSquaredError'});

  let trainLogs = [];
  const container = document.querySelector(`#${modelName} .chart`);
  // 更新训练中文案
  updateStatus('Starting training process...');
  // 开始训练模型
  await model.fit(tensors.trainFeatures, tensors.trainTarget, {
    // 设置批次
    batchSize: BATCH_SIZE,
    // 设置周期
    epochs: NUM_EPOCHS,
    // validation_split: 0 和 1 之间的浮点数。
    // 用作验证集的训练数据的比例。 
    // 模型将分出一部分不会被训练的验证数据，并将在每一轮结束时评估这些验证数据的误差和任何其他模型指标。 
    // 验证数据是混洗之前 x 和y 数据的最后一部分样本中。
    validationSplit: 0.0,
    // 定义回调函数
    callbacks: {
      onBatchEnd: async function (){
        a[0] +=1;
      },
      // 每个周期触发
      onEpochEnd: async (epoch, logs) => {
        a[1] +=1;
        // 实时显示批次信息
        await updateModelStatus(
            `Epoch ${epoch + 1} of ${NUM_EPOCHS} completed.`, modelName);
        // 对运算结果进行记录
        trainLogs.push(logs);
        // 实时显示loss和val_loss的
        tfvis.show.history(container, trainLogs, ['loss', 'val_loss'])
        // 如果存在权重weightsIllustration
        if (weightsIllustration) {
          // console.info(model.layers[0].getWeights()[0].data());
          // 第一层输入端的权重值
          const kernelAsArr = model.layers[0].getWeights()[0].dataSync();
          const weightsList = describeKernelElements(kernelAsArr);
          // 生成对应关系的【object】
          updateWeightDescription(weightsList);
        }
        console.info(a);
      }
    }
  });
  function updateWeightDescription(weightsList) {
    const inspectionHeadlineElement =
        document.getElementById('inspectionHeadline');
    inspectionHeadlineElement.innerText =
        `Top ${NUM_TOP_WEIGHTS_TO_DISPLAY} weights by magnitude`;
    // Sort weights objects by descending absolute value.
    weightsList.sort((a, b) => Math.abs(b.value) - Math.abs(a.value));
    var table = document.getElementById('myTable');
    // Clear out table contents
    table.innerHTML = '';
    // Add new rows to table.
    weightsList.forEach((weight, i) => {
      if (i < NUM_TOP_WEIGHTS_TO_DISPLAY) {
        let row = table.insertRow(-1);
        let cell1 = row.insertCell(0);
        let cell2 = row.insertCell(1);
        if (weight.value < 0) {
          cell2.setAttribute('class', 'negativeWeight');
        } else {
          cell2.setAttribute('class', 'positiveWeight');
        }
        cell1.innerHTML = weight.description;
        cell2.innerHTML = weight.value.toFixed(4);
      }
    });
  };
  function describeKernelElements(kernel) {
    // tf.util.assert()函数用于断言该函数中作为参数的表达式为true。
    // 如果不正确，则将引发错误以及该方法中所述的消息。
    // tf.util.assert(expr, msg)
    // expr:这是要声明的表达式，它是布尔类型的。
    // msg(()=>字符串)：当表达式不为真且抛出错误时，此函数将返回所声明的消息。在此，出于性能原因使用函数。
    tf.util.assert(
        kernel.length == 12,
        `kernel must be a array of length 12, got ${kernel.length}`);
    const outList = [];
    for (let idx = 0; idx < kernel.length; idx++) {
      outList.push({description: featureDescriptions[idx], value: kernel[idx]});
    }
    return outList;
  }
  
  // ui.updateStatus('Running on test data...');
  // const result = model.evaluate(
  //     tensors.testFeatures, tensors.testTarget, {batchSize: BATCH_SIZE});
  // const testLoss = result.dataSync()[0];

  // const trainLoss = trainLogs[trainLogs.length - 1].loss;
  // const valLoss = trainLogs[trainLogs.length - 1].val_loss;
  // await ui.updateModelStatus(
  //     `Final train-set loss: ${trainLoss.toFixed(4)}\n` +
  //         `Final validation-set loss: ${valLoss.toFixed(4)}\n` +
  //         `Test-set loss: ${testLoss.toFixed(4)}`,
  //     modelName);
};









function uisetup(){
  trainSimpleLinearRegression.addEventListener('click', async (e) => {
    // 声明模型
    const model = linearRegressionModel();
    await run(model, 'linear', true);
  }, false);
  // trainNeuralNetworkLinearRegression1Hidden.addEventListener(
  //     'click', async () => {
  //       const model = multiLayerPerceptronRegressionModel1Hidden();
  //       await run(model, 'oneHidden', false);
  //     }, false);
  // trainNeuralNetworkLinearRegression2Hidden.addEventListener(
  //     'click', async () => {
  //       const model = multiLayerPerceptronRegressionModel2Hidden();
  //       await run(model, 'twoHidden', false);
  //     }, false);
}

// 进行监听
document.addEventListener('DOMContentLoaded', async () => {
  // 进行操作
  // 定义文件地址
  const BASE_URL = 'https://storage.googleapis.com/tfjs-examples/multivariate-linear-regression/data/';
  const TRAIN_FEATURES_FN = 'train-data.csv';
  const TRAIN_TARGET_FN = 'train-target.csv';
  const TEST_FEATURES_FN = 'test-data.csv';
  const TEST_TARGET_FN = 'test-target.csv';

  // 从接口获取清洗格式后对应的数据
  bootData.trainFeatures = await getData(`${BASE_URL}${TRAIN_FEATURES_FN}`);  
  bootData.trainTarget = await getData(`${BASE_URL}${TRAIN_TARGET_FN}`);  
  bootData.testFeatures = await getData(`${BASE_URL}${TEST_FEATURES_FN}`);  
  bootData.testTarget = await getData(`${BASE_URL}${TEST_TARGET_FN}`);  
  // 长度不变的情况下对输入参数进行乱序
  shuffle(bootData.testFeatures, bootData.testTarget);
  shuffle(bootData.trainFeatures, bootData.trainTarget);

  // 展示数据已完成准备信息
  updateStatus('Data loaded, converting to tensors');
  // 清洗数据
  arraysToTensors();
  // 展示数据已完成张量格式准备
  updateStatus(
    'Data is now available as tensors.\n' +
    'Click a train button to begin.');
  // 显示朴素计算的等待文案
  updateBaselineStatus('Estimating baseline loss');
  // 显示朴素计算的结果
  computeBaseline();
  // 加载模型运算
  uisetup();
}, false);
