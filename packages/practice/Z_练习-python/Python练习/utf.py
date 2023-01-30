# ord & chr & encode & decode & len & %


print('<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<')
print(ord('A'))
print(ord('中'))
print(chr(66))
print(chr(25991))
print('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~')
print('ABC'.encode('ascii'))
print('中文'.encode('utf-8'))
print('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~')
print(b'\xe4\xb8\xad\xe6\x96\x87'.decode('utf-8'))
print(b'\xe4\xb8\xad\xff'.decode('utf-8', errors='ignore'))
print('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>')



print(len('ABC'))
print(len(b'\xe4\xb8\xad\xe6\x96\x87'))
print(len('\xe4\xb8\xad\xe6\x96\x87'))
print(len('中文'))
print(len('中文'.encode('utf-8')))

print('%2d-%02d' % (3, 1))
print('%.2f' % 3.1415926)
s1 = 72
s2 = 85
r = (s2-s1)/s1*100
print('%.1f%%' % r)

