def fact(n):
    if n==1:
        return 1
    return n * fact(n - 1)
print(fact(5))

# 切片/

L = list(range(100))
print(L)
print(L[:10])
print(L[-10:])
print(L[10:20])
print(L[:10:2])
print(L[::5])
