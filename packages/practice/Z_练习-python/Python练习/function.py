# def
print(abs(100))
print(max(1, 2))
print(int(12.34))
print(float('12.34'))
print(str(1.23))
print(bool(1))
print(bool(''))
print(hex(255))

def my_abs(x):
    if not isinstance(x, (int, float)):
        raise TypeError('bad operand type')
    if x >= 0:
        return x
    else:
        return -x
def nop():
    pass
print(my_abs(-99))
print(nop())
from funcc import xx
xx()
def move(x, y, step, angle=0):
    nx = x + step * math.cos(angle)
    ny = y - step * math.sin(angle)
    return nx, ny
x, y = move(100, 100, 60, math.pi / 6)
print(x, y)
r = move(100, 100, 60, math.pi / 6)
print(r)


import math

def quadratic(a, b, c):
    




my_abs('A')