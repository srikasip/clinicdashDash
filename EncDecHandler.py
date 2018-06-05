import os
from Crypto.Cipher import DES
import base64

def spotEnc(sentString):
  keyString = os.environ.get("APP_EncDecKey", default=None)
  key = bytes(keyString, 'utf-8')
  des = DES.new(key, DES.MODE_ECB)
  toCrypt = bytes(pad(sentString), 'utf-8') # pad(sentString).encode('utf-8')
  cipherTxt = des.encrypt(toCrypt)
  encodedCipher = str(base64.b64encode(cipherTxt), 'utf-8')

  return encodedCipher

def spotDec(sentString):
  keyString = os.environ.get("APP_EncDecKey", default=None)
  key = bytes(keyString, 'utf-8')

  des = DES.new(key, DES.MODE_ECB)
  toCrypt = base64.b64decode(bytes(sentString, 'utf-8'))
  clearText = des.decrypt(toCrypt)

  clearText = clearText.strip()
  clearText = str(clearText, 'utf-8')

  return clearText

def pad(text):
  diff = len(text) % 8
  if diff>0:
    text += ' ' * (8-diff)
  
  return text