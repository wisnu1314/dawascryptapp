import hashlib
import random
from math import exp, expm1
import string
import time

# Constants
ROUNDS = 16
BLOCKSIZE = 16
BLOCKSIZE_BITS = 128

def generateuniquekey():
    return ''.join(random.choices(string.ascii_lowercase + string.digits, k=36))

# Generate this once and store it securely
UNIQUE = generateuniquekey()  

def shuffle(message, key):
    random.seed(key)
    l = list(range(len(message)))
    random.shuffle(l)
    return [message[x] for x in l]

def unshuffle(shuffled_message, key):
    random.seed(key)
    l = list(range(len(shuffled_message)))
    random.shuffle(l)
    out = [None] * len(shuffled_message)
    for i, x in enumerate(l):
        out[x] = shuffled_message[i]
    return out

def key_md5(key):
    return hashlib.md5((key+UNIQUE).encode('utf-8')).hexdigest()

def subkeygen(s1, s2, i):
    result = hashlib.md5((s1+s2).encode('utf-8')).hexdigest()
    return result

# Helper functions
def xor(s1, s2):
    return ''.join(chr(ord(a) ^ ord(b)) for a, b in zip(s1, s2))

def stobin(s):
    return ''.join('{:08b}'.format(ord(c)) for c in s)

def bintoint(s):
    return int(str(s), 2)

def itobin(i):
    return bin(i)

def bintostr(b):
    n = int(b, 2)
    return ''.join(chr(int(b[i: i + 8], 2)) for i in range(0, len(b), 8))

def hextodec(s):
    return int(str(s), 16)

def generatesbox(key):
    sb1 = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]
    sb2 = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]
    sb3 = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]
    sb4 = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]
    sb5 = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]
    sb6 = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]
    sb7 = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]
    sb8 = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]
    for i in range(1, 9):
        for j in range(1, 17):
            if(i == 1):
                hdec1 = (hextodec(key[(j - 1) * 2: (j - 1) * 2 + 2]) + i + j) % 16
                sb1 = sb1[hdec1:] + sb1[:hdec1]
            if(i == 2):
                hdec2 = (hextodec(key[(j - 1) * 2: (j - 1) * 2 + 2]) + i + j) % 16
                sb2 = sb2[-hdec2:] + sb2[:-hdec2]
            if(i == 3):
                hdec3 = (hextodec(key[(j - 1) * 2: (j - 1) * 2 + 2]) + i + j) % 16
                sb3 = sb3[hdec3:] + sb3[:hdec3]
            if(i == 4):
                hdec4 = (hextodec(key[(j - 1) * 2: (j - 1) * 2 + 2]) + i + j) % 16
                sb4 = sb4[-hdec4:] + sb4[:-hdec4]
            if(i == 5):
                hdec5 = (hextodec(key[(j - 1) * 2: (j - 1) * 2 + 2]) + i + j) % 16
                sb5 = sb5[hdec5:] + sb5[:hdec5]
            if(i == 6):
                hdec6 = (hextodec(key[(j - 1) * 2: (j - 1) * 2 + 2]) + i + j) % 16
                sb6 = sb6[-hdec6:] + sb6[:-hdec6]
            if(i == 7):
                hdec7 = (hextodec(key[(j - 1) * 2: (j - 1) * 2 + 2]) + i + j) % 16
                sb7 = sb7[hdec7:] + sb7[:hdec7]
            if(i == 8):
                hdec8 = (hextodec(key[(j - 1) * 2: (j - 1) * 2 + 2]) + i + j) % 16
                sb8 = sb8[-hdec8:] + sb8[:-hdec8]
    sb = [sb1, sb2, sb3, sb4, sb5, sb6, sb7, sb8]
    return sb

def transform(x, i, k, sbox):
    k = stobin(k)
    x = stobin(str(x))
    if (len(x) == 32):
        out = ""
        for i in range(8):
            val = bintoint(x[i*4:(i*4) + 4])
            out += bin(sbox[i].index(val))[2:].zfill(4)

        out = out[4:len(out)] + out[0:4]
    else:
        out = x
    k = bintoint(k)
    x = bintoint(out)

    res = pow((x * k), i)
    res = itobin(res)
    return bintostr(res)

def encrypt(key, message, mode):
    ciphertext = ""
    n = BLOCKSIZE  
    
    message = [message[i: i + n] for i in range(0, len(message), n)]

    lastBlockLength = len(message[len(message)-1])

    if (lastBlockLength < BLOCKSIZE):
        for i in range(lastBlockLength, BLOCKSIZE):
            message[len(message)-1] += " "

    # generate a 16 bit key based of user inputted key
    key = key_md5(key)
    key_initial = key
    ctr = 0
    for block in message:
        #generate sbox based on md5key
        sbox = generatesbox(key)
        L = [""] * (ROUNDS + 1)
        R = [""] * (ROUNDS + 1)
        L[0] = block[0:BLOCKSIZE//2]
        R[0] = block[BLOCKSIZE//2:BLOCKSIZE]

        for i in range(1, ROUNDS+1):
            round_key = subkeygen(str(i), key, i)
            LR_im = R[i - 1][:BLOCKSIZE//4]
            RR_im = R[i - 1][BLOCKSIZE//4:]
  
            LL_i = RR_im
            RL_i = xor(LR_im, transform(RR_im, i, round_key, sbox))

            L[i] = LL_i + RL_i
            R[i] = xor(L[i - 1], transform(R[i - 1], i, round_key, sbox))

        partial_cipher = L[ROUNDS] + R[ROUNDS]
        shuffled_cipher = shuffle(partial_cipher, key)
        ciphertext += ''.join(shuffled_cipher)
        if (mode == "cbc"):
            key = subkeygen(L[0], key, i)
        if (mode == "counter"):
            key = subkeygen(str(ctr), key_initial, i)
            ctr += 1

    return ciphertext

def decrypt(key, ciphertext, mode):
    message = ""
    n = BLOCKSIZE  
    
    ciphertext = [ciphertext[i: i + n] for i in range(0, len(ciphertext), n)]

    lastBlockLength = len(ciphertext[len(ciphertext)-1])

    if (lastBlockLength < BLOCKSIZE):
        for i in range(lastBlockLength, BLOCKSIZE):
            ciphertext[len(ciphertext)-1] += " "

    # generate a 128 bit key based off the user inputted key using md5
    key = key_md5(key)
    key_initial = key
    ctr = 0
    for block in ciphertext:
        #generate sbox based on md5key
        sbox = generatesbox(key)
        L = [""] * (ROUNDS + 1)
        R = [""] * (ROUNDS + 1)
        
        # First unshuffle the block
        unshuffled_block = unshuffle(block, key)
        unshuffled_block = ''.join(unshuffled_block)
        
        L[ROUNDS] = unshuffled_block[0:BLOCKSIZE//2]
        R[ROUNDS] = unshuffled_block[BLOCKSIZE//2:BLOCKSIZE]

        for i in range(ROUNDS, 0, -1):
            round_key = subkeygen(str(i), key, i)
            LL_i = L[i][:BLOCKSIZE//4]
            RL_i = L[i][BLOCKSIZE//4:]

            RR_im = LL_i
            LR_im = xor(RL_i, transform(RR_im, i, round_key, sbox))

            R[i - 1] = LR_im + RR_im
            L[i - 1] = xor(R[i], transform(R[i - 1], i, round_key, sbox))

        partial_message = L[0] + R[0]
        message += partial_message
        if (mode == "cbc"):
            key = subkeygen(L[0], key, i)
        if (mode == "counter"):
            key = subkeygen(str(ctr), key_initial, i)
            ctr += 1

    return message.rstrip()

def determine_mode(inp):
    if(inp % 3 == 0):  
        return "cbc"
    elif (inp % 3 == 1): 
        return "ecb"
    else: 
        return "counter"