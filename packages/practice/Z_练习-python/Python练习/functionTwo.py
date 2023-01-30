def power(x):
    return x * x
def power(x, n):
    s = 1
    while n > 0:
        n = n - 1
        s = s * x
    return s
def power(x, n=2):
    s = 1
    while n > 0:
        n = n - 1
        s = s * x
    return s
print(power(1,4))

def calc(*numbers):
    sum = 0
    for n in numbers:
        sum = sum + n * n
    return sum
nums = [1, 2, 3]
print(calc(*nums))

def person(name, age, **kw):
    print('name:', name, 'age:', age, 'other:', kw)
print(person('Michael', 30))