# -*- coding: utf-8 -*-
import base64

def write_chunk(b64_str, mode='a'):
    raw = base64.b64decode(b64_str.encode('utf-8')).decode('utf-8')
    with open('README.md', mode, encoding='utf-8') as f:
        f.write(raw)
