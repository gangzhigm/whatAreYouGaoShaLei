import time 
result = []
for i in range(10000):
    result.append(i)
time_start = time.time()
for i in range(10000):
        temp = result.index(i)
time_end = time.time()
print('检索时间',time_end-time_start)